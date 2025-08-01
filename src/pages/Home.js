import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Home.css";
import MainSlider from "../component/MainSlider";
import PdList from "./common/PdList";
import { Button } from "../util/Buttons";

const Home = () => {
    const navigate = useNavigate();
    
    const homeBtnClick = () => {
        navigate("/");
    };

    return (
        <div className="home-container">

            <header className="home-header">
                <div className="logo">
                    <Button type={"logo"} onClick={homeBtnClick} />
                </div>
                <nav className="nav-menu">
                    <Link to="/products?cate=소고기">소고기</Link>
                    <Link to="/products?cate=돼지고기">돼지고기</Link>
                    <Link to="/products?cate=선물세트">선물세트</Link>
                    <Link to="/review">구매리뷰</Link> 
                </nav>
            </header>

            <main className="home-main">
                <MainSlider />
                <p className="home-description">
                    PREMIUM ONLINE BUTCHER SHOP GOVENGERS
                </p>
                <h1 className="home-title">
                    신선한 고기를<br />
                    현관 앞까지<br />
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
            <div className="info-banner-section">
                <Link to="/shipping-guide" className="info-banner-card">
                    <img src="/postoffice.png" alt="우체국 배송 안내" />
                    <h3>우체국배송 안내</h3>
                    <p>우체국배송 토요일 휴무지역</p>
                </Link>
                
                <Link to="/point-guide" className="info-banner-card">
                    <img src="/point.png" alt="포인트 적립" />
                    <h3>포인트 적립</h3>
                    <p>포인트 적립하세요~</p>
                </Link>
                
                <Link to="/cooking-guide" className="info-banner-card">
                    <img src="/recipe.png" alt="고기 굽는 법" />
                    <h3>고기 맛있게 굽는 방법</h3>
                    <p>고벤저스가 알려주는 고기 굽는법</p>
                </Link>
            </div>
            <PdList />
        </div>
    );
};

export default Home;