import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/common/Join.css';

function Join() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        uid: '', upw: '', unm: '', umail: '', ubt: '', utel: '',
    });
    const [errors, setErrors] = useState({});
    const [verifications, setVerifications] = useState({
        emailCode: '', smsCode: '', emailVerified: false, smsVerified: false,
    });
    const [uiState, setUiState] = useState({
        showEmailCodeInput: false, showSmsCodeInput: false, emailTimer: 0, smsTimer: 0,
    });

    // 이메일 타이머 useEffect
    useEffect(() => {
        let timer;
        if (uiState.emailTimer > 0) {
            timer = setInterval(() => setUiState(prev => ({ ...prev, emailTimer: prev.emailTimer - 1 })), 1000);
        }
        return () => clearInterval(timer);
    }, [uiState.emailTimer]);

    // SMS 타이머 useEffect
    useEffect(() => {
        let timer;
        if (uiState.smsTimer > 0) {
            timer = setInterval(() => setUiState(prev => ({ ...prev, smsTimer: prev.smsTimer - 1 })), 1000);
        }
        return () => clearInterval(timer);
    }, [uiState.smsTimer]);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            setUiState(prev => ({ ...prev, emailTimer: 0, smsTimer: 0 }));
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'emailCode' || name === 'smsCode') {
            setVerifications(prev => ({ ...prev, [name]: value }));
        } else {
            setUserInfo(prev => ({ ...prev, [name]: value }));
            
            // 이메일이 변경되면 즉시 타이머 중단 및 인증 상태 초기화
            if (name === 'umail') {
                setVerifications(prev => ({ ...prev, emailVerified: false, emailCode: '' }));
                setUiState(prev => ({ 
                    ...prev, 
                    showEmailCodeInput: false, 
                    emailTimer: 0
                }));
            }
            
            // 전화번호가 변경되면 즉시 타이머 중단 및 SMS 인증 상태 초기화
            if (name === 'utel') {
                setVerifications(prev => ({ ...prev, smsVerified: false, smsCode: '' }));
                setUiState(prev => ({ 
                    ...prev, 
                    showSmsCodeInput: false, 
                    smsTimer: 0
                }));
            }
            
            // 해당 필드의 에러 메시지 제거
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };
    
    const validate = (name, value, allValues) => {
        switch (name) {
            case 'uid':
                if (!value) return '아이디를 입력해주세요.';
                if (/\s/.test(value)) return '아이디에 공백을 포함할 수 없습니다.';
                if (value.length < 5 || value.length > 20) return '아이디는 5자 이상 20자 이하로 입력해주세요.';
                if (!/^[a-zA-Z0-9_-]+$/.test(value)) return '아이디는 영문, 숫자, 밑줄(_), 하이픈(-)만 사용할 수 있습니다.';
                return '';
            case 'upw':
                if (!value) return '비밀번호를 입력해주세요.';
                if (/\s/.test(value)) return '비밀번호에 공백을 포함할 수 없습니다.';
                if (value.length < 8 || value.length > 20) return '비밀번호는 8자 이상 20자 이하로 입력해주세요.';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) {
                    return '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
                }
                if (allValues.uid && value.toLowerCase() === allValues.uid.toLowerCase()) {
                    return '비밀번호는 아이디와 같을 수 없습니다.';
                }
                return '';
            case 'unm':
                if (!value) return '이름을 입력해주세요.';
                return '';
            case 'umail':
                if (!value) return '이메일을 입력해주세요.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return '올바른 이메일 형식을 입력해주세요.';
                }
                return '';
            case 'ubt':
                if (!value) return '생년월일을 입력해주세요.';
                if (!/^\d{8}$/.test(value)) return '생년월일은 8자리 숫자(YYYYMMDD)로 입력해주세요.';
                const year = parseInt(value.substring(0, 4));
                const month = parseInt(value.substring(4, 6));
                const day = parseInt(value.substring(6, 8));
                const currentYear = new Date().getFullYear();
                
                if (year < 1900 || year > currentYear) return '올바른 연도를 입력해주세요.';
                if (month < 1 || month > 12) return '올바른 월을 입력해주세요.';
                if (day < 1 || day > 31) return '올바른 일을 입력해주세요.';
                
                return '';
            case 'utel':
                if (!value) return '전화번호를 입력해주세요.';
                if (!/^\d{10,11}$/.test(value)) return '전화번호는 10~11자리 숫자만 입력해주세요.';
                if (!/^01[0-9]/.test(value)) return '올바른 휴대폰 번호 형식을 입력해주세요.';
                return '';
            default:
                return '';
        }
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMessage = validate(name, value, userInfo);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handleSendEmailCode = async () => {
        const emailError = validate('umail', userInfo.umail, userInfo);
        if (emailError) { 
            setErrors(prev => ({ ...prev, umail: emailError })); 
            return; 
        }
        
        setErrors(prev => ({ ...prev, general: '' }));
        
        try {
            const response = await axios.post('/api/email/send-code', { email: userInfo.umail });
            const message = typeof response.data === 'string' ? response.data : 
                           response.data?.message || '이메일 인증 코드가 발송되었습니다.';
            alert(message);
            setUiState(prev => ({ 
                ...prev, 
                showSmsCodeInput: false, 
                showEmailCodeInput: true, 
                emailTimer: 180 
            }));
            setVerifications(prev => ({ ...prev, emailCode: '' }));
        } catch (err) { 
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || "이메일 발송에 실패했습니다.";
            setErrors({ general: errorMessage }); 
        }
    };

    const handleVerifyEmailCode = async () => {
        if (!verifications.emailCode.trim()) {
            setErrors({ general: "인증 코드를 입력해주세요." });
            return;
        }
        
        setErrors(prev => ({ ...prev, general: '' }));
        
        try {
            const response = await axios.post('/api/email/verify-code', { 
                email: userInfo.umail, 
                code: verifications.emailCode.trim() 
            });
            const message = typeof response.data === 'string' ? response.data : 
                           response.data?.message || '이메일 인증이 완료되었습니다.';
            alert(message);
            setVerifications(prev => ({ ...prev, emailVerified: true, smsVerified: false }));
            setUiState(prev => ({ ...prev, showEmailCodeInput: false, emailTimer: 0 }));
        } catch (err) { 
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || "인증에 실패했습니다.";
            setErrors({ general: errorMessage }); 
        }
    };

    const handleSendSmsCode = async () => {
        const phoneError = validate('utel', userInfo.utel, userInfo);
        if (phoneError) { 
            setErrors(prev => ({ ...prev, utel: phoneError })); 
            return; 
        }
        
        setErrors(prev => ({ ...prev, general: '' }));
        
        try {
            const response = await axios.post('/api/sms/send-code', { phone: userInfo.utel });
            const message = typeof response.data === 'string' ? response.data : 
                           response.data?.message || 'SMS 인증 코드가 발송되었습니다.';
            alert(message);
            setUiState(prev => ({ 
                ...prev, 
                showEmailCodeInput: false, 
                showSmsCodeInput: true, 
                smsTimer: 180 
            }));
            setVerifications(prev => ({ ...prev, smsCode: '' }));
        } catch (err) { 
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || "SMS 발송에 실패했습니다.";
            setErrors({ general: errorMessage }); 
        }
    };

    const handleVerifySmsCode = async () => {
        if (!verifications.smsCode.trim()) {
            setErrors({ general: "인증 코드를 입력해주세요." });
            return;
        }
        
        setErrors(prev => ({ ...prev, general: '' }));
        
        try {
            const response = await axios.post('/api/sms/verify-code', { 
                phone: userInfo.utel, 
                code: verifications.smsCode.trim() 
            });
            const message = typeof response.data === 'string' ? response.data : 
                           response.data?.message || 'SMS 인증이 완료되었습니다.';
            alert(message);
            setVerifications(prev => ({ ...prev, smsVerified: true, emailVerified: false }));
            setUiState(prev => ({ ...prev, showSmsCodeInput: false, smsTimer: 0 }));
        } catch (err) { 
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || "인증에 실패했습니다.";
            setErrors({ general: errorMessage }); 
        }
    };
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = Object.keys(userInfo).reduce((acc, key) => {
            const errorMessage = validate(key, userInfo[key], userInfo);
            if (errorMessage) acc[key] = errorMessage;
            return acc;
        }, {});
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!verifications.emailVerified && !verifications.smsVerified) {
            setErrors({ general: "이메일 또는 문자 인증 중 하나를 완료해야 합니다." });
            return;
        }
        
        setErrors({});

        const finalUserInfo = { 
            ...userInfo, 
            emailVerified: verifications.emailVerified, 
            smsVerified: verifications.smsVerified, 
            enabled: true 
        };
        
        try {
            await axios.post('/api/join', finalUserInfo);
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
            
            // 이메일 관련 에러인 경우 이메일 인증 상태 초기화
            if (errorMessage.includes('이메일') || 
                errorMessage.includes('email') || 
                errorMessage.includes('이미 가입된') || 
                errorMessage.includes('already exists') || 
                errorMessage.includes('이미 존재') ||
                errorMessage.includes('중복') ||
                errorMessage.includes('duplicate')) {
                
                setVerifications(prev => ({ 
                    ...prev, 
                    emailVerified: false, 
                    emailCode: '' 
                }));
                setUiState(prev => ({ 
                    ...prev, 
                    showEmailCodeInput: false, 
                    emailTimer: 0 
                }));
                
                setErrors({ general: errorMessage + " 다른 이메일 주소를 입력해주세요." });
                return;
            }

            // 아이디 관련 에러인 경우
            if (errorMessage.includes('아이디') || errorMessage.includes('username') || errorMessage.includes('id')) {
                setErrors({ general: errorMessage + " 다른 아이디를 입력해주세요." });
                return;
            }
            
            setErrors({ general: errorMessage });
        }
    };

    return (
        <div className="user-form-container">
            <form onSubmit={handleSubmit} className="user-form join-form">
                <h2>회원가입</h2>
                {errors.general && <div className="error-box">{errors.general}</div>}

                <div className="form-group">
                    <label>아이디</label>
                    <input type="text" name="uid" value={userInfo.uid} onChange={handleChange} onBlur={handleBlur} required />
                    {errors.uid && <div className="error-message">{errors.uid}</div>}
                </div>
                
                <div className="form-group">
                    <label>비밀번호</label>
                    <input type="password" name="upw" value={userInfo.upw} onChange={handleChange} onBlur={handleBlur} required />
                    {errors.upw && <div className="error-message">{errors.upw}</div>}
                </div>
                
                <div className="form-group">
                    <label>이름</label>
                    <input type="text" name="unm" value={userInfo.unm} onChange={handleChange} onBlur={handleBlur} required />
                    {errors.unm && <div className="error-message">{errors.unm}</div>}
                </div>
                
                <div className="form-group">
                    <label>생년월일</label>
                    <input type="text" name="ubt" value={userInfo.ubt} onChange={handleChange} onBlur={handleBlur} placeholder="예: 19900101" required />
                    {errors.ubt && <div className="error-message">{errors.ubt}</div>}
                </div>
                
                <div className="form-group">
                    <label>이메일</label>
                    <div className="input-with-button">
                        <input 
                            type="email" 
                            name="umail" 
                            value={userInfo.umail} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            readOnly={verifications.emailVerified} 
                            required 
                        />
                        {!verifications.emailVerified && (
                             <button 
                                type="button" 
                                onClick={handleSendEmailCode} 
                                disabled={uiState.emailTimer > 0}
                            >
                                {uiState.emailTimer > 0 ? `재전송(${formatTime(uiState.emailTimer)})` : '이메일 인증'}
                            </button>
                        )}
                    </div>
                    {errors.umail && <div className="error-message">{errors.umail}</div>}
                    {verifications.emailVerified && <span className="verified-text">✅ 이메일 인증 완료</span>}
                </div>
                
                {uiState.showEmailCodeInput && (
                    <div className="form-group">
                        <label>이메일 인증 코드</label>
                        <div className="input-with-button">
                            <input 
                                type="text" 
                                name="emailCode" 
                                value={verifications.emailCode}
                                onChange={handleChange} 
                                placeholder="인증 코드를 입력하세요"
                            />
                            <button type="button" onClick={handleVerifyEmailCode}>인증 확인</button>
                        </div>
                    </div>
                )}
                
                <div className="form-group">
                    <label>전화번호</label>
                    <div className="input-with-button">
                        <input 
                            type="tel" 
                            name="utel" 
                            value={userInfo.utel} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            placeholder="01012345678" 
                            readOnly={verifications.smsVerified} 
                            required 
                        />
                        {!verifications.smsVerified && (
                           <button 
                                type="button" 
                                onClick={handleSendSmsCode} 
                                disabled={uiState.smsTimer > 0}
                            >
                                {uiState.smsTimer > 0 ? `재전송(${formatTime(uiState.smsTimer)})` : '문자 인증'}
                            </button>
                        )}
                    </div>
                    {errors.utel && <div className="error-message">{errors.utel}</div>}
                    {verifications.smsVerified && <span className="verified-text">✅ 문자 인증 완료</span>}
                </div>
                
                {uiState.showSmsCodeInput && (
                    <div className="form-group">
                        <label>문자 인증 코드</label>
                        <div className="input-with-button">
                            <input 
                                type="text" 
                                name="smsCode" 
                                value={verifications.smsCode}
                                onChange={handleChange} 
                                placeholder="인증 코드를 입력하세요"
                            />
                            <button type="button" onClick={handleVerifySmsCode}>인증 확인</button>
                        </div>
                    </div>
                )}
                
                <button type="submit" className="submit-btn">회원가입 완료</button>
            </form>
        </div>
    );
}

export default Join;