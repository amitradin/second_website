//This is the task card itself

import React from "react";
import { formatDate } from "../lib/utils.js";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { CheckCircle, Circle, Calendar } from "lucide-react";

const Task = ({ task, setTask }) => {
  // Function to get priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // make sure the page doesn't reload
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await axiosInstance.delete(`/tasks/${id}`); // delete the task
      toast.success("Task deleted successfully");
      setTask((prevTasks) => prevTasks.filter((task) => task._id !== id)); // update the state to remove the deleted task

    } catch (error) {
      toast.error("Failed to delete the task");
    }
  };

  const handleComplete = async (e, id) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation(); // prevent event bubbling
    try {
      // Toggle the completion status
      const updatedTask = { ...task, completed: !task.completed };

      await axiosInstance.put(`/tasks/update/${id}`, {
        title: task.title,
        course: task.course,
        content: task.content,
        priority: task.priority,
        dueDate: formatDate(task.dueDate),
        completed: !task.completed,
      });

      // Update the local state
      setTask((prevTasks) => prevTasks.filter((task) => task._id !== id));

      toast.success(
        updatedTask.completed
          ? "Task marked as completed!"
          : "Task marked as pending!"
      );
    } catch (error) {
      console.error("Error updating task:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to update task status");
    }
  };

  // now for the actual task card
  return (
    <div className="card w-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 mb-4 border border-gray-200 rounded-lg">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            {/* Completion Status Icon */}
            <div className="mr-3">
              <button
                onClick={(e) => handleComplete(e, task._id)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                title={task.completed ? "Mark as pending" : "Mark as completed"}
              >
                {task.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            <div className="flex-1">
              <Link to={`/task/${task._id}`} className="block">
                <h2
                  className={`text-lg font-semibold hover:text-blue-600 transition-colors ${
                    task.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {task.title}
                </h2>

                {/* Course */}
                {task.course && (
                  <p
                    className={`text-sm font-medium mt-1 ${
                      task.completed ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    Course: {task.course}
                  </p>
                )}

                {/* Content/Description */}
                {task.content && (
                  <p
                    className={`text-sm mt-2 ${
                      task.completed ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {task.content}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(task.createdAt)}
                  </p>
                  <Circle className={`w-4 h-4 ${getPriorityColor(task.priority)} `} fill="currentColor" />
                  <p className={`p-1 font-medium ${getPriorityColor(task.priority)}`}>
                    Priority: {task.priority}
                  </p>
                  {task.dueDate ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <p
                        className={`text-sm font-medium ${
                          task.completed ? "text-gray-400" : "text-orange-600"
                        }`}
                      >
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </Link>
            </div>
          </div>
          <div className="ml-4">
            <button
              className="btn btn-sm btn-error text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              onClick={(e) => handleDelete(e, task._id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Task;
