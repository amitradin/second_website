// controllers/task.controller.js

import Task from "../models/Task.js";
import { bucket } from "../middleware/upload.js";

// @desc   Get all tasks for the authenticated user
// @route  GET /tasks/
export async function getAllTasks(req, res) {
  try {
    // req.user is set by the authenticateToken middleware
    const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 }); // sort by due date
    res.json(tasks);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
}

// @desc   Create a new task for the authenticated user
// @route  POST /tasks/add
export async function createTask(req, res) {
  try {
    const { title, content, course, priority, dueDate } = req.body;
    if (!title || !course || !dueDate) {
      return res
        .status(400)
        .json("Error: Title, course, and due date are required.");
    }
    // Parse date from DD.MM.YYYY format
    let parsedDate;
    if (dueDate.includes(".")) {
      const [day, month, year] = dueDate.split(".");
      parsedDate = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      parsedDate = new Date(dueDate);
    }

    const newTask = new Task({
      user: req.user._id, // Associate task with authenticated user
      title,
      course,
      content,
      priority,
      dueDate: parsedDate,
    });
    await newTask.save();
    res.status(200).json(newTask);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
}

// @desc   Get a specific task by ID (only if it belongs to the authenticated user)
// @route  GET /tasks/:id
export async function getTaskById(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json("Error: Task not found or access denied");
    }
    res.json(task);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
}

// @desc   Delete a task (only if it belongs to the authenticated user)
// @route  DELETE /tasks/:id
export async function deleteTask(req, res) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!task) {
      return res.status(404).json("Error: Task not found or access denied");
    }
    res.json("Task deleted.");
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
}

// @desc   Update a task (only if it belongs to the authenticated user)
// @route  POST /tasks/update/:id
export async function updateTask(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json("Error: Task not found or access denied");
    }

    task.title = req.body.title;
    task.course = req.body.course;
    task.content = req.body.content;
    task.priority = req.body.priority;

    // Parse date from DD.MM.YYYY format
    if (req.body.dueDate) {
      if (req.body.dueDate.includes(".")) {
        const [day, month, year] = req.body.dueDate.split(".");
        task.dueDate = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        task.dueDate = new Date(req.body.dueDate);
      }
    }

    task.completed = req.body.completed;

    await task.save();
    res.json("Task updated!");
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
}

export async function uploadTaskFiles(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json("Error : Task wasn't found");
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json("Error: no files uploaded");
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        // Debug: Log what we're receiving
        console.log('Original filename received:', file.originalname);
        console.log('Filename buffer:', Buffer.from(file.originalname));
        console.log('Filename as hex:', Buffer.from(file.originalname).toString('hex'));
        
        // Handle Hebrew characters properly
        let originalName = file.originalname;
        
        // Try to detect and fix corrupted Hebrew
        const isCorrupted = originalName.includes('×') || originalName.includes('�') || /[\u0080-\u00FF]/.test(originalName);
        
        if (isCorrupted) {
          console.log('Detected corrupted Hebrew filename, attempting recovery...');
          // Try to recover by converting from latin1 to utf8 (common corruption pattern)
          try {
            const recoveredName = Buffer.from(originalName, 'latin1').toString('utf8');
            console.log('Attempted recovery result:', recoveredName);
            // Only use recovered name if it looks reasonable (contains Hebrew characters)
            if (/[\u0590-\u05FF]/.test(recoveredName)) {
              originalName = recoveredName;
              console.log('Successfully recovered Hebrew filename:', originalName);
            } else {
              console.log('Recovery failed, using fallback name');
              const ext = file.mimetype.split('/')[1] || 'file';
              originalName = `קובץ_${Date.now()}.${ext}`;
            }
          } catch (error) {
            console.log('Recovery failed with error:', error);
            const ext = file.mimetype.split('/')[1] || 'file';
            originalName = `קובץ_${Date.now()}.${ext}`;
          }
        }
        
        // Use a safe filename for GridFS but store original in metadata
        const safeGridFSName = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const uploadStream = bucket.openUploadStream(safeGridFSName, {
          metadata: {
            taskId: req.params.id,
            userId: req.user._id,
            mimetype: file.mimetype,
            originalFilename: originalName, // Store Hebrew name here
          },
        });
        uploadStream.end(file.buffer);

        uploadStream.on("finish", () => {
          console.log('Stored filename for display:', originalName);
          resolve({
            fileId: uploadStream.id,
            filename: uploadStream.filename,
            originalName: originalName, // Store the Hebrew filename for display
            mimetype: file.mimetype,
            size: file.size,
          });
        });
        uploadStream.on("error", reject);
      });
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    task.attachments.push(...uploadedFiles);
    await task.save();

    // Send success response - THIS WAS MISSING!
    res.json({
      message: "Files uploaded successfully",
      attachments: uploadedFiles,
    });
  } catch (error) {
    res.status(400).json("Error in uploading the task: " + error);
  }
}

export async function downloadTaskFile(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const attachment = task.attachments.find((att) => att.fileId.toString() === req.params.fileId);
    if (!attachment) {
      return res.status(404).json("Attachment not found");
    }
    const downloadStream = bucket.openDownloadStream(attachment.fileId);

    // Handle Hebrew and Unicode filenames properly for download
    const originalName = attachment.originalName;
    const encodedFilename = encodeURIComponent(originalName);
    const asciiFilename = originalName.replace(/[^\x00-\x7F]/g, "_"); // Fallback for older browsers
    
    res.set({
      "Content-Type": attachment.mimetype,
      "Content-Disposition": `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
    });

    downloadStream.pipe(res);

    downloadStream.on("error", () => {
      res.status(404).json("Error: file not found in storage");
    });
  } catch (error) {
    res.status(400).json("Error downloading the file" + error);
  }
}

export async function deleteTaskFile(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json("Task not found");  
    }
    const attachmentIndex = task.attachments.findIndex(
      (att) => att.fileId.toString() === req.params.fileId  
    );
    if (attachmentIndex === -1) {
      return res.status(404).json("Attachment not found");  
    }

    const attachment = task.attachments[attachmentIndex];

    await bucket.delete(attachment.fileId);

    task.attachments.splice(attachmentIndex, 1);
    await task.save();

    res.json("File deleted successfully");

  } catch (error) {  // ← Fixed typo: error not erorr
    res.status(400).json("Error deleting: " + error);
  }
}
