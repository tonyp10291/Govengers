import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import {
  CreditCardIcon,
  UserIcon,
  HeartIcon,
  StarIcon,
  BookOpenIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import styles from "../../css/user/Mypage.module.css";

// 문의내역 아코디언 - API 연동 (내 문의만 조회)
function BoardAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  const [boardList, setBoardList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ↓↓↓ 로그인한 내 uid 가져오기!
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      try {
        // ★ 내 문의만 불러오기(uid 파라미터!)
        const res = await axios.get("/api/uqna", { params: { uid: userId } });
        setBoardList(
          res.data.map((q, idx) => ({
            num: res.data.length - idx,
            title: q.title,
            secret: q.isPrivate,
            date: (q.createdAt || "").replace("T", " ").substring(0, 19),
            answer: q.answer,
            answerWriter: "관리자",
            answerDate: q.answerAt ? q.answerAt.replace("T", " ").substring(0, 19) : "",
          }))
        );
      } catch (e) {
        setBoardList([]);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchData();
  }, [userId]);  // userId 변경 시마다 재호출

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.boardHeader}>
        <span className={styles.boardTitle}>Q &amp; A</span>
      </div>
      <div className={styles.boardTable}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>로딩 중...</div>
        ) : boardList.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>문의 내역이 없습니다.</div>
        ) : (
          boardList.map((row, i) => (
            <React.Fragment key={row.num}>
              <div
                className={styles.boardRow}
                style={{ cursor: "pointer" }}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className={styles.boardInner}>
                  <div className={styles.boardNum}>{row.num}</div>
                  <div className={styles.boardContent}>
                    <span className={styles.boardQTitle}>{row.title}</span>
                    {row.secret && <span className={styles.boardSecret}>비밀</span>}
                  </div>
                  <div className={styles.boardDate}>{row.date}</div>
                </div>
              </div>
              {openIdx === i && (
                <div className={styles.qaToggleContent}>
                  <div className={styles.qaQuestion}>
                    <span className={styles.qaLabelQ}>질문</span>
                    <span className={styles.qaText}>{row.title}</span>
                    <span className={styles.qaQInfo}>{row.date}</span>
                  </div>
                  <div className={styles.qaAnswer}>
                    <span className={styles.qaLabelA}>답변</span>
                    <span className={styles.qaText}>
                      {row.answer
                        ? row.answer
                        : <span style={{ color: "#bbb" }}>답변이 아직 완료되지 않았습니다.</span>
                      }
                    </span>
                    <span className={styles.qaAInfo}>
                      {row.answerDate}
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

const MENU_ITEMS = [
  { icon: CreditCardIcon, label: "ORDER", sub: "주문내역 조회", },
  { icon: UserIcon, label: "PROFILE", sub: "회원정보", },
  { icon: HeartIcon, label: "WISHLIST", sub: "관심상품", },
  { icon: StarIcon, label: "REVIEW", sub: "리뷰관리", },
  { icon: BookOpenIcon, label: "BOARD", sub: "문의내역 확인", content: <BoardAccordion /> },
];

const Mypage = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleToggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className={styles.mypageWrapper}>
      <div className={styles.mypageContainer}>
        <div className={styles.statusBox}>
          <div className={styles.statusHeader}>
            <span className={styles.statusTitle}>나의 주문처리 현황</span>
            <span className={styles.statusPeriod}>(최근 3개월 기준)</span>
          </div>
          <div className={styles.statusContent}>
            <div>
              <div className={styles.statusLabel}>입금전</div>
              <div className={styles.statusNum}>0</div>
            </div>
            <div>
              <div className={styles.statusLabel}>배송준비중</div>
              <div className={styles.statusNum}>0</div>
            </div>
            <div>
              <div className={styles.statusLabel}>배송중</div>
              <div className={styles.statusNum}>0</div>
            </div>
            <div>
              <div className={styles.statusLabel}>배송완료</div>
              <div className={styles.statusNum}>0</div>
            </div>
          </div>
        </div>
        <div className={styles.menuGrid}>
          {MENU_ITEMS.map((item, i) => (
            <div
              key={i}
              className={styles.menuBox}
              onClick={() => handleToggle(i)}
              style={{ position: "relative" }}
            >
              <item.icon
                className={styles.menuIcon}
                style={{
                  marginBottom: 0,
                  width: "35px",
                  height: "35px",
                  display: "block",
                }}
              />
              <div
                className={styles.menuLabel}
                style={
                  openIdx === i
                    ? {
                        background: "#b7dcff",
                        color: "#111",
                        borderRadius: "4px",
                        padding: "0 4px",
                        transition: "background 0.12s",
                        display: "inline-block",
                      }
                    : { display: "inline-block" }
                }
              >
                {item.label}
              </div>
              <div className={styles.menuSub}>{item.sub}</div>
            </div>
          ))}
        </div>
        {/* 펼침 영역: menuGrid 하단에만 위치 */}
        {openIdx !== null && (
          <div className={styles.menuWideAccordion}>
            {MENU_ITEMS[openIdx].content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mypage;