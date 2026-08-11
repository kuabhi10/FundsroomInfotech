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
exports.createStockMovement = exports.getStockMovements = void 0;
const stockMovementsService = __importStar(require("./stockMovements.service"));
const stockMovements_schema_1 = require("./stockMovements.schema");
const getStockMovements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            productId: req.query.productId,
            type: req.query.type,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
        };
        const result = await stockMovementsService.getStockMovements(filters, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getStockMovements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStockMovements = getStockMovements;
const createStockMovement = async (req, res) => {
    try {
        const parsed = stockMovements_schema_1.createStockMovementSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
            return;
        }
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const newMovement = await stockMovementsService.createStockMovement(parsed.data, userId);
        res.status(201).json({ data: newMovement });
    }
    catch (error) {
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
exports.createStockMovement = createStockMovement;
