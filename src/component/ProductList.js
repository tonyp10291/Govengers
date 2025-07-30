import React, { useEffect, useState } from 'react';
import '../css/admin/ProductList.css';  
const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('상품 불러오기 실패:', err));
  }, []);

  return (
    <section className="product-section">
      <h2>PRODUCT</h2>
      <p className="bar">고깃간 베스트 상품 백엔드 완료 후 재수정</p>
      <ul className="product-list">
        {products.map((item) => (
          <li key={item.pid} className="product-item">
            <img src={item.imageUrl} alt={item.pnm} />
            <h3>{item.pnm}</h3>
            {/* 상품명 아래 HIT!! 표시 */}
            {item.hit === 1 && <div className="hit-text">HIT!!</div>}
            <p className="price">₩{item.price?.toLocaleString()}</p>
            <div className="badges">
              {item.soldOut && <span className="badge soldout">SOLD OUT</span>}
              {item.hit === 1 && <span className="badge hit">HIT</span>}
              {item.new && <span className="badge new">NEW</span>}
            </div>
          </li>
        ))}
      </ul>``
    </section>
  );
};

export default ProductList;
