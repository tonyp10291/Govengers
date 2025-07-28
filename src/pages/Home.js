  import React from "react";
  import { Link } from "react-router-dom";
  import "../css/Home.css";
  import MainSlider from "../component/MainSlider";
  import TopHeader from "../component/TopHeader";
  import ProductList from "../component/ProductList"; 
  import Footer from "../component/Footer"; 

//gfgfg
  const Home = () => {
    return (
      <div className="home-container">
        {/* 🔝 상단 고객센터 / 커뮤니티 */}
        <TopHeader />
        {/* 🔝 헤더 */}
        <header className="home-header">
          <img src="/logo.png" alt="고깃간 로고" className="logo" />
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
            고깃간의 제품은 등급과 육질 육량 등을 체크해 매일 경매를 받습니다
            <br />
            그리고 그것들 중 또 한번 전문가들의 선별 작업을 거쳐 통과된 고기만이 고객님의 집으로 배달됩니다
          </p>
        </main>

<ProductList />

    <div className="info-banner-section">
  <div className="info-banner-card">
    <img src="/postoffice.png" alt="우체국 배송 안내" />
    <h3>우체국배송 안내</h3>
    <p>우체국배송 토요일 휴무지역</p>
  </div>
  <div className="info-banner-card">
    <img src="/point.png" alt="포인트 적립" />
    <h3>포인트 적립</h3>
    <p>포인트 적립하세용~</p>
  </div>
  <div className="info-banner-card">
    <img src="/receipt.png" alt="고기 굽는 법" />
    <h3>고기 맛있게 굽는 방법</h3>
    <p>고깃간이 알려주는 고기 굽는법</p>
  </div>
</div>
<Footer />
        
      </div>
    );
  };

  export default Home;
