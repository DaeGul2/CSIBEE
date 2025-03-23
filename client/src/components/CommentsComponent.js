import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import api from '../services/api';

function CommentsComponent({ postId, category, user, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId, category]);

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments/');
      // 해당 postId와 category의 댓글만 필터링
      const filtered = res.data.filter(c => 
        parseInt(c.post_id) === parseInt(postId) && c.category === category
      );
      setComments(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      category: category,
      author_id: user.user_id,
      post_id: postId,
      content: newComment,
      parent_comment_id: replyTo
    };
    try {
      await api.post('/comments/', payload);
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // 본인이 작성한 댓글 삭제 기능
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // 재귀적으로 대댓글(자식 댓글) 렌더링, 작성시간 및 본인 댓글 삭제 버튼, 그리고 게시글 작성자와 일치하면 "작성자" 라벨 추가
  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter(c => c.parent_comment_id === parentId)
      .map(comment => (
        <div key={comment.comment_id} style={{ marginLeft: level * 20 + 'px', marginTop: '10px', borderLeft: level > 0 ? '1px solid #ddd' : 'none', paddingLeft: '10px' }}>
          <div>
            <strong>{comment.author_id}</strong>
            {comment.author_id === postAuthorId && (
              <span style={{ color: "red", fontWeight: "bold", marginLeft: "5px" }}>
                (작성자)
              </span>
            )} : {comment.content}
          </div>
          <div style={{ fontSize: "0.8em", color: "#888" }}>
            {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
          </div>
          <div>
            <Button variant="link" size="sm" onClick={() => setReplyTo(comment.comment_id)}>
              Reply
            </Button>
            {user && user.user_id === comment.author_id && (
              <Button variant="link" size="sm" onClick={() => handleDeleteComment(comment.comment_id)}>
                Delete
              </Button>
            )}
          </div>
          {renderComments(comment.comment_id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="mt-4">
      <h5>댓글</h5>
      <div>{renderComments()}</div>
      <Form onSubmit={handleSubmit} className="mt-3">
        {replyTo && (
          <div style={{ marginBottom: '5px' }}>
            Replying to comment #{replyTo}{" "}
            <Button variant="secondary" size="sm" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
          </div>
        )}
        <Form.Group controlId="newComment">
          <Form.Control
            type="text"
            placeholder="댓글 입력"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-2">
          {replyTo ? "대댓글 등록" : "댓글 등록"}
        </Button>
      </Form>
    </div>
  );
}

export default CommentsComponent;
