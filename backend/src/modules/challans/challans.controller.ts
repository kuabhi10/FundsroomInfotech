import { Request, Response, NextFunction } from 'express';
import * as challansService from './challans.service';

export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { customerId, status, items } = req.body;
    
    const challan = await challansService.createChallan(customerId, status, items, userId);
    res.status(201).json({ data: challan });
  } catch (error) {
    next(error);
  }
};

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await challansService.getChallans(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await challansService.getChallanById(req.params.id as string);
    res.status(200).json({ data: challan });
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await challansService.updateChallan(req.params.id as string, req.body);
    res.status(200).json({ data: challan });
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const challan = await challansService.confirmChallan(req.params.id as string, userId);
    res.status(200).json({ data: challan });
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const challan = await challansService.cancelChallan(req.params.id as string, userId);
    res.status(200).json({ data: challan });
  } catch (error) {
    next(error);
  }
};
