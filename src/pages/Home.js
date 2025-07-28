  import React from "react";
  import { Link } from "react-router-dom";
  import "../css/Home.css";
  import MainSlider from "../component/MainSlider";
  import HeaderTop from "../component/HeaderTop";

  const Home = () => {
    return (
      <div className="home-container">
        {/* 🔝 상단 고객센터 / 커뮤니티 */}
        <HeaderTop /> {}
        {/* 🔝 헤더 */}
        <header className="home-header">
          <img src="/logo.png" alt="고벤져스 로고" className="logo" />
          <nav className="nav-menu">
            <Link to="/products?cate=소고기">소고기</Link>
            <Link to="/products?cate=돼지고기">돼지고기</Link>
            <Link to="/products?cate=선물세트">선물세트</Link>
            <Link to="/products?cate=구매리뷰">구매리뷰</Link>
          </nav>
        </header>

        {/* 메인 영역 */}
        <main className="home-main">
          <MainSlider />
          <p className="home-description">
            PREMIUM ONLINE BUTCHER SHOP GOVENGERS
          </p>
          <h1 className="home-title">
            신선한 고기를
            <br />
            현관 앞까지
            <br />
            온라인 정육점 GOVENGERS
          </h1>
          <p className="home-subtitle">
            스마트폰으로 바로 주문하고 다음날 받아보는 온라인 정육점 고벤저스
            <br />
            고벤져스의 제품은 등급과 육질 육량 등을 체크해 매일 경매를 받습니다
            <br />
            그리고 그것들 중 또 한번 전문가들의 선별 작업을 거쳐 통과된 고기만이 고객님의 집으로 배달됩니다
          </p>
        </main>

        {/* 🦶 푸터 */}
        <footer className="home-footer">
          ⓒ 2025 고벤저스 Corp. All rights reserved.
        </footer>
      </div>
    );
  };

  export default Home;
