import React from 'react';
import '../../css/GuidePage.css';

const CookingGuide = () => {
  return (
    <div className="guide-container">
      <div className="guide-header">
        <h1>고기 맛있게 굽는 방법</h1>
        <p>고벤저스가 알려주는 고기 굽는 비법</p>
      </div>
      
      <div className="guide-content">
        <div className="guide-image-section">
          <img 
            src="/cooking-guide.png" 
            alt="고기 굽는 방법" 
            className="guide-image"
          />
        </div>
        
        <div className="guide-text-section">
          <h3>굽기 전 준비</h3>
          <ul>
            <li>고기를 실온에 30분 정도 두어 온도를 맞춰주세요</li>
            <li>키친타올로 고기 표면의 수분을 제거하세요</li>
            <li>소금, 후추로 간을 해주세요</li>
          </ul>
          
          <h3>고기별 굽기 방법</h3>
          <ul>
            <li><strong>스테이크:</strong> 강불에서 각 면 2-3분씩</li>
            <li><strong>갈비:</strong> 중불에서 뒤집어가며 15-20분</li>
            <li><strong>삼겹살:</strong> 기름 없이 중약불에서 천천히</li>
            <li><strong>목살:</strong> 중불에서 노릇하게 구워주세요</li>
          </ul>
          
          <h3>굽기 완료 확인</h3>
          <ul>
            <li>고기를 눌렀을 때 탄력이 느껴지면 완료</li>
            <li>육즙이 투명하게 나오면 완료</li>
            <li>온도계로 내부 온도 확인 (63도 이상)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CookingGuide;