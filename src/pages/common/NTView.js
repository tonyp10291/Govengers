import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/common/NTView.css";
import { Button } from "../../util/Buttons";
import AuthContext from "../../context/AuthContext";

export default function NTView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useContext(AuthContext);
  const isAdmin = isLoggedIn && userRole === "ROLE_ADMIN";

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/notices/view/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("받은 공지 상세 데이터:", data);
        
        const processedData = {
          ...data,
          isEvent: data.event === true || data.event === 1,
          isFixed: data.fixed === true || data.fixed === 1
        };

        setNotice(processedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("공지사항 상세 정보 불러오기 실패:", err);
        setError("공지사항을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [id]);

  const handleBackClick = () => {
    navigate("/ntlist");
  };

  const handleEditClick = () => {
    navigate(`/admin/notice/edit/${id}`);
  };

  const handleDeleteClick = () => {
    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      console.log("삭제 요청 - ID:", id);
      console.log("토큰:", token);

      fetch(`/api/notices/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => {
          console.log("삭제 응답 상태:", res.status);
          if (res.status === 401) {
            alert("인증이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            return;
          }
          if (res.status === 403) {
            alert("삭제 권한이 없습니다. 관리자만 삭제할 수 있습니다.");
            return;
          }
          if (!res.ok) {
            throw new Error(`삭제 실패: ${res.status}`);
          }
          alert("공지사항이 삭제되었습니다.");
          navigate("/ntlist");
        })
        .catch((err) => {
          console.error("삭제 실패:", err);
          alert("삭제에 실패했습니다: " + err.message);
        });
    }
  };

  const renderContent = (content) => {
    if (!content) return "";
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="ntview-container">
        <div className="ntview-loading">
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ntview-container">
        <div className="ntview-error">
          {error}
          <div className="ntview-btn-wrap">
            <Button text={"목록으로"} type={"movePage"} onClick={handleBackClick} />
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="ntview-container">
        <div className="ntview-error">
          공지사항을 찾을 수 없습니다.
          <div className="ntview-btn-wrap">
            <Button text={"목록으로"} type={"movePage"} onClick={handleBackClick} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ntview-container">
      <div className="ntview-header">
        {isAdmin && (
          <div className="ntview-btn-wrap-right">
            <Button text={"수정"} type={"movePage"} onClick={handleEditClick} />
            <Button text={"삭제"} type={"cancel"} onClick={handleDeleteClick} />
          </div>
        )}
      </div>

      <div className="ntview-content">
        <div className="ntview-meta">
          <div className="ntview-meta-item">
            <span className="ntview-meta-label">공지번호:</span>
            <span className="ntview-meta-value">{notice.noticeId}</span>
          </div>
          <div className="ntview-meta-item">
            <span className="ntview-meta-label">카테고리:</span>
            <span className={`${notice.isEvent ? 'event-badge' : 'notice-badge'}`}>
              {notice.isEvent ? "EVENT" : "공지"}
            </span>
          </div>
          <div className="ntview-meta-item">
            <span className="ntview-meta-label">게시일시:</span>
            <span className="ntview-meta-value">
              {notice.createdAt
                ? new Date(notice.createdAt).toLocaleString("ko-KR")
                : "날짜 없음"}
            </span>
          </div>
        </div>

        <div className="ntview-title">
          {notice.title}
        </div>

        <div className="ntview-body">
          {renderContent(notice.content)}
        </div>
      </div>

      <div className="ntview-footer">
        <div className="ntview-btn-wrap-center">
          <Button text={"목록으로"} type={"movePage"} onClick={handleBackClick} />
        </div>
      </div>
    </div>
  );
}