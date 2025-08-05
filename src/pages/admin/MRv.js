// import "../../css/admin/MRv.css";
import "../../css/util/Buttons.css";

export default function ReviewList() {
  let reviews = [];
  let currentReviewId = null;
  let isMobile = window.innerWidth <= 768;

  const handleResize = () => {
    isMobile = window.innerWidth <= 768;
  };

  const fetchReviews = () => {
    fetch("/api/reviews/list")
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        
        if (!Array.isArray(data)) {
          console.error("❌ 리뷰 목록 응답이 배열이 아님:", data);
          return;
        }

        const sorted = data.sort((a, b) => b.id - a.id);
        
        console.log("정렬된 데이터:", sorted);
        reviews = sorted;
      })
      .catch((err) => {
        console.error("리뷰 불러오기 실패:", err);
      });
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

  const handleTitleClick = (reviewId) => {
    showDetail(reviewId);
  };

  const showDetail = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    currentReviewId = reviewId;

    document.getElementById('detailProductName').textContent = review.productName;
    document.getElementById('detailDate').textContent = formatDate(review.date);
    document.getElementById('detailRating').innerHTML = `
      <span class="stars">${getStars(review.rating)}</span>
      <span style="margin-left: 8px;">(${review.rating}/5)</span>
    `;
    document.getElementById('detailImage').src = review.image;
    document.getElementById('detailContent').textContent = review.content;
    document.getElementById('detailResponse').textContent = review.response;

    document.getElementById('detailModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    document.getElementById('detailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentReviewId = null;
  };

  const confirmDelete = (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      deleteReview(reviewId);
    }
  };

  const deleteReview = async (reviewId = currentReviewId) => {
    if (!reviewId) return;

    try {
      const response = await fetch(`/api/reviews/delete/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        reviews = reviews.filter(r => r.id !== reviewId);
        if (currentReviewId === reviewId) {
          closeModal();
        }
        window.alert('리뷰가 삭제되었습니다.');
      } else {
        window.alert('삭제 실패');
      }
    } catch (err) {
      console.error("삭제 중 오류:", err);
      window.alert("서버 오류 발생");
    }
  };

  return (
    <div>
      <div className="review-container">
        <h2 className="review-title">리뷰 관리</h2>
        
        <table className="review-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>리뷰사진</th>
              <th>상품명</th>
              <th>별점</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="reviewTableBody">
            {Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>
                    <img src={review.image} alt={review.productName} className="review-image" />
                  </td>
                  <td className="title-cell product-name" onClick={() => handleTitleClick(review.id)}>
                    {review.productName}
                  </td>
                  <td>
                    <span className="stars">{getStars(review.rating)}</span>
                    <span style={{marginLeft: '5px', color: '#666', fontSize: '0.875rem'}}>({review.rating}/5)</span>
                  </td>
                  <td>
                    <div className="btn-wrap">
                      <button className="btn btn-detail" onClick={() => showDetail(review.id)}>상세보기</button>
                      <button className="btn btn-delete" onClick={() => confirmDelete(review.id)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>
                  등록된 리뷰가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div id="detailModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>리뷰 상세정보</h2>
            <span className="close" onClick={closeModal}>&times;</span>
          </div>
          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">상품명</div>
                <div className="detail-value" id="detailProductName"></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">작성일시</div>
                <div className="detail-value" id="detailDate"></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">별점</div>
                <div className="detail-value" id="detailRating"></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">리뷰사진</div>
                <img id="detailImage" className="detail-image" src="" alt="리뷰 사진" />
              </div>
            </div>

            <div className="review-content">
              <div className="section-title">리뷰 내용</div>
              <div id="detailContent"></div>
            </div>

            <div className="review-response">
              <div className="section-title">답변 내용</div>
              <div id="detailResponse"></div>
            </div>

            <div style={{textAlign: 'center'}}>
              <button className="btn btn-delete" onClick={deleteReview}>리뷰 삭제</button>
              <button className="btn btn-back" onClick={closeModal}>목록으로</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const init = () => {
    window.addEventListener('resize', handleResize);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });

    fetchReviews();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}