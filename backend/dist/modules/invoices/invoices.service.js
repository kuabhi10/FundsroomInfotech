"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePdf = exports.getInvoiceById = exports.getInvoices = exports.createInvoice = void 0;
const client_1 = require("@prisma/client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma = new client_1.PrismaClient();
// Utility to generate the next invoice number safely using the sequence table
async function generateInvoiceNumber() {
    const sequence = await prisma.invoiceSequence.create({
        data: {},
    });
    // Pad with leading zeros, e.g., INV-0001
    const paddedId = String(sequence.id).padStart(4, '0');
    return `INV-${paddedId}`;
}
const createInvoice = async (challanId, createdById) => {
    const challan = await prisma.challan.findUnique({
        where: { id: challanId },
        include: { invoice: true, customer: true }
    });
    if (!challan) {
        throw { status: 404, message: 'Challan not found' };
    }
    if (challan.status !== 'CONFIRMED') {
        throw { status: 400, message: 'Only CONFIRMED challans can be invoiced' };
    }
    if (challan.invoice) {
        throw { status: 400, message: 'Invoice already exists for this challan' };
    }
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            challanId: challan.id,
            customerId: challan.customerId,
            totalAmount: challan.totalAmount,
            status: 'GENERATED'
        }
    });
    return invoice;
};
exports.createInvoice = createInvoice;
const getInvoices = async (filters) => {
    const { customerId, dateFrom, dateTo, page = '1', limit = '20' } = filters;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 20;
    const skip = (pageNumber - 1) * pageSize;
    const where = {};
    if (customerId)
        where.customerId = customerId;
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom)
            where.createdAt.gte = new Date(dateFrom);
        if (dateTo)
            where.createdAt.lte = new Date(dateTo);
    }
    const [data, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true, businessName: true } },
                challan: { select: { challanNumber: true } }
            }
        }),
        prisma.invoice.count({ where }),
    ]);
    return { data, total, page: pageNumber, limit: pageSize };
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (id) => {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            challan: {
                include: {
                    items: true
                }
            }
        }
    });
    if (!invoice) {
        throw { status: 404, message: 'Invoice not found' };
    }
    return invoice;
};
exports.getInvoiceById = getInvoiceById;
const generateInvoicePdf = async (id, res) => {
    const invoice = await (0, exports.getInvoiceById)(id);
    const doc = new pdfkit_1.default({ margin: 50 });
    // Trick IDM by returning a generic octet-stream and NO Content-Disposition
    res.setHeader('Content-Type', 'application/octet-stream');
    doc.pipe(res);
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, { align: 'right' });
    doc.text(`Generated from Challan #: ${invoice.challan.challanNumber}`, { align: 'right' });
    doc.moveDown();
    // Customer Info
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(invoice.customer.businessName);
    doc.text(invoice.customer.name);
    if (invoice.customer.address)
        doc.text(invoice.customer.address);
    if (invoice.customer.mobile)
        doc.text(`Mobile: ${invoice.customer.mobile}`);
    if (invoice.customer.gstNumber)
        doc.text(`GST: ${invoice.customer.gstNumber}`);
    doc.moveDown(2);
    // Table Header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 250;
    const col3 = 350;
    const col4 = 450;
    doc.font('Helvetica-Bold');
    doc.text('Product Name', col1, tableTop);
    doc.text('Quantity', col2, tableTop, { width: 90, align: 'right' });
    doc.text('Unit Price', col3, tableTop, { width: 90, align: 'right' });
    doc.text('Line Total', col4, tableTop, { width: 90, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');
    let y = tableTop + 25;
    // Table Rows
    for (const item of invoice.challan.items) {
        // productSnapshot contains { name, sku, unitPrice }
        const snap = item.productSnapshot;
        const name = snap?.name || 'Unknown Product';
        const price = Number(snap?.unitPrice || 0).toFixed(2);
        const lineTotal = Number(item.lineTotal).toFixed(2);
        doc.text(name, col1, y);
        doc.text(item.quantity.toString(), col2, y, { width: 90, align: 'right' });
        doc.text(price, col3, y, { width: 90, align: 'right' });
        doc.text(lineTotal, col4, y, { width: 90, align: 'right' });
        y += 20;
    }
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    // Total
    doc.font('Helvetica-Bold');
    doc.text('Total Amount:', col3, y, { width: 90, align: 'right' });
    doc.text(Number(invoice.totalAmount).toFixed(2), col4, y, { width: 90, align: 'right' });
    doc.end();
};
exports.generateInvoicePdf = generateInvoicePdf;
