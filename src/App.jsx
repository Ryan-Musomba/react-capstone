// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import UserDashboard from "./components/UserDashboard";
// Import other dashboards as needed (e.g., AdminDashboard, OrganizationDashboard)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        {/* Add routes for other dashboards */}
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/organization-dashboard" element={<OrganizationDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;