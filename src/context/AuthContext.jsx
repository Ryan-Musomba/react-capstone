import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'user');
          setDisplayName(userData.displayName || 'User');
          setCurrentUser(user);
        } else {
          await setDoc(userDocRef, {
            email: user.email,
            role: 'user',
            createdAt: new Date(),
            displayName: user.displayName || 'User',
            photoURL: user.photoURL || '',
            status: 'active'
          });
          setUserRole('user');
          setDisplayName(user.displayName || 'User');
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setDisplayName('');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, displayName, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);