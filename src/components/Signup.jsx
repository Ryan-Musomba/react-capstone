import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Signup({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        displayName,
        createdAt: new Date(),
        photoURL: '',
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="Email"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            minLength="6"
          />
        </div>
        <div className="mb-6">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="user">User</option>
            <option value="organization">Organization</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-600 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Signup;