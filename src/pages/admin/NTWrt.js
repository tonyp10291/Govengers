import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import TopHeader from "../../component/TopHeader";
import "../../css/admin/NTWrt.css";
import "../../css/util/Buttons.css";
import { Button } from "../../util/Buttons";

export default function NTWrt() {
  const navigate = useNavigate();
  const { isLoggedIn, userRole, isAuthLoading } = useContext(AuthContext);
  const isAdmin = isLoggedIn && userRole === 'ROLE_ADMIN';

  useEffect(() => {
    if(!isAuthLoading && !isAdmin){
        navigate("/alert");
    }
  }, [isAdmin, navigate, isAuthLoading]);

  const [noticeId, setNoticeId] = useState(null);

  const [notice, setNotice] = useState({
    title: "",
    content: "",
    isEvent: false,
    isFixed: false,
  });  

  useEffect(() => {
    const stored = localStorage.getItem("lastNoticeId");
    const nextId = stored ? parseInt(stored) + 1 : 1;
    setNoticeId(nextId);
  }, []);  

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "title" || id === "content") {
      setNotice((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🧾 notice 값 확인:", notice);

    if (!notice.title || !notice.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (notice.title.length > 50) {
      alert("제목은 50자 이내로 작성해주세요.");
      return;
    }

    if (notice.content.length > 1500) {
      alert("내용은 1500자 이내로 작성해주세요.");
      return;
    }

    const requestData = {
      title: notice.title,
      content: notice.content,
      isEvent: notice.isEvent,
      isFixed: notice.isFixed
    };
    
    console.log("📤 전송할 데이터:", requestData);
    console.log("📤 isEvent:", requestData.isEvent, "타입:", typeof requestData.isEvent);
    console.log("📤 isFixed:", requestData.isFixed, "타입:", typeof requestData.isFixed);
    console.log("📤 JSON.stringify:", JSON.stringify(requestData));

    try {
      const token = localStorage.getItem("token");
      console.log("💬 token:", token);

      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      console.log("📥 응답:", responseText);

      if (response.ok) {
        alert("공지 등록이 완료되었습니다.");
        localStorage.setItem("lastNoticeId", noticeId);
        navigate("/ntlist");
      } else {
        alert("등록 실패: " + responseText);
      }
    } catch (err) {
      console.error("등록 중 오류: ", err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div>
    <TopHeader />
    <div className="notice-container">

      <h2 className="notice-title">공지사항 / 이벤트 등록</h2>
      <form className="notice-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="noticeId">공지 번호</label>
          <input
            type="text"
            id="noticeId"
            value={noticeId !== null ? noticeId : "로딩 중..."}
            readOnly
          />
        </div>
  
        <div className="form-group">
          <label htmlFor="isEvent">카테고리</label>
          <div className="category-fixed-inline">
            <select
              id="isEvent"
              value={notice.isEvent ? "event" : "notice"}
              onChange={(e) => {
                console.log("🔄 카테고리 변경:", e.target.value);
                setNotice((prev) => ({
                  ...prev,
                  isEvent: e.target.value === "event",
                }));
              }}
            >
              <option value="notice">공지</option>
              <option value="event">이벤트</option>
            </select>

            <label className="fixed-checkbox">
              <input
                type="checkbox"
                checked={notice.isFixed}
                onChange={(e) => {
                  console.log("🔄 고정 변경:", e.target.checked);
                  setNotice((prev) => ({
                    ...prev,
                    isFixed: e.target.checked,
                  }));
                }}
              />
              <span>상단 고정</span>
            </label>
          </div>
        </div>
  
        <div className="form-group">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            value={notice.title}
            maxLength={50}
            onChange={handleChange}
            placeholder="제목을 입력해주세요 (최대 50자)"
          />
        </div>
  
        <div className="form-group">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            value={notice.content}
            maxLength={1500}
            onChange={handleChange}
            placeholder="내용을 입력해주세요 (최대 1500자)"
          ></textarea>
        </div>
  
        <div className="notice-buttons">
          <Button text={"등록"} type={"submit"} />
          <Button text={"취소"} type={"cancel"} onClick={() => navigate("/ntlist")} />
        </div>
      </form>
      </div>
    </div>
  );
}