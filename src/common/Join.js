import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/common/Join.css';

function Join() {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState({
        uid: '', upw: '', unm: '', umail: '', ubt: '', utel: '',
    });
    const [verifications, setVerifications] = useState({
        emailCode: '', smsCode: '', emailVerified: false, smsVerified: false,
    });
    const [uiState, setUiState] = useState({
        showEmailCodeInput: false, showSmsCodeInput: false, emailTimer: 0, smsTimer: 0,
    });
    const [error, setError] = useState('');

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
        }
    };

    const handleSendEmailCode = async () => {
        if (!userInfo.umail) { setError("이메일을 입력해주세요."); return; }
        try {
            const response = await axios.post('/api/email/send-code', { email: userInfo.umail });
            alert(response.data);
            setUiState(prev => ({ ...prev, showSmsCodeInput: false, showEmailCodeInput: true, emailTimer: 180 }));
        } catch (err) { setError(err.response?.data || "이메일 발송에 실패했습니다."); }
    };

    const handleVerifyEmailCode = async () => {
        try {
            const response = await axios.post('/api/email/verify-code', { email: userInfo.umail, code: verifications.emailCode });
            alert(response.data);
            setVerifications(prev => ({ ...prev, emailVerified: true, smsVerified: false }));
            setUiState(prev => ({ ...prev, showEmailCodeInput: false, emailTimer: 0 }));
        } catch (err) { setError(err.response?.data || "인증에 실패했습니다."); }
    };

    const handleSendSmsCode = async () => {
        if (!userInfo.utel) { setError("전화번호를 입력해주세요."); return; }
        try {
            const response = await axios.post('/api/sms/send-code', { phone: userInfo.utel });
            alert(response.data);
            setUiState(prev => ({ ...prev, showEmailCodeInput: false, showSmsCodeInput: true, smsTimer: 180 }));
        } catch (err) { setError(err.response?.data || "SMS 발송에 실패했습니다."); }
    };

    const handleVerifySmsCode = async () => {
        try {
            const response = await axios.post('/api/sms/verify-code', { phone: userInfo.utel, code: verifications.smsCode });
            alert(response.data);
            setVerifications(prev => ({ ...prev, smsVerified: true, emailVerified: false }));
            setUiState(prev => ({ ...prev, showSmsCodeInput: false, smsTimer: 0 }));
        } catch (err) { setError(err.response?.data || "인증에 실패했습니다."); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!verifications.emailVerified && !verifications.smsVerified) {
            setError("이메일 또는 문자 인증 중 하나를 완료해야 합니다.");
            return;
        }
        const finalUserInfo = { ...userInfo, emailVerified: verifications.emailVerified, smsVerified: verifications.smsVerified, enabled: true };
        try {
            await axios.post('/api/join', finalUserInfo);
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) { setError(err.response?.data || '회원가입 중 오류가 발생했습니다.'); }
    };

    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="user-form-container">
            <form onSubmit={handleSubmit} className="user-form join-form">
                <h2>회원가입</h2>
                {error && <div className="error-box">{error}</div>}

                <div className="form-group"><label>아이디</label><input type="text" name="uid" onChange={handleChange} required /></div>
                <div className="form-group"><label>비밀번호</label><input type="password" name="upw" onChange={handleChange} required /></div>
                <div className="form-group"><label>이름</label><input type="text" name="unm" onChange={handleChange} required /></div>
                <div className="form-group"><label>생년월일</label><input type="text" name="ubt" placeholder="예: 19900101" onChange={handleChange} /></div>

                <div className="form-group">
                    <label>이메일</label>
                    <div className="input-with-button">
                        <input type="email" name="umail" onChange={handleChange} readOnly={verifications.emailVerified || uiState.showEmailCodeInput} required />
                        {!verifications.emailVerified && (
                             <button type="button" onClick={handleSendEmailCode} disabled={uiState.emailTimer > 0}>
                                {uiState.emailTimer > 0 ? `재전송(${formatTime(uiState.emailTimer)})` : '이메일 인증'}
                            </button>
                        )}
                    </div>
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
                        <input type="tel" name="utel" placeholder="01012345678" onChange={handleChange} readOnly={verifications.smsVerified || uiState.showSmsCodeInput} />
                         {!verifications.smsVerified && (
                            <button type="button" onClick={handleSendSmsCode} disabled={uiState.smsTimer > 0}>
                                {uiState.smsTimer > 0 ? `재전송(${formatTime(uiState.smsTimer)})` : '문자 인증'}
                            </button>
                         )}
                    </div>
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