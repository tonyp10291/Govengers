import React from "react";
import TopHeader from "../../component/TopHeader";
import "../../css/user/UQnA.css";

const UQnA = () => {
  const inquiries = [
    { id: 17, title: "소고기 입고 문의", writer: "PLIPOP", date: "2025-07-28" },
    { id: 16, title: "돼지고기 입고 문의", writer: "PLIPOP", date: "2025-07-28" },
    { id: 15, title: "상품 문의", writer: "PLIPOP", date: "2025-07-28" },
    { id: 14, title: "유통기한 문의", writer: "PLIPOP", date: "2025-07-28" },
    { id: 13, title: "레시피 문의", writer: "PLIPOP", date: "2025-07-28" },
    { id: 12, title: "배송 관련 문의", writer: "PLIPOP", date: "2025-07-27" },
    { id: 11, title: "재입고 문의", writer: "익명", date: "2025-07-27" },
    { id: 10, title: "가격 문의", writer: "PLIPOP", date: "2025-07-27" },
  ];

  return (
    <div>
        <TopHeader />
      <div className="uqna-container">
        <h1 className="uqna-title">문의하기</h1>
        <div className="uqna-tabs">
          <span className="tab">공지사항</span>
          <span className="tab">레시피</span>
          <span className="tab active">문의하기</span>
          <span className="tab">구매리뷰</span>
        </div>
        <table className="uqna-table">
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>글쓴이</th>
              <th>작성시간</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="title">{item.title}</td>
                <td>{item.writer}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="uqna-bottom">
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button>🔍</button>
          </div>
          <button className="write-btn">글쓰기</button>
        </div>
      </div>
    </div>
  );
};

export default UQnA;