# AI Networking Companion API

A scalable Node.js + TypeScript backend API for the AI Networking Companion app with authentication and AI features.

## 🚀 Features

- ✅ **TypeScript** - Full type safety
- ✅ **Express.js** - Fast, minimalist web framework
- ✅ **MongoDB** - NoSQL database with Mongoose ODM
- ✅ **Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Security** - Helmet, CORS, rate limiting
- ✅ **Validation** - Input validation and sanitization
- ✅ **Error Handling** - Centralized error handling
- ✅ **Code Quality** - ESLint + Prettier
- ✅ **Modular Architecture** - Clean, scalable structure

## 📁 Project Structure

```
synkicycle-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Route controllers
│   │   └── auth.controller.ts
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.ts
│   │   └── errorHandler.ts
│   ├── models/          # Database models
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   └── auth.routes.ts
│   ├── types/           # TypeScript type definitions
│   │   └── express.d.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts
│   │   └── validation.ts
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Application entry point
├── .env.example         # Environment variables template
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-networking-companion
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   OPENAI_API_KEY=your-openai-api-key
   ```

## 🚀 Running the Application

### Development mode (with hot reload):
```bash
npm run dev
```

### Production build:
```bash
npm run build
npm start
```

### Linting & Formatting:
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## 📡 API Endpoints

### Authentication

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "bio": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "bio": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64abc123...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "bio": "",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Server returns JWT token
3. Client stores token (localStorage/cookies)
4. Client includes token in `Authorization` header for protected routes:
   ```
   Authorization: Bearer <token>
   ```

## 🏗️ Architecture Highlights

### Path Aliases
The project uses TypeScript path aliases for cleaner imports:

```typescript
import User from '@models/User';
import { protect } from '@middleware/auth.middleware';
import { generateToken } from '@utils/jwt';
```

### Middleware Stack
1. Helmet (security headers)
2. CORS (cross-origin resource sharing)
3. Compression (response compression)
4. Body Parser (JSON/URL-encoded)
5. Morgan (logging)
6. Rate Limiting (DDoS protection)

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- Development vs production error details

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers
- `compression` - Response compression
- `morgan` - HTTP logger
- `express-rate-limit` - Rate limiting
- `socket.io` - WebSocket support (for future features)
- `openai` - OpenAI API client (for AI features)

### Development
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `@types/*` - TypeScript type definitions
- `eslint` - Code linting
- `prettier` - Code formatting

## 🚧 Next Steps

This is a foundational setup. You can expand it with:

- [ ] Profile management endpoints
- [ ] File upload (avatar/documents)
- [ ] Real-time features with Socket.io
- [ ] AI chat integration with OpenAI
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social authentication (Google, GitHub, etc.)
- [ ] Admin routes and permissions
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 License

ISC

## 👨‍💻 Author

Your Name

---

**Happy Coding! 🚀**

