// src/components/OrganizationDashboard.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function OrganizationDashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        if (data.role !== "organization") {
          navigate("/"); // Redirect if not organization
        }
        setUserData({ ...data, uid: user.uid });
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
        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
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
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Organization Features</h3>
          <p>Manage your organization details here</p>
          {/* Add organization-specific features here */}
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;