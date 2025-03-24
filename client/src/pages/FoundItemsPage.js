import React, { useState, useEffect } from "react";
import {
  Container, Button, Modal, Form, Image, Row, Col, Card, InputGroup, FormControl
} from "react-bootstrap";
import api from "../services/api";
import CommentsComponent from "../components/CommentsComponent";

function FoundItemsPage() {
  const [foundItems, setFoundItems] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    found_item_post_name: "",
    found_item_name: "",
    found_location: "",
    found_time: "",
    content: "",
    status: false, // 기본값: 미해결
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 6; // 페이지당 아이템 수

  // 현재 로그인한 사용자 (sessionStorage)
  const user = JSON.parse(sessionStorage.getItem("user"));

  // 제목을 13글자 이후 "..." 처리
  const shortenTitle = (title) => {
    return title.length > 13 ? title.substring(0, 13) + "..." : title;
  };

  // 상대시간 표시 함수 (분전/시간전/일전/달전)
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return diffMins + "분전";
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return diffHours + "시간전";
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return diffDays + "일전";
    }
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths + "달전";
  };

  // 페이지/검색어 변화 시 데이터 다시 가져오기
  useEffect(() => {
    fetchFoundItems();
  }, [currentPage, searchTerm]);

  // foundItems가 바뀔 때마다 댓글 수를 다시 계산
  useEffect(() => {
    fetchCommentCounts();
  }, [foundItems]);

  // 백엔드에서 검색/페이지네이션된 습득물 목록 가져오기
  const fetchFoundItems = async () => {
    try {
      const res = await api.get("/found_items/", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          keyword: searchTerm,
        },
      });
      setFoundItems(res.data.found_items);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("❌ 습득물 목록 불러오기 실패:", err);
    }
  };

  // 전체 댓글에서 found_item 카테고리 댓글 수 계산
  const fetchCommentCounts = async () => {
    try {
      const res = await api.get("/comments/");
      const counts = {};
      res.data.forEach((comment) => {
        if (comment.category === "found_item") {
          const postId = comment.post_id;
          counts[postId] = (counts[postId] || 0) + 1;
        }
      });
      setCommentCounts(counts);
    } catch (err) {
      console.error("❌ 댓글 목록 불러오기 실패:", err);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  // 습득물 등록
  // 습득물 등록 함수 (handleRegisterSubmit)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.user_id) {
        alert("로그인이 필요합니다.");
        return;
      }
      const formData = new FormData();
      formData.append("author_id", user.user_id);
      for (const key in registerForm) {
        formData.append(key, registerForm[key]);
      }
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.post("/found_items/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 등록 후 모달 닫기
      setShowRegisterModal(false);
      // 업로드 폼 상태 초기화
      setRegisterForm({
        found_item_post_name: "",
        found_item_name: "",
        found_location: "",
        found_time: "",
        content: "",
        status: false,
      });
      // 이미지 파일 상태 초기화
      setImageFiles([]);
      fetchFoundItems();
    } catch (err) {
      console.error("❌ 습득물 등록 실패:", err);
    }
  };


  // 상세 조회 (조회수 증가 포함)
  const handleItemClick = async (item) => {
    try {
      const res = await api.get(`/found_items/${item.found_item_post_id}`);
      setSelectedItem(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("❌ 게시글 상세 조회 실패:", err);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/found_items/${postId}`);
      fetchFoundItems();
      setShowDetailModal(false);
    } catch (err) {
      console.error("❌ 게시글 삭제 실패:", err);
    }
  };

  // 작성자만 "찾기 완료" (혹은 '해결') 버튼 클릭 -> status true
  const handleMarkAsResolved = async (postId) => {
    if (!window.confirm("해결 처리하시겠습니까?")) return;
    try {
      await api.put(`/found_items/${postId}`, { status: true });
      setSelectedItem({ ...selectedItem, status: true });
      fetchFoundItems();
    } catch (err) {
      console.error("❌ 상태 업데이트 실패:", err);
    }
  };

  // 페이지 이동
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 검색
  const handleSearch = () => {
    setCurrentPage(1);
    fetchFoundItems();
  };

  return (
    <Container style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>📌 분실물 찾아가세요</h2>

      {/* 키워드 검색 */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder="키워드 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: "0.8em" }}
        />
        <Button variant="outline-secondary" onClick={handleSearch} style={{ fontSize: "0.8em" }}>
          검색
        </Button>
      </InputGroup>

      <Button
        style={{
          width: "100%",
          backgroundColor: "#1DA1F2",
          borderColor: "#1DA1F2",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "15px",
        }}
        onClick={() => setShowRegisterModal(true)}
      >
        ➕ 습득물 등록
      </Button>

      {/* 카드형 피드 - 모바일에서 2열 */}
      <Row>
        {foundItems.map((item) => (
          <Col key={item.found_item_post_id} xs={6} className="mb-4" style={{ position: "relative" }}>
            <Card>
              {/* 해결/미해결 상태 배지 (카드 우측 상단) */}
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  backgroundColor: item.status ? "#28a745" : "#dc3545",
                  color: "#fff",
                  padding: "2px 5px",
                  borderRadius: "3px",
                  fontSize: "0.6em",
                }}
              >
                {item.status ? "해결" : "미해결"}
              </div>

              {/* 이미지 (추후 image_urls 업로드 로직 적용 시 변경) */}
              {item.image_urls && item.image_urls.length > 0 && (
                <Card.Img
                  variant="top"
                  src={`${process.env.REACT_APP_API_URL}${item.image_urls[0]}`}
                  style={{ height: "150px", objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleItemClick(item)}
                />
              )}

              <Card.Body style={{ cursor: "pointer", padding: "5px" }} onClick={() => handleItemClick(item)}>
                <Card.Title style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "3px" }}>
                  {shortenTitle(item.found_item_post_name)}
                </Card.Title>
                <div style={{ fontSize: "0.65em", color: "#555" }}>
                  {item.author_id} | {formatRelativeTime(item.created_at)} | {item.views} 조회 |{" "}
                  {commentCounts[item.found_item_post_id] || 0} 댓글
                </div>
              </Card.Body>
              {user && user.user_id === item.author_id && (
                <Card.Footer style={{ padding: "5px" }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePost(item.found_item_post_id)}
                    style={{ fontSize: "0.65em" }}
                  >
                    삭제
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 페이지네이션 */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "15px" }}>
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ fontSize: "0.65em" }}
        >
          이전
        </Button>
        <span style={{ margin: "0 10px", fontSize: "0.65em" }}>
          페이지 {currentPage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ fontSize: "0.65em" }}
        >
          다음
        </Button>
      </div>

      {/* 습득물 등록 Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "1em" }}>📝 습득물 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>게시글 제목</Form.Label>
              <Form.Control
                name="found_item_post_name"
                value={registerForm.found_item_post_name}
                onChange={handleRegisterChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>습득물 이름</Form.Label>
              <Form.Control
                name="found_item_name"
                value={registerForm.found_item_name}
                onChange={handleRegisterChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>습득 위치</Form.Label>
              <Form.Control
                name="found_location"
                value={registerForm.found_location}
                onChange={handleRegisterChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>습득 시간</Form.Label>
              <Form.Control
                name="found_time"
                value={registerForm.found_time}
                onChange={handleRegisterChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>내용</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={registerForm.content}
                onChange={handleRegisterChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: "0.9em" }}>🖼️ 이미지 업로드</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
                style={{ fontSize: "0.8em" }}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{ backgroundColor: "#1DA1F2", borderColor: "#1DA1F2", fontSize: "0.8em" }}
            >
              등록
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* 습득물 상세 Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 습득물 상세 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <h4 style={{ fontWeight: "bold", marginBottom: "15px" }}>
                {selectedItem.found_item_post_name}
              </h4>
              <div style={{ marginBottom: "10px", fontSize: "0.9em", color: "#555" }}>
                <div>작성자: {selectedItem.author_id}</div>
                <div>올린시간: {new Date(selectedItem.created_at).toLocaleString()}</div>
                <div>조회수: {selectedItem.views}</div>
                <div>{selectedItem.status ? "해결" : "미해결"}</div>
              </div>
              <p>
                <strong>습득물명:</strong> {selectedItem.found_item_name}
              </p>
              <p>
                <strong>습득 장소:</strong> {selectedItem.found_location}
              </p>
              <p>
                <strong>습득 시간:</strong> {selectedItem.found_time}
              </p>
              <p>{selectedItem.content}</p>
              {selectedItem.image_urls && selectedItem.image_urls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "15px" }}>
                  {selectedItem.image_urls.map((url, index) => (
                    <Image
                      key={index}
                      src={`${process.env.REACT_APP_API_URL}${url}`}
                      fluid
                      style={{ width: "100%", marginBottom: "10px", borderRadius: "10px" }}
                    />
                  ))}
                </div>
              )}
              {/* 작성자만 해결/삭제 가능 */}
              {user && (user.is_admin === true || user.user_id === selectedItem.author_id) && (
                <>
                  {!selectedItem.status && (
                    <Button
                      variant="success"
                      onClick={() => handleMarkAsResolved(selectedItem.found_item_post_id)}
                      style={{ marginBottom: "15px", fontSize: "0.8em", marginRight: "5px" }}
                    >
                      찾기 완료
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => handleDeletePost(selectedItem.found_item_post_id)}
                    style={{ marginBottom: "15px", fontSize: "0.8em" }}
                  >
                    게시글 삭제
                  </Button>
                </>
              )}

              {/* 댓글 컴포넌트 연결 (category="found_item") */}
              <CommentsComponent
                postId={selectedItem.found_item_post_id}
                category="found_item"
                user={user}
                postAuthorId={selectedItem.author_id}
              />
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default FoundItemsPage;
