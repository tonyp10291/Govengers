import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/user/PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentData = location.state;
    
    const [showDetails, setShowDetails] = useState(false);
    const API_BASE_URL = "http://localhost:8080";

    // 이미지 에러 핸들링 함수
    const handleImageError = (e, productInfo) => {
        console.warn(`결제 성공 페이지 이미지 로드 실패: ${productInfo?.productImage || 'undefined'}`);
        
        // 첫 번째 시도: 서버 기본 이미지
        if (!e.target.src.includes('default-product.jpg')) {
            e.target.src = `${API_BASE_URL}/api/images/default-product.jpg`;
            return;
        }
        
        // 두 번째 시도: 플레이스홀더 SVG
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydtOuvuOyngCDsl5bsnYw8L3RleHQ+PC9zdmc+';
        
        // 더 이상 에러 발생하지 않도록
        e.target.onerror = null;
    };

    // 이미지 URL 생성 함수
    const getImageUrl = (productInfo) => {
        if (!productInfo) return `${API_BASE_URL}/api/images/default-product.jpg`;
        
        // productInfo가 배열인 경우 (복수 상품)
        if (Array.isArray(productInfo) && productInfo.length > 0) {
            const firstItem = productInfo[0];
            if (firstItem.imageFilename) {
                return firstItem.imageFilename.startsWith('http') ? 
                    firstItem.imageFilename : 
                    `${API_BASE_URL}/api/images/${firstItem.imageFilename}`;
            }
        }
        
        // productInfo가 객체인 경우 (단일 상품)
        if (productInfo.productImage) {
            return productInfo.productImage.startsWith('http') ? 
                productInfo.productImage : 
                `${API_BASE_URL}/api/images/${productInfo.productImage}`;
        }
        
        if (productInfo.imageFilename) {
            return productInfo.imageFilename.startsWith('http') ? 
                productInfo.imageFilename : 
                `${API_BASE_URL}/api/images/${productInfo.imageFilename}`;
        }
        
        return `${API_BASE_URL}/api/images/default-product.jpg`;
    };

    // 상품 정보 가져오기 함수 (단일 상품용으로 단순화)
    const getProductDisplayInfo = (productInfo) => {
        if (!productInfo) return { name: '상품 정보 없음', description: '', quantity: 1 };
        
        // 단일 상품 객체인 경우
        return {
            name: productInfo.productName || productInfo.pnm || '상품명 없음',
            description: productInfo.description || '',
            quantity: productInfo.quantity || 1
        };
    };

    if (!paymentData) {
        return (
            <div className="payment-success-page">
                <div className="payment-success-container">
                    <h1>잘못된 접근입니다.</h1>
                    <button onClick={() => navigate('/')} className="payment-success-home-button">
                        홈으로 가기
                    </button>
                </div>
            </div>
        );
    }

    const orderInfo = paymentData.orderInfo || {};
    const productInfo = paymentData.productInfo || {};
    const productDisplay = getProductDisplayInfo(productInfo);

    console.log('PaymentSuccess 데이터 확인:', paymentData);
    console.log('상품 정보:', productInfo);
    console.log('이미지 URL:', getImageUrl(productInfo));

    return (
        <div className="payment-success-page">
            <div className="payment-success-container">
                <div className="payment-success-header">
                    <div className="payment-success-icon">🎉</div>
                    <h1 className="payment-success-title">결제가 완료되었습니다!</h1>
                    <p className="payment-success-subtitle">주문이 성공적으로 처리되었습니다</p>
                </div>
                
                <div className="payment-success-order-summary">
                    <div className="payment-success-summary-header">
                        <h2>주문 정보</h2>
                        <div className="payment-success-order-number">
                            주문번호: <span>{paymentData.merchantUid}</span>
                        </div>
                    </div>
                    
                    <div className="payment-success-product-section">
                        {Array.isArray(productInfo) && productInfo.length > 0 ? (
                            // 복수 상품인 경우 개별 표시
                            productInfo.map((item, index) => (
                                <div key={item.pid || item.cartId || index} className="payment-success-product-item">
                                    <img 
                                        src={item.imageFilename ? 
                                            (item.imageFilename.startsWith('http') ? 
                                                item.imageFilename : 
                                                `${API_BASE_URL}/api/images/${item.imageFilename}`
                                            ) : 
                                            `${API_BASE_URL}/api/images/default-product.jpg`
                                        }
                                        alt={item.productName || item.pnm}
                                        className="payment-success-product-image"
                                        onError={(e) => handleImageError(e, item)}
                                    />
                                    <div className="payment-success-product-details">
                                        <h3 className="payment-success-product-name">{item.productName || item.pnm}</h3>
                                        <div className="payment-success-product-info">
                                            <span className="payment-success-quantity">수량: {item.quantity || 1}개</span>
                                            <span className="payment-success-price">{((item.price || 0) * (item.quantity || 1)).toLocaleString()}원</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // 단일 상품인 경우
                            <div className="payment-success-product-item">
                                <img 
                                    src={getImageUrl(productInfo)}
                                    alt={productDisplay.name}
                                    className="payment-success-product-image"
                                    onError={(e) => handleImageError(e, productInfo)}
                                />
                                <div className="payment-success-product-details">
                                    <h3 className="payment-success-product-name">{productDisplay.name}</h3>
                                    <p className="payment-success-product-description">{productDisplay.description}</p>
                                    <div className="payment-success-product-info">
                                        <span className="payment-success-quantity">수량: {productDisplay.quantity}개</span>
                                        <span className="payment-success-price">{paymentData.amount?.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="payment-success-payment-total">
                        <div className="payment-success-total-row">
                            <span className="payment-success-total-label">총 결제 금액</span>
                            <span className="payment-success-total-amount">{paymentData.amount?.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
                
                <div className="payment-success-details-toggle">
                    <button 
                        className="payment-success-toggle-button"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <span>주문 상세보기</span>
                        <span className={`payment-success-arrow ${showDetails ? 'success-up' : 'success-down'}`}>
                            {showDetails ? '▲' : '▼'}
                        </span>
                    </button>
                </div>
                
                {showDetails && (
                    <div className="payment-success-order-details">
                        <div className="payment-success-detail-section">
                            <h3 className="payment-success-detail-title">👤 주문자 정보</h3>
                            <div className="payment-success-detail-content">
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">주문자명:</span>
                                    <span className="payment-success-value">{paymentData.buyerName || '정보 없음'}</span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">이메일:</span>
                                    <span className="payment-success-value">{orderInfo.buyerEmail || '정보 없음'}</span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">휴대폰번호:</span>
                                    <span className="payment-success-value">{orderInfo.buyerPhone || '정보 없음'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="payment-success-detail-section">
                            <h3 className="payment-success-detail-title">🚚 배송 정보</h3>
                            <div className="payment-success-detail-content">
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">받으실 분:</span>
                                    <span className="payment-success-value">{orderInfo.receiverName || paymentData.buyerName || '정보 없음'}</span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">배송 주소:</span>
                                    <span className="payment-success-value">
                                        {orderInfo.zipCode && orderInfo.address && orderInfo.detailAddress ? 
                                            `(${orderInfo.zipCode}) ${orderInfo.address} ${orderInfo.detailAddress}` : 
                                            '주소 정보 없음'
                                        }
                                    </span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">배송 방법:</span>
                                    <span className="payment-success-value">{orderInfo.deliveryMethod || '택배'}</span>
                                </div>
                                {orderInfo.deliveryMemo && (
                                    <div className="payment-success-detail-row">
                                        <span className="payment-success-label">배송 요청사항:</span>
                                        <span className="payment-success-value">{orderInfo.deliveryMemo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="payment-success-detail-section">
                            <h3 className="payment-success-detail-title">💳 결제 정보</h3>
                            <div className="payment-success-detail-content">
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">결제 방법:</span>
                                    <span className="payment-success-value">
                                        {orderInfo.payMethod === 'card' ? '💳 신용카드' : orderInfo.payMethod || '💳 신용카드'}
                                    </span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">결제 상태:</span>
                                    <span className="payment-success-value payment-success-status-completed">✅ 결제 완료</span>
                                </div>
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">거래번호:</span>
                                    <span className="payment-success-value">{paymentData.impUid}</span>
                                </div>
                                {paymentData.orderId && (
                                    <div className="payment-success-detail-row">
                                        <span className="payment-success-label">주문 ID:</span>
                                        <span className="payment-success-value">{paymentData.orderId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="payment-success-action-buttons">
                    <button 
                        className="payment-success-primary-button"
                        onClick={() => navigate('/')}
                    >
                        쇼핑 계속하기
                    </button>
                    <button 
                        className="payment-success-secondary-button"
                        onClick={() => navigate('/orders')}
                    >
                        주문 내역 보기
                    </button>
                </div>
                
                <div className="payment-success-notice-section">
                    <h3 className="payment-success-notice-title">📋 주문 안내</h3>
                    <ul className="payment-success-notice-list">
                        <li>주문 확인 이메일이 발송되었습니다.</li>
                        <li>배송은 주문 확인 후 1-2일 내에 시작됩니다.</li>
                        <li>배송 현황은 주문 내역에서 확인하실 수 있습니다.</li>
                        <li>문의사항이 있으시면 고객센터로 연락주세요.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;