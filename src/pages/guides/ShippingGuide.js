import React from 'react';
import '../../css/GuidePage.css';

const ShippingGuide = () => {
  return (
    <div className="guide-container">
      <div className="guide-header">
        <h1>배송 안내</h1>
        <p>우체국 배송 관련 안내사항입니다</p>
      </div>
      
      <div className="guide-content">
        <div className="guide-image-section">
          <img 
            src="/shipping-guide.png" 
            alt="배송 안내" 
            className="guide-image"
          />
        </div>
        
        <div className="guide-text-section">
          <h3>배송 정보</h3>
          <ul>
            <li>우체국 택배로 배송됩니다</li>
            <li>토요일 휴무 지역이 있습니다</li>
            <li>당일 오후 2시까지 주문 시 다음날 배송</li>
            <li>냉장/냉동 상품은 별도 포장하여 배송</li>
          </ul>
          
          <h3>배송비</h3>
          <ul>
            <li>5만원 이상 구매 시 무료배송</li>
            <li>5만원 미만 시 배송비 3,000원</li>
            <li>제주/도서산간 지역 추가 배송비 발생</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShippingGuide;