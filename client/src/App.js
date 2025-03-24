import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import SharePage from './pages/SharePage';
import NoticeBoardPage from './pages/NoticeBoardPage';
import AdminPage from './pages/AdminPage';
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <NavbarComponent user={user} setUser={setUser} />
      <Routes>
        <Route 
          path="/" 
          element={user ? <NoticeBoardPage /> : <LoginPage setUser={setUser} />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />} 
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/lost-items" 
          element={user ? <LostItemsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/found-items" 
          element={user ? <FoundItemsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/share" 
          element={user ? <SharePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/notices" 
          element={user ? <NoticeBoardPage /> : <Navigate to="/login" />} 
        />
        <Route
          path="/admin"
          element={
            user
              ? (user.is_admin
                  ? <AdminPage />
                  : <Navigate to="/lost-items" />
                )
              : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
