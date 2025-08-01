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

    useEffect(() => {
        let timer;
        if (uiState.emailTimer > 0) {
            timer = setInterval(() => setUiState(prev => ({ ...prev, emailTimer: prev.emailTimer - 1 })), 1000);
        }
        return () => clearInterval(timer);
    }, [uiState.emailTimer]);

    useEffect(() => {
        let timer;
        if (uiState.smsTimer > 0) {
            timer = setInterval(() => setUiState(prev => ({ ...prev, smsTimer: prev.smsTimer - 1 })), 1000);
        }
        return () => clearInterval(timer);
    }, [uiState.smsTimer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'emailCode' || name === 'smsCode') {
            setVerifications(prev => ({ ...prev, [name]: value }));
        } else {
            setUserInfo(prev => ({ ...prev, [name]: value }));
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
                return '';
            case 'utel':
                if (!value) return '전화번호를 입력해주세요.';
                if (!/^\d{10,11}$/.test(value)) return '전화번호는 10~11자리 숫자만 입력해주세요.';
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
        if (emailError) { setErrors(prev => ({ ...prev, umail: emailError })); return; }
        try {
            const response = await axios.post('/api/email/send-code', { email: userInfo.umail });
            alert(response.data);
            setUiState(prev => ({ ...prev, showSmsCodeInput: false, showEmailCodeInput: true, emailTimer: 180 }));
        } catch (err) { setErrors({ general: err.response?.data || "이메일 발송에 실패했습니다." }); }
    };

    const handleVerifyEmailCode = async () => {
        try {
            const response = await axios.post('/api/email/verify-code', { email: userInfo.umail, code: verifications.emailCode });
            alert(response.data);
            setVerifications(prev => ({ ...prev, emailVerified: true, smsVerified: false }));
            setUiState(prev => ({ ...prev, showEmailCodeInput: false, emailTimer: 0 }));
        } catch (err) { setErrors({ general: err.response?.data || "인증에 실패했습니다." }); }
    };

    const handleSendSmsCode = async () => {
        if (!userInfo.utel) { setErrors({ general: "전화번호를 입력해주세요." }); return; }
        try {
            const response = await axios.post('/api/sms/send-code', { phone: userInfo.utel });
            alert(response.data);
            setUiState(prev => ({ ...prev, showEmailCodeInput: false, showSmsCodeInput: true, smsTimer: 180 }));
        } catch (err) { setErrors({ general: err.response?.data || "SMS 발송에 실패했습니다." }); }
    };

    const handleVerifySmsCode = async () => {
        try {
            const response = await axios.post('/api/sms/verify-code', { phone: userInfo.utel, code: verifications.smsCode });
            alert(response.data);
            setVerifications(prev => ({ ...prev, smsVerified: true, emailVerified: false }));
            setUiState(prev => ({ ...prev, showSmsCodeInput: false, smsTimer: 0 }));
        } catch (err) { setErrors({ general: err.response?.data || "인증에 실패했습니다." }); }
    };
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = Object.keys(userInfo).reduce((acc, key) => {
            if (['uid', 'upw', 'unm', 'umail'].includes(key)) {
                const errorMessage = validate(key, userInfo[key], userInfo);
                if (errorMessage) acc[key] = errorMessage;
            }
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

        const finalUserInfo = { ...userInfo, emailVerified: verifications.emailVerified, smsVerified: verifications.smsVerified, enabled: true };
        try {
            await axios.post('/api/join', finalUserInfo);
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            setErrors({ general: err.response?.data || '회원가입 중 오류가 발생했습니다.' });
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
                        <input type="email" name="umail" value={userInfo.umail} onChange={handleChange} onBlur={handleBlur} readOnly={verifications.emailVerified || uiState.showEmailCodeInput} required />
                        {!verifications.emailVerified && (
                             <button type="button" onClick={handleSendEmailCode} disabled={uiState.emailTimer > 0}>{uiState.emailTimer > 0 ? `재전송(${formatTime(uiState.emailTimer)})` : '이메일 인증'}</button>
                        )}
                    </div>
                    {errors.umail && <div className="error-message">{errors.umail}</div>}
                    {verifications.emailVerified && <span className="verified-text">✅ 이메일 인증 완료</span>}
                </div>
                {uiState.showEmailCodeInput && (
                    <div className="form-group">
                        <label>이메일 인증 코드</label>
                        <div className="input-with-button">
                            <input type="text" name="emailCode" onChange={handleChange} />
                            <button type="button" onClick={handleVerifyEmailCode}>인증 확인</button>
                        </div>
                    </div>
                )}
                
                <div className="form-group">
                    <label>전화번호</label>
                    <div className="input-with-button">
                        <input type="tel" name="utel" value={userInfo.utel} onChange={handleChange} onBlur={handleBlur} placeholder="01012345678" readOnly={verifications.smsVerified || uiState.showSmsCodeInput} required />
                        {!verifications.smsVerified && (
                           <button type="button" onClick={handleSendSmsCode} disabled={uiState.smsTimer > 0}>{uiState.smsTimer > 0 ? `재전송(${formatTime(uiState.smsTimer)})` : '문자 인증'}</button>
                        )}
                    </div>
                    {errors.utel && <div className="error-message">{errors.utel}</div>}
                    {verifications.smsVerified && <span className="verified-text">✅ 문자 인증 완료</span>}
                </div>
                {uiState.showSmsCodeInput && (
                    <div className="form-group">
                        <label>문자 인증 코드</label>
                        <div className="input-with-button">
                            <input type="text" name="smsCode" onChange={handleChange} />
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