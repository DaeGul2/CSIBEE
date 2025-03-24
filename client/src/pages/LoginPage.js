import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage({ setUser }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { user_id: userId, password });
      // 로그인 성공 시 세션 스토리지에 저장
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
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <h2>로그인</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUserId" className="mb-3">
              <Form.Label>아이디</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="아이디 입력" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="비밀번호 입력" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </Form.Group>
            <Button variant="primary" type="submit">로그인</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
