import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaDonate, FaAd, FaArrowLeft } from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import Navbar from './Navbar';

function OrganizationDashboard() {
  const [view, setView] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    fundingGoal: '',
    deadline: '',
    category: '',
    location: '',
    urgency: 'low',
    imageUrl: '',
  });
  const [editCampaignId, setEditCampaignId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const categories = ['Education', 'Food', 'Healthcare', 'Disaster Relief', 'Environment'];

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const campaignQuery = query(collection(db, 'campaigns'), where('creatorId', '==', currentUser.uid));
    const unsubscribeCampaigns = onSnapshot(campaignQuery, (snapshot) => {
      const campaignsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampaigns(campaignsList);

      const campaignIds = campaignsList.map((c) => c.id);
      if (campaignIds.length > 0) {
        const donationQuery = query(collection(db, 'donations'), where('campaignId', 'in', campaignIds));
        const unsubscribeDonations = onSnapshot(donationQuery, (donationSnapshot) => {
          const donationsList = donationSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDonations(donationsList);
        });
        return () => unsubscribeDonations();
      } else {
        setDonations([]);
      }
    });

    return () => unsubscribeCampaigns();
  }, [currentUser, navigate]);

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    const campaignData = {
      ...newCampaign,
      fundingGoal: parseFloat(newCampaign.fundingGoal),
      amountRaised: 0,
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName || 'Unknown',
      status: 'pending',
      createdAt: new Date(),
      deadline: new Date(newCampaign.deadline).toISOString(),
    };
    try {
      if (editCampaignId) {
        await updateDoc(doc(db, 'campaigns', editCampaignId), campaignData);
        setEditCampaignId(null);
      } else {
        const docRef = await addDoc(collection(db, 'campaigns'), campaignData);
        setCampaigns([...campaigns, { id: docRef.id, ...campaignData }]);
      }
      setNewCampaign({
        name: '',
        description: '',
        fundingGoal: '',
        deadline: '',
        category: '',
        location: '',
        urgency: 'low',
        imageUrl: '',
      });
      alert(editCampaignId ? 'Campaign updated' : 'Campaign submitted for approval');
    } catch {
      alert('Failed to submit campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      setCampaigns(campaigns.filter((c) => c.id !== id));
      alert('Campaign deleted');
    } catch {
      alert('Failed to delete campaign');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCampaigns = campaigns.slice(indexOfFirstItem, indexOfLastItem);
  const currentDonations = donations.slice(indexOfFirstItem, indexOfLastItem);
  const totalCampaignPages = Math.ceil(campaigns.length / itemsPerPage);
  const totalDonationPages = Math.ceil(donations.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-indigo-600">Organization Dashboard</h2>
          </div>
          <div className="mt-4 space-y-2">
            <SidebarItem
              icon={<FaAd />}
              text="My Campaigns"
              active={view === 'campaigns'}
              onClick={() => setView('campaigns')}
            />
            <SidebarItem
              icon={<FaDonate />}
              text="Donations"
              active={view === 'donations'}
              onClick={() => setView('donations')}
            />
            <SidebarItem
              icon={<FaAd />}
              text="Create Campaign"
              active={view === 'create'}
              onClick={() => setView('create')}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 flex items-center text-indigo-600 hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
          {view === 'create' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{editCampaignId ? 'Update Campaign' : 'Create Campaign'}</h3>
              <form onSubmit={handleCampaignSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Campaign Name"
                    className="p-2 border rounded-md"
                    required
                  />
                  <input
                    type="number"
                    value={newCampaign.fundingGoal}
                    onChange={(e) => setNewCampaign({ ...newCampaign, fundingGoal: e.target.value })}
                    placeholder="Funding Goal ($)"
                    className="p-2 border rounded-md"
                    required
                  />
                  <input
                    type="date"
                    value={newCampaign.deadline}
                    onChange={(e) => setNewCampaign({ ...newCampaign, deadline: e.target.value })}
                    className="p-2 border rounded-md"
                    required
                  />
                  <select
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                    className="p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newCampaign.location}
                    onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                    placeholder="Location"
                    className="p-2 border rounded-md"
                  />
                  <select
                    value={newCampaign.urgency}
                    onChange={(e) => setNewCampaign({ ...newCampaign, urgency: e.target.value })}
                    className="p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    type="url"
                    value={newCampaign.imageUrl}
                    onChange={(e) => setNewCampaign({ ...newCampaign, imageUrl: e.target.value })}
                    placeholder="Image URL"
                    className="p-2 border rounded-md col-span-2"
                  />
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder="Description"
                    className="p-2 border rounded-md col-span-2"
                    required
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white p-2 rounded-md"
                  >
                    {editCampaignId ? 'Update' : 'Create'}
                  </button>
                  {editCampaignId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCampaignId(null);
                        setNewCampaign({
                          name: '',
                          description: '',
                          fundingGoal: '',
                          deadline: '',
                          category: '',
                          location: '',
                          urgency: 'low',
                          imageUrl: '',
                        });
                      }}
                      className="flex-1 bg-gray-500 text-white p-2 rounded-md"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          {view === 'campaigns' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Your Campaigns</h3>
              {campaigns.length === 0 ? (
                <p>No campaigns yet</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCampaigns.map((c) => (
                      <div key={c.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{c.name}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{c.description}</p>
                        <p className="text-sm text-gray-500">
                          Goal: ${c.fundingGoal.toFixed(2)} | Raised: ${(c.amountRaised || 0).toFixed(2)}
                        </p>
                        {c.amountRaised >= c.fundingGoal && (
                          <p className="text-green-600 font-semibold">Goal Reached!</p>
                        )}
                        <p className="text-sm text-gray-500">Status: {c.status}</p>
                        {c.status === 'rejected' && c.rejectionReason && (
                          <p className="text-sm text-red-600">Rejection Reason: {c.rejectionReason}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Deadline: {new Date(c.deadline).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              setEditCampaignId(c.id);
                              setNewCampaign({
                                name: c.name,
                                description: c.description,
                                fundingGoal: c.fundingGoal.toString(),
                                deadline: c.deadline.split('T')[0],
                                category: c.category,
                                location: c.location || '',
                                urgency: c.urgency,
                                imageUrl: c.imageUrl || '',
                              });
                              setView('create');
                            }}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center space-x-2">
                    {Array.from({ length: totalCampaignPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {view === 'donations' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Donations to Your Campaigns</h3>
              {donations.length === 0 ? (
                <p>No donations yet</p>
              ) : (
                <>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3">Campaign</th>
                        <th className="p-3">Donor</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDonations.map((d) => (
                        <tr key={d.id} className="border-b">
                          <td className="p-3">{d.campaignName}</td>
                          <td className="p-3">{d.anonymous ? 'Anonymous' : d.displayName}</td>
                          <td className="p-3">${d.amount.toFixed(2)}</td>
                          <td className="p-3">{new Date(d.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-center space-x-2">
                    {Array.from({ length: totalDonationPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;