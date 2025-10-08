import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '@config/env';

// Import routes
import authRoutes from '@routes/auth.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Root route - Beautiful status page
app.get('/', (_req: Request, res: Response) => {
  try {
    const htmlPath = join(__dirname, 'views', 'status.html');
    let html = readFileSync(htmlPath, 'utf8');
    
    // Replace timestamp placeholder
    html = html.replace('{{timestamp}}', new Date().toLocaleString());
    
    res.status(200).setHeader('Content-Type', 'text/html').send(html);
  } catch {
    // Fallback if file not found
    res.status(200).json({
      success: true,
      message: '🚀 AI Networking Companion API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('Error:', err.stack);
  
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

