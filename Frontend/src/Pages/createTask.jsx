import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { Menu, Inbox, Plus, CheckCircle, ArrowLeft } from "lucide-react";
import {Link} from "react-router-dom";

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    content: "",
    priority: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      formData.priority = formData.priority[0].toUpperCase() + formData.priority.slice(1);
      await axiosInstance.post("/tasks/add", formData);
      toast.success("Task created successfully!");
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      {/* Left - Navigation Drawer */}
      <div className="w-full lg:w-1/4 p-4">
        <div className="drawer lg:drawer-open ">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            {/* Mobile menu button */}
            <div className="navbar lg:hidden">
              <div className="flex-none">
                <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                  <Menu className="w-6 h-6" />
                </label>
              </div>
            </div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay"></label>
            <aside className="w-64 min-h-full bg-gray-400 text-gray-800">
              {/* Sidebar content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Task Manager</h2>
                <ul className="menu p-0 w-full bg-gray-300 rounded-lg">
                  <li className="mb-2">
                    <Link to="/" className="flex items-center p-3 rounded-lg ">
                      <Inbox className="w-5 h-5 mr-3" />
                      Pending Tasks
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/create-task"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-200 bg-gray-200"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Create Task
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link
                      to="/completed"
                      className="flex items-center p-3 rounded-lg hover:bg-gray-200 "
                    >
                      <CheckCircle className="w-5 h-5 mr-3" />
                      Completed
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Right - Create Task Form */}
      <div className="w-full lg:w-3/4 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6 lg:mb-8">
            <button
              onClick={() => navigate("/")}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Back to tasks"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Create New Task
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
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2
                   focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white
                    text-black"
                  placeholder="Enter task title..."
                />
              </div>

              {/* Course Field */}
              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Course *
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black rounded-lg 
                  focus:ring-2 focus:ring-blue-500 
                  focus:border-blue-500 transition-colors bg-white text-black"
                  placeholder="Enter course name..."
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
                  placeholder="Enter task description (optional)..."
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
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="sm:flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
