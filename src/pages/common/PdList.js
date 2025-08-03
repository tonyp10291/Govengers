import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../../css/common/PdList.css";

const PdList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(err => {
        console.error('상품 불러오기 실패:', err);
      });
  }, []);

  return (
    <section className="product-section">
      <h2>PRODUCT</h2>
      <p className="bar">고깃간 베스트 상품</p>
      <ul className="product-list">
        {Array.isArray(products) && products.map((item, index) => (
          <li key={index} className="product-item">
            <img src={item.imageUrl} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="price">₩{item.price.toLocaleString()}</p>
            <div className="badges">
              {item.soldOut && <span className="badge soldout">SOLD OUT</span>}
              {item.hit && <span className="badge hit">HIT</span>}
              {item.new && <span className="badge new">NEW</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PdList;