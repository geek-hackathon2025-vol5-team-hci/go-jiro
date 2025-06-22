const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createEvaluation = async (req, res) => {
  const { shopId, estimatePortion, actualPortion, orderHelp, exitPressure, comment } = req.body;
  const userId = req.user.id;


  try {
    // 計算の途中経過を確認
    const googleId = req.user.id;

    const user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.id; // ← これは Int 型
    const jirodo = ((-estimatePortion + actualPortion + 2 * orderHelp + 2 * exitPressure) * 100) / 24;
    console.log("⚙️ Calculated jirodo:", jirodo);

    // Prismaのcreate前にdataオブジェクトをログ出力
    const createData = {
      jirodo,
      estimatePortion,
      actualPortion,
      orderHelp,
      exitPressure,
      comment,
      shop: { connect: { id: shopId } },
      user: { connect: { id: userId } },
    };
   

    const newEvaluation = await prisma.evaluation.create({
      data: createData,
    });

    console.log("✅ Created evaluation:", newEvaluation);
    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error("💥 Prisma Error:", error);
    res.status(400).json({ message: 'Error creating evaluation', error: error.message });
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
