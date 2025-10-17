// Full-stack server file for Render deployment
import express from "express";
import cors from "cors";
import { connectDB } from "./Backend/src/config/db.js"; 
import path from "path";
import { fileURLToPath } from 'url';

import dotenv from "dotenv";
import taskRoutes from "./Backend/src/routes/taskRoutes.js";
import userRoutes from "./Backend/src/routes/userRoutes.js";

import {checkDueTasks} from './Backend/src/services/sendNotification.js';
import rateLimiter from "./Backend/src/middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './Backend/.env', quiet: true });

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173", 
  "http://127.0.0.1:3000", 
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// API routes with rate limiting
app.use("/api/tasks", rateLimiter, taskRoutes);
app.use("/api/users", rateLimiter, userRoutes);

// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, 'Frontend/dist')));
  
  // Handle React routing, return all requests to React app
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/dist', 'index.html'));
  });
} else {
  // Development API status route
  app.get('/', (req, res) => {
    res.json({
      message: 'University Task Tracker API is running!',
      version: '1.0.0',
      endpoints: {
        tasks: '/api/tasks',
        users: '/api/users'
      },
      status: 'healthy'
    });
  });
}

// Use environment port or default to 5001
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
