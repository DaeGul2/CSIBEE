import React, { useState, useEffect } from "react";
import { Container, Button, Modal, Form, Image } from "react-bootstrap";
import api from "../services/api";

function LostItemsPage() {
  const [lostItems, setLostItems] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    lost_item_post_name: "",
    lost_item_name: "",
    lost_location: "",
    lost_time: "",
    content: "",
    status: true,
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    try {
      const res = await api.get("/lost-items/");
      setLostItems(res.data);
    } catch (err) {
      console.error("❌ 분실물 목록 불러오기 실패:", err);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.user_id) {
        alert("로그인이 필요합니다.");
        return;
      }
      formData.append("author_id", user.user_id);
      for (const key in registerForm) {
        formData.append(key, registerForm[key]);
      }
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.post("/lost-items/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowRegisterModal(false);
      fetchLostItems();
    } catch (err) {
      console.error("❌ 분실물 등록 실패:", err);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <Container style={{ maxWidth: "600px", backgroundColor: "#f5f8fa", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", borderBottom: "2px solid #ddd", paddingBottom: "10px" }}>
        📌 분실물 게시판
      </h2>
      
      <Button
        style={{
          width: "100%",
          backgroundColor: "#1DA1F2",
          borderColor: "#1DA1F2",
          fontSize: "16px",
          fontWeight: "bold",
        }}
        onClick={() => setShowRegisterModal(true)}
      >
        ➕ 분실물 등록
      </Button>

      <div style={{ marginTop: "20px" }}>
        {lostItems.map((item) => (
          <div
            key={item.lost_item_post_id}
            onClick={() => handleItemClick(item)}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "15px",
              display: "flex",
              cursor: "pointer",
              alignItems: "center",
            }}
          >
            {item.image_urls.length > 0 && (
              <Image
                src={`http://localhost:5000${item.image_urls[0]}`}
                roundedCircle
                style={{ width: "50px", height: "50px", marginRight: "15px" }}
              />
            )}
            <div>
              <span style={{ fontWeight: "bold", fontSize: "16px" }}>{item.lost_item_post_name}</span>
              <p style={{ margin: 0, fontSize: "14px", color: "#657786" }}>{item.lost_item_name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 분실물 등록 Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📝 분실물 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            {["lost_item_post_name", "lost_item_name", "lost_location", "lost_time"].map((field, idx) => (
              <Form.Group key={idx} className="mb-3">
                <Form.Label>{field.replace("_", " ")}</Form.Label>
                <Form.Control name={field} value={registerForm[field]} onChange={handleRegisterChange} />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>내용</Form.Label>
              <Form.Control as="textarea" name="content" value={registerForm.content} onChange={handleRegisterChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>🖼️ 이미지 업로드</Form.Label>
              <Form.Control type="file" multiple onChange={handleImageChange} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ backgroundColor: "#1DA1F2", borderColor: "#1DA1F2" }}>
              등록
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* 분실물 상세 Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📋 분실물 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <h4 style={{ fontWeight: "bold" }}>{selectedItem.lost_item_post_name}</h4>
              <p>📍 {selectedItem.lost_item_name}</p>
              <p>📍 {selectedItem.lost_location}</p>
              <p>📍 {selectedItem.lost_time}</p>
              <p>📄 {selectedItem.content}</p>
              {selectedItem.image_urls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {selectedItem.image_urls.map((url, index) => (
                    <Image
                      key={index}
                      src={`http://localhost:5000${url}`}
                      fluid
                      style={{ width: "100%", marginBottom: "10px", borderRadius: "10px" }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default LostItemsPage;
