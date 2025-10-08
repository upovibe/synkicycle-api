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
    // Try multiple possible paths for Vercel deployment
    const possiblePaths = [
      join(__dirname, 'views', 'status.html'),
      join(process.cwd(), 'dist', 'views', 'status.html'),
      join(process.cwd(), 'src', 'views', 'status.html'),
      join(__dirname, '..', 'views', 'status.html')
    ];
    
    let html = '';
    let found = false;
    
    for (const htmlPath of possiblePaths) {
      try {
        html = readFileSync(htmlPath, 'utf8');
        found = true;
        break;
      } catch {
        // Continue to next path
      }
    }
    
    if (found) {
      // Replace timestamp placeholder
      html = html.replace('{{timestamp}}', new Date().toLocaleString());
      res.status(200).setHeader('Content-Type', 'text/html').send(html);
    } else {
      throw new Error('HTML file not found');
    }
  } catch {
    // Fallback - return inline HTML
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Networking Companion API</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: white; margin: 0; }
        .container { text-align: center; max-width: 600px; padding: 2rem; background: rgba(255, 255, 255, 0.1); border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
        .logo { font-size: 3rem; margin-bottom: 1rem; }
        h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(45deg, #fff, #f0f0f0); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .status { display: inline-block; background: #4ade80; color: #065f46; padding: 0.5rem 1rem; border-radius: 50px; font-weight: bold; margin: 1rem 0; }
        .version { color: #cbd5e1; margin-bottom: 2rem; }
        .endpoints { text-align: left; background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 10px; margin: 1rem 0; }
        .endpoint { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .endpoint:last-child { border-bottom: none; }
        .method { background: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
        .method.post { background: #10b981; }
        .method.put { background: #f59e0b; }
        .path { font-family: 'Courier New', monospace; color: #e2e8f0; }
        .footer { margin-top: 2rem; color: #94a3b8; font-size: 0.9rem; }
        .timestamp { color: #64748b; font-size: 0.8rem; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🤖</div>
        <h1>AI Networking Companion</h1>
        <div class="status">🟢 Server Running</div>
        <div class="version">Version 1.0.0</div>
        <div class="endpoints">
            <h3 style="margin-bottom: 1rem; color: #e2e8f0;">API Endpoints</h3>
            <div class="endpoint"><span class="method">GET</span><span class="path">/health</span></div>
            <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/register</span></div>
            <div class="endpoint"><span class="method post">POST</span><span class="path">/api/auth/login</span></div>
            <div class="endpoint"><span class="method">GET</span><span class="path">/api/auth/me</span></div>
            <div class="endpoint"><span class="method put">PUT</span><span class="path">/api/auth/profile</span></div>
        </div>
        <div class="footer">
            <p>🚀 Ready to power your AI networking experience!</p>
            <div class="timestamp">Last updated: ${new Date().toLocaleString()}</div>
        </div>
    </div>
</body>
</html>
    `;
    res.status(200).setHeader('Content-Type', 'text/html').send(fallbackHtml);
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

