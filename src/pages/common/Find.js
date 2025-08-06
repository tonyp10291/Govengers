/* eslint-disable no-unused-vars */
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
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [foundUserId, setFoundUserId] = useState('');
    
    const [findInfo, setFindInfo] = useState({ 
        name: '', 
        phone: '', 
        email: '', 
        code: '',
        uid: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (showCodeInput && timer === 0) {
            setShowCodeInput(false);
            setMessage("인증 시간이 만료되었습니다. 다시 시도해주세요.");
        }
        // eslint-disable-next-line
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
        setShowPasswordReset(false);
        setFoundUserId('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetStates();
        setFindInfo({ 
            name: '', 
            phone: '', 
            email: '', 
            code: '',
            uid: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleAuthMethodChange = (e) => {
        setAuthMethod(e.target.value);
        resetStates();
        setFindInfo(prev => ({ 
            ...prev, 
            phone: '', 
            email: '', 
            code: '',
            uid: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }));
    };
    
    const handleSendCode = async () => {
        resetStates();
        
        if (activeTab === 'id') {
            if (authMethod === 'sms') {
                if (!findInfo.phone) { setError("전화번호를 입력해주세요."); return; }
                try {
                    const response = await axios.post('/api/sms/send-code', { phone: findInfo.phone });
                    const message = typeof response.data === 'string' ? response.data : 
                                   response.data?.message || 'SMS 인증 코드가 발송되었습니다.';
                    setMessage(message);
                    setShowCodeInput(true);
                    setTimer(180);
                } catch (err) { 
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "SMS 발송에 실패했습니다.";
                    setError(errorMessage); 
                }
            } else {
                if (!findInfo.email) { setError("이메일을 입력해주세요."); return; }
                try {
                    const response = await axios.post('/api/email/send-code', { email: findInfo.email });
                    const message = typeof response.data === 'string' ? response.data : 
                                   response.data?.message || '이메일 인증 코드가 발송되었습니다.';
                    setMessage(message);
                    setShowCodeInput(true);
                    setTimer(180);
                } catch (err) { 
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "이메일 발송에 실패했습니다.";
                    setError(errorMessage); 
                }
            }
        } else {
            if (!findInfo.uid) { setError("아이디를 입력해주세요."); return; }
            
            if (authMethod === 'sms') {
                if (!findInfo.phone) { setError("전화번호를 입력해주세요."); return; }
                try {
                    const response = await axios.post('/api/verify-user-for-password-reset', { 
                        uid: findInfo.uid, 
                        utel: findInfo.phone 
                    });
                    
                    const codeResponse = await axios.post('/api/sms/send-code', { phone: findInfo.phone });
                    const message = typeof codeResponse.data === 'string' ? codeResponse.data : 
                                   codeResponse.data?.message || 'SMS 인증 코드가 발송되었습니다.';
                    setMessage(message);
                    setShowCodeInput(true);
                    setTimer(180);
                } catch (err) {
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "사용자 정보를 확인할 수 없습니다.";
                    setError(errorMessage);
                }
            } else {
                if (!findInfo.email) { setError("이메일을 입력해주세요."); return; }
                
                try {
                    const response = await axios.post('/api/verify-user-for-password-reset', { 
                        uid: findInfo.uid, 
                        umail: findInfo.email 
                    });
                    
                    const codeResponse = await axios.post('/api/email/send-code', { email: findInfo.email });
                    const message = typeof codeResponse.data === 'string' ? codeResponse.data : 
                                   codeResponse.data?.message || '이메일 인증 코드가 발송되었습니다.';
                    setMessage(message);
                    setShowCodeInput(true);
                    setTimer(180);
                } catch (err) {
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "사용자 정보를 확인할 수 없습니다.";
                    setError(errorMessage);
                }
            }
        }
    };
    
    const handleVerifyCode = async () => {
        setError('');
        if (!findInfo.code) { setError("인증번호를 입력해주세요."); return; }
        
        if (activeTab === 'id') {
            if (authMethod === 'sms') {
                try {
                    // eslint-disable-next-line no-unused-vars
                    const response = await axios.post('/api/sms/verify-code', { 
                        phone: findInfo.phone, 
                        code: findInfo.code 
                    });
                    const message = typeof response.data === 'string' ? response.data : 
                                   response.data?.message || 'SMS 인증이 완료되었습니다.';
                    setMessage(message);
                    setIsVerified(true);
                    setShowCodeInput(false);
                    setTimer(0);
                    
                    handleFindId();
                } catch (err) { 
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "인증에 실패했습니다.";
                    setError(errorMessage); 
                }
            } else {
                try {
                    // eslint-disable-next-line no-unused-vars
                    const response = await axios.post('/api/email/verify-code', { 
                        email: findInfo.email, 
                        code: findInfo.code 
                    });
                    const message = typeof response.data === 'string' ? response.data : 
                                   response.data?.message || '이메일 인증이 완료되었습니다.';
                    setMessage(message);
                    setIsVerified(true);
                    setShowCodeInput(false);
                    setTimer(0);
                    
                    // 인증 완료 즉시 아이디 찾기
                    handleFindId();
                } catch (err) { 
                    const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                       err.response?.data?.message || "인증에 실패했습니다.";
                    setError(errorMessage); 
                }
            }
        } else {
            try {
                if (authMethod === 'sms') {
                    const response = await axios.post('/api/sms/verify-code', { 
                        phone: findInfo.phone, 
                        code: findInfo.code 
                    });
                } else {
                    const response = await axios.post('/api/email/verify-code', { 
                        email: findInfo.email, 
                        code: findInfo.code 
                    });
                }
                
                const message = "인증이 완료되었습니다.";
                setMessage(message);
                setIsVerified(true);
                setShowCodeInput(false);
                setTimer(0);
                setShowPasswordReset(true);
            } catch (err) { 
                const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                   err.response?.data?.message || "인증에 실패했습니다.";
                setError(errorMessage); 
            }
        }
    };

    const handleFindId = async () => {
        console.log("handleFindId 호출됨", { authMethod, findInfo });
        if (authMethod === 'sms') {
            try {
                console.log("SMS로 아이디 찾기 요청", { unm: findInfo.name, utel: findInfo.phone });
                const response = await axios.post('/api/find-id', { 
                    unm: findInfo.name, 
                    utel: findInfo.phone 
                });
                console.log("SMS 아이디 찾기 응답", response.data);
                setFoundUserId(response.data.uid);
                setMessage("아이디 찾기가 완료되었습니다.");
                setError('');
            } catch (err) { 
                console.error("SMS 아이디 찾기 에러", err);
                const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                   err.response?.data?.message || "사용자 정보를 찾을 수 없습니다.";
                setError(errorMessage); 
            }
        } else {
            try {
                console.log("이메일로 아이디 찾기 요청", { unm: findInfo.name, umail: findInfo.email });
                const response = await axios.post('/api/find-id-by-email', { 
                    unm: findInfo.name, 
                    umail: findInfo.email 
                });
                console.log("이메일 아이디 찾기 응답", response.data);
                setFoundUserId(response.data.uid);
                setMessage(`회원님의 아이디는 [ ${response.data.uid} ] 입니다.`);
                setError('');
            } catch (err) { 
                console.error("이메일 아이디 찾기 에러", err);
                const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                                   err.response?.data?.message || "사용자 정보를 찾을 수 없습니다.";
                setError(errorMessage); 
            }
        }
    };

    const validatePasswordReset = () => {
        if (!findInfo.newPassword) {
            setError("새 비밀번호를 입력해주세요.");
            return false;
        }
        if (findInfo.newPassword.length < 8 || findInfo.newPassword.length > 20) {
            setError("새 비밀번호는 8자 이상 20자 이하로 입력해주세요.");
            return false;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(findInfo.newPassword)) {
            setError("새 비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.");
            return false;
        }
        if (findInfo.newPassword !== findInfo.confirmPassword) {
            setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return false;
        }
        return true;
    };

    const handlePasswordReset = async () => {
        if (!validatePasswordReset()) return;
        
        try {
            const response = await axios.post('/api/reset-password', {
                uid: findInfo.uid,
                newPassword: findInfo.newPassword
            });
            
            const message = typeof response.data === 'string' ? response.data : 
                           response.data?.message || '비밀번호가 성공적으로 변경되었습니다.';
            alert(message);
            navigate('/login');
        } catch (err) {
            const errorMessage = typeof err.response?.data === 'string' ? err.response.data :
                               err.response?.data?.message || "비밀번호 변경에 실패했습니다.";
            setError(errorMessage);
        }
    };
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="user-form-container">
            <div className="user-form find-form">
                <div className="tab-buttons">
                    <button 
                        onClick={() => handleTabChange('id')} 
                        className={activeTab === 'id' ? 'active' : ''}
                    >
                        아이디 찾기
                    </button>
                    <button 
                        onClick={() => handleTabChange('pw')} 
                        className={activeTab === 'pw' ? 'active' : ''}
                    >
                        비밀번호 찾기
                    </button>
                </div>
                
                {error && <div className="error-box">{error}</div>}

                {activeTab === 'id' ? (
                    <>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <h2>아이디 찾기</h2>
                            
                            {!foundUserId && (
                                <>
                                    <div className="auth-method-selector">
                                        <label>
                                            <input 
                                                type="radio" 
                                                value="sms" 
                                                name="authMethod" 
                                                checked={authMethod === 'sms'} 
                                                onChange={handleAuthMethodChange} 
                                            /> 
                                            휴대폰으로 찾기
                                        </label>
                                        <label>
                                            <input 
                                                type="radio" 
                                                value="email" 
                                                name="authMethod" 
                                                checked={authMethod === 'email'} 
                                                onChange={handleAuthMethodChange} 
                                            /> 
                                            이메일로 찾기
                                        </label>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>이름</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={findInfo.name} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    {authMethod === 'sms' ? (
                                        <div className="form-group">
                                            <label>전화번호</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    value={findInfo.phone} 
                                                    onChange={handleChange} 
                                                    readOnly={isVerified || showCodeInput} 
                                                    required 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleSendCode} 
                                                    disabled={timer > 0}
                                                >
                                                    {timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>이메일</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    value={findInfo.email} 
                                                    onChange={handleChange} 
                                                    readOnly={isVerified || showCodeInput} 
                                                    required 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleSendCode} 
                                                    disabled={timer > 0}
                                                >
                                                    {timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {showCodeInput && (
                                        <div className="form-group">
                                            <label>인증번호</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="text" 
                                                    name="code" 
                                                    value={findInfo.code} 
                                                    onChange={handleChange} 
                                                    required 
                                                />
                                                <button type="button" onClick={handleVerifyCode}>인증 확인</button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {message && !error && !foundUserId && activeTab === 'id' && (
                                        <div className="info-box">{message}</div>
                                    )}
                                </>
                            )}
                        </form>
                        
                        {foundUserId && (
                            <div className="id-result">
                                회원님의 아이디는 [ {foundUserId} ] 입니다.
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <h2>비밀번호 찾기</h2>
                            
                            {!showPasswordReset ? (
                                <>
                                    <div className="auth-method-selector">
                                        <label>
                                            <input 
                                                type="radio" 
                                                value="sms" 
                                                name="authMethod" 
                                                checked={authMethod === 'sms'} 
                                                onChange={handleAuthMethodChange} 
                                            /> 
                                            휴대폰으로 찾기
                                        </label>
                                        <label>
                                            <input 
                                                type="radio" 
                                                value="email" 
                                                name="authMethod" 
                                                checked={authMethod === 'email'} 
                                                onChange={handleAuthMethodChange} 
                                            /> 
                                            이메일로 찾기
                                        </label>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>아이디</label>
                                        <input 
                                            type="text" 
                                            name="uid" 
                                            value={findInfo.uid} 
                                            onChange={handleChange} 
                                            placeholder="가입 시 사용한 아이디" 
                                            readOnly={isVerified || showCodeInput}
                                            required 
                                        />
                                    </div>
                                    
                                    {authMethod === 'sms' ? (
                                        <div className="form-group">
                                            <label>전화번호</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    value={findInfo.phone} 
                                                    onChange={handleChange} 
                                                    placeholder="가입 시 사용한 전화번호" 
                                                    readOnly={isVerified || showCodeInput}
                                                    required 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleSendCode} 
                                                    disabled={timer > 0}
                                                >
                                                    {timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>이메일</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    value={findInfo.email} 
                                                    onChange={handleChange} 
                                                    placeholder="가입 시 사용한 이메일 주소" 
                                                    readOnly={isVerified || showCodeInput}
                                                    required 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleSendCode} 
                                                    disabled={timer > 0}
                                                >
                                                    {timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {showCodeInput && (
                                        <div className="form-group">
                                            <label>인증번호</label>
                                            <div className="input-with-button">
                                                <input 
                                                    type="text" 
                                                    name="code" 
                                                    value={findInfo.code} 
                                                    onChange={handleChange} 
                                                    required 
                                                />
                                                <button type="button" onClick={handleVerifyCode}>인증 확인</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="password-reset-form">
                                    
                                    <div className="form-group">
                                        <label>새 비밀번호</label>
                                        <input 
                                            type="password" 
                                            name="newPassword" 
                                            value={findInfo.newPassword} 
                                            onChange={handleChange} 
                                            placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>새 비밀번호 확인</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            value={findInfo.confirmPassword} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    
                                    <button type="button" className="submit-btn" onClick={handlePasswordReset}>
                                        비밀번호 변경
                                    </button>
                                </div>
                            )}
                        </form>
                    </>
                )}
                
                <div className="link-group">
                    <span onClick={() => navigate('/login')}>로그인 페이지로</span>
                </div>
            </div>
        </div>
    );
}

export default Find;