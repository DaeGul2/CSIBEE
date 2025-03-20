// src/pages/FoundItemsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Card, Row, Col } from 'react-bootstrap';
import api from '../services/api'; // axios 대신 api.js 임포트

function FoundItemsPage() {
  const [foundItems, setFoundItems] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    found_item_post_name: '',
    author_id: '',
    found_item_name: '',
    found_location: '',
    found_time: '',
    content: '',
    image_urls: '',
    resolved: false,
    status: true
  });

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      const res = await api.get('/found_items/');
      setFoundItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/found_items/', registerForm);
      setShowRegisterModal(false);
      fetchFoundItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <Container className="mt-4">
      <h2>습득물 게시판</h2>
      <Button variant="primary" onClick={() => setShowRegisterModal(true)}>
        습득물 등록
      </Button>
      <Row className="mt-3">
        {foundItems.map(item => (
          <Col key={item.found_item_post_id} xs={12} md={6} lg={4} className="mb-3">
            <Card onClick={() => handleItemClick(item)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>{item.found_item_post_name}</Card.Title>
                <Card.Text>{item.found_item_name}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 습득물 등록 Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>습득물 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>게시글 제목</Form.Label>
              <Form.Control 
                name="found_item_post_name" 
                value={registerForm.found_item_post_name} 
                onChange={handleRegisterChange} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>습득물명</Form.Label>
              <Form.Control 
                name="found_item_name" 
                value={registerForm.found_item_name} 
                onChange={handleRegisterChange} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>습득 장소</Form.Label>
              <Form.Control 
                name="found_location" 
                value={registerForm.found_location} 
                onChange={handleRegisterChange} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>습득 시간</Form.Label>
              <Form.Control 
                name="found_time" 
                value={registerForm.found_time} 
                onChange={handleRegisterChange} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>내용</Form.Label>
              <Form.Control 
                as="textarea" 
                name="content" 
                value={registerForm.content} 
                onChange={handleRegisterChange} 
              />
            </Form.Group>
            <Button variant="primary" type="submit">등록</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* 습득물 상세 Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>습득물 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <h4>{selectedItem.found_item_post_name}</h4>
              <p>습득물명: {selectedItem.found_item_name}</p>
              <p>습득 장소: {selectedItem.found_location}</p>
              <p>습득 시간: {selectedItem.found_time}</p>
              <p>{selectedItem.content}</p>
              {/* 상세 modal 내에 댓글 영역 추가 (추후 API 연동) */}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default FoundItemsPage;
