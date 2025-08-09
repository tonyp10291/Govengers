import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // 상품 정보 받아오기
    const productInfo = location.state;

    const [paymentData, setPaymentData] = useState({
        amount: productInfo?.amount || '',
        productName: productInfo?.productName || '',
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        payMethod: 'card'
    });

    const [loading, setLoading] = useState(false);

    // 상품 정보가 없으면 상품 페이지로 리다이렉트
    useEffect(() => {
        if (!productInfo) {
            alert('잘못된 접근입니다. 상품을 선택해주세요.');
            navigate('/products');
        }
    }, [productInfo, navigate]);

    // 포트원 스크립트 로드
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.iamport.kr/v1/iamport.js';
        script.async = true;
        document.head.appendChild(script);
        
        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const requestPayment = async () => {
        if (!paymentData.buyerName) {
            alert('구매자 이름을 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            // 1. 서버에서 결제 준비
            const prepareResponse = await axios.post('http://localhost:8080/api/payment/prepare', {
                amount: parseInt(paymentData.amount),
                productName: paymentData.productName,
                buyerName: paymentData.buyerName,
                buyerEmail: paymentData.buyerEmail,
                buyerPhone: paymentData.buyerPhone,
                payMethod: paymentData.payMethod
            });

            const { merchantUid, amount, productName, buyerName, buyerEmail, buyerPhone, impCode } = prepareResponse.data;

            // 2. 포트원 결제 창 호출
            if (window.IMP) {
                window.IMP.init(impCode);

                window.IMP.request_pay({
                    pg: 'danal_tpay',
                    pay_method: paymentData.payMethod,
                    merchant_uid: merchantUid,
                    name: productName,
                    amount: amount,
                    buyer_email: buyerEmail,
                    buyer_name: buyerName,
                    buyer_tel: buyerPhone
                }, async function (rsp) {
                    if (rsp.success) {
                        try {
                            // 서버에서 결제 검증
                            const verifyResponse = await axios.post('http://localhost:8080/api/payment/verify', {
                                impUid: rsp.imp_uid,
                                merchantUid: rsp.merchant_uid
                            });

                            if (verifyResponse.data.success) {
                                // 결제 성공 페이지로 이동
                                navigate('/payment/success', {
                                    state: {
                                        merchantUid: rsp.merchant_uid,
                                        impUid: rsp.imp_uid,
                                        amount: rsp.paid_amount,
                                        productName: productName,
                                        buyerName: buyerName
                                    }
                                });
                            } else {
                                alert('결제 검증 실패: ' + verifyResponse.data.message);
                            }
                        } catch (error) {
                            console.error('결제 검증 오류:', error);
                            alert('결제 검증 중 오류가 발생했습니다.');
                        }
                    } else {
                        alert('결제 실패: ' + rsp.error_msg);
                    }
                    setLoading(false);
                });
            } else {
                alert('포트원 라이브러리를 로드할 수 없습니다. 페이지를 새로고침해주세요.');
                setLoading(false);
            }

        } catch (error) {
            console.error('결제 준비 오류:', error);
            alert('결제 준비 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    if (!productInfo) {
        return <div>로딩 중...</div>;
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            padding: '20px'
        }}>
            <div style={{ 
                maxWidth: '800px', 
                margin: '0 auto'
            }}>
                {/* 헤더 */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        color: '#333',
                        marginBottom: '10px'
                    }}>
                        💳 결제하기
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '1rem'
                    }}>
                        안전하고 간편한 포트원 다날 결제
                    </p>
                </div>

                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '30px',
                    alignItems: 'start'
                }}>
                    {/* 주문 정보 */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{
                            fontSize: '1.3rem',
                            color: '#333',
                            marginBottom: '20px',
                            borderBottom: '2px solid #007bff',
                            paddingBottom: '10px'
                        }}>
                            📦 주문 상품
                        </h3>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <img 
                                src={productInfo.productImage}
                                alt={productInfo.productName}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginRight: '15px'
                                }}
                            />
                            <div>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    color: '#333',
                                    margin: '0 0 5px 0'
                                }}>
                                    {productInfo.productName}
                                </h4>
                                <p style={{
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    margin: '0'
                                }}>
                                    {productInfo.description}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                            }}>
                                <span>상품 금액:</span>
                                <span>{productInfo.amount.toLocaleString()}원</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px'
                            }}>
                                <span>배송비:</span>
                                <span>무료</span>
                            </div>
                            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#e74c3c'
                            }}>
                                <span>총 결제 금액:</span>
                                <span>{productInfo.amount.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>

                    {/* 결제 폼 */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{
                            fontSize: '1.3rem',
                            color: '#333',
                            marginBottom: '20px',
                            borderBottom: '2px solid #28a745',
                            paddingBottom: '10px'
                        }}>
                            👤 구매자 정보
                        </h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                구매자명 *
                            </label>
                            <input
                                type="text"
                                name="buyerName"
                                value={paymentData.buyerName}
                                onChange={handleInputChange}
                                placeholder="구매자 이름을 입력하세요"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '2px solid #e9ecef', 
                                    borderRadius: '8px', 
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                이메일
                            </label>
                            <input
                                type="email"
                                name="buyerEmail"
                                value={paymentData.buyerEmail}
                                onChange={handleInputChange}
                                placeholder="이메일을 입력하세요"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '2px solid #e9ecef', 
                                    borderRadius: '8px', 
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                전화번호
                            </label>
                            <input
                                type="tel"
                                name="buyerPhone"
                                value={paymentData.buyerPhone}
                                onChange={handleInputChange}
                                placeholder="전화번호를 입력하세요"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '2px solid #e9ecef', 
                                    borderRadius: '8px', 
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                결제 방법
                            </label>
                            <select
                                name="payMethod"
                                value={paymentData.payMethod}
                                onChange={handleInputChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    border: '2px solid #e9ecef', 
                                    borderRadius: '8px', 
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="card">💳 신용카드</option>
                                <option value="trans">🏦 실시간계좌이체</option>
                                <option value="vbank">🏛️ 가상계좌</option>
                                <option value="phone">📱 휴대폰소액결제</option>
                            </select>
                        </div>

                        <button
                            onClick={requestPayment}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '18px',
                                backgroundColor: loading ? '#ccc' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                marginBottom: '15px'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#0056b3';
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#007bff';
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {loading ? '결제 처리 중... ⏳' : `${productInfo.amount.toLocaleString()}원 결제하기 💳`}
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                        >
                            ← 상품 목록으로 돌아가기
                        </button>

                        <div style={{ 
                            marginTop: '20px', 
                            fontSize: '12px', 
                            color: '#999', 
                            textAlign: 'center',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            🔒 안전한 결제
                            <br />
                            포트원 다날 결제 시스템으로 안전하게 보호됩니다
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;