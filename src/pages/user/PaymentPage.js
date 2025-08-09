import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/user/PaymentPage.css';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const productInfo = location.state;

    // 회원/비회원 구분
    const getUserId = () => localStorage.getItem('userId') || '';
    const isGuest = !getUserId() || productInfo?.isGuest;

    const [orderData, setOrderData] = useState({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        receiverName: '', // 받으실 분 이름 추가
        deliveryMethod: '택배',
        zipCode: '',
        address: '',
        detailAddress: '',
        addressExtra: '',
        deliveryMemo: '', // 배송 요청사항 추가
        payMethod: 'card'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // 회원인 경우 기존 정보 자동 입력
    useEffect(() => {
        const loadMemberInfo = async () => {
            if (!isGuest && getUserId()) {
                try {
                    const response = await fetch('/api/user/profile', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (response.ok) {
                        const userInfo = await response.json();
                        setOrderData(prev => ({
                            ...prev,
                            buyerName: userInfo.name || '',
                            buyerEmail: userInfo.email || '',
                            buyerPhone: userInfo.phone || '',
                            receiverName: userInfo.name || '',
                            zipCode: userInfo.zipCode || '',
                            address: userInfo.address || '',
                            detailAddress: userInfo.detailAddress || ''
                        }));
                    }
                } catch (error) {
                    console.log('회원 정보 로드 실패:', error);
                    // 실패해도 계속 진행 (수동 입력)
                }
            }
        };

        loadMemberInfo();
    }, [isGuest]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        const iamportScript = document.createElement('script');
        iamportScript.src = 'https://cdn.iamport.kr/v1/iamport.js';
        iamportScript.async = true;
        document.head.appendChild(iamportScript);
        
        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            if (document.head.contains(iamportScript)) {
                document.head.removeChild(iamportScript);
            }
        };
    }, []);

    useEffect(() => {
        if (!productInfo) {
            alert('잘못된 접근입니다. 상품을 선택해주세요.');
            navigate('/products');
        }
    }, [productInfo, navigate]);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'buyerName':
            case 'receiverName':
                if (!value.trim()) {
                    error = name === 'buyerName' ? '주문자명을 입력해주세요.' : '받으실 분 이름을 입력해주세요.';
                } else if (value.trim().length < 2) {
                    error = '이름은 2자 이상 입력해주세요.';
                } else if (!/^[가-힣a-zA-Z\s]+$/.test(value.trim())) {
                    error = '이름은 한글 또는 영문만 입력 가능합니다.';
                }
                break;

            case 'buyerEmail':
                if (!value.trim()) {
                    error = '이메일을 입력해주세요.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    error = '올바른 이메일 형식을 입력해주세요.';
                }
                break;

            case 'buyerPhone':
                const cleanPhone = value.replace(/[^0-9]/g, '');
                if (!value.trim()) {
                    error = '휴대폰번호를 입력해주세요.';
                } else if (cleanPhone.length < 10 || cleanPhone.length > 11 || !cleanPhone.startsWith('01')) {
                    error = '올바른 휴대폰번호를 입력해주세요. (예: 010-1234-5678)';
                }
                break;

            case 'detailAddress':
                if (!value.trim()) {
                    error = '상세주소를 입력해주세요.';
                } else if (value.trim().length < 2) {
                    error = '상세주소를 2자 이상 입력해주세요.';
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        return !error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'buyerPhone') {
            const phoneNumber = value.replace(/[^0-9]/g, '');
            let formattedPhone = phoneNumber;
            
            if (phoneNumber.length <= 3) {
                formattedPhone = phoneNumber;
            } else if (phoneNumber.length <= 7) {
                formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
            } else {
                formattedPhone = `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
            }
            
            setOrderData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
            validateField(name, formattedPhone);
            return;
        }

        if (name === 'buyerName' || name === 'receiverName') {
            const nameValue = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, '');
            setOrderData(prev => ({
                ...prev,
                [name]: nameValue
            }));
            validateField(name, nameValue);
            return;
        }

        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));
        validateField(name, value);
    };

    const handleZipCodeSearch = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: function(data) {
                    let addr = '';
                    let extraAddr = '';

                    if (data.userSelectedType === 'R') {
                        addr = data.roadAddress;
                    } else {
                        addr = data.jibunAddress;
                    }

                    if(data.userSelectedType === 'R'){
                        if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                            extraAddr += data.bname;
                        }
                        if(data.buildingName !== '' && data.apartment === 'Y'){
                            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                        }
                        if(extraAddr !== ''){
                            extraAddr = ' (' + extraAddr + ')';
                        }
                    }

                    setOrderData(prev => ({
                        ...prev,
                        zipCode: data.zonecode,
                        address: addr,
                        addressExtra: extraAddr
                    }));
                }
            }).open();
        } else {
            alert('우편번호 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const validateForm = () => {
        if (!orderData.buyerName.trim()) {
            alert('주문자명을 입력해주세요.');
            document.querySelector('input[name="buyerName"]').focus();
            return false;
        }
        if (orderData.buyerName.trim().length < 2) {
            alert('주문자명은 2자 이상 입력해주세요.');
            document.querySelector('input[name="buyerName"]').focus();
            return false;
        }
        if (!/^[가-힣a-zA-Z\s]+$/.test(orderData.buyerName.trim())) {
            alert('주문자명은 한글 또는 영문만 입력 가능합니다.');
            document.querySelector('input[name="buyerName"]').focus();
            return false;
        }

        if (!orderData.buyerEmail.trim()) {
            alert('이메일을 입력해주세요.');
            document.querySelector('input[name="buyerEmail"]').focus();
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(orderData.buyerEmail.trim())) {
            alert('올바른 이메일 형식을 입력해주세요.');
            document.querySelector('input[name="buyerEmail"]').focus();
            return false;
        }

        if (!orderData.buyerPhone.trim()) {
            alert('휴대폰번호를 입력해주세요.');
            document.querySelector('input[name="buyerPhone"]').focus();
            return false;
        }
        const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
        if (!phoneRegex.test(orderData.buyerPhone.replace(/[^0-9]/g, ''))) {
            alert('올바른 휴대폰번호를 입력해주세요. (예: 010-1234-5678)');
            document.querySelector('input[name="buyerPhone"]').focus();
            return false;
        }

        if (!orderData.receiverName.trim()) {
            alert('받으실 분 이름을 입력해주세요.');
            document.querySelector('input[name="receiverName"]').focus();
            return false;
        }

        if (!orderData.zipCode.trim()) {
            alert('우편번호를 검색해주세요.');
            return false;
        }
        if (!/^[0-9]{5}$/.test(orderData.zipCode)) {
            alert('올바른 우편번호를 입력해주세요.');
            return false;
        }

        if (!orderData.address.trim()) {
            alert('주소를 입력해주세요. 우편번호 찾기를 이용해주세요.');
            return false;
        }

        if (!orderData.detailAddress.trim()) {
            alert('상세주소를 입력해주세요.');
            document.querySelector('input[name="detailAddress"]').focus();
            return false;
        }
        if (orderData.detailAddress.trim().length < 2) {
            alert('상세주소를 2자 이상 입력해주세요.');
            document.querySelector('input[name="detailAddress"]').focus();
            return false;
        }

        return true;
    };

    const requestPayment = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            console.log('=== 결제 요청 시작 ===');
            console.log('회원 구분:', isGuest ? '비회원' : '회원');
            
            const totalPrice = productInfo.amount;
            const deliveryFee = 3000;
            const finalTotal = totalPrice + deliveryFee;
            
            const requestData = {
                // 상품 정보
                productId: productInfo.pid,
                productName: productInfo.productName,
                productPrice: productInfo.price,
                quantity: productInfo.quantity,
                amount: finalTotal,
                
                // 주문자 정보
                buyerName: orderData.buyerName,
                buyerEmail: orderData.buyerEmail,
                buyerPhone: orderData.buyerPhone,
                
                // 배송 정보
                receiverName: orderData.receiverName,
                zipCode: orderData.zipCode,
                address: orderData.address,
                detailAddress: orderData.detailAddress,
                addressExtra: orderData.addressExtra,
                deliveryMethod: orderData.deliveryMethod,
                deliveryMemo: orderData.deliveryMemo,
                
                // 결제 정보
                payMethod: orderData.payMethod,
                
                // 회원 구분
                isGuest: isGuest,
                userId: isGuest ? null : getUserId()
            };
            
            console.log('결제 준비 요청 데이터:', requestData);
            const prepareResponse = await axios.post('http://localhost:8080/api/payment/prepare', requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(isGuest ? {} : { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
                },
                timeout: 10000
            });
            
            console.log('결제 준비 응답:', prepareResponse.data);

            if (!prepareResponse.data.success) {
                throw new Error('결제 준비 실패: ' + prepareResponse.data.message);
            }

            const { merchantUid, amount, productName, buyerName, buyerEmail, buyerPhone, impCode } = prepareResponse.data;

            if (!window.IMP) {
                throw new Error('포트원 라이브러리가 로드되지 않았습니다.');
            }

            window.IMP.init(impCode);
            window.IMP.request_pay({
                pg: 'danal_tpay',
                pay_method: orderData.payMethod,
                merchant_uid: merchantUid,
                name: productName,
                amount: amount,
                buyer_email: buyerEmail,
                buyer_name: buyerName,
                buyer_tel: buyerPhone,
                buyer_addr: `${orderData.address} ${orderData.detailAddress}`,
                buyer_postcode: orderData.zipCode
            }, async function (rsp) {
                console.log('=== 포트원 결제 응답 ===', rsp);
                
                if (rsp.success) {
                    try {
                        console.log('=== 결제 검증 및 DB 저장 시작 ===');
                        console.log('impUid:', rsp.imp_uid);
                        console.log('merchantUid:', rsp.merchant_uid);
                        
                        const verifyResult = await verifyPaymentWithRetry(rsp.imp_uid, rsp.merchant_uid);
                        
                        console.log('결제 검증 및 DB 저장 성공:', verifyResult);

                        if (verifyResult.success) {
                            // 결제 성공 시 localStorage의 장바구니에서 해당 상품 제거 (선택사항)
                            if (!isGuest) {
                                removeFromLocalStorageCart(productInfo.pid);
                            }

                            navigate('/payment/success', {
                                state: {
                                    merchantUid: rsp.merchant_uid,
                                    impUid: rsp.imp_uid,
                                    amount: finalTotal,
                                    productName: productName,
                                    buyerName: buyerName,
                                    isGuest: isGuest,
                                    orderId: verifyResult.orderId, // 주문 ID 추가
                                    productInfo: {
                                        productName: productInfo.productName,
                                        productImage: productInfo.productImage,
                                        description: productInfo.description,
                                        quantity: productInfo.quantity,
                                        amount: productInfo.amount
                                    },
                                    orderInfo: {
                                        buyerEmail: orderData.buyerEmail,
                                        buyerPhone: orderData.buyerPhone,
                                        receiverName: orderData.receiverName,
                                        zipCode: orderData.zipCode,
                                        address: orderData.address,
                                        detailAddress: orderData.detailAddress,
                                        deliveryMethod: orderData.deliveryMethod,
                                        deliveryMemo: orderData.deliveryMemo,
                                        payMethod: orderData.payMethod
                                    }
                                }
                            });
                        } else {
                            alert('결제 검증 실패: ' + verifyResult.message);
                        }
                    } catch (verifyError) {
                        console.error('결제 검증 오류:', verifyError);
                        try {
                            console.log('=== 결제 상태 재확인 시작 ===');
                            const statusResponse = await axios.get(
                                `http://localhost:8080/api/payment/status/${rsp.merchant_uid}`,
                                { timeout: 10000 }
                            );
                            
                            console.log('결제 상태 재확인 응답:', statusResponse.data);
                            
                            if (statusResponse.data.success && statusResponse.data.status === 'COMPLETED') {
                                console.log('재확인 결과: 결제 완료 상태 확인됨');
                                navigate('/payment/success', {
                                    state: {
                                        merchantUid: rsp.merchant_uid,
                                        impUid: rsp.imp_uid,
                                        amount: finalTotal,
                                        productName: productName,
                                        buyerName: buyerName,
                                        isGuest: isGuest,
                                        productInfo: {
                                            productName: productInfo.productName,
                                            productImage: productInfo.productImage,
                                            description: productInfo.description,
                                            quantity: productInfo.quantity,
                                            amount: productInfo.amount
                                        },
                                        orderInfo: {
                                            buyerEmail: orderData.buyerEmail,
                                            buyerPhone: orderData.buyerPhone,
                                            receiverName: orderData.receiverName,
                                            zipCode: orderData.zipCode,
                                            address: orderData.address,
                                            detailAddress: orderData.detailAddress,
                                            deliveryMethod: orderData.deliveryMethod,
                                            deliveryMemo: orderData.deliveryMemo,
                                            payMethod: orderData.payMethod
                                        }
                                    }
                                });
                            } else {
                                alert('결제 검증에 실패했습니다. 고객센터로 문의해주세요.\n주문번호: ' + rsp.merchant_uid);
                            }
                        } catch (statusError) {
                            console.error('결제 상태 재확인 실패:', statusError);
                            alert('결제 상태 확인 중 오류가 발생했습니다. 고객센터로 문의해주세요.\n주문번호: ' + rsp.merchant_uid);
                        }
                    }
                } else {
                    console.log('결제 실패:', rsp.error_msg);
                    alert('결제 실패: ' + (rsp.error_msg || '알 수 없는 오류'));
                }
                setLoading(false);
            });

        } catch (error) {
            console.error('결제 준비 오류:', error);
            
            let errorMessage = '결제 준비 중 오류가 발생했습니다.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = '결제 준비 실패: ' + error.response.data.message;
            }
            
            alert(errorMessage);
            setLoading(false);
        }
    };

    const verifyPaymentWithRetry = async (impUid, merchantUid, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`결제 검증 시도 ${attempt}/${maxRetries}`);
                
                const verifyResponse = await axios.post('http://localhost:8080/api/payment/verify', {
                    impUid: impUid,
                    merchantUid: merchantUid,
                    isGuest: isGuest,
                    userId: isGuest ? null : getUserId()
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(isGuest ? {} : { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
                    },
                    timeout: 15000
                });
                
                console.log(`검증 시도 ${attempt} 응답:`, verifyResponse.data);
                
                if (verifyResponse.data.success) {
                    return verifyResponse.data;
                } else if (attempt === maxRetries) {
                    throw new Error(verifyResponse.data.message || '결제 검증 실패');
                }
                console.log(`${attempt}초 후 재시도...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                
            } catch (error) {
                console.error(`검증 시도 ${attempt} 실패:`, error);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                console.log(`${attempt}초 후 재시도...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    };

    // localStorage 장바구니에서 해당 상품 제거
    const removeFromLocalStorageCart = (productId) => {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const updatedCartItems = cartItems.filter(item => item.pid !== productId);
            localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        } catch (error) {
            console.error('장바구니 정리 실패:', error);
        }
    };

    if (!productInfo) {
        return <div>로딩 중...</div>;
    }

    const totalPrice = productInfo.amount;
    const deliveryFee = 3000;
    const finalTotal = totalPrice + deliveryFee;

    return (
        <div className="payment-page">
            <div className="payment-main-container">
                <div className="payment-page-header">
                    <h1>주문서 작성/결제</h1>
                    <p>안전하고 간편한 포트원 다날 결제 {isGuest && '(비회원 주문)'}</p>
                </div>

                <div className="payment-main-content">
                    <div className="payment-section order-products">
                        <h2 className="payment-section-title">상품명/옵션 <span className="payment-highlight">수량/상품금액/할인금액</span></h2>
                        
                        <div className="payment-product-list">
                            <div className="payment-product-item">
                                <img 
                                    src={productInfo.productImage}
                                    alt={productInfo.productName}
                                    className="payment-product-image"
                                />
                                <div className="payment-product-details">
                                    <h4 className="payment-product-name">{productInfo.productName}</h4>
                                    <p className="payment-product-description">{productInfo.description}</p>
                                </div>
                                <div className="payment-product-price-info">
                                    <div className="payment-quantity">수량: {productInfo.quantity || 1}개</div>
                                    <div className="payment-price">{productInfo.amount.toLocaleString()}원</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-section buyer-info">
                        <h2 className="payment-section-title">주문자 정보 {isGuest && '(비회원)'}</h2>
                        
                        <div className="payment-form-grid">
                            <div className="payment-form-group">
                                <label>주문자 *</label>
                                <input
                                    type="text"
                                    name="buyerName"
                                    value={orderData.buyerName}
                                    onChange={handleInputChange}
                                    placeholder="이름 입력 (한글/영문만)"
                                    className={`payment-form-input ${errors.buyerName ? 'payment-error' : ''}`}
                                    maxLength="20"
                                />
                                {errors.buyerName && <div className="payment-error-message">{errors.buyerName}</div>}
                            </div>

                            <div className="payment-form-group">
                                <label>이메일 *</label>
                                <input
                                    type="email"
                                    name="buyerEmail"
                                    value={orderData.buyerEmail}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    className={`payment-form-input ${errors.buyerEmail ? 'payment-error' : ''}`}
                                />
                                {errors.buyerEmail && <div className="payment-error-message">{errors.buyerEmail}</div>}
                            </div>

                            <div className="payment-form-group">
                                <label>휴대폰번호 *</label>
                                <input
                                    type="tel"
                                    name="buyerPhone"
                                    value={orderData.buyerPhone}
                                    onChange={handleInputChange}
                                    placeholder="010-1234-5678"
                                    className={`payment-form-input ${errors.buyerPhone ? 'payment-error' : ''}`}
                                    maxLength="13"
                                />
                                {errors.buyerPhone && <div className="payment-error-message">{errors.buyerPhone}</div>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-section delivery-info">
                        <h2 className="payment-section-title">배송 정보</h2>
                        
                        <div className="payment-delivery-method">
                            <label>받으실 분 *</label>
                            <input
                                type="text"
                                name="receiverName"
                                value={orderData.receiverName}
                                onChange={handleInputChange}
                                placeholder="받으실 분 이름 입력"
                                className={`payment-form-input ${errors.receiverName ? 'payment-error' : ''}`}
                            />
                            {errors.receiverName && <div className="payment-error-message">{errors.receiverName}</div>}
                        </div>

                        <div className="payment-address-section">
                            <div className="payment-form-group payment-address-search">
                                <label>우편번호 *</label>
                                <div className="payment-address-input-group">
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={orderData.zipCode}
                                        placeholder="우편번호"
                                        className="payment-form-input"
                                        readOnly
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleZipCodeSearch}
                                        className="payment-address-search-btn"
                                    >
                                        우편번호 찾기
                                    </button>
                                </div>
                            </div>

                            <div className="payment-form-group">
                                <label>도로명주소 *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={orderData.address + orderData.addressExtra}
                                    placeholder="주소"
                                    className="payment-form-input"
                                    readOnly
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>상세주소 *</label>
                                <input
                                    type="text"
                                    name="detailAddress"
                                    value={orderData.detailAddress}
                                    onChange={handleInputChange}
                                    placeholder="상세주소 (동/호수, 건물명 등)"
                                    className={`payment-form-input ${errors.detailAddress ? 'payment-error' : ''}`}
                                />
                                {errors.detailAddress && <div className="payment-error-message">{errors.detailAddress}</div>}
                            </div>
                        </div>

                        <div className="payment-delivery-notice">
                            <div className="payment-notice-item">
                                <span className="payment-notice-label">배송 요청 사항</span>
                                <input
                                    type="text"
                                    name="deliveryMemo"
                                    value={orderData.deliveryMemo}
                                    onChange={handleInputChange}
                                    placeholder="배송 요청사항을 입력해주세요"
                                    className="payment-form-input"
                                />
                            </div>
                            <p className="payment-delivery-warning">
                                ※ 배송 메모는 택배사에 전달되는 메시지입니다. 배송일, 시간 지정은 불가합니다.
                            </p>
                        </div>
                    </div>
                    
                    <div className="payment-section payment-summary">
                        <h2 className="payment-section-title">결제정보</h2>
                        
                        <div className="payment-breakdown">
                            <div className="payment-breakdown-item">
                                <span>총 [{productInfo.quantity || 1}]개의 상품 금액</span>
                                <span>{totalPrice.toLocaleString()}원</span>
                            </div>
                            <div className="payment-breakdown-item">
                                <span>배송비</span>
                                <span>{deliveryFee.toLocaleString()}원</span>
                            </div>
                            <div className="payment-breakdown-item">
                                <span>합계</span>
                                <span className="payment-total-amount">{finalTotal.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="payment-section payment-method">
                        <h2 className="payment-section-title">결제수단</h2>
                        
                        <div className="payment-method-options">
                            <div className="payment-method-option">
                                <input
                                    type="radio"
                                    id="card"
                                    name="payMethod"
                                    value="card"
                                    checked={orderData.payMethod === 'card'}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="card" className="payment-method-label">
                                    <span className="payment-method-icon">💳</span>
                                    신용카드
                                </label>
                            </div>
                        </div>

                        <div className="payment-actions">
                            <button
                                onClick={requestPayment}
                                disabled={loading}
                                className="payment-submit-button"
                            >
                                {loading ? '결제 처리 중... ⏳' : `${finalTotal.toLocaleString()}원 결제하기 💳`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;