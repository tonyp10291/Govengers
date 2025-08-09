import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../css/user/PaymentSuccess.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentData = location.state;
    
    const [showDetails, setShowDetails] = useState(false);

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

    console.log('PaymentSuccess 데이터 확인:', paymentData); 

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
                        <div className="payment-success-product-item">
                            <img 
                                src={productInfo.productImage} 
                                alt={productInfo.productName}
                                className="payment-success-product-image"
                            />
                            <div className="payment-success-product-details">
                                <h3 className="payment-success-product-name">{productInfo.productName}</h3>
                                <p className="payment-success-product-description">{productInfo.description}</p>
                                <div className="payment-success-product-info">
                                    <span className="payment-success-quantity">수량: {productInfo.quantity || 1}개</span>
                                    <span className="payment-success-price">{paymentData.amount?.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
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
                                    <span className="payment-success-value">{paymentData.buyerName || '정보 없음'}</span>
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
                            </div>
                        </div>
                        
                        <div className="payment-success-detail-section">
                            <h3 className="payment-success-detail-title">💳 결제 정보</h3>
                            <div className="payment-success-detail-content">
                                <div className="payment-success-detail-row">
                                    <span className="payment-success-label">결제 방법:</span>
                                    <span className="payment-success-value">
                                        {orderInfo.payMethod === 'card' ? '💳 신용카드' : orderInfo.payMethod}
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