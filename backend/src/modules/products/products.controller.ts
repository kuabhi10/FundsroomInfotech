import { Request, Response } from 'express';
import * as productsService from './products.service';
import { createProductSchema, updateProductSchema } from './products.schema';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      lowStock: req.query.lowStock,
    };

    const result = await productsService.getProducts(filters, page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await productsService.getProductById(id);
    
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({ data: product });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { sku } = parsed.data;
    const skuExists = await productsService.checkSkuExists(sku);
    if (skuExists) {
      res.status(409).json({ error: 'Product with this SKU already exists' });
      return;
    }

    const newProduct = await productsService.createProduct(parsed.data);
    res.status(201).json({ data: newProduct });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const product = await productsService.getProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const updatedProduct = await productsService.updateProduct(id, parsed.data);
    res.status(200).json({ data: updatedProduct });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
