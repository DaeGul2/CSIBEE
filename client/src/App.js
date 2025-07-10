import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa'; // 상단에 추가
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavbarComponent from './components/NavbarComponent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import SharePage from './pages/SharePage';
import NoticeBoardPage from './pages/NoticeBoardPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 🔊 최초 렌더링 시 자동 재생 시도
    const audio = audioRef.current;
    if (audio) {
      audio.play()
        .then(() => {
          setIsPlaying(true); // 성공적으로 재생되면 상태 true로
        })
        .catch((err) => {
          console.warn('자동재생 실패 (사용자 상호작용 필요):', err.message);
          setIsPlaying(false); // 실패 시 버튼으로만 가능
        });
    }
  }, []);


  // 재생/일시정지 토글
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn("재생 오류:", err.message);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // 재생 상태 동기화 (예: 사용자가 브라우저에서 직접 정지한 경우 등)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isPlaying) {
        audio.play();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying]);

  return (
    <Router>
      {/* 🎵 오디오 요소 */}
      <audio ref={audioRef} loop>
        <source src="/audio/bgm.m4a" type="audio/mp4" />
        Your browser does not support the audio element.
      </audio>

      {/* 🎛 커스텀 재생 컨트롤러 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '50%',
          padding: '14px',
          zIndex: 9999,
          cursor: 'pointer',
          color: '#fff',
          fontSize: '20px',
          transition: 'background-color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
        onClick={togglePlay}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
        title={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
      </div>

      <NavbarComponent user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={user ? <NoticeBoardPage /> : <LoginPage setUser={setUser} />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lost-items" element={user ? <LostItemsPage /> : <Navigate to="/login" />} />
        <Route path="/found-items" element={user ? <FoundItemsPage /> : <Navigate to="/login" />} />
        <Route path="/share" element={user ? <SharePage /> : <Navigate to="/login" />} />
        <Route path="/notices" element={user ? <NoticeBoardPage /> : <Navigate to="/login" />} />
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
