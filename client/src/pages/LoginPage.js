import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LoginPage.css'; // 추가: 스타일 분리 (선택사항)

function LoginPage({ setUser }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { user_id: userId, password });
      sessionStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/notice');
    } catch (err) {
      console.error('로그인 실패:', err);
      if (err.response && err.response.status === 403) {
        alert('관리자의 승인을 받기 전입니다.');
      } else {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    }
  };

  return (
 <Container className="d-flex flex-column justify-content-start align-items-center login-container">
      <Row className="w-100 justify-content-center" style={{ marginTop: '1rem' }}>
        <Col
          xs={12}
          sm={10}
          md={6}
          className="text-center"
          style={{ height: '250px', marginBottom: '1rem' }} // 이미지 영역 높이
        >
          <img
            src="/images/login2.png"
            alt="로그인 이미지"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              borderRadius: '10px',
            }}
          />
        </Col>
      </Row>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} className="text-center">
          <h2 className="mb-4">로그인</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUserId" className="mb-3 text-start">
              <Form.Label>아이디</Form.Label>
              <Form.Control
                type="text"
                placeholder="아이디 입력"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-4 text-start">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              로그인
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
