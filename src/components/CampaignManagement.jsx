import React from 'react';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';

function CampaignManagement({ campaigns, setCampaigns }) {
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    await deleteDoc(doc(db, 'campaigns', id));
    setCampaigns(campaigns.filter(c => c.id !== id));
    alert('Campaign deleted');
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
      {campaigns.length === 0 ? (
        <p>No campaigns available</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Goal</th>
              <th className="p-3">Raised</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.description}</td>
                <td className="p-3">${(c.fundingGoal || 0).toFixed(2)}</td>
                <td className="p-3">${(c.amountRaised || 0).toFixed(2)}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3">
                  <FaTrash className="cursor-pointer text-red-600 hover:text-red-800" onClick={() => handleDelete(c.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CampaignManagement;