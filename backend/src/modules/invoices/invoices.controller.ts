import { Request, Response, NextFunction } from 'express';
import * as invoiceService from './invoices.service';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { challanId } = req.body;
    // Assuming authenticate middleware attaches user to req.user
    const userId = (req as any).user?.userId;
    const invoice = await invoiceService.createInvoice(challanId, userId);
    res.status(201).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.getInvoices(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id as string);
    res.status(200).json({ data: invoice });
  } catch (error) {
    next(error);
  }
};

export const generateInvoicePdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await invoiceService.generateInvoicePdf(req.params.id as string, res);
  } catch (error) {
    next(error);
  }
};
