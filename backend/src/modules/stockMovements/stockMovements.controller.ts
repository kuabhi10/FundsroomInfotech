import { Request, Response } from 'express';
import * as stockMovementsService from './stockMovements.service';
import { createStockMovementSchema } from './stockMovements.schema';

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters = {
      productId: req.query.productId as string,
      type: req.query.type as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };

    const result = await stockMovementsService.getStockMovements(filters, page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getStockMovements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStockMovement = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createStockMovementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newMovement = await stockMovementsService.createStockMovement(parsed.data, userId);
    res.status(201).json({ data: newMovement });
  } catch (error: any) {
    console.error('Error in createStockMovement:', error);
    if (error.message === 'Product not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Insufficient stock') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
