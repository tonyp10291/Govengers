import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/common/NTList.css";
import { Button } from "../../util/Buttons";
import AuthContext from "../../context/AuthContext";

export default function NTList() {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useContext(AuthContext);
  const isAdmin = isLoggedIn && userRole === "ROLE_ADMIN";

  const [notices, setNotices] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 화면 크기 변화 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/notices/list")
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 받은 원본 데이터:", data);
        
        data.forEach(item => {
          console.log(`📋 원본 데이터 - ID: ${item.noticeId}`);
          console.log(`   - isEvent: ${item.isEvent} (타입: ${typeof item.isEvent})`);
          console.log(`   - isFixed: ${item.isFixed} (타입: ${typeof item.isFixed})`);
          console.log(`   - title: ${item.title}`);
        });

        if (!Array.isArray(data)) {
          console.error("❌ 공지 목록 응답이 배열이 아님:", data);
          return;
        }

        const processedData = data.map(item => ({
          ...item,

          isEvent: Boolean(item.isEvent),
          isFixed: Boolean(item.isFixed)
        }));
        
        console.log("🔄 변환된 데이터:");
        processedData.forEach(item => {
          console.log(`📋 변환 후 - ID: ${item.noticeId}, isEvent: ${item.isEvent}, isFixed: ${item.isFixed}`);
        });

        const sorted = processedData.sort((a, b) => {
          if (a.isFixed !== b.isFixed) {
            return b.isFixed ? 1 : -1;
          }
          return b.noticeId - a.noticeId;
        });

        console.log("✅ 최종 정렬된 데이터:", sorted);
        setNotices(sorted);
      })
      .catch((err) => {
        console.error("❌ 공지사항 불러오기 실패:", err);
      });
  }, []);

  const handleTitleClick = (id) => {
    navigate(`/notice/view/${id}`);
  };

  const handleWriteClick = () => {
    navigate("/admin/ntwrt");
  };

  return (
    <div className="ntlist-container">
      <h2 className="ntlist-title">공지사항 / 이벤트</h2>
      {isAdmin && (
        <div className="btn-wrap" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <Button text={"글쓰기"} type={"movePage"} onClick={handleWriteClick} />
        </div>
      )}
      <table className="ntlist-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>게시일</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(notices) && notices.length > 0 ? (
            notices.map((item) => (
              <tr key={item.noticeId} className={item.isFixed ? "fixed-row" : ""}>
                <td>{item.noticeId}</td>
                <td>
                  {console.log(`🎨 렌더링 - ID: ${item.noticeId}, isEvent: ${item.isEvent}, 표시: ${item.isEvent ? "이벤트" : "공지"}`)}
                  {item.isEvent ? (
                    <span className="category-badge event-badge">이벤트</span>
                  ) : (
                    <span className="category-badge notice-badge">공지</span>
                  )}
                </td>
                <td className="title-cell" onClick={() => handleTitleClick(item.noticeId)}>
                  {item.isFixed && <span className="fixed-icon">📌 </span>}
                  {item.title}
                </td>
                <td>
                  {item.createdAt ? (
                    isMobile ? 
                      (() => {
                        const date = new Date(item.createdAt);
                        const year = String(date.getFullYear()).slice(-2);
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}년${month}월${day}일`;
                      })()
                      : new Date(item.createdAt).toLocaleString("ko-KR")
                  ) : "날짜 없음"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                등록된 공지사항이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}