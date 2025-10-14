import React, { useState, useEffect } from "react";
import {Route, Routes, Navigate} from "react-router";

import HomePage from "./Pages/HomePage";
import CreateTask from "./Pages/createTask";
import CompletedTasks from "./Pages/CompletedTasks";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import TaskDetails from "./Pages/TaskDetails";
import Header from "./Components/Header";

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Component to redirect authenticated users away from auth pages
const AuthRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-400 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }
  
  return(
    <div className="min-h-screen bg-gray-400 overflow-x-hidden">
      {!isAuthPage && isAuthenticated && <Header />}
      <div className="container mx-auto px-3 sm:p-5">
        <Routes>
          {/* Default route - redirects based on authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/create-task" element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          } />
          <Route path="/completed" element={
            <ProtectedRoute>
              <CompletedTasks />
            </ProtectedRoute>
          } />

          <Route path = "/task/:id" element = {
            <ProtectedRoute>
              <TaskDetails/>
            </ProtectedRoute>
          } />
          
          {/* Auth routes - redirect to home if already authenticated */}
          <Route path="/login" element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          } />
          <Route path="/signup" element={
            <AuthRoute>
              <SignupPage />
            </AuthRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;