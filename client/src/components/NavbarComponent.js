import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NavbarComponent.css';

function NavbarComponent({ user, setUser }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      sessionStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <div className="my-navbar">
  <div className="navbar-content" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
    {/* 첫 줄: 로고 */}
    <div className="brand" onClick={() => navigate('/')}>
      CSIBEE
    </div>

    {/* 두 번째 줄: 메뉴 */}
    {user && (
      <div className="nav-row">
        <div className="nav-links">
          <Nav.Link as={Link} to="/notices" className="nav-item">공지</Nav.Link>
          <Nav.Link as={Link} to="/lost-items" className="nav-item">분실물 찾아요</Nav.Link>
          <Nav.Link as={Link} to="/found-items" className="nav-item">분실물 찾아가세요</Nav.Link>
          <Nav.Link as={Link} to="/share" className="nav-item">나눔</Nav.Link>
          {user.is_admin && (
            <Nav.Link as={Link} to="/admin" className="nav-item">관리자</Nav.Link>
          )}
          <Nav.Link onClick={handleLogout} className="nav-item">로그아웃</Nav.Link>
        </div>
      </div>
    )}
  </div>
</div>

  );
}

export default NavbarComponent;
