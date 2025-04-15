import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Login({ onSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e, isGoogle = false) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let userCredential;
      if (isGoogle) {
        userCredential = await signInWithPopup(auth, googleProvider);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() && isGoogle) {
        await setDoc(userDocRef, {
          email: user.email,
          role: 'user',
          createdAt: new Date(),
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        });
      }
      onSuccess();
    } catch {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value.trim())}
            placeholder="Email"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button
        onClick={e => handleLogin(e, true)}
        className="w-full mt-4 bg-white border border-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-100 flex items-center justify-center"
        disabled={loading}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
        Sign in with Google
      </button>
      <p className="mt-4 text-center text-sm">
        Need an account? <button onClick={onSwitchToSignup} className="text-indigo-600 hover:underline">Sign up</button>
      </p>
    </div>
  );
}

export default Login;