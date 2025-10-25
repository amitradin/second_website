import React, { useState, useEffect } from "react";
import Task from "../Components/Task";
import Sidebar from "../Components/Sidebar";
import axiosInstance from "../lib/axios.js";
import { Filter } from "lucide-react";
import FiltersSection from "../Components/FiltersSection.jsx";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const handleFilterChange = (courses, priorities) => {
    setSelectedCourses(courses);
    setSelectedPriorities(priorities);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        // Filter only pending (non-completed) tasks
        const pendingTasks = response.data.filter(task => task.completed !== true);
        setTasks(pendingTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter tasks based on selected courses and priorities
  const filteredTasks = selectedCourses.length === 0 
    ? tasks // Show all if no filter selected
    : tasks.filter(task => selectedCourses.includes(task.course));
  const filteredPriorities = selectedPriorities.length === 0
    ? filteredTasks // Show all if no filter selected
    : filteredTasks.filter(task => selectedPriorities.includes(task.priority));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      {/* Left side - Sidebar and Filter */}
      <div className="flex flex-col w-full lg:w-1/4 lg:min-w-64">
        {/* Sidebar */}
        <Sidebar 
          activeRoute="pending" 
          taskCount={tasks.length}
          lowPriorityCount= {tasks.filter(task => task.priority === 'Low').length} 
          mediumPriorityCount= {tasks.filter(task => task.priority === 'Medium').length}
          highPriorityCount= {tasks.filter(task => task.priority === 'High').length}
          statisticsLabel="Pending Tasks" 
        />
        
        {/* Filter section - below the sidebar */}
        <FiltersSection 
          activeRoute="pending" 
          tasks={tasks} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Right side - tasks */}
      <div className="w-full lg:flex-1 p-4">
        <h1 className="text-2xl font-bold mb-6 text-black">Pending Tasks</h1>
        {filteredPriorities.length > 0 ? (
          <div className="space-y-4">
            {filteredPriorities.map((task) => (
              <Task key={task._id} task={task} setTask={setTasks} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tasks found</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
