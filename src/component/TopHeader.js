import React, { useState, useRef, useEffect } from "react";
import "../css/TopHeader.css";
import { Link } from "react-router-dom";

function TopHeader({ isAdmin }) {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const [showSearch, setShowSearch] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);
const timeoutRef = useRef(null);

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
      {isAdmin ? (
        <>
          <Link to="/login" className="util-link">LOGIN</Link>
          <Link to="/admin/products" className="util-link">상품목록</Link>
          <Link to="/admin/orders" className="util-link">주문목록</Link>
        </>
      ) : (
        <>
          <Link to="/login" className="util-link">LOGIN</Link>
          <Link to="/join" className="util-link">JOIN</Link>
          <Link to="/cart" className="util-link">CART</Link>
          <Link to="/wishlist" className="util-link">WISHLIST</Link>
          <Link to="/order" className="util-link">ORDER</Link>
          <Link to="/mypage" className="util-link">MY PAGE</Link>
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