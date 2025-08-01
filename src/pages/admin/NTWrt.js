import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopHeader from "../../component/TopHeader";
import "./../../css/admin/NTWrt.css";
import "./../../css/util/Buttons.css";
import { Button } from "../../util/Buttons";

export default function NTWrt() {
  const navigate = useNavigate();

  const [noticeId, setNoticeId] = useState(null);
  const [notice, setNotice] = useState({
    title: "",
    content: "",
    is_event: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("lastNoticeId");
    const nextId = stored ? parseInt(stored) + 1 : 1;
    setNoticeId(nextId);
  }, []);  

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNotice((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    try {
      const response = await fetch("http://localhost:8090/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });

      if (response.ok) {
        alert("공지 등록이 완료되었습니다.");
        localStorage.setItem("lastNoticeId", noticeId);
        navigate("/noticeList");
      } else {
        alert("등록 실패");
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
          <label htmlFor="is_event">카테고리</label>
          <select
            id="is_event"
            value={notice.is_event ? "event" : "notice"}
            onChange={(e) =>
              setNotice((prev) => ({
                ...prev,
                is_event: e.target.value === "event",
              }))
            }
          >
            <option value="notice">공지</option>
            <option value="event">이벤트</option>
          </select>
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
          {/* <button type="submit" className="submit-btn">등록</button> */}
          <Button text={"취소"} type={"cancel"} onClick={() => navigate("/noticeList")} />
          {/* <button type="button" className="cancel-btn" onClick={() => navigate("/noticeList")}>취소</button> */}
        </div>
      </form>
      </div>
    </div>
  );
}
