const prisma = require('../config/prisma');

exports.createEvaluation = async (req, res) => {
  const { shopId, estimatePortion, actualPortion, orderHelp, exitPressure, comment } = req.body;
  const userId = req.user.id;

  try {
    // フロントエンドから直接数値が送られてくるため、そのまま計算に使用
    const jirodo = (-estimatePortion + actualPortion + 2 * orderHelp + 2 * exitPressure) / 24;

    const newEvaluation = await prisma.evaluation.create({
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
    res.status(201).json(newEvaluation);
  } catch (error) {
    res.status(400).json({ message: 'Error creating evaluation', error: error.message });
  }
};

exports.getEvaluationsByShopId = async (req, res) => {
    const { shopId } = req.params;
    try {
        const evaluations = await prisma.evaluation.findMany({
            where: { shopId: parseInt(shopId) },
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
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching evaluations', error: error.message });
    }
};