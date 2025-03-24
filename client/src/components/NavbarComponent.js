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
      <div className="navbar-content">
        {/* 로고/브랜드 */}
        <div className="brand" onClick={() => navigate('/')}>
          CSIBEE
        </div>

        {/* 로그인 유저일 때만 메뉴 링크 표시 */}
        {user && (
          <div className="nav-links">
            <Nav.Link as={Link} to="/lost-items" className="nav-item">
              분실물
            </Nav.Link>
            <Nav.Link as={Link} to="/found-items" className="nav-item">
              습득물
            </Nav.Link>
            <Nav.Link as={Link} to="/share" className="nav-item">
              나눔
            </Nav.Link>
            <Nav.Link as={Link} to="/notices" className="nav-item">
              공지사항
            </Nav.Link>
            {user.is_admin && (
              <Nav.Link as={Link} to="/admin" className="nav-item">
                관리자
              </Nav.Link>
            )}
          </div>
        )}

        {/* 우측 사용자 영역 */}
        <div className="nav-user-area">
          {user ? (
            <>
              <span className="nav-user-text">
                안녕하세요, {user.user_name}님
              </span>
              <Nav.Link onClick={handleLogout} className="nav-logout">
                로그아웃
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login" className="nav-item">
                로그인
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="nav-item">
                회원가입
              </Nav.Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavbarComponent;
