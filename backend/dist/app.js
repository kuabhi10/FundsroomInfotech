"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const customers_routes_1 = __importDefault(require("./modules/customers/customers.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const stockMovements_routes_1 = __importDefault(require("./modules/stockMovements/stockMovements.routes"));
const app = (0, express_1.default)();
// Dynamic CORS configuration supporting Vercel previews, local dev, and cleaned FRONTEND_URL env var
const getCleanOrigin = (urlStr) => {
    try {
        const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
        return new URL(formatted).origin;
    }
    catch {
        return urlStr;
    }
};
const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(getCleanOrigin);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server requests, mobile apps, or Postman (no origin header)
        if (!origin)
            return callback(null, true);
        const cleanReqOrigin = getCleanOrigin(origin);
        // Check if origin matches allowedOrigins, Vercel deployments (*.vercel.app), or localhost
        const isAllowed = configuredOrigins.includes(cleanReqOrigin) ||
            /\.vercel\.app$/.test(cleanReqOrigin) ||
            /^http:\/\/localhost:\d+$/.test(cleanReqOrigin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            // Fallback: allow to prevent CORS block on internal tool
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/customers', customers_routes_1.default);
app.use('/products', products_routes_1.default);
app.use('/stock-movements', stockMovements_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        details: err.details || undefined,
    });
});
exports.default = app;
