// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    user_id: '',
    user_password: '',
    user_password_confirm: '', // 비밀번호 재입력 필드 추가
    user_name: '',             // 실제 성명을 입력 (수정 가능)
    phone_number: '',
    admission_year: '',
    grade: '',
    class_num: '',
    student_num: ''
  });
  const [idAvailable, setIdAvailable] = useState(null); // null: 확인 전, true: 사용 가능, false: 중복
  const [checking, setChecking] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    // user_id가 변경되면 중복확인 결과 초기화
    if (e.target.name === 'user_id') setIdAvailable(null);
    // 비밀번호 재입력 체크
    if (
      (e.target.name === 'user_password' || e.target.name === 'user_password_confirm') &&
      formData.user_password &&
      formData.user_password_confirm &&
      formData.user_password !== formData.user_password_confirm
    ) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 중복확인 함수: 입력한 user_id가 이미 존재하는지 GET 요청
  const checkDuplicateId = async () => {
    if (!formData.user_id) return;
    setChecking(true);
    try {
      // 백엔드 GET /users/<user_id> 엔드포인트 호출
      await api.get(`/users/${formData.user_id}`);
      // 요청이 성공하면 이미 존재하는 id
      setIdAvailable(false);
    } catch (err) {
      // 만약 404 에러가 발생하면, id가 없다는 뜻 -> 사용 가능
      if (err.response && err.response.status === 404) {
        setIdAvailable(true);
      } else {
        console.error(err);
      }
    }
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (idAvailable !== true) {
      alert('사용 가능한 아이디인지 확인해 주세요.');
      return;
    }
    if (formData.user_password !== formData.user_password_confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    const payload = {
      user_id: formData.user_id,         // 반드시 값이 있어야 함
      user_password: formData.user_password,
      user_name: formData.user_name,
      phone_number: formData.phone_number,
      admission_year: formData.admission_year,
      grade: formData.grade,
      class_num: formData.class_num,
      student_num: formData.student_num
    };
    console.log('회원가입 payload:', payload);  // 확인용
    try {
      const res = await api.post('/users/', payload);
      console.log('User registered:', res.data);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <h2>회원가입</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="user_id" className="mb-3">
              <Form.Label>아이디</Form.Label>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  placeholder="아이디 입력" 
                  name="user_id" 
                  value={formData.user_id} 
                  onChange={handleChange} 
                />
                <Button variant="outline-secondary" onClick={checkDuplicateId} disabled={checking}>
                  중복확인
                </Button>
              </InputGroup>
              {idAvailable === true && (
                <Alert variant="success" className="mt-2">
                  사용 가능한 아이디입니다.
                </Alert>
              )}
              {idAvailable === false && (
                <Alert variant="danger" className="mt-2">
                  이미 사용 중인 아이디입니다.
                </Alert>
              )}
            </Form.Group>

            <Form.Group controlId="user_password" className="mb-3">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="비밀번호 입력" 
                name="user_password" 
                value={formData.user_password} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="user_password_confirm" className="mb-3">
              <Form.Label>비밀번호 확인</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="비밀번호 재입력" 
                name="user_password_confirm" 
                value={formData.user_password_confirm} 
                onChange={handleChange} 
              />
              {passwordMismatch && (
                <Alert variant="danger" className="mt-2">
                  비밀번호가 일치하지 않습니다.
                </Alert>
              )}
            </Form.Group>

            <Form.Group controlId="user_name" className="mb-3">
              <Form.Label>이름</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="실제 성명 입력" 
                name="user_name" 
                value={formData.user_name} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="phone_number" className="mb-3">
              <Form.Label>전화번호</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="전화번호 입력" 
                name="phone_number" 
                value={formData.phone_number} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="admission_year" className="mb-3">
              <Form.Label>입학년도</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="입학년도 입력" 
                name="admission_year" 
                value={formData.admission_year} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="grade" className="mb-3">
              <Form.Label>학년</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="학년 입력" 
                name="grade" 
                value={formData.grade} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="class_num" className="mb-3">
              <Form.Label>반</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="반 입력" 
                name="class_num" 
                value={formData.class_num} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Form.Group controlId="student_num" className="mb-3">
              <Form.Label>번호</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="번호 입력" 
                name="student_num" 
                value={formData.student_num} 
                onChange={handleChange} 
              />
            </Form.Group>

            <Button variant="primary" type="submit">회원가입</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
