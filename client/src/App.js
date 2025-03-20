import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import SharePage from './pages/SharePage';

function App() {
  // ✅ 로그인 상태 (유저 정보 저장)
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ 세션 유지: sessionStorage에서 사용자 정보 가져오기
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <NavbarComponent user={user} setUser={setUser} />
      <Routes>
        {/* ✅ 로그인 안 한 경우 로그인 페이지로 이동 */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/lost-items" /> : <LoginPage setUser={setUser} />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/lost-items" /> : <LoginPage setUser={setUser} />} 
        />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* ✅ 로그인 안 된 경우, 모든 페이지 접근 차단 */}
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

        {/* ✅ 존재하지 않는 경로는 로그인 페이지로 */}
        <Route path="*" element={<Navigate to={user ? "/lost-items" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
