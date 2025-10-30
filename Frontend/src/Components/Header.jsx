import React, { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios.js";

const Header = () => {
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleToggleNotifications = async () => {
    if (!user) return; // Should not happen if the toggle is rendered conditionally

    const newNotificationStatus = !user.notification;

    try {
      // Optimistic UI update
      const updatedUser = { ...user, notification: newNotificationStatus };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      await axiosInstance.post("/users/notifications/toggle", {
        enabled: newNotificationStatus, // Backend expects 'enabled'
      });
      // No need for toast.success here, as the UI is already updated
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      // Revert UI on error
      setUser(user); // Revert to previous state
      localStorage.setItem("user", JSON.stringify(user));
      toast.error("Failed to update notification preference.");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-2 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-gray-800 truncate">
            University Task Tracker
          </h1>
        </div>
        {user && (
          <div className="flex items-center space-x-1 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
             
              <span className="hidden sm:inline text-sm text-gray-700">
                notifications
              </span>
                <div>
                  <input type="checkbox" className="toggle toggle-xs sm:toggle-sm bg-gray-400"
                  checked={user.notification} // Control the checkbox with the user's notification status
                  onChange={handleToggleNotifications}/>
               </div>

              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0 ml-1 sm:ml-0" />
              <span className="text-sm text-gray-700 truncate min-w-0">
                <span className="hidden sm:inline">{user.lastName}</span>
                <span className="sm:hidden">{user.firstName}</span>
                <span className="hidden sm:inline"> {user.firstName}</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
