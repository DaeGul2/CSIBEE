import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Modal,
  Form,
  Table,
  InputGroup,
  FormControl,
  Image,
} from "react-bootstrap";
import api from "../services/api";
import CommentsComponent from "../components/CommentsComponent";


// 목록에서만 상대시간 표기 (예: "3일 전", "2시간 전")
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) {
    return "방금 전";
  }
  if (diffMins < 60) {
    return `${diffMins}분 전`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}일 전`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}개월 전`;
  }
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}년 전`;
}

// 상세 정보 모달에서는 yyyy-mm-dd hh:mm 포맷으로 출력
function formatFullDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function NoticeBoardPage() {
  const [notices, setNotices] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [registerForm, setRegisterForm] = useState({
    notice_post_name: "",
    content: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // 로그인한 사용자 정보 (sessionStorage)
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices/", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          keyword: searchTerm,
        },
      });
      setNotices(res.data.notices);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("공지사항 목록 불러오기 실패:", err);
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
    if (!user || !user.user_id) {
      alert("로그인이 필요합니다.");
      return;
    }
    // 관리자만 작성 가능
    if (!user.is_admin) {
      alert("관리자만 공지사항을 작성할 수 있습니다.");
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

    try {
      await api.post("/notices/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setShowRegisterModal(false);
      setRegisterForm({ notice_post_name: "", content: "" });
      setImageFiles([]);
      fetchNotices();
    } catch (err) {
      console.error("공지사항 등록 실패:", err);
    }
  };

  const handleNoticeClick = async (notice) => {
    try {
      const res = await api.get(`/notices/${notice.notice_post_id}`, {
        withCredentials: true,
      });
      setSelectedNotice(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("공지사항 상세 조회 실패:", err);
    }
  };

  const handleDeleteNotice = async (postId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/notices/${postId}`, { withCredentials: true });
      fetchNotices();
      setShowDetailModal(false);
    } catch (err) {
      console.error("공지사항 삭제 실패:", err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchNotices();
  };

  return (
    <Container className="mt-4">
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(255,255,255,0.9)', // 내용 가독성 확보
        }}
      >
        {/* 흐릿한 배경 이미지 */}
        <div
          style={{
            backgroundImage: 'url("/images/notice_background.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            filter: 'blur(4px)',
            opacity: 0.7,
            zIndex: -1,
          }}
        ></div>

        {/* 실제 내용 */}
        <h2>공지사항</h2>
        <InputGroup className="mb-3" style={{ maxWidth: "400px" }}>
          <FormControl
            placeholder="키워드 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleSearch}>
            검색
          </Button>
        </InputGroup>
        {user && user.is_admin && (
          <Button variant="primary" onClick={() => setShowRegisterModal(true)}>
            공지사항 등록
          </Button>
        )}
      </div>


      {/* 테이블: 번호, 제목, 작성자, 작성일(상대시간) */}
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>번호</th>
            <th>제목</th>
            <th style={{ width: "120px" }}>작성자</th>
            <th style={{ width: "120px" }}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice, index) => (
            <tr
              key={notice.notice_post_id}
              style={{ cursor: "pointer" }}
              onClick={() => handleNoticeClick(notice)}
            >
              {/* 번호 */}
              <td>{(currentPage - 1) * itemsPerPage + (index + 1)}</td>
              {/* 제목 */}
              <td>{notice.notice_post_name}</td>
              {/* 작성자 */}
              <td>{notice.author_id}</td>
              {/* 작성일 (상대 시간) */}
              <td>{formatRelativeTime(notice.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 페이지네이션 */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </Button>
        <span className="mx-3">
          페이지 {currentPage} / {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </Button>
      </div>

      {/* 공지사항 등록 Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>공지사항 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>제목</Form.Label>
              <Form.Control
                name="notice_post_name"
                value={registerForm.notice_post_name}
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
            <Form.Group className="mb-3">
              <Form.Label>이미지 업로드</Form.Label>
              <Form.Control type="file" multiple onChange={handleImageChange} />
            </Form.Group>
            <Button variant="primary" type="submit">
              등록
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* 공지사항 상세 Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>공지사항 상세</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotice && (
            <>
              <h4>{selectedNotice.notice_post_name}</h4>
              {/* 상세에선 full date로 표시 */}
              <p>
                작성자: {selectedNotice.author_id} |{" "}
                {formatFullDate(selectedNotice.created_at)}
              </p>
              <p>{selectedNotice.content}</p>
              {selectedNotice.image_urls && selectedNotice.image_urls.length > 0 && (
                <div className="mb-3">
                  {selectedNotice.image_urls.map((url, index) => (
                    <Image
                      key={index}
                      src={`${process.env.REACT_APP_API_URL}${url}`}
                      fluid
                      className="mb-2"
                    />
                  ))}
                </div>
              )}
              {user && user.is_admin && (
                <Button
                  variant="danger"
                  onClick={() => handleDeleteNotice(selectedNotice.notice_post_id)}
                >
                  삭제
                </Button>
              )}
              {/* 댓글 컴포넌트 */}
              <CommentsComponent
                postId={selectedNotice.notice_post_id}
                category="notice"
                user={user}
                postAuthorId={selectedNotice.author_id}
              />
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default NoticeBoardPage;
