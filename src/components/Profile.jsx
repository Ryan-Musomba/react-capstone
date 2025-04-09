// src/components/Profile.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData({ uid: user.uid, ...userDoc.data() });
        }
      } else {
        navigate("/"); // Redirect to home if not logged in
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const goToDashboard = () => {
    switch (userData?.role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "user":
        navigate("/user-dashboard");
        break;
      case "organization":
        navigate("/organization-dashboard");
        break;
      default:
        navigate("/user-dashboard");
    }
  };

  if (!userData) return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">Platform</div>
        <div className="text-white">Loading...</div>
      </nav>
      <div className="text-center p-4">Loading profile...</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">Platform</div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none"
          >
            <span>Porfile</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
              <button
                onClick={goToDashboard}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-4 text-left">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium capitalize">{userData.role}</p>
            </div>
            {userData.name && (
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{userData.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;