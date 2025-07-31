import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../css/TopHeader.css";

function TopHeader() {
  const { isLoggedIn, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = isLoggedIn && userRole === 'ROLE_ADMIN';
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => { clearTimeout(timeoutRef.current); setIsOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => { setIsOpen(false); }, 200); };
  const toggleSearch = () => { setShowSearch(prev => !prev); };
  
  const handleLogout = () => {
    logout();
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 50); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`header-top ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <div className="header-left">
          {!isAdmin && ( <span className="cs-center"> C/S CENTER <b>010-1231-0000</b> </span> )}
          <div className="community-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button className="community-btn">
              <span className="icon">≡</span>
              <span className="text">COMMUNITY</span>
            </button>
            {isOpen && (
              <ul className="dropdown-menu">
                {isAdmin ? (
                  <>
                    <li><Link to="/notice-admin">공지 관리</Link></li>
                    <li><Link to="/contact-admin">문의 관리</Link></li>
                    <li><Link to="/review-admin">리뷰 관리</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/notice">공지사항</Link></li>
                    <li><Link to="/recipe">레시피</Link></li>
                    <li><Link to="/contact">문의하기</Link></li>
                    <li><Link to="/review">구매리뷰</Link></li>
                  </>
                )}
              </ul>
            )}
          </div>
        </div>
        <div className="header-right">
          {isLoggedIn ? (
            isAdmin ? (
              <>
                <button onClick={handleLogout} className="util-link logout-btn">LOGOUT</button>
                <Link to="/admin/products" className="util-link">상품 관리</Link>
                <Link to="/admin/orders" className="util-link">주문 관리</Link>
              </>
            ) : (
              <>
                <button onClick={handleLogout} className="util-link logout-btn">LOGOUT</button>
                <Link to="/cart" className="util-link">CART</Link>
                <Link to="/wishlist" className="util-link">WISHLIST</Link>
                <Link to="/order" className="util-link">ORDER</Link>
                <Link to="/mypage" className="util-link">MY PAGE</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login" className="util-link">LOGIN</Link>
              <Link to="/join" className="util-link">JOIN</Link>
              <Link to="/cart" className="util-link">CART</Link>
              <Link to="/wishlist" className="util-link">WISHLIST</Link>
            </>
          )}
          {!isAdmin && ( <button className="search-btn" onClick={toggleSearch}>🔍</button> )}
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