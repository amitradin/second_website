import React, { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">University Task Tracker</h1>
        </div>
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 min-w-0">
              <User className="w-5 h-5 text-gray-600 shrink-0" />
              <span className="text-sm text-gray-700 truncate max-w-[140px] sm:max-w-none">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
