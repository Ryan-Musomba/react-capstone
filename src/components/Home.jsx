import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Login from './Login';
import Signup from './Signup';
import Navbar from './Navbar';
import { FaQuoteLeft } from 'react-icons/fa';

function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login')) setShowLogin(true);
    if (params.get('signup')) setShowSignup(true);

    async function fetchCampaigns() {
      const q = query(collection(db, 'campaigns'), where('status', '==', 'approved'));
      const snapshot = await getDocs(q);
      const campaignsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeaturedCampaigns(campaignsList.slice(0, 3));
    }
    fetchCampaigns();
  }, [location.search]);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/donations?search=${searchQuery}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">You Can Change a Life Today</h1>
          <p className="text-lg mb-6">Join us in making a difference with every donation.</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100">
            Donate Now
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold mb-4 text-center">Why We Exist</h2>
        <p className="text-lg text-gray-600 mb-4 text-center">
          GiveHope connects donors with impactful campaigns to support communities worldwide. We ensure your contributions make a real difference.
        </p>
      </div>
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-indigo-600">2,000+</p>
            <p className="text-gray-600">Meals Served</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-indigo-600">98%</p>
            <p className="text-gray-600">Donations to Programs</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-indigo-600">12</p>
            <p className="text-gray-600">Communities Served</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold mb-4 text-center">How Your Donation Helps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">$10</p>
            <p className="text-gray-600">School supplies for a child</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">$50</p>
            <p className="text-gray-600">One month of clean water</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">$100</p>
            <p className="text-gray-600">Medical care for a family</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-4 text-center">Real Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FaQuoteLeft className="text-indigo-600 mb-4" />
              <p className="text-gray-600 mb-4">"GiveHope changed my life by providing clean water to my village."</p>
              <p className="font-semibold">— Aisha, Beneficiary</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FaQuoteLeft className="text-indigo-600 mb-4" />
              <p className="text-gray-600 mb-4">"Donating through GiveHope is so easy and impactful!"</p>
              <p className="font-semibold">— John, Donor</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold mb-4 text-center">Featured Campaigns</h2>
        {featuredCampaigns[0] && (
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-center">
            <img
              src={featuredCampaigns[0].imageUrl || 'https://via.placeholder.com/500x200'}
              alt={featuredCampaigns[0].name}
              className="w-full md:w-1/2 h-48 object-cover rounded-md mb-4 md:mb-0 md:mr-6"
            />
            <div>
              <h3 className="text-xl font-semibold mb-2">{featuredCampaigns[0].name}</h3>
              <p className="text-gray-600 mb-4">{featuredCampaigns[0].description}</p>
              <p className="text-sm text-gray-500 mb-4">Deadline: {new Date(featuredCampaigns[0].deadline).toLocaleDateString()}</p>
              <button
                onClick={() => navigate(`/campaign/${featuredCampaigns[0].id}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Support Now
              </button>
            </div>
          </div>
        )}
      </div>
      <footer className="bg-gray-800 text-white p-6 text-center">
        <p>© 2025 GiveHope. All rights reserved.</p>
      </footer>
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <button onClick={() => setShowLogin(false)} className="float-right text-gray-600">✕</button>
            <Login onSuccess={() => { setShowLogin(false); navigate('/'); }} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />
          </div>
        </div>
      )}
      {showSignup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <button onClick={() => setShowSignup(false)} className="float-right text-gray-600">✕</button>
            <Signup onSuccess={() => { setShowSignup(false); navigate('/'); }} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;