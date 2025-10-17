import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js"; 

import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import {checkDueTasks} from './services/sendNotification.js';
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config({ quiet: true });

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173", 
  "http://127.0.0.1:3000", 
  "http://127.0.0.1:5173",
  "https://university-task-tracker-frontend.onrender.com", // Frontend Render URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(rateLimiter);

// Root route - API status
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

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);


// Use environment port or default to 5001
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});
