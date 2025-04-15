import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FaAd, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import CampaignManagement from './CampaignManagement';
import CampaignApproval from './CampaignApproval';
import UserManagement from './UserManagement';
import SidebarItem from './SidebarItem';
import Navbar from './Navbar';

function AdminDashboard() {
  const [view, setView] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/?login=true');
      return;
    }
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    async function fetchData() {
      const campaignSnapshot = await getDocs(collection(db, 'campaigns'));
      const campaignsData = campaignSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userSnapshot = await getDocs(collection(db, 'users'));
      const usersData = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCampaigns(campaignsData);
      setUsers(usersData);
    }

    fetchData();
  }, [currentUser, userRole, navigate]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h2>
          </div>
          <div className="mt-4 space-y-2">
            <SidebarItem icon={<FaAd />} text="Manage Campaigns" active={view === 'campaigns'} onClick={() => setView('campaigns')} />
            <SidebarItem icon={<FaCheckCircle />} text="Approve Campaigns" active={view === 'approvals'} onClick={() => setView('approvals')} />
            <SidebarItem icon={<FaAd />} text="Manage Users" active={view === 'users'} onClick={() => setView('users')} />
          </div>
        </div>
        <div className="flex-1 flex flex-col p-6">
          <button onClick={() => navigate('/')} className="mb-4 flex items-center text-indigo-600 hover:underline">
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
          {view === 'campaigns' && <CampaignManagement campaigns={campaigns} setCampaigns={setCampaigns} />}
          {view === 'approvals' && <CampaignApproval campaigns={campaigns} setCampaigns={setCampaigns} />}
          {view === 'users' && (
            <UserManagement users={currentUsers} setUsers={setUsers} totalPages={totalPages} paginate={page => setCurrentPage(page)} currentPage={currentPage} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;