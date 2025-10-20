import React, { useState, useEffect, Suspense, lazy } from "react";
import {Route, Routes, Navigate} from "react-router";
import Header from "./Components/Header";
import { listen } from "quicklink";

// Lazy load page components
const HomePage = lazy(() => import("./Pages/HomePage"));
const CreateTask = lazy(() => import("./Pages/createTask"));
const CompletedTasks = lazy(() => import("./Pages/CompletedTasks"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const SignupPage = lazy(() => import("./Pages/SignupPage"));
const TaskDetails = lazy(() => import("./Pages/TaskDetails"));
const EditTask = lazy(() => import("./Pages/EditTask"));

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

    // preload links
    listen();
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
        <Suspense fallback={
          <div className="min-h-screen bg-gray-400 flex items-center justify-center">
            <div className="text-xl text-white">Loading...</div>
          </div>
        }>
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

          <Route path = "/task/:id/edit" element = {
            <ProtectedRoute>
              <EditTask />
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
        </Suspense>
      </div>
    </div>
  );
}

export default App;