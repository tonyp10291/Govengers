import React, { useState, useRef, useEffect } from "react";
import "../css/TopHeader.css";

function TopHeader() {
  const [isOpen, setIsOpen] = useState(false); // COMMUNITY 드롭다운
  const [showSearch, setShowSearch] = useState(false); // 검색 슬라이드 토글
  const [isScrolled, setIsScrolled] = useState(false); // 스크롤 시 헤더 축소

  const timeoutRef = useRef(null);

  // COMMUNITY 드롭다운
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // 🔍 검색 슬라이드 토글
  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  };

  // 스크롤 시 헤더 축소 적용
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`header-top ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        {/* 왼쪽: 고객센터 + 커뮤니티 */}
        <div className="header-left">
          <span className="cs-center">
            C/S CENTER <b>010-6506-5733</b>
          </span>

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
                <li>공지사항</li>
                <li>레시피</li>
                <li>문의하기</li>
                <li>구매리뷰</li>
              </ul>
            )}
          </div>
        </div>

        {/* 오른쪽: 로그인, 장바구니 등 */}
        <div className="header-right">
          <a href="/login" className="util-link">LOGIN</a>
          <a href="/join" className="util-link">JOIN</a>
          <a href="/cart" className="util-link">CART</a>
          <a href="/order" className="util-link">ORDER</a>
          <a href="/mypage" className="util-link">MY PAGE</a>
          <button className="search-btn" onClick={toggleSearch}>🔍</button>
        </div>
      </div>

      {/* 검색 슬라이드 */}
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
    </div>
  );
}

export default TopHeader;
