import React, { useState } from "react";
import axios from "axios";
import "../../css/user/UQAdd.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const UQAdd = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("상품문의");
  const [isPrivate, setIsPrivate] = useState(false);

  // 문의 등록
  const handleSubmit = async () => {
    try {
      // 토큰 가져오기
      const token = localStorage.getItem("token");

      // 로그인 안 된 경우
      if (!token) {
        alert("로그인 후 이용 가능합니다.");
        window.location.href = "/login";
        return;
      }

      // 새 문의 데이터
      const newInquiry = { title, content, category, isPrivate };

      // 요청 보내기 (Bearer 명시적으로 붙임)
      await axios.post("/api/uqna", newInquiry, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`, // Bearer 반드시 붙이기
        },
      });

      alert("문의가 등록되었습니다.");
      window.location.href = "/uqna";
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 실패: 알 수 없는 오류");
    }
  };

  // 작성 취소
  const handleCancel = () => {
    if (window.confirm("작성을 취소하고 목록으로 돌아가시겠습니까?")) {
      window.location.href = "/uqna";
    }
  };

  return (
    <div className="uqadd-container">
      <h2 className="uqadd-title">문의 작성</h2>

      <div className="uqadd-form">
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요."
          />
        </div>

        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의할 내용을 입력해주세요."
          ></textarea>
        </div>

        <div className="form-group type-row">
          <label>유형</label>
          <div className="type-flex">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="상품문의">상품문의</option>
              <option value="배송문의">배송문의</option>
              <option value="결제문의">결제문의</option>
              <option value="회원문의">회원문의</option>
              <option value="기타문의">기타문의</option>
            </select>

            <div className="secret-check">
              <label>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                비밀글 <i className="fas fa-lock"></i>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="notice-section">
        <div className="notice-header">
          <h3 className="notice-title">유의 사항</h3>
          <div className="notice-buttons">
            <button className="delete-btn" onClick={handleCancel}>
              삭제
            </button>
            <button className="submit-btn" onClick={handleSubmit}>
              등록
            </button>
          </div>
        </div>
        <div className="notice-text">
          <ul>
            <li>욕설, 비방, 거래 글, 분쟁 유발, 명예훼손, 허위 사실 유포, 광고성 게시글 금지</li>
            <li>공개 게시판이므로 개인정보는 입력하지 말아주세요. 피해는 책임지지 않습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UQAdd;