import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./components/Home";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import OrganizationDashboard from "./components/OrganizationDashboard";
import CampaignDetails from "./components/CampaignDetails";
import Donations from "./components/Donations";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/campaigns"
            element={<ProtectedRoute><Donations /></ProtectedRoute>}
          />
          <Route
            path="/user-dashboard"
            element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin-dashboard"
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/org-dashboard"
            element={<ProtectedRoute><OrganizationDashboard /></ProtectedRoute>}
          />
          <Route
            path="/campaign/:id"
            element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;