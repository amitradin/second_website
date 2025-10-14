import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { Menu, Inbox, Plus, CheckCircle, ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { formatDate, formatDateForInput } from "../lib/utils.js";
const EditTask = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    content: "",
    priority: "",
    dueDate: "",
    attachments: [], // Include attachments to preserve them
  });
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTask = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axiosInstance.get(`/tasks/${id}`);
      setTask(response.data);

      // Populate form data with task data
      const taskData = response.data;
      setFormData({
        title: taskData.title || "",
        course: taskData.course || "",
        content: taskData.content || "",
        priority: taskData.priority || "",
        dueDate: formatDateForInput(taskData.dueDate) || "",
        attachments: taskData.attachments || [], // Preserve existing attachments
        completed: taskData.completed || false, // Preserve completed status
      });

      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      //capitalize first letter of priority
      formData.priority =
        formData.priority == "Select priority..."
          ? task.priority
          : formData.priority[0].toUpperCase() + formData.priority.slice(1);

      await axiosInstance.put(`/tasks/update/${id}`, formData);
      toast.success("Task edited successfully!");
      console.log(formData);
      navigate(`/task/${id}`); // Redirect to the edited task page
    } catch (error) {
      console.error("Error Editing task:", error);
      console.error(formData);
      toast.error("Failed to edit task");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p className="text-red-600">Error loading task: {error.message}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Don't render form until task is loaded
  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <p className="text-gray-600">Task not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      <div className="w-full p-4 lg:p-8 ">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6 lg:mb-8">
            <button
              onClick={() => navigate(`/task/${id}`)} // go back to the Task
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to tasks"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Edit Task
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2
                   focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white
                    text-black"
                  placeholder={"Enter task title"}
                />
              </div>

              {/* Course Field */}
              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black rounded-lg 
                  focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 transition-colors bg-white text-black"
                  placeholder={"Enter course name"}
                />
              </div>

              {/* Content Field */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Description
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-black rounded-lg 
                  focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 transition-colors resize-vertical bg-white text-black"
                  placeholder={"Enter task description"}
                ></textarea>
              </div>

              {/* Priority Field - Optional */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2
                   focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black"
                >
                  <option value="">Select priority...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date Field */}
              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/task/${id}`)}
                  className="sm:flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? "Loading..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
