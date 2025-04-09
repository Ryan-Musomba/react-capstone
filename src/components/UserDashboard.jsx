// src/components/UserDashboard.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmount, setDonationAmount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch user data
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc.data();
          if (data.role !== "user") {
            navigate("/");
            return;
          }
          setUserData({ ...data, uid: user.uid });

          // Fetch user's donations
          const donationsSnapshot = await getDocs(
            collection(db, "users", user.uid, "donations")
          );
          const donationsList = donationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDonations(donationsList);

          // Fetch available campaigns (assuming a campaigns collection exists)
          const campaignsSnapshot = await getDocs(collection(db, "campaigns"));
          const campaignsList = campaignsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCampaigns(campaignsList);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/");
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    if (!donationAmount || !selectedCampaign) return;

    try {
      const user = auth.currentUser;
      const donationData = {
        amount: parseFloat(donationAmount),
        campaignId: selectedCampaign,
        timestamp: new Date(),
      };

      // Add donation to user's subcollection
      await addDoc(collection(db, "users", user.uid, "donations"), donationData);
      
      // Update local state
      setDonations([...donations, donationData]);
      setDonationAmount("");
      alert("Donation successful!");
    } catch (error) {
      console.error("Donation error:", error);
      alert("Failed to process donation");
    }
  };

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl mb-4">Welcome, {userData?.email}</h2>
          <p className="mb-2">Role: {userData?.role}</p>
          <p className="text-lg font-semibold">Total Donated: ${totalDonated.toFixed(2)}</p>
        </div>

        {/* Make a Donation */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Make a Donation</h3>
          <form onSubmit={handleDonation}>
            <div className="mb-4">
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a Campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <input
                type="number"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Amount ($)"
                min="1"
                step="0.01"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={!donationAmount || !selectedCampaign}
            >
              Donate Now
            </button>
          </form>
        </div>

        {/* Donation History */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Donation History</h3>
          {donations.length === 0 ? (
            <p>No donations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Campaign</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(donation.timestamp).toLocaleDateString()}</td>
                      <td className="p-2">${donation.amount.toFixed(2)}</td>
                      <td className="p-2">
                        {campaigns.find(c => c.id === donation.campaignId)?.name || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Available Campaigns */}
        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Available Campaigns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{campaign.name}</h4>
                <p className="text-sm text-gray-600">{campaign.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;