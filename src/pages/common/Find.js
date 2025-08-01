import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/common/Find.css';

function Find() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('id');
    const [authMethod, setAuthMethod] = useState('sms');
    const [timer, setTimer] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [findInfo, setFindInfo] = useState({ name: '', phone: '', email: '', code: '' });

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (showCodeInput) {
            setShowCodeInput(false);
            setMessage("인증 시간이 만료되었습니다. 다시 시도해주세요.");
        }
    }, [timer, showCodeInput]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFindInfo(prev => ({ ...prev, [name]: value }));
    };

    const resetStates = () => {
        setMessage('');
        setError('');
        setTimer(0);
        setShowCodeInput(false);
        setIsVerified(false);
    };

    const handleAuthMethodChange = (e) => {
        setAuthMethod(e.target.value);
        resetStates();
        setFindInfo({ name: '', phone: '', email: '', code: '' });
    };
    
    const handleSendCode = async () => {
        resetStates();
        if (authMethod === 'sms') {
            if (!findInfo.phone) { setError("전화번호를 입력해주세요."); return; }
            try {
                const response = await axios.post('/api/sms/send-code', { phone: findInfo.phone });
                setMessage(response.data);
                setShowCodeInput(true);
                setTimer(180);
            } catch (err) { setError(err.response?.data || "SMS 발송에 실패했습니다."); }
        } else { // email
            if (!findInfo.email) { setError("이메일을 입력해주세요."); return; }
            try {
                const response = await axios.post('/api/email/send-code', { email: findInfo.email });
                setMessage(response.data);
                setShowCodeInput(true);
                setTimer(180);
            } catch (err) { setError(err.response?.data || "이메일 발송에 실패했습니다."); }
        }
    };
    
    const handleVerifyCode = async () => {
        setError('');
        if (!findInfo.code) { setError("인증번호를 입력해주세요."); return; }
        if (authMethod === 'sms') {
            try {
                const response = await axios.post('/api/sms/verify-code', { phone: findInfo.phone, code: findInfo.code });
                setMessage(response.data);
                setIsVerified(true);
                setShowCodeInput(false);
                setTimer(0);
            } catch (err) { setError(err.response?.data || "인증에 실패했습니다."); }
        } else { // email
            try {
                const response = await axios.post('/api/email/verify-code', { email: findInfo.email, code: findInfo.code });
                setMessage(response.data);
                setIsVerified(true);
                setShowCodeInput(false);
                setTimer(0);
            } catch (err) { setError(err.response?.data || "인증에 실패했습니다."); }
        }
    };

    const handleFindId = async () => {
        if (!isVerified) { setError("먼저 본인 인증을 완료해주세요."); return; }
        if (authMethod === 'sms') {
            try {
                const response = await axios.post('/api/find-id', { unm: findInfo.name, utel: findInfo.phone });
                setMessage(`회원님의 아이디는 [ ${response.data.uid} ] 입니다.`);
            } catch (err) { setError(err.response?.data.message || "사용자 정보를 찾을 수 없습니다."); }
        } else {
            try {
                const response = await axios.post('/api/find-id-by-email', { unm: findInfo.name, umail: findInfo.email });
                setMessage(`회원님의 아이디는 [ ${response.data.uid} ] 입니다.`);
            } catch (err) { setError(err.response?.data.message || "사용자 정보를 찾을 수 없습니다."); }
        }
    };

    const handleRequestPasswordReset = async () => {
        resetStates();
        if (!findInfo.email) {
            setError("가입 시 사용한 이메일을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post('/api/request-password-reset', { umail: findInfo.email });
            setMessage(response.data);
        } catch (err) {
            setError(err.response?.data.message || "오류가 발생했습니다.");
        }
    };
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="user-form-container">
            <div className="user-form find-form">
                <div className="tab-buttons">
                    <button onClick={() => { setActiveTab('id'); resetStates(); }} className={activeTab === 'id' ? 'active' : ''}>아이디 찾기</button>
                    <button onClick={() => { setActiveTab('pw'); resetStates(); }} className={activeTab === 'pw' ? 'active' : ''}>비밀번호 찾기</button>
                </div>
                
                {message && !error && <div className="info-box">{message}</div>}
                {error && <div className="error-box">{error}</div>}

                {activeTab === 'id' ? (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h2>아이디 찾기</h2>
                        <div className="auth-method-selector">
                            <label><input type="radio" value="sms" name="authMethod" checked={authMethod === 'sms'} onChange={handleAuthMethodChange} /> 휴대폰으로 찾기</label>
                            <label><input type="radio" value="email" name="authMethod" checked={authMethod === 'email'} onChange={handleAuthMethodChange} /> 이메일로 찾기</label>
                        </div>
                        <div className="form-group"><label>이름</label><input type="text" name="name" value={findInfo.name} onChange={handleChange} required /></div>

                        {authMethod === 'sms' ? (
                            <div className="form-group">
                                <label>전화번호</label>
                                <div className="input-with-button">
                                    <input type="tel" name="phone" value={findInfo.phone} onChange={handleChange} readOnly={isVerified || showCodeInput} required />
                                    <button type="button" onClick={handleSendCode} disabled={timer > 0}>{timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>이메일</label>
                                <div className="input-with-button">
                                    <input type="email" name="email" value={findInfo.email} onChange={handleChange} readOnly={isVerified || showCodeInput} required />
                                    <button type="button" onClick={handleSendCode} disabled={timer > 0}>{timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}</button>
                                </div>
                            </div>
                        )}
                        
                        {showCodeInput && (
                            <div className="form-group">
                                <label>인증번호</label>
                                <div className="input-with-button">
                                    <input type="text" name="code" value={findInfo.code} onChange={handleChange} required />
                                    <button type="button" onClick={handleVerifyCode}>인증 확인</button>
                                </div>
                            </div>
                        )}
                        <button type="button" className="submit-btn" disabled={!isVerified} onClick={handleFindId}>아이디 찾기</button>
                    </form>
                ) : (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h2>비밀번호 찾기</h2>
                        <div className="form-group">
                            <label>이메일</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={findInfo.email} 
                                onChange={handleChange} 
                                placeholder="가입 시 사용한 이메일 주소" 
                                required 
                            />
                        </div>
                        <button type="button" className="submit-btn" onClick={handleRequestPasswordReset}>
                            비밀번호 재설정 링크 받기
                        </button>
                    </form>
                )}
                <div className="link-group"><span onClick={() => navigate('/login')}>로그인 페이지로</span></div>
            </div>
        </div>
    );
}

export default Find;