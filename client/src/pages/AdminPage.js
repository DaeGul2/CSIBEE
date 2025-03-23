import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import api from '../services/api';

function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/users/pending');
      setPendingUsers(res.data);
    } catch (err) {
      console.error('미승인 사용자 목록 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, makeAdmin = false) => {
    try {
      await api.put(`/users/${userId}/approve`, { is_admin: makeAdmin });
      alert('승인 완료!');
      fetchPendingUsers();
    } catch (err) {
      console.error('승인 실패:', err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>관리자 페이지</h2>
      <p>아직 승인되지 않은 사용자 목록입니다.</p>
      <Table bordered hover>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>현재 관리자 여부</th>
            <th>승인</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.map(user => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.user_name}</td>
              <td>{user.is_admin ? '관리자' : '일반'}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleApprove(user.user_id, false)}>
                  일반 승인
                </Button>{' '}
                <Button variant="warning" size="sm" onClick={() => handleApprove(user.user_id, true)}>
                  관리자 승인
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminPage;
