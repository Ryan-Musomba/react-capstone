// src/components/Home.js
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-white font-bold text-xl">Platform</div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

     
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Welcome to the Platform</h1>
        </div>
      </div>
    </div>
  );
}

export default Home;