import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { PieChart } from 'react-minimal-pie-chart';
import Navbar from './Navbar';

function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [donors, setDonors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [donationLoading, setDonationLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const donorsPerPage = 5;
  const predefinedAmounts = [10, 100, 1000];

  useEffect(() => {
    const campaignRef = doc(db, 'campaigns', id);
    const unsubscribe = onSnapshot(
      campaignRef,
      (doc) => {
        if (doc.exists()) {
          setCampaign({ id: doc.id, ...doc.data() });
        } else {
          setError('Campaign not found');
        }
      },
      (err) => {
        setError('Failed to load campaign.');
      }
    );

    const fetchDonors = async () => {
      if (currentUser) {
        const campaignDoc = await getDoc(campaignRef);
        if (campaignDoc.exists() && campaignDoc.data().creatorId === currentUser.uid) {
          const donationsRef = collection(db, 'donations');
          const q = query(donationsRef, where('campaignId', '==', id));
          const unsubscribeDonors = onSnapshot(q, (snapshot) => {
            const donorsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              displayName: doc.data().anonymous ? null : doc.data().displayName || 'Unknown',
            }));
            setDonors(donorsList);
          });
          return () => unsubscribeDonors();
        }
      }
    };
    fetchDonors();

    return () => unsubscribe();
  }, [id, currentUser]);

  const handleDonation = async (e) => {
    e.preventDefault();
    setError(null);
    setDonationLoading(true);

    if (!currentUser) {
      navigate('/?login=true');
      setDonationLoading(false);
      return;
    }

    // Prevent campaign owner from donating
    if (currentUser.uid === campaign?.creatorId) {
      alert('You cannot donate to your own campaign.');
      setDonationLoading(false);
      return;
    }

    if (!donationAmount || !paymentMethod) {
      setError('Please enter an amount and select a payment method.');
      setDonationLoading(false);
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid donation amount greater than $0.');
      setDonationLoading(false);
      return;
    }

    if (!['credit_card', 'paypal', 'bank_transfer'].includes(paymentMethod)) {
      setError('Invalid payment method selected.');
      setDonationLoading(false);
      return;
    }

    try {
      const campaignRef = doc(db, 'campaigns', id);
      const campaignDoc = await getDoc(campaignRef);

      if (!campaignDoc.exists()) {
        throw new Error('Campaign does not exist.');
      }

      const campaignData = campaignDoc.data();

      if (campaignData.status !== 'approved') {
        throw new Error('This campaign is not approved for donations.');
      }

      const deadline = new Date(campaignData.deadline);
      if (deadline < new Date()) {
        throw new Error('This campaign has expired.');
      }

      const currentRaised = campaignData.amountRaised || 0;
      const remaining = campaignData.fundingGoal - currentRaised;
      if (amount > remaining) {
        throw new Error(`Donation amount exceeds remaining goal of $${remaining.toFixed(2)}.`);
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User data not found.');
      }

      const userData = userDoc.data();
      const displayName = userData.displayName || currentUser.email.split('@')[0];

      const donationData = {
        amount,
        campaignId: id,
        campaignName: campaignData.name,
        timestamp: new Date().toISOString(),
        anonymous,
        paymentMethod,
        donorId: currentUser.uid,
        displayName: anonymous ? null : displayName,
      };

      await Promise.all([
        addDoc(collection(db, 'donations'), donationData),
        updateDoc(campaignRef, {
          amountRaised: currentRaised + amount,
        }),
      ]);

      setDonationAmount('');
      setPaymentMethod('');
      setAnonymous(false);
      alert('Donation successful! Thank you for your support.');
    } catch (err) {
      setError(err.message || 'An error occurred while processing your donation.');
    } finally {
      setDonationLoading(false);
    }
  };

  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;
  if (!campaign) return <div className="text-center p-4">Loading...</div>;

  const progress = Math.min(((campaign.amountRaised || 0) / campaign.fundingGoal) * 100, 100);
  const isGoalReached = (campaign.amountRaised || 0) >= campaign.fundingGoal;
  const isExpired = new Date(campaign.deadline) < new Date();

  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = donors.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(donors.length / donorsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <img
              src={campaign.imageUrl || 'https://via.placeholder.com/800x400'}
              alt={campaign.name}
              className="w-full h-64 object-cover rounded-md mb-6"
            />
            <h2 className="text-3xl font-semibold mb-4">{campaign.name}</h2>
            <p className="text-gray-600 mb-4">{campaign.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              Created by: {campaign.creatorName || 'Unknown'}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <p>Raised: ${(campaign.amountRaised || 0).toFixed(2)}</p>
              <p>Goal: ${campaign.fundingGoal.toFixed(2)}</p>
              <p>Amount Needed: ${(campaign.fundingGoal - (campaign.amountRaised || 0)).toFixed(2)}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-indigo-600 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {isGoalReached && (
              <p className="text-green-600 font-semibold mb-4">Goal Reached! No more donations needed.</p>
            )}
            {isExpired && !isGoalReached && (
              <p className="text-red-600 font-semibold mb-4">This campaign has expired.</p>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Deadline: {new Date(campaign.deadline).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Category: {campaign.category} | Urgency: {campaign.urgency}
            </p>
            {currentUser?.uid === campaign.creatorId && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">Donors</h4>
                {currentDonors.length === 0 ? (
                  <p>No donations yet.</p>
                ) : (
                  <>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3">Donor</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDonors.map((d) => (
                          <tr key={d.id} className="border-b">
                            <td className="p-3">{d.anonymous ? 'Anonymous' : d.displayName}</td>
                            <td className="p-3">${d.amount.toFixed(2)}</td>
                            <td className="p-3">{new Date(d.timestamp).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 flex justify-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Donate Now</h3>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {isGoalReached || isExpired ? (
              <p className="text-gray-600">
                {isGoalReached ? 'This campaign has reached its goal.' : 'This campaign has expired.'}
              </p>
            ) : (
              <form onSubmit={handleDonation}>
                {!currentUser && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                    Please{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/?login=true')}
                      className="text-indigo-600 hover:underline"
                    >
                      login
                    </button>{' '}
                    to donate
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Select Amount</label>
                  <div className="flex space-x-2 mb-2">
                    {predefinedAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount.toString())}
                        className={`px-4 py-2 border rounded-md ${
                          donationAmount === amount.toString()
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200'
                        }`}
                        disabled={donationLoading || !currentUser}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Custom Amount ($)"
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0.01"
                    step="0.01"
                    disabled={donationLoading || !currentUser}
                  />
                  {donationAmount && campaign?.fundingGoal && parseFloat(donationAmount) > (campaign.fundingGoal - (campaign.amountRaised || 0)) && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Amount exceeds remaining goal of $
                      {(campaign.fundingGoal - (campaign.amountRaised || 0)).toFixed(2)}.
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={donationLoading || !currentUser}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="mr-2"
                      disabled={donationLoading || !currentUser}
                    />
                    Donate Anonymously
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                  disabled={donationLoading || !currentUser}
                >
                  {donationLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          fill="white"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Donating...
                    </span>
                  ) : (
                    'Donate'
                  )}
                </button>
              </form>
            )}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Donation Progress</h4>
              <PieChart
                data={[
                  { title: 'Raised', value: campaign.amountRaised || 0, color: '#4F46E5' },
                  {
                    title: 'Remaining',
                    value: Math.max(campaign.fundingGoal - (campaign.amountRaised || 0), 0),
                    color: '#E5E7EB',
                  },
                ]}
                radius={40}
                lineWidth={20}
                animate
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetails;