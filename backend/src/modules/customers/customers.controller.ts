import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const prisma = new PrismaClient();

export const listCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, type, page = '1', limit = '20' } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { mobile: { contains: search as string, mode: 'insensitive' } },
        { businessName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (type) {
      where.customerType = type as any;
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    res.status(200).json({ data, total, page: pageNumber, limit: limitNumber });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Challans relation will be implemented in Phase 5, return empty array for now
    const responseData = {
      ...customer,
      challans: [],
    };

    res.status(200).json({ data: responseData });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    // Convert followUpDate string to Date if provided
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }

    const customer = await prisma.customer.create({
      data,
    });

    res.status(201).json({ data: customer });
  } catch (error: any) {
    console.error('Create customer error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Customer with these unique constraints already exists.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data = req.body;

    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
    });

    res.status(200).json({ data: customer });
  } catch (error: any) {
    console.error('Update customer error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Customer with these unique constraints already exists.' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCustomerNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.params.id as string;
    const { note } = req.body;
    const createdById = req.user?.userId;

    if (!createdById) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const newNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Optionally return the updated list of notes
    const notesList = await prisma.customerNote.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({ data: notesList });
  } catch (error) {
    console.error('Add customer note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
