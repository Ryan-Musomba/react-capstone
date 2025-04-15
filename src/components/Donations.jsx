import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Navbar from './Navbar';

function Donations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterAmount, setFilterAmount] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');

    const q = query(collection(db, 'campaigns'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const campaignsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampaigns(campaignsList);
    }, () => setError('Failed to load campaigns.'));
    return () => unsubscribe();
  }, [location.search]);

  const filteredCampaigns = campaigns.filter(camp =>
    camp.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory === 'all' || camp.category === filterCategory) &&
    (!filterUrgency || camp.urgency === filterUrgency) &&
    (!filterAmount ||
      (filterAmount === 'low' && camp.fundingGoal <= 1000) ||
      (filterAmount === 'medium' && camp.fundingGoal > 1000 && camp.fundingGoal <= 10000) ||
      (filterAmount === 'high' && camp.fundingGoal > 10000))
  );

  const categories = ['all', 'Education', 'Food', 'Healthcare', 'Disaster Relief', 'Environment', ...new Set(campaigns.map(camp => camp.category || 'Uncategorized'))];
  const urgencies = ['', 'low', 'medium', 'high'];
  const amountRanges = ['', 'low', 'medium', 'high'];

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold mb-8">Explore Campaigns</h2>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            >
              {urgencies.map(urg => (
                <option key={urg} value={urg}>
                  {urg === '' ? 'All Urgencies' : urg.charAt(0).toUpperCase() + urg.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterAmount}
              onChange={e => setFilterAmount(e.target.value)}
              className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="">All Amounts</option>
              <option value="low">Low ($0 - $1,000)</option>
              <option value="medium">Medium ($1,001 - $10,000)</option>
              <option value="high">High ($10,001+)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCampaigns.length === 0 ? (
            <p className="col-span-3 text-center">No campaigns found</p>
          ) : (
            filteredCampaigns.map(camp => {
              const progress = Math.min(((camp.amountRaised || 0) / camp.fundingGoal) * 100, 100);
              return (
                <div key={camp.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <img src={camp.imageUrl || 'https://via.placeholder.com/500x200'} alt={camp.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{camp.name}</h3>
                    <p className="text-gray-600 mb-2">Created by: {camp.creatorName || 'Unknown'}</p>
                    <p className="text-gray-600 mb-4 line-clamp-2">{camp.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Raised: ${camp.amountRaised || 0} / ${camp.fundingGoal} | Needed: ${(camp.fundingGoal - (camp.amountRaised || 0)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => navigate(`/campaign/${camp.id}`)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                      >
                        View Campaign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Donations;