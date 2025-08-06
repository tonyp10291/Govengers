import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../util/Buttons';
import '../../css/Home.css';
import '../../css/user/UPdList.css';

const UPdList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 12;

    const [searchParams] = useSearchParams();
    const urlCategory = searchParams.get('cate') || '전체';
    const navigate = useNavigate();

    const homeBtnClick = () => {
        navigate("/");
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (urlCategory && urlCategory !== '전체') {
                response = await axios.get(`/api/products/category/${urlCategory}`);
            } else {
                response = await axios.get('/api/products/list');
            }

            console.log('API 응답:', response.data);
            setProducts(response.data);
        } catch (error) {
            console.error('상품 조회 실패:', error);
            alert('상품을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [urlCategory]);

    useEffect(() => {
        fetchProducts();
        setCurrentPage(1);
    }, [fetchProducts, urlCategory]);

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const currentProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const openCartModal = () => {
        setIsCartModalOpen(true);
    };

    const closeCartModal = () => {
        setIsCartModalOpen(false);
    };

    const formatPrice = (price) => {
        return price.toLocaleString('ko-KR');
    };

    const handlePurchase = () => {
        alert('바로 구매하기 기능이 실행됩니다.');
        closeModal();
    };

    const handleAddToCart = (product, quantity = 1, fromModal = false) => {
        const existingItem = cartItems.find(item => item.pid === product.pid);

        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item.pid === product.pid
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity }]);
        }

        if (fromModal) {
            closeModal();
        }

        openCartModal();
    };

    const handleWishlist = () => {
        alert('찜하기가 완료되었습니다.');
    };

    const getTotalQuantity = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    if (loading) {
        return (
            <div className="updlist-container">
                <div className="loading">상품을 불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="updlist-container">
            <header className="home-header">
                <div className="logo">
                    <Button type={"logo"} onClick={homeBtnClick} />
                </div>
                <nav className="nav-menu">
                    <Link to="/products?cate=소고기">소고기</Link>
                    <Link to="/products?cate=돼지고기">돼지고기</Link>
                    <Link to="/products?cate=닭고기">닭고기</Link>
                    <Link to="/products?cate=선물세트">선물세트</Link>
                </nav>
            </header>

            <div className="category-title">
                <h2>{urlCategory === '전체' || !urlCategory ? '전체 상품' : `${urlCategory} 상품`}</h2>
            </div>

            <div className="products-grid">
                {currentProducts.length === 0 ? (
                    <div className="no-products">
                        <p>상품이 없습니다.</p>
                    </div>
                ) : (
                    currentProducts.map(product => (
                        <div key={product.pid} className="product-card" onClick={() => navigate(`/product/${product.pid}`)}
                            style={{ cursor: 'pointer' }}>
                            <div className="product-image">
                                <img
                                    src={product.imgFilename ? `/api/imgs/${product.imgFilename}` : '/img/default-product.jpg'}
                                    alt={product.pnm}
                                    onError={(e) => {
                                        e.target.src = '/img/default-product.jpg';
                                    }}
                                />
                                <div className="product-actions">
                                    <button
                                        className="action-btn cart-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        title="장바구니"
                                    >
                                        🛒
                                    </button>
                                    <button
                                        className="action-btn zoom-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(product);
                                        }}
                                        title="확대보기"
                                    >
                                        🔍
                                    </button>
                                    <button
                                        className="action-btn detail-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(product);
                                        }}
                                        title="상세보기"
                                    >
                                        📄
                                    </button>
                                </div>
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.pnm}</h3>
                                {product.pdesc && (
                                    <p className="product-desc">{product.pdesc}</p>
                                )}
                                <p className="product-price">₩{formatPrice(product.price)}</p>
                                <div className="product-meta">
                                    <span className="stock">재고: {product.stock}개</span>
                                    <span className="hit">HIT</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        ‹
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index + 1}
                            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        ›
                    </button>
                </div>
            )}

            {isModalOpen && selectedProduct && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div className="modal-body">
                            <div className="modal-image">
                                <img
                                    src={selectedProduct.imgFilename ? `/api/imgs/${selectedProduct.imgFilename}` : '/img/default-product.jpg'}
                                    alt={selectedProduct.pnm}
                                    onError={(e) => {
                                        e.target.src = '/img/default-product.jpg';
                                    }}
                                />
                            </div>
                            <div className="modal-info">
                                <h2>{selectedProduct.pnm}</h2>
                                {selectedProduct.pdesc && (
                                    <p className="modal-desc">{selectedProduct.pdesc}</p>
                                )}
                                <p className="modal-price">₩{formatPrice(selectedProduct.price)}</p>
                                <div className="product-details">
                                    <p><strong>카테고리:</strong> {selectedProduct.mainCategory}</p>
                                    {selectedProduct.origin && (
                                        <p><strong>원산지:</strong> {selectedProduct.origin}</p>
                                    )}
                                    <p><strong>재고:</strong> {selectedProduct.stock}개</p>
                                    {selectedProduct.hit && (
                                        <p><strong>조회수:</strong> {selectedProduct.hit}</p>
                                    )}
                                </div>
                                <div className="quantity-selector">
                                    <label>수량:</label>
                                    <input
                                        id="modal-quantity"
                                        type="number"
                                        min="1"
                                        max={selectedProduct.stock}
                                        defaultValue="1"
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button className="btn-purchase" onClick={handlePurchase}>
                                        바로 구매하기
                                    </button>
                                    <button
                                        className="btn-cart"
                                        onClick={() => {
                                            const quantity = parseInt(document.getElementById('modal-quantity').value);
                                            handleAddToCart(selectedProduct, quantity, true);
                                        }}
                                    >
                                        장바구니 담기
                                    </button>
                                    <button className="btn-wishlist" onClick={handleWishlist}>
                                        찜하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isCartModalOpen && (
                <div className="modal-overlay" onClick={closeCartModal}>
                    <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-modal-header">
                            <h3>장바구니 담기</h3>
                            <button className="modal-close" onClick={closeCartModal}>×</button>
                        </div>

                        <div className="cart-summary">
                            <p>총 {getTotalQuantity()} 개</p>
                        </div>

                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.pid} className="cart-item">
                                    <img
                                        src={item.imgFilename ? `/api/imgs/${item.imgFilename}` : '/img/default-product.jpg'}
                                        alt={item.pnm}
                                        className="cart-item-image"
                                        onError={(e) => {
                                            e.target.src = '/img/default-product.jpg';
                                        }}
                                    />
                                    <div className="cart-item-info">
                                        <h4>{item.pnm}</h4>
                                        <p className="cart-item-price">₩{formatPrice(item.price)}</p>
                                        <div className="cart-quantity-controls">
                                            <span>수량: {item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-pagination">
                            <button>‹</button>
                            <span>1</span>
                            <button>›</button>
                        </div>

                        <div className="cart-modal-buttons">
                            <button className="btn-direct-purchase">바로 구매하기</button>
                            <button className="btn-continue-shopping" onClick={closeCartModal}>장바구니 이동</button>
                            <button className="btn-shopping-continue" onClick={closeCartModal}>쇼핑계속하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UPdList;