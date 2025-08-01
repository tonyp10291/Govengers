import React from 'react';
import '../../css/GuidePage.css';

const PointGuide = () => {
  return (
    <div className="guide-container">
      <div className="guide-header">
        <h1>포인트 적립</h1>
        <p>고벤저스 포인트 적립 및 사용 안내</p>
      </div>
      
      <div className="guide-content">
        <div className="guide-image-section">
          <img 
            src="/point-guide.png" 
            alt="포인트 적립 안내" 
            className="guide-image"
          />
        </div>
        
        <div className="guide-text-section">
          <h3>포인트 적립</h3>
          <ul>
            <li>구매 금액의 1% 포인트 적립</li>
            <li>리뷰 작성 시 500포인트 추가 적립</li>
            <li>생일 쿠폰으로 2,000포인트 지급</li>
            <li>친구 추천 시 3,000포인트 적립</li>
          </ul>
          
          <h3>포인트 사용</h3>
          <ul>
            <li>1포인트 = 1원으로 사용 가능</li>
            <li>최소 1,000포인트부터 사용 가능</li>
            <li>전체 주문 금액의 70%까지 사용 가능</li>
            <li>유효기간: 적립일로부터 2년</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PointGuide;