import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js"; 

import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import './services/sendNotifications.js';
import { checkDueTasks } from "./services/sendNotifications.js";

dotenv.config({ quiet: true });

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(express.json());

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

connectDB().then(() => {
  app.listen(5001, () => {
    console.log("port 5001");
  });
});
