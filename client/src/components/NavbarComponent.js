import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function NavbarComponent({ user, setUser }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });  // ✅ 서버 세션 삭제 요청
      sessionStorage.removeItem('user');  // ✅ 세션에서 사용자 정보 삭제
      setUser(null);  // ✅ 상태 변경
      navigate('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">CSIBEE</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/lost-items">분실물</Nav.Link>
              <Nav.Link as={Link} to="/found-items">습득물</Nav.Link>
              <Nav.Link as={Link} to="/share">나눔</Nav.Link>
              <Nav.Link as={Link} to="/admin">관리자</Nav.Link>
            </Nav>
          )}
          <Nav className="ms-auto">
            {user ? (
              <>
                <Navbar.Text className="me-3">안녕하세요, {user.user_name}님</Navbar.Text>
                <Nav.Link onClick={handleLogout}>로그아웃</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">로그인</Nav.Link>
                <Nav.Link as={Link} to="/register">회원가입</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
