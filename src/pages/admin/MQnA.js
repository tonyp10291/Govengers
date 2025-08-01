import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/admin/MQnA.css";

const MQnA = () => {
  const [inquiries, setInquiries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [answerStatusFilter, setAnswerStatusFilter] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("");
  const [replyText, setReplyText] = useState("");

  const token = localStorage.getItem("token");

  // 카테고리별 한글 표시
  const getCategoryText = (category) => {
    const categoryMap = {
      '상품문의': '상품문의',
      '배송문의': '배송문의',
      '결제문의': '결제문의',
      '회원문의': '회원문의',
      '기타문의': '기타문의'
    };
    return categoryMap[category] || category;
  };

  // 카테고리별 색상 클래스
  const getCategoryClass = (category) => {
    const classMap = {
      '상품문의': 'category-product',
      '배송문의': 'category-delivery',
      '결제문의': 'category-payment',
      '회원문의': 'category-member',
      '기타문의': 'category-other'
    };
    return classMap[category] || 'category-other';
  };

  // 답변 상태 표시
  const getAnswerStatusText = (inquiry) => {
    return inquiry.answer ? '답변완료' : '답변대기';
  };

  const getAnswerStatusClass = (inquiry) => {
    return inquiry.answer ? 'status-answered' : 'status-pending';
  };

  // 검색 핸들러
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append('page', '0');
    if (searchTerm) params.append('keyword', searchTerm);
    if (categoryFilter) params.append('category', categoryFilter);
    if (answerStatusFilter) params.append('answerStatus', answerStatusFilter);
    if (privacyFilter) params.append('isPrivate', privacyFilter === 'private');

    axios.get(`/api/admin/inquiries?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setInquiries(res.data.content);
        setTotalPages(res.data.totalPages);
        setPage(0);
        if (res.data.content.length === 0) {
          alert("검색 결과가 없습니다.");
        }
      })
      .catch(err => {
        console.error("❌ 검색 실패:", err);
        alert("검색에 실패했습니다.");
      });
  };

  // 페이지 로드
  useEffect(() => {
    if (searchTerm.trim() === "" && !categoryFilter && !answerStatusFilter && !privacyFilter) {
      axios.get(`/api/admin/inquiries?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          setInquiries(res.data.content);
          setTotalPages(res.data.totalPages);
        })
        .catch(err => {
          console.error("❌ 문의 목록 불러오기 실패:", err);
        });
    }
  }, [page, token, searchTerm, categoryFilter, answerStatusFilter, privacyFilter]);

  // 상세보기 토글
  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
    setReplyText(""); // 답변 텍스트 초기화
  };

  // 답변 등록/수정
  const handleReply = (inquiryId) => {
    if (!replyText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    axios.post(`/api/admin/inquiries/${inquiryId}/answer`, 
      { 
        answer: replyText,
        adminId: "admin" // JWT에서 추출한 관리자 ID로 변경
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(() => {
        alert("답변이 등록되었습니다.");
        setReplyText("");
        // 목록 새로고침
        window.location.reload();
      })
      .catch(err => {
        console.error("❌ 답변 등록 실패:", err);
        alert("답변 등록에 실패했습니다.");
      });
  };

  // 문의 삭제
  const handleDelete = (inquiryId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    axios.delete(`/api/admin/inquiries/${inquiryId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => {
        alert("문의가 삭제되었습니다.");
        // 목록 새로고침
        window.location.reload();
      })
      .catch(err => {
        console.error("❌ 문의 삭제 실패:", err);
        alert("문의 삭제에 실패했습니다.");
      });
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    const maxVisiblePages = 5;
    const currentGroup = Math.floor(page / maxVisiblePages);
    const startPage = currentGroup * maxVisiblePages;
    const endPage = Math.min(startPage + maxVisiblePages, totalPages);

    const pageNumbers = [];
    for (let i = startPage; i < endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>총 {totalPages}페이지 중 {page + 1}페이지</span>
        </div>
        
        <div className="pagination">
          <button 
            onClick={() => setPage((prev) => Math.max(prev - 5, 0))}
            disabled={page < 5}
            className="pagination-btn first-last"
            title="5페이지 뒤로"
          >
            ⟪
          </button>

          <button 
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="pagination-btn prev-next"
            title="이전 페이지"
          >
            ‹
          </button>

          {startPage > 0 && (
            <>
              <button
                onClick={() => setPage(0)}
                className="pagination-btn page-number"
              >
                1
              </button>
              <span className="pagination-dots">...</span>
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`pagination-btn page-number ${page === pageNum ? "active" : ""}`}
            >
              {pageNum + 1}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              <span className="pagination-dots">...</span>
              <button
                onClick={() => setPage(totalPages - 1)}
                className="pagination-btn page-number"
              >
                {totalPages}
              </button>
            </>
          )}

          <button 
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="pagination-btn prev-next"
            title="다음 페이지"
          >
            ›
          </button>

          <button 
            onClick={() => setPage((prev) => Math.min(prev + 5, totalPages - 1))}
            disabled={page >= totalPages - 5}
            className="pagination-btn first-last"
            title="5페이지 앞으로"
          >
            ⟫
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-mqna-wrap">
      <div className="mqna-container">
        <h2 className="mqna-title">문의 관리</h2>

        <div className="admin-card">
          <div className="filter-section">
            <div className="search-box-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="제목, 내용, 작성자로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>🔍</button>
              </div>
            </div>
            
            <div className="filter-controls">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 카테고리</option>
                <option value="상품문의">상품문의</option>
                <option value="배송문의">배송문의</option>
                <option value="결제문의">결제문의</option>
                <option value="회원문의">회원문의</option>
                <option value="기타문의">기타문의</option>
              </select>
              
              <select 
                value={answerStatusFilter} 
                onChange={(e) => setAnswerStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 상태</option>
                <option value="PENDING">답변대기</option>
                <option value="ANSWERED">답변완료</option>
              </select>

              <select 
                value={privacyFilter} 
                onChange={(e) => setPrivacyFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">공개/비공개</option>
                <option value="public">공개</option>
                <option value="private">비공개</option>
              </select>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>카테고리</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>답변상태</th>
                <th>공개여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map(inquiry => (
                <React.Fragment key={inquiry.inquiryId}>
                  <tr onClick={() => toggleExpand(inquiry.inquiryId)} className={`summary-row ${expandedId === inquiry.inquiryId ? 'expanded' : ''}`}>
                    <td>
                      <span className={`category-badge ${getCategoryClass(inquiry.category)}`}>
                        {getCategoryText(inquiry.category)}
                      </span>
                    </td>
                    <td className="title-cell">{inquiry.title}</td>
                    <td>{inquiry.user?.unm || '탈퇴회원'}</td>
                    <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getAnswerStatusClass(inquiry)}`}>
                        {getAnswerStatusText(inquiry)}
                      </span>
                    </td>
                    <td>
                      <span className={`privacy-badge ${inquiry.isPrivate ? 'private' : 'public'}`}>
                        {inquiry.isPrivate ? '🔒 비공개' : '🌐 공개'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(inquiry.inquiryId)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  {expandedId === inquiry.inquiryId && (
                    <tr className="detail-row">
                      <td colSpan="7">
                        <div className="detail-box">
                          <div className="detail-content">
                            <div className="detail-section">
                              <h4>문의 내용</h4>
                              <p className="content-text">{inquiry.content}</p>
                            </div>
                            
                            {inquiry.answer && (
                              <div className="detail-section">
                                <h4>관리자 답변</h4>
                                <p className="reply-text">{inquiry.answer}</p>
                                <small className="answer-date">
                                  답변일: {new Date(inquiry.answerAt).toLocaleString()}
                                </small>
                              </div>
                            )}
                            
                            <div className="detail-section">
                              <h4>답변 작성/수정</h4>
                              <div className="reply-form">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="답변을 입력하세요..."
                                  className="reply-textarea"
                                  rows="4"
                                />
                                <button 
                                  className="reply-submit-btn"
                                  onClick={() => handleReply(inquiry.inquiryId)}
                                >
                                  {inquiry.answer ? '답변 수정' : '답변 등록'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default MQnA;