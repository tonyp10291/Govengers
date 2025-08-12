// src/pages/admin/QnaDetailAdmin.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { Button } from '../../util/Buttons';
import '../../css/util/Buttons.css';

export default function QnaDetailAdmin() {
  const { qid } = useParams();
  const [qna, setQna] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/qna/${qid}`);
        setQna(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error('QNA 상세 실패:', e.response?.status, e.response?.data);
        alert('문의 상세 로드 실패');
      }
    })();
  }, [qid]);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    try {
      await api.post(`/qna/${qid}/answer`, { content: answer }); // 규칙 OK
      alert('답변이 등록되었습니다.');
      setAnswer('');
    } catch (e) {
      console.error('답변 등록 실패:', e.response?.status, e.response?.data);
      alert(`답글등록 실패: ${e.response?.status || ''}`);
    }
  };

  if (!qna) return null;

  return (
    <div className="admin-qna-detail">
      <h2>[관리자] 상품문의 상세</h2>
      <div className="qna-box">
        <div className="title">{qna.title}</div>
        <div className="content">{qna.content}</div>
      </div>

      <div className="answer-box">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="관리자 답변을 입력하세요"
          rows={6}
        />
        <Button onClick={submitAnswer}>답변 등록</Button>
      </div>
    </div>
  );
}
