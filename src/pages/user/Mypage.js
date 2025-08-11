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
} from "@heroicons/react/24/outline";
import styles from "../../css/user/Mypage.module.css";

function parsePhone(utel) {
  if (!utel) return { p1: "", p2: "", p3: "" };
  const digits = utel.replace(/\D/g, "");
  const p1 = digits.slice(0, 3);
  const rest = digits.slice(3);
  const p2 = digits.length === 11 ? rest.slice(0, 4) : rest.slice(0, 3);
  const p3 = digits.length === 11 ? rest.slice(4, 8) : rest.slice(3, 7);
  return { p1, p2, p3 };
}
function joinPhone(p1, p2, p3) {
  const a = (p1 || "").trim();
  const b = (p2 || "").trim();
  const c = (p3 || "").trim();
  if (!a && !b && !c) return "";
  return [a, b, c].filter(Boolean).join("-");
}
const validators = {
  password(newPw, uid) {
    if (/\s/.test(newPw)) return "비밀번호에 공백을 포함할 수 없습니다.";
    if (newPw.length < 8 || newPw.length > 20) return "비밀번호는 8자 이상 20자 이하로 입력해주세요.";
    const includesAll =
      /[a-z]/.test(newPw) &&
      /[A-Z]/.test(newPw) &&
      /[0-9]/.test(newPw) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPw);
    if (!includesAll) return "비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.";
    if (uid && newPw.toLowerCase() === uid.toLowerCase()) return "비밀번호는 아이디와 같을 수 없습니다.";
    return "";
  },
  email(v) {
    if (!v) return "이메일을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "올바른 이메일 형식을 입력해주세요.";
    return "";
  },
  mobile(utel) {
    if (!utel) return "휴대전화 번호를 입력해주세요.";
    const digits = utel.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(digits)) return "전화번호는 10~11자리 숫자만 입력해주세요.";
    if (!/^01[0-9]/.test(digits)) return "올바른 휴대폰 번호 형식을 입력해주세요.";
    return "";
  },
};
function BoardAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  const [boardList, setBoardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/uqna", {
          params: { uid: userId },
          withCredentials: true,
        });
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
  }, [userId]);

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
                      {row.answer ? row.answer : <span style={{ color: "#bbb" }}>답변이 아직 완료되지 않았습니다.</span>}
                    </span>
                    <span className={styles.qaAInfo}>{row.answerDate}</span>
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
function ProfileAccordion() {
  const { userId } = useContext(AuthContext);
  const [initLoaded, setInitLoaded] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    currentPassword: "",
    password: "",
    passwordCheck: "",
    userName: "",
    tel1: "",
    tel2: "",
    tel3: "",
    phone1: "",
    phone2: "",
    phone3: "",
    email: ""
  });
  const [errs, setErrs] = useState({});

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!userId) return;
        await axios.post("/api/mypage/set-uid", { uid: userId }, { withCredentials: true });
        const me = await axios.get("/api/mypage/me", { withCredentials: true });
        const { uid, unm, utel, umail } = me.data || {};
        const p = parsePhone(utel);
        setForm((prev) => ({
          ...prev,
          userId: uid || "",
          userName: unm || "",
          phone1: p.p1,
          phone2: p.p2,
          phone3: p.p3,
          email: umail || ""
        }));
      } catch (e) {
        console.error(e);
        alert("프로필 로드에 실패했습니다.");
      } finally {
        setInitLoaded(true);
      }
    }
    bootstrap();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errs[name]) setErrs((p) => ({ ...p, [name]: "" }));
  };

  const validateBeforeSubmit = () => {
    const newErrs = {};
    const emailErr = validators.email(form.email);
    if (emailErr) newErrs.email = emailErr;

    const utel = joinPhone(form.phone1, form.phone2, form.phone3);
    const mobileErr = validators.mobile(utel);
    if (mobileErr) newErrs.mobile = mobileErr;

    const willChangePw = form.currentPassword || form.password || form.passwordCheck;
    if (willChangePw) {
      if (!form.currentPassword) newErrs.currentPassword = "현재 비밀번호를 입력하세요.";
      if (!form.password) newErrs.password = "새 비밀번호를 입력하세요.";
      if (form.password && form.userId) {
        const pwErr = validators.password(form.password, form.userId);
        if (pwErr) newErrs.password = pwErr;
      }
      if (form.password && form.passwordCheck && form.password !== form.passwordCheck) {
        newErrs.passwordCheck = "새 비밀번호가 일치하지 않습니다.";
      }
    }

    if (!form.userName) newErrs.userName = "이름을 입력해주세요.";

    setErrs(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initLoaded) return;
    if (!validateBeforeSubmit()) return;

    const utel = joinPhone(form.phone1, form.phone2, form.phone3);

    try {
      await axios.put(
        "/api/mypage/me",
        { unm: form.userName, utel, umail: form.email },
        { withCredentials: true }
      );

      const willChangePw = form.currentPassword || form.password || form.passwordCheck;
      if (willChangePw) {
        await axios.patch(
          "/api/mypage/me/password",
          { currentPassword: form.currentPassword, newPassword: form.password },
          { withCredentials: true }
        );
      }

      alert("저장되었습니다.");

      const me = await axios.get("/api/mypage/me", { withCredentials: true });
      const { uid, unm, utel: utel2, umail } = me.data || {};
      const p = parsePhone(utel2);
      setForm((prev) => ({
        ...prev,
        userId: uid || prev.userId,
        userName: unm || prev.userName,
        phone1: p.p1,
        phone2: p.p2,
        phone3: p.p3,
        email: umail || prev.email,
        currentPassword: "",
        password: "",
        passwordCheck: ""
      }));
      setErrs({});
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "저장 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <h2 className={styles.profileTitle}>회원 정보 수정</h2>
      <div className={styles.profileFormSection}>
        <div className={styles.sectionTitle}>
          기본정보 <span className={styles.formStar}>* 필수입력사항</span>
        </div>

        <form className={styles.profileForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              아이디 <span className={styles.formStar}>*</span>
            </label>
            <input className={styles.formInput} name="userId" value={form.userId} readOnly />
            <span className={styles.inputGuide}>(영문소문자/숫자, 4~16자)</span>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              현재 비밀번호 <span className={styles.formStar}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="현재 비밀번호 입력"
            />
            {errs.currentPassword && <div style={{ color: "#d33", fontSize: 12 }}>{errs.currentPassword}</div>}
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              새 비밀번호 <span className={styles.formStar}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="새 비밀번호 입력"
            />
            <span className={styles.inputGuide}>
              (영문 대/소문자, 숫자, 특수문자 모두 포함 · 8~20자 / 공백 불가 / 아이디와 동일 금지)
            </span>
            {errs.password && <div style={{ color: "#d33", fontSize: 12 }}>{errs.password}</div>}
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              비밀번호 확인 <span className={styles.formStar}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="password"
              name="passwordCheck"
              value={form.passwordCheck}
              onChange={handleChange}
              placeholder="새 비밀번호 확인"
            />
            {errs.passwordCheck && <div style={{ color: "#d33", fontSize: 12 }}>{errs.passwordCheck}</div>}
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              이름 <span className={styles.formStar}>*</span>
            </label>
            <input className={styles.formInput} name="userName" value={form.userName} onChange={handleChange} />
            {errs.userName && <div style={{ color: "#d33", fontSize: 12 }}>{errs.userName}</div>}
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>일반전화</label>
            <select className={styles.telSelect} name="tel1" value={form.tel1} onChange={handleChange}>
              <option value="">선택</option>
              <option value="02">02</option>
              <option value="031">031</option>
              <option value="032">032</option>
            </select>
            <span className={styles.hyphen}>-</span>
            <input className={styles.telInput} name="tel2" value={form.tel2} onChange={handleChange} maxLength={4} />
            <span className={styles.hyphen}>-</span>
            <input className={styles.telInput} name="tel3" value={form.tel3} onChange={handleChange} maxLength={4} />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              휴대전화 <span className={styles.formStar}>*</span>
            </label>
            <select className={styles.telSelect} name="phone1" value={form.phone1} onChange={handleChange}>
              <option value="">선택</option>
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
            </select>
            <span className={styles.hyphen}>-</span>
            <input className={styles.telInput} name="phone2" value={form.phone2} onChange={handleChange} maxLength={4} />
            <span className={styles.hyphen}>-</span>
            <input className={styles.telInput} name="phone3" value={form.phone3} onChange={handleChange} maxLength={4} />
            {errs.mobile && <div style={{ color: "#d33", fontSize: 12 }}>{errs.mobile}</div>}
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              이메일 <span className={styles.formStar}>*</span>
            </label>
            <input className={styles.formInput} name="email" value={form.email} onChange={handleChange} />
            {errs.email && <div style={{ color: "#d33", fontSize: 12 }}>{errs.email}</div>}
          </div>

          <div className={styles.btnRow}>
            <button className={styles.saveBtn} type="submit">회원정보수정</button>
            <button className={styles.leaveBtn} type="button">회원탈퇴</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MENU_ITEMS = [
  { icon: CreditCardIcon, label: "ORDER", sub: "주문내역 조회" },
  { icon: UserIcon, label: "PROFILE", sub: "회원정보", content: <ProfileAccordion /> },
  { icon: HeartIcon, label: "WISHLIST", sub: "관심상품" },
  { icon: StarIcon, label: "REVIEW", sub: "리뷰관리" },
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

  const handleToggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);

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
            <div>
              <div className={styles.statusLabel}>적립금</div>
              <div className={styles.statusNum}>0원</div>
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
              <item.icon className={styles.menuIcon} />
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

        {openIdx !== null && MENU_ITEMS[openIdx].content && (
          <div
            className={
              MENU_ITEMS[openIdx].label === "BOARD"
                ? `${styles.menuWideAccordion} ${styles.qna}`
                : styles.menuWideAccordion
            }
          >
            {MENU_ITEMS[openIdx].content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mypage;