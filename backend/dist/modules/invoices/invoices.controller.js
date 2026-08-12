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
exports.generateInvoicePdf = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const invoiceService = __importStar(require("./invoices.service"));
const createInvoice = async (req, res, next) => {
    try {
        const { challanId } = req.body;
        // Assuming authenticate middleware attaches user to req.user
        const userId = req.user?.userId;
        const invoice = await invoiceService.createInvoice(challanId, userId);
        res.status(201).json({ data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoice = createInvoice;
const getInvoices = async (req, res, next) => {
    try {
        const result = await invoiceService.getInvoices(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res, next) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);
        res.status(200).json({ data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceById = getInvoiceById;
const generateInvoicePdf = async (req, res, next) => {
    try {
        await invoiceService.generateInvoicePdf(req.params.id, res);
    }
    catch (error) {
        next(error);
    }
};
exports.generateInvoicePdf = generateInvoicePdf;
