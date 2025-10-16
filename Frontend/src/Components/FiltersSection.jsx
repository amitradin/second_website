//This is the filter section
import React from "react";
import { useState, useEffect } from "react";

//first Ill add a filter based on the course name, multiple choice is allowed

const FiltersSection = ({ activeRoute, tasks = [], onFilterChange }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [uniqueCourses, setCourses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [uniquePriorities, setUniquePriorities] = useState([
   
  ]);

  const handleCourseToggle = (course) => {
    const updatedSelection = selectedCourses.includes(course)
      ? selectedCourses.filter((c) => c !== course) // Remore if already selected
      : [...selectedCourses, course]; // Add if not selected

    setSelectedCourses(updatedSelection);
    onFilterChange(updatedSelection, selectedPriorities); // Pass both filters to parent
  };
  const handlePriorityToggle = (priority) => {
    const updatedSelection = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority) // Remove if already selected
      : [...selectedPriorities, priority]; // Add if not selected
    setSelectedPriorities(updatedSelection);
    onFilterChange(selectedCourses, updatedSelection); // Pass both filters to parent
  };
  useEffect(() => {
    // Process the passed tasks data instead of making API call
    const filterCourses = tasks.filter((task) => {
      if (activeRoute === "pending") {
        return task.completed === false;
      } else if (activeRoute === "completed") {
        return task.completed === true;
      }
      return true; // Show all courses for other routes
    });
    
    const allCourses = filterCourses.map((task) => task.course);
    const uniqueCourses = [
      ...new Set(
        allCourses.filter((course) => course && course.trim() !== "")
      ),
    ];
    const allPriorities = filterCourses.map((task) => task.priority);
    const uniquePriorities = [
      ...new Set(
        allPriorities.filter((priority) => priority && priority.trim() !== "")
      ),
    ];
    setUniquePriorities(uniquePriorities);
    setCourses(uniqueCourses);
  }, [activeRoute, tasks]);

  return (
    <div className="bg-gray-400 text-gray-800">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-base-content/70 mb-3">
          Filters
        </h3>
        <div className="stats stats-vertical shadow w-full bg-gray-300">
          <div className="stat">
            <div className="stat-title text-black">Course</div>
            {/* now I'll add the list of available courses here */}
            <div className="list-disc list-inside text-sm text-black p-2">
              {uniqueCourses.map((course) => (
                <label
                  key={course}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => handleCourseToggle(course)}
                    className="mr-2 accent-blue-600"
                  />
                  <span
                    className={`text-sm ${
                      selectedCourses.includes(course) ? "font-bold" : ""
                    }`}
                  >
                    {course}
                  </span>
                </label>
              ))}
            </div>
            <div className="stat-title text-black">Priority</div>
            <div className="list-disc list-inside text-sm text-black p-2">
              {uniquePriorities.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(priority)}
                    onChange={() => handlePriorityToggle(priority)}
                    className="mr-2 accent-blue-600"
                  />
                  <span
                    className={`text-sm ${
                      selectedPriorities.includes(priority) ? "font-bold" : ""
                    }`}
                  >
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;
