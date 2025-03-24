import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import api from '../services/api';

function CommentsComponent({ postId, category, user, postAuthorId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, category]);

  const fetchComments = async () => {
    try {
      const res = await api.get('/comments/');
      // 해당 postId와 category의 댓글만 필터링
      const filtered = res.data.filter(
        (c) => parseInt(c.post_id) === parseInt(postId) && c.category === category
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
      category,
      author_id: user.user_id,
      post_id: postId,
      content: newComment,
      parent_comment_id: replyTo,
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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // 재귀적으로 대댓글(자식 댓글) 렌더링
  const renderComments = (parentId = null, level = 0) => {
    return comments
      .filter((c) => c.parent_comment_id === parentId)
      .map((comment) => (
        <Card
          key={comment.comment_id}
          style={{
            marginLeft: level * 20 + 'px',
            marginTop: '10px',
            borderLeft: level > 0 ? '2px solid #ccc' : 'none',
            paddingLeft: '10px',
            boxShadow: 'none',
          }}
          body
        >
          {/* 상단: 작성자 / 시간 (오른쪽) */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <div style={{ fontSize: '0.9rem' }}>
              <strong>{comment.author_id}</strong>
              {comment.author_id === postAuthorId && (
                <span style={{ color: 'red', marginLeft: '5px' }}>
                  (작성자)
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>
              {comment.created_at
                ? new Date(comment.created_at).toLocaleString()
                : ""}
            </div>
          </div>

          {/* 내용 */}
          <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            {comment.content}
          </div>

          {/* 하단: 답변/삭제 버튼 */}
          <div style={{ marginTop: '8px' }}>
            <Button
              variant="link"
              size="sm"
              onClick={() => setReplyTo(comment.comment_id)}
              style={{ padding: 0, marginRight: '8px' }}
            >
              답변
            </Button>
            {user && user.user_id === comment.author_id && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleDeleteComment(comment.comment_id)}
                style={{ padding: 0 }}
              >
                삭제
              </Button>
            )}
          </div>

          {/* 대댓글(자식) 재귀 */}
          {renderComments(comment.comment_id, level + 1)}
        </Card>
      ));
  };

  return (
    <div className="mt-4">
      <h5>댓글</h5>
      <div>{renderComments()}</div>

      {/* 새 댓글/대댓글 작성 폼 */}
      <Form onSubmit={handleSubmit} className="mt-3">
        {replyTo && (
          <div style={{ marginBottom: '5px', fontSize: '0.85rem', color: '#555' }}>
            답변 작성 중... (#{replyTo})
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReplyTo(null)}
              style={{ marginLeft: '8px' }}
            >
              취소
            </Button>
          </div>
        )}
        <Form.Group controlId="newComment">
          <Form.Control
            type="text"
            placeholder="댓글을 입력해주세요."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          className="mt-2"
          style={{ fontSize: '0.9rem' }}
        >
          {replyTo ? "대댓글 등록" : "댓글 등록"}
        </Button>
      </Form>
    </div>
  );
}

export default CommentsComponent;
