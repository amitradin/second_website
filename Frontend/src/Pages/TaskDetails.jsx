import React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios.js";
import { Circle, ChevronLeft, SquarePen, Trash2, File } from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils.js";

const TaskDetails = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchTask = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axiosInstance.get(`/tasks/${id}`);
      setTask(response.data);
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

  const handleUpload = async (files) => {
    if (!files || files.length === 0) {
      toast.error("No files selected for upload");
      return;
    }

    try {
      toast.loading("Uploading files...", { id: "upload-toast" });
      setUploadLoading(true);

      // Create FormData to send files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Upload files to the task
      const response = await axiosInstance.post(
        `/tasks/${id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Show success message
      toast.success(
        `${response.data.attachments.length} file(s) uploaded successfully!`,
        { id: "upload-toast" }
      );

      // Refresh task data to show new files (without showing loading state)
      await fetchTask(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files. Please try again.", {
        id: "upload-toast",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileInputChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleUpload(files);
      // Clear the input after upload using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleFileDelete = async (fileId, fileName) => {
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      // Show loading toast for delete operation
      toast.loading(`Deleting "${fileName}"...`, { id: "delete-toast" });

      // API call to delete the file
      await axiosInstance.delete(`/tasks/${id}/files/${fileId}`);

      // Success feedback
      toast.success(`"${fileName}" deleted successfully!`, {
        id: "delete-toast",
      });

      // Refresh task data to remove deleted file from UI (without showing loading state)
      await fetchTask(false);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file. Please try again.", {
        id: "delete-toast",
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      // Show loading feedback
      toast.loading("Downloading file...", { id: "download-toast" });

      // API call to download the file
      const response = await axiosInstance.get(`/tasks/${id}/files/${fileId}`, {
        responseType: "blob", // Important: tells axios to expect binary data
      });

      // Create a blob URL for the downloaded file
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      // Create a temporary download link and click it
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName; // Use the original filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success feedback
      toast.success(`"${fileName}" downloaded successfully!`, {
        id: "download-toast",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file. Please try again.", {
        id: "download-toast",
      });
    }
  };

  const handleStateChange = async () => {
    // this is for changing a pending task to completed and vice versa
    try {
      toast.loading("Updating task status...", { id: "status-toast" });
      const response = await axiosInstance.put(`/tasks/update/${id}`, {
        title: task.title,
        course: task.course,
        content: task.content,
        priority: task.priority,
        dueDate: formatDate(task.dueDate),
        attachments: task.attachments,
        completed: !task.completed,
      });
      toast.success(
        `Task marked as ${response.data.completed ? "completed" : "pending"}!`,
        { id: "status-toast" }
      );
      await fetchTask(false);
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status. Please try again.", {
        id: "status-toast",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-black">Loading task details...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading task: {error.message}
      </div>
    );
  }

  if (!task) {
    return <div className="text-center text-black">Task not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Tasks
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {task.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${
                      task.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {task.completed ? "✓ Completed" : "⏳ Pending"}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${
                      task.priority === "High"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:ml-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate(`/edit-task/${task._id}`)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <SquarePen className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this task?"
                      )
                    ) {
                      axiosInstance.delete(`/tasks/${task._id}`);
                      navigate("-1");
                    }
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h2>
              {task.content ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {task.content}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>

            {/* File Attachments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  File Attachments
                </h2>
                {uploadLoading && (
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading...
                  </div>
                )}
              </div>

              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {task.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <File className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleDownload(file.fileId, file.originalName)
                          }
                          className="flex-1 sm:flex-none px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-center"
                        >
                          Download
                        </button>
                        <button
                          onClick={() =>
                            handleFileDelete(file.fileId, file.originalName)
                          }
                          className="flex-1 sm:flex-none px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-6">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    No files attached to this task
                  </p>
                </div>
              )}

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Files
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                      disabled={uploadLoading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                        uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="text-center">
                        <File className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {uploadLoading ? 'Uploading...' : 'Choose files to upload'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Click to select multiple files
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Select one or more files to upload. Supported formats: 
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  jpeg | jpg | png | gif | pdf | doc | docx | txt | zip | rar
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Task Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Task Details
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-bold text-gray-500">Course</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.course}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div>
                    <dt className="text-sm font-bold text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(task.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleStateChange();
                  }}
                  className={`w-full flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    task.completed
                      ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                      : "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {task.completed ? "Mark as Pending" : "Mark as Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
