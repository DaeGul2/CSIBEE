import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './NavbarComponent.css'; // 아래 CSS 예시를 임포트

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
    <Navbar bg="light" expand="lg" className="my-navbar">
      <Container>
        {/* 좌측 상단 브랜드 */}
        <Navbar.Brand as={Link} to="/" className="my-brand">
          CSIBEE
        </Navbar.Brand>

        {/* 모바일 토글 버튼 (햄버거 아이콘) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* 펼쳐지는 메뉴 */}
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/lost-items" className="nav-item">
                분실물
              </Nav.Link>
              <Nav.Link as={Link} to="/found-items" className="nav-item">
                습득물
              </Nav.Link>
              <Nav.Link as={Link} to="/share" className="nav-item">
                나눔
              </Nav.Link>
              {user.is_admin && (
                <Nav.Link as={Link} to="/admin" className="nav-item">
                  관리자
                </Nav.Link>
              )}
            </Nav>
          )}

          <Nav className="ms-auto">
            {user ? (
              <>
                <Navbar.Text className="nav-user me-2">
                  안녕하세요, {user.user_name}님
                </Navbar.Text>
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
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
