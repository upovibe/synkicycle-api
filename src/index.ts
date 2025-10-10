import app from './app';
import connectDB from '@config/database';
import { config } from '@config/env';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  // Connect to database for local development
  connectDB().then(() => {
    // Start server for local development
    const PORT = config.PORT || 5000;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`   AI Networking Companion API`);
      console.log('   ========================================');
      console.log(`   Environment: ${config.NODE_ENV}`);
      console.log(`   Server: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log('   ========================================');
      console.log('');
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

