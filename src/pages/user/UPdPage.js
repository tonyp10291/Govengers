import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import axios from 'axios';
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
  const { isLoggedIn, userRole } = useContext(AuthContext);
  const isAdmin = isLoggedIn && userRole === 'ROLE_ADMIN';
  const guest_id = localStorage.getItem('guest_id');
  const token = localStorage.getItem('token');  
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!guest_id) {
        window.location.reload();
    }

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

  const handleBuyNow = () => {
    alert('구매하기 기능은 개발중입니다!');
  };

  const handleCategoryClick = (to) => {
    navigate(to);
  };

  const handleAddToCart = async (product, quantity = 1) => {
      
      if (!guest_id) {
          window.location.reload();
      }
      if (isAdmin){
        alert("관리자는 사용 불가능한 기능입니다.");
        return;
      }
      

      let url = '';
      let headers = {};

      if (token) {
          url = `/api/cart/user/add?pid=${product.pid}&quantity=${quantity}`;
          headers = { 'Authorization': `Bearer ${token}` };
      } else {
          url = `/api/cart/guest/add?guestId=${guest_id}&pid=${product.pid}&quantity=${quantity}`;
      }

      try {
          await axios.post(url, {}, { headers });
          alert("상품이 장바구니에 담겼습니다.");
      } catch (err) {         
          alert("오류가 발생했습니다.");
          console.error(err);
      }
  };

  const handleAddWishlist = async (product) => {
      
      if (!guest_id) {
          window.location.reload();
      }
      if (isAdmin){
        alert("관리자는 사용 불가능한 기능입니다.");
        return;
      }

      let url = '';
      let headers = { 'Content-Type': 'application/json' };

      if (token) {
          url = `/api/wishlist/user/add?pid=${product.pid}`;
          headers = { ...headers, 'Authorization': `Bearer ${token}` };
      } else {
          url = `/api/wishlist/guest/add?guestId=${guest_id}&pid=${product.pid}`;
      }

      try {
          await axios.post(url, {}, { headers });
          alert('찜하기가 완료되었습니다.');
      } catch (err) {
          if (err.response && err.response.data) {
              if (err.response.data === "wishlist 추가 실패") {
                  console.error(err.response.data);
                  let result = window.confirm("이미 리스트에 있는 상품입니다.\n찜목록으로 이동하시겠습니까?");
                  if (result) {
                      navigate("/wishlist");
                  }
              } else {
                  alert("알 수 없는 에러: " + err.response.data);
              }
          } else {
              alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
              console.error(err);
          }
      }
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

  const infoLabels = [
    { label: '적립금', value: `${Math.floor(product.price * 0.01)}원` },
    { label: '원산지', value: product.origin || '국내' },
    { label: '카테고리', value: product.mainCategory },
    { label: '유통기한', value: product.expDate || '-' },
  ];

  const totalPrice = product.price * quantity;

  return (
    <div className="upd-container">
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

      <div className="upd-main-flex">
        <div className="upd-img-box">
          <img
            src={product.image ? `${API_BASE_URL}/api/images/${product.image}` : '/api/images/default-product.jpg'}
            alt={product.pnm}
            className="upd-main-img"
          />
        </div>
        <div className="upd-info-box">
          <div className="upd-title-row">
            <span className="upd-title">{product.pnm}</span>
            {product.hit == 1 && 
              <span className="upd-hit">HIT</span>
            }
            {product.soldout == 1 &&
                <span className="upd-soldout">품절</span>
            }
          </div>
          <div className="upd-price">₩{Number(product.price).toLocaleString()}</div>

          <div className="upd-vertical-info-list">
            {infoLabels.map((item) => (
              <div className="upd-vertical-row" key={item.label}>
                <span className="upd-v-label">{item.label}</span>
                <span className="upd-v-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="upd-desc-box">{product.pdesc}</div>
          
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
          <div className="upd-btn-group">
            {product.soldout == 0 &&
              <button className="upd-buy-btn" onClick={handleBuyNow}>구매하기</button>
            }
            <div className="upd-cart-wish-row">
                {product.soldout == 0 &&
                  <button
                      className="upd-cart-btn"
                      onClick={() => {
                          handleAddToCart(product, quantity);
                      }}
                  >
                      장바구니 담기
                  </button>
                }
                <button className="upd-wish-btn" onClick={() => handleAddWishlist(product)}>
                  찜하기
              </button>
            </div>
          </div>
        </div>
      </div>

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
