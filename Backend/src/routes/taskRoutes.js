import express from "express"
import { getAllTasks, createTask, getTaskById, deleteTask, updateTask, uploadTaskFiles, downloadTaskFile, deleteTaskFile } from "../controllers/taskController.js"
import { authenticateToken } from "../middleware/auth.js"
import upload from "../middleware/upload.js"

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

// Route to upload files to a task (protected)
router.post("/:id/upload", authenticateToken, upload.array('files', 5), uploadTaskFiles);

router.get("/:id/files/:fileId" , authenticateToken , downloadTaskFile)

router.delete("/:id/files/:fileId" ,authenticateToken, deleteTaskFile)

export default router;