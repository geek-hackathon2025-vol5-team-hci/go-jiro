const prisma = require("../config/prisma");
//const prisma = new PrismaClient();

exports.createEvaluation = async (req, res, next) => {
  const {
    shopId,
    estimatePortion,
    actualPortion,
    orderHelp,
    exitPressure,
    comment,
  } = req.body;

  try {
    // ログインしているユーザーの情報を取得
    const googleId = req.user.id;
    const user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user.id;

    // --- トランザクション処理開始 ---
    // 評価の作成と店舗の平均点更新を、まとめて安全に実行します
    const newEvaluation = await prisma.$transaction(async (tx) => {
      // --- ステップ1: 今回の評価(Evaluation)を作成 ---
      const jirodoFloat =
        ((-estimatePortion + actualPortion + 2 * orderHelp + 2 * exitPressure) *
          100) /
        24;
      const jirodo = Math.round(jirodoFloat); // 整数に丸める

      const createdEval = await tx.evaluation.create({
        data: {
          jirodo,
          estimatePortion,
          actualPortion,
          orderHelp,
          exitPressure,
          comment,
          shop: { connect: { id: shopId } },
          user: { connect: { id: userId } },
        },
      });
      console.log("✅ Created evaluation:", createdEval);

      // --- ステップ2: 店舗(Shop)の平均点を計算して更新 ---

      // 2a. このお店の評価をすべて取得
      const allEvaluations = await tx.evaluation.findMany({
        where: { shopId: shopId },
      });

      // 2b. 平均値を計算
      if (allEvaluations.length > 0) {
        const totalJirodo = allEvaluations.reduce(
          (sum, ev) => sum + ev.jirodo,
          0
        );
        const averageJirodo = totalJirodo / allEvaluations.length;
        const roundedAverage = Math.round(averageJirodo); // 平均値も整数に

        // 2c. Shopテーブルのjiro_difficultyを更新
        await tx.shop.update({
          where: { id: shopId },
          data: { jiro_difficulty: roundedAverage },
        });
      }
      await tx.user.update({
        where: { id: userId },
        data: {
          jiroCount: {
            increment: 1, // 1ずつ増やす
          },
        },
      });
      console.log(`✅ Incremented jiroCount for user ${userId}`);

      // トランザクションの結果として、作成した評価データを返す
      return createdEval;
    });

    res.status(201).json(newEvaluation);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "この店舗は既に評価済みです。" });
    }
    console.error("💥 Prisma Error:", error);
    res
      .status(400)
      .json({ message: "Error creating evaluation", error: error.message });
  }
};

exports.getEvaluationsByShopId = async (req, res) => {
  const { shopId } = req.params;
  console.log("🔍 Fetch evaluations for shopId:", shopId);
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { shopId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true, // nameからdisplayNameに変更
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📋 Found ${evaluations.length} evaluations`);
    res.status(200).json(evaluations);
  } catch (error) {
    console.error("💥 Error fetching evaluations:", error);
    res
      .status(400)
      .json({ message: "Error fetching evaluations", error: error.message });
  }
};
