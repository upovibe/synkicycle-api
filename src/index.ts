import { server } from './app';
import connectDB from '@config/database';
import { config } from '@config/env';

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

// Start server
server.listen(config.PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`   AI Networking Companion API`);
  console.log('   ========================================');
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Server: http://localhost:${config.PORT}`);
  console.log(`   Health: http://localhost:${config.PORT}/health`);
  console.log(`   Socket.io: http://localhost:${config.PORT}`);
  console.log('   ========================================');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated!');
  });
});

