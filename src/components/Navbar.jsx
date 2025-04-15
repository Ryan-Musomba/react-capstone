import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaUser, FaHome, FaList } from 'react-icons/fa'; // Added FaList import

function Navbar() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName || 'User');
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => navigate('/')}>
        GiveHope
      </div>
      <div className="flex items-center space-x-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-indigo-600"
        >
          <FaHome className="mr-2" />
          Home
        </button>
        {currentUser && (
          <button
            onClick={() => navigate('/campaigns')}
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <FaList className="mr-2" />
            Campaigns
          </button>
        )}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600"
            >
              <FaUser className="h-6 w-6" />
              <span>{displayName}</span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p><strong>Name:</strong> {displayName}</p>
                  <p><strong>Role:</strong> {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}</p>
                </div>
                <button
                  onClick={() => {
                    navigate(
                      userRole === 'admin' ? '/admin-dashboard' :
                      userRole === 'organization' ? '/org-dashboard' : '/user-dashboard'
                    );
                    setIsProfileOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => navigate('/?login=true')} className="text-indigo-600 hover:underline">
              Login
            </button>
            <button
              onClick={() => navigate('/?signup=true')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;