import React from "react";
import { Menu, Inbox, Plus, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({
  activeRoute,
  taskCount,
  lowPriorityCount,
  mediumPriorityCount,
  highPriorityCount,
  statisticsLabel = "Tasks",
}) => {
  return (
    <div className="bg-gray-400 text-gray-800">
      {/* Sidebar content */}
      <div className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-5 sm:mb-7">
          Task Manager
        </h2>
        <ul className="menu p-0 w-full bg-gray-300 rounded-lg">
          <li className="mb-2">
            <Link
              to="/"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "pending" ? "bg-gray-200" : ""
              }`}
            >
              <Inbox className="w-5 h-5 mr-3" />
              <span className="truncate">Pending Tasks</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/create-task"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "create" ? "bg-gray-200" : ""
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              <span className="truncate">Create Task</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/completed"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "completed" ? "bg-gray-200" : ""
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              <span className="truncate">Completed</span>
            </Link>
          </li>
        </ul>

        {/* Task Statistics */}
        <div className="mt-6 sm:mt-8">
          <h3 className="text-xs sm:text-sm font-semibold text-base-content/70 mb-3">
            Statistics
          </h3>
          <div className="stats stats-vertical shadow w-full bg-gray-300">
            <div className="stat p-3">
              <div className="flex items-center space-x-1">
                <div className="stat-title text-xs text-black">
                  {`Total ${statisticsLabel}:`}
                </div>
                <div className="stat-value text-sm font-semibold">{taskCount}</div>
              </div>
              
              <div className="pl-2 mt-2 space-y-0.5">
                <div className="flex items-center space-x-1">
                  <div className="stat-title text-xs text-black">- Low priority:</div>
                  <div className="stat-value text-sm font-semibold">{lowPriorityCount}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="stat-title text-xs text-black">- Medium priority:</div>
                  <div className="stat-value text-sm font-semibold">{mediumPriorityCount}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="stat-title text-xs text-black">- High priority:</div>
                  <div className="stat-value text-sm font-semibold">{highPriorityCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
