import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import customersRoutes from './modules/customers/customers.routes';
import productsRoutes from './modules/products/products.routes';
import stockMovementsRoutes from './modules/stockMovements/stockMovements.routes';
import challansRoutes from './modules/challans/challans.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';

const app = express();

// Dynamic CORS configuration supporting Vercel previews, local dev, and cleaned FRONTEND_URL env var
const getCleanOrigin = (urlStr: string) => {
  try {
    const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    return new URL(formatted).origin;
  } catch {
    return urlStr;
  }
};

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(item => item.trim())
  .filter(Boolean)
  .map(getCleanOrigin);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests, mobile apps, or Postman (no origin header)
    if (!origin) return callback(null, true);

    const cleanReqOrigin = getCleanOrigin(origin);

    // Check if origin matches allowedOrigins, Vercel deployments (*.vercel.app), or localhost
    const isAllowed = 
      configuredOrigins.includes(cleanReqOrigin) ||
      /\.vercel\.app$/.test(cleanReqOrigin) ||
      /^http:\/\/localhost:\d+$/.test(cleanReqOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      // Fallback: allow to prevent CORS block on internal tool
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/stock-movements', stockMovementsRoutes);
app.use('/challans', challansRoutes);
app.use('/invoices', invoicesRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    details: err.details || undefined,
  });
});

export default app;
