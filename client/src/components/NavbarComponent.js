import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './NavbarComponent.css';

function NavbarComponent({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  // 페이지별 이미지 맵핑
  const routeImages = {
    '/notices': '/icons/notice.png',
    '/lost-items': '/icons/lost.png',
    '/found-items': '/icons/found.png',
    '/share': '/icons/share.png',
    '/admin': '/icons/admin.png',
  };

  const currentPath = location.pathname;
  const currentIcon = routeImages[currentPath];

  return (
    <div className="my-navbar">
      <div className="navbar-content" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        
        {/* 로고 + 이미지 */}
        <div className="brand" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>CSIBEE</span>
          {currentIcon && (
            <img src={currentIcon} alt="page-icon" style={{ height: '24px' }} />
          )}
        </div>

        {/* 메뉴 영역 */}
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
            </div>
          </div>
        )}

        {/* 우측 사용자 영역 */}
        <div className="nav-user-area">
          {user ? (
            <Nav.Link onClick={handleLogout} className="nav-logout">로그아웃</Nav.Link>
          ) : (
            <Nav.Link as={Link} to="/register" className="nav-item">회원가입</Nav.Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavbarComponent;
