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
        
        // 디버깅: 검색 결과의 인증 상태 확인
        if (res.data.content.length > 0) {
          console.log('=== 검색 결과 사용자 인증 상태 ===');
          res.data.content.forEach((user, index) => {
            console.log(`${index + 1}. ${user.unm} (${user.uid}):`);
            console.log(`   emailVerified: ${user.emailVerified} (${typeof user.emailVerified})`);
            console.log(`   smsVerified: ${user.smsVerified} (${typeof user.smsVerified})`);
            console.log(`   이메일: ${user.umail}`);
            console.log(`   전화번호: ${user.utel}`);
          });
        }
        
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
          
          // 디버깅: 페이지 로드 시 사용자 인증 상태 확인
          if (res.data.content.length > 0) {
            console.log('=== 페이지 로드 사용자 인증 상태 ===');
            res.data.content.forEach((user, index) => {
              console.log(`${index + 1}. ${user.unm} (${user.uid}):`);
              console.log(`   emailVerified: ${user.emailVerified} (${typeof user.emailVerified})`);
              console.log(`   smsVerified: ${user.smsVerified} (${typeof user.smsVerified})`);
            });
          }
        })
        .catch(err => {
          console.error("❌ 사용자 목록 불러오기 실패:", err);
        });
    }
  }, [page, searchTerm, token]);

  const toggleExpand = (uid) => {
    setExpandedUid(prev => (prev === uid ? null : uid));
  };

  // 포인트 포맷팅 함수
  const formatPoints = (points) => {
    if (typeof points === 'number') {
      return points.toLocaleString();
    }
    return points || '0';
  };

  // 인증 상태 표시 함수
  const getVerificationStatus = (isVerified) => {
    return isVerified ? '✔️ 인증됨' : '❌ 미인증';
  };

  // 계정 상태 표시 함수 (제거)
  // const getAccountStatus = (enabled) => {
  //   return enabled ? '✔️ 활성' : '❌ 비활성';
  // };

  // 사용자 역할 표시 함수
  const getUserRole = (role) => {
    switch(role) {
      case 'ROLE_ADMIN':
        return '👑 관리자';
      case 'ROLE_USER':
        return '👤 일반회원';
      default:
        return role || '미지정';
    }
  };

  const renderPagination = () => {
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
    <div className="admin-user-wrap">
      <div className="uqna-container">
        <h2 className="uqna-title">회원 정보 관리</h2>

        <div className="admin-card">
          <div className="search-box-container">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="이름 또는 아이디로 검색" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button onClick={handleSearch}>🔍</button>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>이름</th>
                <th>아이디</th>
                <th>전화번호</th>
                <th>생년월일</th>
                <th>포인트</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <React.Fragment key={user.uid}>
                  <tr 
                    onClick={() => toggleExpand(user.uid)} 
                    className={`summary-row ${expandedUid === user.uid ? 'expanded' : ''}`}
                  >
                    <td>{page * 10 + index + 1}</td>
                    <td>{user.unm}</td>
                    <td>{user.uid}</td>
                    <td>{user.utel || '없음'}</td>
                    <td>{user.ubt || '없음'}</td>
                    <td className="points-cell">{formatPoints(user.point)} P</td>
                  </tr>
                  {expandedUid === user.uid && (
                    <tr className="detail-row">
                      <td colSpan="6">
                        <div className="detail-box">
                          <div className="detail-content">
                            <div className="detail-section basic-info">
                              <h4>👤 기본정보</h4>
                              <p><strong>이름:</strong> {user.unm}</p>
                              <p><strong>아이디:</strong> {user.uid}</p>
                              <p><strong>전화번호:</strong> {user.utel || '없음'}</p>
                            </div>
                            
                            <div className="detail-section">
                              <h4>📧 이메일 인증</h4>
                              <p>{user.umail || '없음'}</p>
                              <span className={`verification-badge ${user.emailVerified ? 'verified' : 'unverified'}`}>
                                {user.emailVerified ? '✔️ 인증완료' : '❌ 미인증'}
                              </span>
                            </div>
                            
                            <div className="detail-section">
                              <h4>📱 SMS 인증</h4>
                              <p>{user.utel ? user.utel : '없음'}</p>
                              <span className={`verification-badge ${user.smsVerified ? 'verified' : 'unverified'}`}>
                                {user.smsVerified ? '✔️ 인증완료' : '❌ 미인증'}
                              </span>
                            </div>

                            <div className="detail-section">
                              <h4>👤 사용자 권한</h4>
                              <p>{getUserRole(user.role)}</p>
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

          {users.length === 0 && (
            <div className="no-data">
              <p>표시할 사용자가 없습니다.</p>
            </div>
          )}

          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default MUser;