import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NTWrt() {
  const navigate = useNavigate();

  const [noticeId, setNoticeId] = useState(null);
  const [notice, setNotice] = useState({
    title: "",
    content: "",
    is_event: false,
  });

  useEffect(() => {
    fetch("/api/notices/next-id")
      .then((res) => res.json())
      .then((data) => setNoticeId(data.nextId))
      .catch((err) => {
        console.error("공지 번호 불러오기 실패: ", err);
        setNoticeId("알 수 없음");
      });
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNotice((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckbox = (e) => {
    setNotice((prev) => ({
      ...prev,
      is_event: e.target.checked,
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
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notice),
      });

      if (response.ok) {
        alert("공지 등록이 완료되었습니다.");
        navigate("/noticeList"); // ✅ 등록 후 목록 페이지로 이동
      } else {
        alert("등록 실패");
      }
    } catch (err) {
      console.error("등록 중 오류: ", err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📢 공지사항 / 이벤트 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="noticeId" className="form-label">공지 번호</label>
          <input
            type="text"
            className="form-control"
            id="noticeId"
            value={noticeId !== null ? noticeId : "로딩 중..."}
            readOnly
          />
        </div>

        <div className="mb-3">
          <label className="form-label">카테고리</label><br />
          <input
            type="checkbox"
            id="is_event"
            checked={notice.is_event}
            onChange={handleCheckbox}
          /> 이벤트로 등록하기
        </div>

        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={notice.title}
            maxLength={50}
            onChange={handleChange}
            placeholder="제목을 입력해주세요 (최대 50자)"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">내용</label>
          <textarea
            className="form-control"
            id="content"
            rows="6"
            value={notice.content}
            maxLength={1500}
            onChange={handleChange}
            placeholder="내용을 입력해주세요 (최대 1500자)"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">등록하기</button>
      </form>
    </div>
  );
}
