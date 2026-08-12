import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      draftChallans,
      confirmedChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
    ]);

    // Raw query for low stock alerts where currentStock <= minStockAlert and minStockAlert > 0
    const lowStockRaw = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM products WHERE "currentStock" <= "minStockAlert"
    `;
    const lowStockAlerts = Number(lowStockRaw[0]?.count || 0);

    res.status(200).json({
      data: {
        totalCustomers,
        totalProducts,
        lowStockAlerts,
        draftChallans,
        confirmedChallans,
      }
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};
