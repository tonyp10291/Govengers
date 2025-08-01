import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/admin/MUser.css";

const MUser = () => {
  const [users, setUsers] = useState([]);
  const [expandedUid, setExpandedUid] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  // ✅ 검색 핸들러
  const handleSearch = () => {
    axios.get(`/api/admin/users?page=0&keyword=${searchTerm}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setPage(0);
        if (res.data.content.length === 0) {
          alert("그런 사람 없는데용!?");
        }
      })
      .catch(err => {
        console.error("❌ 검색 실패:", err);
        alert("그런 사람 없는데용!?");
      });
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      axios.get(`/api/admin/users?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => {
          setUsers(res.data.content);
          setTotalPages(res.data.totalPages);
        })
        .catch(err => {
          console.error("❌ 사용자 목록 불러오기 실패:", err);
        });
    }
  }, [page, searchTerm, token]);

  const toggleExpand = (uid) => {
    setExpandedUid(prev => (prev === uid ? null : uid));
  };

  // ✅ 페이지네이션 렌더링 함수
  const renderPagination = () => {
    const maxVisiblePages = 5; // 5개씩만 보여주기
    let startPage, endPage;

    // 5개씩 그룹으로 나누기
    const currentGroup = Math.floor(page / maxVisiblePages);
    startPage = currentGroup * maxVisiblePages;
    endPage = Math.min(startPage + maxVisiblePages, totalPages);

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
          {/* 5칸 뒤로 */}
          <button 
            onClick={() => setPage((prev) => Math.max(prev - 5, 0))}
            disabled={page < 5}
            className="pagination-btn first-last"
            title="5페이지 뒤로"
          >
            ⟪
          </button>

          {/* 이전 */}
          <button 
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="pagination-btn prev-next"
            title="이전 페이지"
          >
            ‹
          </button>

          {/* 첫 페이지가 안 보이면 1 표시 */}
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

          {/* 페이지 번호들 (5개씩) */}
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`pagination-btn page-number ${page === pageNum ? "active" : ""}`}
            >
              {pageNum + 1}
            </button>
          ))}

          {/* 마지막 페이지가 안 보이면 마지막 번호 표시 */}
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

          {/* 다음 */}
          <button 
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="pagination-btn prev-next"
            title="다음 페이지"
          >
            ›
          </button>

          {/* 5칸 앞으로 */}
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
    <div className="admin-user-wrap">
      <div className="uqna-container">
        <h2 className="uqna-title">회원 정보 관리</h2>

        <div className="admin-card">
          <div className="search-box-container">
            <div className="search-box">
              <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}/>
              <button onClick={handleSearch}>🔍</button>
        </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>아이디</th>
                <th>전화번호</th>
                <th>주소</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <React.Fragment key={user.uid}>
                  <tr onClick={() => toggleExpand(user.uid)} className={`summary-row ${expandedUid === user.uid ? 'expanded' : ''}`}>
                    <td>{user.unm}</td>
                    <td>{user.uid}</td>
                    <td>{user.utel || '없음'}</td>
                    <td>{user.address || '없음'}</td>
                  </tr>
                  {expandedUid === user.uid && (
                    <tr className="detail-row">
                      <td colSpan="4">
                        <div className="detail-box">
                          <p><strong>이름:</strong> {user.unm}</p>
                          <p><strong>포인트:</strong> {user.point} P</p>
                          <p><strong>아이디:</strong> {user.uid}</p>
                          <p><strong>이메일:</strong> {user.umail || '없음'}</p>
                          <p><strong>전화번호:</strong> {user.utel || '없음'}</p>
                          <p><strong>생년월일:</strong> {user.ubt || '없음'}</p>
                          <p><strong>기본배송지:</strong> {user.address || '없음'}</p>
                          <p><strong>이메일 인증:</strong> {user.email_verified ? '✔️' : '❌'}</p>
                          <p><strong>SMS 인증:</strong> {user.sms_verified ? '✔️' : '❌'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* ✅ 이쁜 페이지네이션 */}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default MUser;