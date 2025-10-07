import React from "react";
import {Route, Routes} from "react-router";

import HomePage from "./Pages/HomePage";
import CreateTask from "./Pages/createTask";
import CompletedTasks from "./Pages/CompletedTasks";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Header from "./Components/Header";

const App = () => {
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
  
  return(
    <div className="min-h-screen bg-gray-400">
      {!isAuthPage && <Header />}
      <div className="container mx-auto p-5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-task" element={<CreateTask />} />
          <Route path="/completed" element={<CompletedTasks />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;