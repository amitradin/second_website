import React from "react";
import { Menu, Inbox, Plus, CheckCircle } from "lucide-react";

const Sidebar = ({ activeRoute, taskCount, statisticsLabel = "Tasks" }) => {
  return (
    <div className="bg-gray-400 text-gray-800">
      {/* Sidebar content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-7">Task Manager</h2>
        <ul className="menu p-0 w-full bg-gray-300 rounded-lg">
          <li className="mb-2">
            <a
              href="/"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "pending" ? "bg-gray-200" : ""
              }`}
            >
              <Inbox className="w-5 h-5 mr-3" />
              Pending Tasks
            </a>
          </li>
          <li className="mb-2">
            <a
              href="/create-task"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "create" ? "bg-gray-200" : ""
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              Create Task
            </a>
          </li>
          <li className="mb-2">
            <a
              href="/completed"
              className={`flex items-center p-3 rounded-lg hover:bg-gray-200 ${
                activeRoute === "completed" ? "bg-gray-200" : ""
              }`}
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              Completed
            </a>
          </li>
        </ul>

        {/* Task Statistics */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-base-content/70 mb-3">
            Statistics
          </h3>
         < div className="stats stats-vertical shadow w-full bg-gray-300">
            <div className="stat">
              <div className="stat-title text-xs text-black">
                {statisticsLabel}
              </div>
              <div className="stat-value text-lg">{taskCount}</div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Sidebar;
