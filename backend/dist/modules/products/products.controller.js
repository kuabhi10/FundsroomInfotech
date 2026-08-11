"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productsService = __importStar(require("./products.service"));
const products_schema_1 = require("./products.schema");
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            search: req.query.search,
            category: req.query.category,
            lowStock: req.query.lowStock,
        };
        const result = await productsService.getProducts(filters, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productsService.getProductById(id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.status(200).json({ data: product });
    }
    catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const parsed = products_schema_1.createProductSchema.safeParse(req.body);
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
    }
    catch (error) {
        console.error('Error in createProduct:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productsService.getProductById(id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const parsed = products_schema_1.updateProductSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const updatedProduct = await productsService.updateProduct(id, parsed.data);
        res.status(200).json({ data: updatedProduct });
    }
    catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProduct = updateProduct;
