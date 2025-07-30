import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import "../css/TopHeader.css";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../util/Buttons";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ★ 로딩 상태 추가!

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedToken = jwtDecode(storedToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(decodedToken);
                    setIsLoggedIn(true);
                } else {
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
                setIsLoggedIn(false);
            }
        } else {
            setUser(null);
            setIsLoggedIn(false);
        }
        setLoading(false); // useEffect 끝나고 반드시 로딩 false로!
    }, []);

    const login = (newToken) => {
        try {
            const decodedToken = jwtDecode(newToken);
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(decodedToken);
            setIsLoggedIn(true);
        } catch (error) {
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

function TopHeader({ isAdmin }) {
  const { isLoggedIn, user, logout } = useContext(AuthContext); // 여기서 받아옴
  const [isOpen, setIsOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 여기서부터 조건 분기!
  return (
    <div className={`header-top ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-inner">

        <div className="header-left">
          {!isAdmin && (
            <span className="cs-center">
              C/S CENTER <b>010-1231-0000</b>
            </span>
          )}

          <div
            className="community-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="community-btn">
              <span className="icon">≡</span>
              <span className="text">COMMUNITY</span>
            </button>
            {isOpen && (
              <ul className="dropdown-menu">
                {isAdmin ? (
                  <>
                    <li><Link to="/notice">공지사항</Link></li>
                    <li><Link to="/recipe">레시피</Link></li>
                    <li><Link to="/contact">신고/문의</Link></li>
                    <li><Link to="/review">리뷰목록</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/ntwrt">공지사항</Link></li>
                    <li><Link to="/recipe">레시피</Link></li>
                    <li><Link to="/uqna">문의하기</Link></li>
                    <li><Link to="/review">구매리뷰</Link></li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* 로그인 상태 & 관리자 */}
          {isLoggedIn && isAdmin && (
            <>
              <Link to="/admin/products" className="util-link">상품목록</Link>
              <Link to="/admin/orders" className="util-link">주문목록</Link>
              <Link to="/pdadd" className="util-link">
                <Button text="상품등록" type="submit" />
              </Link>
              <button className="util-link" onClick={() => { logout(); navigate("/"); }}>LOGOUT</button>
            </>
          )}

          {/* 로그인 상태 & 일반회원 */}
          {isLoggedIn && !isAdmin && (
            <>
              <Link to="/cart" className="util-link">CART</Link>
              <Link to="/order" className="util-link">ORDER</Link>
              <Link to="/mypage" className="util-link">MY PAGE</Link>
              <button className="util-link" onClick={() => { logout(); navigate("/"); }}>LOGOUT</button>
              <button className="search-btn" onClick={toggleSearch}>🔍</button>
            </>
          )}

          {/* 비로그인 상태 */}
          {!isLoggedIn && (
            <>
              <Link to="/login" className="util-link">LOGIN</Link>
              <Link to="/join" className="util-link">JOIN</Link>
              <button className="search-btn" onClick={toggleSearch}>🔍</button>
            </>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className={`search-slide-full ${showSearch ? "open" : ""}`}>
          <div className="search-container">
            <div className="search-bar">
              <label>검색</label>
              <input type="text" placeholder="검색어를 입력하세요" />
              <button className="go-btn">GO</button>
              <button className="close-btn" onClick={toggleSearch}>X</button>
            </div>
            <div className="recommend">추천 검색어</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopHeader;
