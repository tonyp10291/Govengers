// src/pages/user/UPdPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/user/UPdPage.css';

const API_BASE_URL = "http://localhost:8090";

const categoryLinks = [
  { name: "소고기", to: "/products?cate=소고기" },
  { name: "돼지고기", to: "/products?cate=돼지고기" },
  { name: "닭고기", to: "/products?cate=닭고기" },
  { name: "선물세트", to: "/products?cate=선물세트" },
  { name: "소스류", to: "/products?cate=소스류" },
  { name: "구매리뷰", to: "/products?cate=구매리뷰" },
];

const UPdPage = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${pid}`);
        if (!res.ok) throw new Error('상품 정보를 불러올 수 없습니다');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProduct();
  }, [pid]);

  const handleQuantityChange = (delta) => {
    setQuantity(q => Math.max(1, q + delta));
  };

  const handleAddToCart = () => {
    alert('장바구니에 담았습니다 (실제 기능 연동 필요)');
  };

  const handleBuyNow = () => {
    alert('구매하기 기능은 개발중입니다!');
  };

  // 카테고리 메뉴 클릭 → 상품목록 이동
  const handleCategoryClick = (to) => {
    navigate(to);
  };

  if (error) {
    return (
      <div className="upd-container">
        <div className="upd-tab-content" style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <button className="upd-buy-btn" onClick={() => navigate(-1)}>뒤로가기</button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="upd-container">
        <div className="upd-tab-content" style={{ textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  // 상품정보 세로정렬용
  const infoLabels = [
    { label: '적립금', value: `${Math.floor(product.price * 0.01)}원` },
    { label: '원산지', value: product.origin || '국내' },
    { label: '카테고리', value: product.mainCategory },
    { label: '유통기한', value: product.expDate || '-' },
  ];

  const totalPrice = product.price * quantity;

  return (
    <div className="upd-container">
      {/* 상단 카테고리 네비 */}
      <div className="upd-categories">
        {categoryLinks.map((c) => (
          <span
            key={c.name}
            className="upd-category-item"
            onClick={() => handleCategoryClick(c.to)}
            style={{ userSelect: "none" }}
          >
            {c.name}
          </span>
        ))}
      </div>

      {/* 메인(이미지 + 정보) */}
      <div className="upd-main-flex">
        {/* 메인 이미지 */}
        <div className="upd-img-box">
          <img
            src={product.image ? `${API_BASE_URL}/api/images/${product.image}` : `${API_BASE_URL}/api/images/default-product.jpg`}
            alt={product.pnm}
            className="upd-main-img"
          />
        </div>
        {/* 상품 정보 */}
        <div className="upd-info-box">
          <div className="upd-title-row">
            <span className="upd-title">{product.pnm}</span>
            {product.hit > 0 && (
              <span className="upd-hit">HIT</span>
            )}
          </div>
          <div className="upd-price">₩{Number(product.price).toLocaleString()}</div>

          {/* 상품정보 수직 정렬 (map) */}
          <div className="upd-vertical-info-list">
            {infoLabels.map((item) => (
              <div className="upd-vertical-row" key={item.label}>
                <span className="upd-v-label">{item.label}</span>
                <span className="upd-v-value">{item.value}</span>
              </div>
            ))}
          </div>

          {/* 상품설명 */}
          <div className="upd-desc-box">{product.pdesc}</div>
          
          {/* 수량/금액 */}
          <div className="upd-order-row">
            <span>{product.pnm}</span>
            <button className="upd-quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
            <span>{quantity}</span>
            <button className="upd-quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
            <span style={{ fontWeight: 600, marginLeft: 13 }}>
              ₩{Number(product.price).toLocaleString()} <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.96rem' }}>(250g)</span>
            </span>
          </div>
          <div className="upd-total-row">
            TOTAL <b style={{ marginLeft: 9 }}>₩{Number(totalPrice).toLocaleString()} <span className="upd-total-cnt">({quantity}개)</span></b>
          </div>
          {/* 버튼 */}
          <div className="upd-btn-group">
            <button className="upd-buy-btn" onClick={handleBuyNow}>구매하기</button>
            <div className="upd-cart-wish-row">
              <button className="upd-cart-btn" onClick={handleAddToCart}>장바구니</button>
              <button className="upd-wish-btn">관심상품</button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="upd-tab-list">
        <div className={`upd-tab-item ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>상품정보</div>
        <div className={`upd-tab-item ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => setActiveTab('purchase')}>구매정보</div>
        <div className={`upd-tab-item ${activeTab === 'related' ? 'active' : ''}`} onClick={() => setActiveTab('related')}>관련상품</div>
        <div className={`upd-tab-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>상품후기 (68)</div>
        <div className={`upd-tab-item ${activeTab === 'qna' ? 'active' : ''}`} onClick={() => setActiveTab('qna')}>상품문의 (6)</div>
      </div>
      <div className="upd-tab-content">
        {activeTab === 'description' && (
          <div>
            <h3>상품 상세정보</h3>
            <div className="upd-desc-box">{product.pdesc}</div>
          </div>
        )}
        {activeTab === 'purchase' && (
          <div>
            <h3>구매정보</h3>
            <p>배송/교환/환불 안내 등...</p>
          </div>
        )}
        {activeTab === 'related' && (
          <div>
            <h3>관련상품</h3>
            <p>관련 상품 목록...</p>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            <h3>상품후기 (68)</h3>
            <p>후기 리스트...</p>
          </div>
        )}
        {activeTab === 'qna' && (
          <div>
            <h3>상품문의 (6)</h3>
            <p>Q&A 내용...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPdPage;
