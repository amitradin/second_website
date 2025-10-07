import express from "express"
import { getAllTasks, createTask, getTaskById, deleteTask, updateTask } from "../controllers/taskController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router();

// Route to get all tasks (protected)
router.get("/", authenticateToken, getAllTasks);

// Route to create a new task (protected)
router.post("/add", authenticateToken, createTask);

// Route to get a specific task by ID (protected)
router.get("/:id", authenticateToken, getTaskById);

// Route to delete a task by ID (protected)
router.delete("/:id", authenticateToken, deleteTask);

// Route to update a task by ID (protected)
router.put("/update/:id", authenticateToken, updateTask);

export default router;