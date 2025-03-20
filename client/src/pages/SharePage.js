// src/pages/SharePage.js
import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, ListGroup } from 'react-bootstrap';
import api from '../services/api'; // axios 대신 api.js 임포트

function SharePage() {
  const [shareItems, setShareItems] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    share_item_post_name: '',
    author_id: '',
    content: '',
    image_urls: '',
    status: true
  });

  useEffect(() => {
    fetchShareItems();
  }, []);

  const fetchShareItems = async () => {
    try {
      const res = await api.get('/share_items/');
      setShareItems(res.data);
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
      await api.post('/share_items/', registerForm);
      setShowRegisterModal(false);
      fetchShareItems();
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
      <h2>무료 나눔 게시판</h2>
      <Button variant="primary" onClick={() => setShowRegisterModal(true)}>
        나눔 등록
      </Button>
      <ListGroup className="mt-3">
        {shareItems.map(item => (
          <ListGroup.Item 
            key={item.share_item_post_id} 
            action 
            onClick={() => handleItemClick(item)}
          >
            {item.share_item_post_name}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* 나눔 등록 Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>나눔 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>게시글 제목</Form.Label>
              <Form.Control 
                name="share_item_post_name" 
                value={registerForm.share_item_post_name} 
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

      {/* 나눔 상세 Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>나눔 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <h4>{selectedItem.share_item_post_name}</h4>
              <p>{selectedItem.content}</p>
              {/* 상세 modal 내에 댓글 영역 추가 (추후 API 연동) */}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default SharePage;
