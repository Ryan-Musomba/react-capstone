// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserData({ ...userDoc.data(), uid: user.uid });
      } else {
        navigate("/");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl mb-4">Welcome, {userData.email}</h2>
        <p className="mb-2">Role: {userData.role}</p>
        <p>User ID: {userData.uid}</p>
        
        {userData.role === "admin" && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Admin Controls</h3>
            {/* Add admin-specific features here */}
          </div>
        )}
        
        {userData.role === "organization" && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Organization Dashboard</h3>
            {/* Add organization-specific features here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;