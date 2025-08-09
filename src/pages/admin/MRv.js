import React, { useEffect, useState, useCallback } from "react";
import "../../css/admin/MRv.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const MRv = () => {
  const [reviews, setReviews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [editingResponse, setEditingResponse] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const url = searchTerm.trim() === "" 
        ? `/api/reviews/list?page=${page}&size=5`
        : `/api/reviews/list?page=${page}&size=5&keyword=${searchTerm}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("API 응답 데이터:", data);
      console.log("첫 번째 리뷰 데이터:", data.content?.[0] || data[0]);
      console.log("expandedId 상태:", expandedId);
      
      if (Array.isArray(data.content)) {
        setReviews(data.content);
        setTotalPages(data.totalPages || Math.ceil(data.content.length / 5));
      } else if (Array.isArray(data)) {
        const startIndex = page * 5;
        const endIndex = startIndex + 5;
        const paginatedData = data.slice(startIndex, endIndex);
        setReviews(paginatedData);
        setTotalPages(Math.ceil(data.length / 5));
      } else {
        console.error("❌ 리뷰 목록 응답이 배열이 아님:", data);
        setReviews([]);
      }
    } catch (err) {
      console.error("리뷰 불러오기 실패:", err);
      setReviews([]);
    }
  }, [page, searchTerm]);

  const handleSearch = () => {
    setPage(0);
    setExpandedId(null);
    fetchReviews();
    if (reviews.length === 0 && searchTerm.trim() !== "") {
      alert("검색 결과가 없습니다!");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleExpand = (id) => {
    console.log("토글 클릭 - ID:", id, "현재 expandedId:", expandedId);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getStars = (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? '★' : '☆';
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    if (isMobile) {
      const year = String(date.getFullYear()).slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}년${month}월${day}일`;
    } else {
      return date.toLocaleString("ko-KR");
    }
  };

  const startEditResponse = (reviewId, currentResponse) => {
    setEditingResponse(reviewId);
    setResponseText(currentResponse || "");
  };

  const cancelEditResponse = () => {
    setEditingResponse(null);
    setResponseText("");
  };

  const saveResponse = async (reviewId) => {
    try {
      const response = await fetch(`/api/reviews/response/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: responseText })
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          (review.reviewId || review.id) === reviewId 
            ? { ...review, response: responseText }
            : review
        ));
        setEditingResponse(null);
        setResponseText("");
        alert('답변이 저장되었습니다.');
      } else {
        alert('답변 저장 실패');
      }
    } catch (err) {
      console.error("답변 저장 중 오류:", err);
      alert("서버 오류 발생");
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const maxVisiblePages = 5;
    let startPage, endPage;

    const currentGroup = Math.floor(page / maxVisiblePages);
    startPage = currentGroup * maxVisiblePages;
    endPage = Math.min(startPage + maxVisiblePages, totalPages);

    const pageNumbers = [];
    for (let i = startPage; i < endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="review-pagination-container">
        <div className="review-pagination-info">
          <span>총 {totalPages}페이지 중 {page + 1}페이지</span>
        </div>
        
        <div className="review-pagination">
          <button 
            onClick={() => {
              setPage((prev) => Math.max(prev - 5, 0));
              setExpandedId(null);
            }}
            disabled={page < 5}
            className="review-pagination-btn review-first-last"
            title="5페이지 뒤로"
          >
            ⟪
          </button>

          <button 
            onClick={() => {
              setPage((prev) => Math.max(prev - 1, 0));
              setExpandedId(null);
            }}
            disabled={page === 0}
            className="review-pagination-btn review-prev-next"
            title="이전 페이지"
          >
            ‹
          </button>

          {startPage > 0 && (
            <>
              <button
                onClick={() => {
                  setPage(0);
                  setExpandedId(null);
                }}
                className="review-pagination-btn review-page-number"
              >
                1
              </button>
              <span className="review-pagination-dots">...</span>
            </>
          )}

          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => {
                setPage(pageNum);
                setExpandedId(null);
              }}
              className={`review-pagination-btn review-page-number ${page === pageNum ? "active" : ""}`}
            >
              {pageNum + 1}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              <span className="review-pagination-dots">...</span>
              <button
                onClick={() => {
                  setPage(totalPages - 1);
                  setExpandedId(null);
                }}
                className="review-pagination-btn review-page-number"
              >
                {totalPages}
              </button>
            </>
          )}

          <button 
            onClick={() => {
              setPage((prev) => Math.min(prev + 1, totalPages - 1));
              setExpandedId(null);
            }}
            disabled={page === totalPages - 1}
            className="review-pagination-btn review-prev-next"
            title="다음 페이지"
          >
            ›
          </button>

          <button 
            onClick={() => {
              setPage((prev) => Math.min(prev + 5, totalPages - 1));
              setExpandedId(null);
            }}
            disabled={page >= totalPages - 5}
            className="review-pagination-btn review-first-last"
            title="5페이지 앞으로"
          >
            ⟫
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="review-admin-wrap">
      <div className="review-container">
        <h2 className="review-title">리뷰 관리</h2>

        <div className="review-search-box-container">
          <div className="review-search-box">
            <input 
              type="text" 
              placeholder="상품명으로 검색" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <button onClick={handleSearch}>
                <FontAwesomeIcon icon={faSearch} />
            </button>

          </div>
        </div>

        <div className="review-admin-card">
          <table className="review-admin-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>유저ID</th>
                <th>리뷰사진</th>
                <th>상품명</th>
                <th>답변여부</th>
                <th>별점</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <React.Fragment key={review.id}>
                    <tr 
                      onClick={() => toggleExpand(review.reviewId || review.id)} 
                      className={`review-summary-row ${expandedId === (review.reviewId || review.id) ? 'expanded' : ''}`}
                    >
                      <td>
                        <div className="review-no-only">
                          #{review.reviewId || review.id}
                        </div>
                      </td>
                      <td>
                        <div className="review-user-id">
                          {review.uid || review.user?.uid || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {(review.imgFilename || review.image) ? (
                          <img 
                            src={`/gogiImage/${review.imgFilename || review.image}`} 
                            alt={review.product?.pnm || review.productName} 
                            className="review-image" 
                            onError={(e) => {
                              console.log("이미지 로드 실패:", e.target.src);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div 
                          className="review-no-image-placeholder" 
                          style={{ 
                            display: (review.imgFilename || review.image) ? 'none' : 'flex' 
                          }}
                        >
                          이미지 없음
                        </div>
                      </td>
                      <td className="review-product-name">{review.product?.pnm || review.productName}</td>
                      <td>
                        <span className={`review-status-badge ${review.response ? 'completed' : 'pending'}`}>
                          {review.response ? '답변완료' : '답변미완료'}
                        </span>
                      </td>
                      <td>
                        <span className="review-stars">{getStars(review.rating)}</span>
                        <span className="review-rating-text">({review.rating}/5)</span>
                      </td>
                    </tr>
                    {expandedId === (review.reviewId || review.id) && (
                      <tr className="review-detail-row">
                        <td colSpan="6">
                          <div className="review-detail-box">
                            <div className="review-detail-layout">
                              <div className="review-detail-left">
                                <div className="review-detail-item">
                                  <strong>상품명:</strong> {review.product?.pnm || review.productName}
                                </div>
                                <div className="review-detail-item">
                                  <strong>유저ID:</strong> {review.uid || review.user?.uid || 'N/A'}
                                </div>
                                <div className="review-detail-item">
                                  <strong>유저명:</strong> {review.unm || review.user?.unm || 'N/A'}
                                </div>
                                <div className="review-detail-item">
                                  <strong>별점:</strong> 
                                  <span className="review-stars">{getStars(review.rating)}</span>
                                  <span className="review-rating-text">({review.rating}/5)</span>
                                </div>
                                <div className="review-detail-item">
                                  <strong>작성일시:</strong> {formatDate(review.createdAt || review.date)}
                                </div>
                                <div className="review-detail-item">
                                  <strong>리뷰사진:</strong>
                                  {(review.imgFilename || review.image) ? (
                                    <img 
                                      src={`/gogiImage/${review.imgFilename || review.image}`} 
                                      className="review-detail-image" 
                                      alt="리뷰 사진" 
                                      onError={(e) => {
                                        console.log("상세 이미지 로드 실패:", e.target.src);
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="review-no-image-placeholder review-detail-no-image" 
                                    style={{ 
                                      display: (review.imgFilename || review.image) ? 'none' : 'flex' 
                                    }}
                                  >
                                    이미지 없음
                                  </div>
                                </div>
                              </div>

                              <div className="review-detail-right">
                                <div className="review-content-section">
                                  <div className="review-section-title">리뷰 내용</div>
                                  <div className="review-content-text">{review.content}</div>
                                </div>

                                <div className="review-response-section">
                                  <div className="review-section-title">답변 내용</div>
                                  {editingResponse === review.reviewId || editingResponse === review.id ? (
                                    <div className="review-response-edit-form">
                                      <textarea
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        placeholder="답변을 입력하세요..."
                                        className="review-response-textarea"
                                        rows="4"
                                      />
                                      <div className="review-response-buttons">
                                        <button 
                                          className="review-btn review-btn-save"
                                          onClick={() => saveResponse(review.reviewId || review.id)}
                                        >
                                          저장
                                        </button>
                                        <button 
                                          className="review-btn review-btn-cancel"
                                          onClick={cancelEditResponse}
                                        >
                                          취소
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="review-response-display">
                                      <div className="review-content-text">
                                        {review.response || '답변이 없습니다.'}
                                      </div>
                                      <button 
                                        className="review-btn review-btn-edit-response"
                                        onClick={() => startEditResponse(review.reviewId || review.id, review.response)}
                                      >
                                        {review.response ? '답변 수정' : '답변 작성'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>
                    등록된 리뷰가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default MRv;