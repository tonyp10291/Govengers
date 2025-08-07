// src/pages/user/UPdPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/user/UPdPage.css';

const UPdPage = () => {
    const { pid } = useParams();
    const navigate = useNavigate();
    const API_BASE_URL = "http://localhost:8090";
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${pid}`);
                if (!res.ok) {
                    throw new Error('상품 정보를 불러올 수 없습니다');
                }
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        fetchProduct();
    }, [pid]);

    const handleQuantityChange = (change) => {
        setQuantity(prev => Math.max(1, prev + change));
    };

    const handleAddToCart = () => {
        console.log('장바구니에 추가:', { product, quantity });
    };

    const handleBuyNow = () => {
        console.log('바로 구매:', { product, quantity });
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    if (error) {
        return (
            <div className="page-container">
                <div className="product-container">
                    <p className="error-message">{error}</p>
                    <button className="nav-button" onClick={() => navigate(-1)}>
                        뒤로가기
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page-container">
                <div className="product-container">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    const images = [product.image, ...(product.images || [])];
    const totalPrice = product.price * quantity;

    return (
        <div className="page-container">
            {/* Breadcrumb */}
            <div className="breadcrumb-container">
                <div className="breadcrumb">
                    홈 &gt; {product.mainCategory} &gt; {product.subCategory || ''} &gt; {product.pnm}
                </div>
            </div>

            {/* Product Container */}
            <div className="product-container">
                <div className="product-card">
                    <div className="product-layout">
                        {/* Image Section */}
                        <div className="image-section">
                            <div className="main-image">
                                <img
                                    // src={`/uploads/${images[selectedImage]}`}
                                    src={product.image ? `${API_BASE_URL}/api/images/${images[selectedImage]}` : `${API_BASE_URL}/api/images/default-product.jpg`}
                                    alt={product.pnm}
                                    className="product-image"
                                />
                            </div>
                            <div className="thumbnail-grid">
                                {images.slice(0, 4).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail ${idx === selectedImage ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(idx)}
                                    >
                                        <img
                                            // src={`/uploads/${img}`}
                                            src={product.image ? `${API_BASE_URL}/api/images/${img}` : `${API_BASE_URL}/api/images/default-product.jpg`}
                                            alt={`${product.pnm} ${idx + 1}`}
                                            className="thumbnail-image"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="info-section">
                            {/* Product Header */}
                            <div className="product-header">
                                <h1 className="product-title">{product.pnm}</h1>
                            </div>

                            {/* Price */}
                            <div className="price-section">
                                <div className="price-wrapper">
                                    <span className="current-price">₩{product.price.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Product Info Grid */}
                            <div className="info-grid">
                                <div className="info-column">
                                    <div className="info-item">
                                        <span className="info-label">적립금</span>
                                        <span className="info-value">{Math.floor(product.price * 0.01).toLocaleString()}원</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">원산지</span>
                                        <span className="info-value">국내</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">이력번호</span>
                                        <span className="info-value">이력번호 표시 제품임</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">등급</span>
                                        <span className="info-value">1등급</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">중량</span>
                                        <span className="info-value">200g</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">부위</span>
                                        <span className="info-value">채끝</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">용도</span>
                                        <span className="info-value">구이, 스테이크</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">보관방법</span>
                                        <span className="info-value">-2℃~5℃ 냉장보관</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="quantity-section">
                                <div className="quantity-row">
                                    <span className="product-name">한우립 한우 채끝스테이크</span>
                                    <div className="quantity-controls">
                                        <button className="quantity-btn" onClick={() => handleQuantityChange(-1)}>
                                            <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <div className="quantity-display">{quantity}</div>
                                        <button className="quantity-btn" onClick={() => handleQuantityChange(1)}>
                                            <svg className="quantity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                    <span className="item-price">₩{product.price.toLocaleString()}</span>
                                    <span className="item-weight">({quantity * 250}g)</span>
                                </div>
                            </div>

                            {/* Total Price */}
                            <div className="total-section">
                                <span className="total-label">TOTAL</span>
                                <span className="total-price">₩{totalPrice.toLocaleString()}</span>
                                <span className="total-count">({quantity}개)</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-section">
                                <button className="buy-btn" onClick={handleBuyNow}>
                                    구매하기
                                </button>
                                <div className="action-buttons">
                                    <button className="cart-btn" onClick={handleAddToCart}>
                                        장바구니
                                    </button>
                                    <button
                                        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                                        onClick={handleWishlist}
                                    >
                                        관심상품
                                    </button>
                                </div>
                            </div>



                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <div className="tab-buttons">
                            <button
                                className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
                                onClick={() => setActiveTab('description')}
                            >
                                상품정보
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'purchase' ? 'active' : ''}`}
                                onClick={() => setActiveTab('purchase')}
                            >
                                구매정보
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'related' ? 'active' : ''}`}
                                onClick={() => setActiveTab('related')}
                            >
                                관련상품
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                상품후기 (27)
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'qna' ? 'active' : ''}`}
                                onClick={() => setActiveTab('qna')}
                            >
                                상품문의 (2)
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'description' && (
                                <div className="description-content">
                                    <h3 className="content-title">상품 상세정보</h3>
                                    <div className="info-box">
                                        <div className="info-title">상품 특징</div>
                                        <div className="info-text">
                                            프리미엄 등급의 신선한 한우 채끝스테이크입니다.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UPdPage;