const prisma = require('../config/prisma');
//const prisma = new PrismaClient();

exports.createEvaluation = async (req, res) => {
  const { shopId, estimatePortion, actualPortion, orderHelp, exitPressure, comment } = req.body;
  const userId = req.user.id;

    // PassportからGoogle IDを取得
  const googleId = req.user.id;
  if (!googleId) {
    return res.status(401).json({ message: '認証されていません。' });
  }

  try {
   // トランザクションを開始
    const newEvaluation = await prisma.$transaction(async (tx) => {
      // 1. Google IDを基にユーザー情報を取得
      const user = await tx.user.findUnique({
        where: { googleId },
        select: { id: true } // 必要なのは内部IDのみ
      });

      if (!user) {
        // トランザクションを失敗させ、ロールバックする
        throw new Error("User not found");
      }

      // 2. 二郎度を計算
      const jirodo = ((-estimatePortion + actualPortion + 2 * orderHelp + 2 * exitPressure) * 100) / 24;
      console.log("⚙️ Calculated jirodo:", jirodo);

      // 3. 評価データを作成
      const createdEvaluation = await tx.evaluation.create({
        data: {
          jirodo,
          estimatePortion,
          actualPortion,
          orderHelp,
          exitPressure,
          comment,
          shop: { connect: { id: shopId } },
          user: { connect: { id: user.id } }, // 取得した内部IDを使用
        },
      });
      console.log("✅ Created evaluation inside transaction:", createdEvaluation);

      // 4. 同じトランザクション内でユーザーのjiroCountをアトミックにインクリメント
      await tx.user.update({
        where: { id: user.id },
        data: {
          jiroCount: {
            increment: 1, // jiroCountを1増やす
          },
        },
      });
      console.log(`✅ Incremented jiroCount for user ${user.id}`);

      // 5. トランザクションの結果として、作成された評価レコードを返す
      return createdEvaluation;
    });

    // トランザクション成功後、クライアントにレスポンスを返す
    res.status(201).json(newEvaluation);

  } catch (error) {
    console.error("💥 Transaction Error:", error);
    // findUniqueで見つからなかった場合やDBエラーの場合
    if (error.message === "User not found") {
      return res.status(404).json({ message: 'ユーザーが見つかりません。' });
    }
    res.status(400).json({ message: '評価の作成に失敗しました。', error: error.message });
  }
};
exports.getEvaluationsByShopId = async (req, res) => {
  const { shopId } = req.params;
  console.log("🔍 Fetch evaluations for shopId:", shopId);
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { shopId },  // parseIntは使わない想定
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📋 Found ${evaluations.length} evaluations`);
    res.status(200).json(evaluations);
  } catch (error) {
    console.error("💥 Error fetching evaluations:", error);
    res.status(400).json({ message: 'Error fetching evaluations', error: error.message });
  }
};
