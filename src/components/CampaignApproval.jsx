import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FaCheck, FaTimes } from 'react-icons/fa';

function CampaignApproval({ campaigns, setCampaigns }) {
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const approve = async (id) => {
    try {
      const campaignRef = doc(db, 'campaigns', id);
      await updateDoc(campaignRef, { status: 'approved', rejectionReason: null });
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: 'approved', rejectionReason: null } : c)));
      alert('Campaign approved');
    } catch (err) {
      console.error('Approval error:', err);
      alert('Failed to approve campaign. Please try again.');
    }
  };

  const reject = async (id) => {
    if (!rejectReason) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      const campaignRef = doc(db, 'campaigns', id);
      await updateDoc(campaignRef, { 
        status: 'rejected',
        rejectionReason: rejectReason
      });
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: 'rejected', rejectionReason: rejectReason } : c)));
      setRejectReason('');
      setSelectedCampaignId(null);
      alert('Campaign rejected');
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Failed to reject campaign. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pending Campaign Approvals</h2>
      {campaigns.filter((c) => c.status === 'pending').length === 0 ? (
        <p>No pending campaigns</p>
      ) : (
        campaigns
          .filter((c) => c.status === 'pending')
          .map((c) => (
            <div key={c.id} className="flex items-center p-3 border-b">
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-600">{c.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => approve(c.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => setSelectedCampaignId(c.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
                {selectedCampaignId === c.id && (
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection"
                      className="p-1 border rounded-md mr-2"
                    />
                    <button
                      onClick={() => reject(c.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded-md"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
      )}
    </div>
  );
}

export default CampaignApproval;