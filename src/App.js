import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase/config';
import { setUser, clearUser, setLoading } from './redux/userSlice';
import LoginComponent from './components/LoginComponent';
import UserCard from './components/UserCard';
import './assets/styles/main.scss';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase user:', user); // Debug log
      if (user) {
        const userData = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          metadata: user.metadata,
        };
        const authMethod = user.providerData[0]?.providerId.includes('google') ? 'google' : 'email';
        dispatch(setUser({ user: userData, authMethod }));
      } else {
        dispatch(clearUser());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginComponent /> : <Navigate to="/profile" replace />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <UserCard /> : <Navigate to="/login" replace />}
        />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;