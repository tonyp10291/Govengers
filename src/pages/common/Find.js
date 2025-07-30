import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/common/Find.css';

function Find() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('id');
    const [timer, setTimer] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [findIdInfo, setFindIdInfo] = useState({ name: '', phone: '', code: '' });
    const [foundId, setFoundId] = useState('');
    
    // (비밀번호 찾기 관련 상태는 추후 구현)

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setShowCodeInput(false);
        }
    }, [timer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (activeTab === 'id') {
            setFindIdInfo(prev => ({ ...prev, [name]: value }));
        }
        // TODO: 비밀번호 찾기 로직
    };
    
    const handleSendCode = async () => {
        setMessage('');
        setError('');
        if (!findIdInfo.phone) {
            setError("전화번호를 입력해주세요.");
            return;
        }
        try {
            // 백엔드에 인증번호 발송 요청
            const response = await axios.post('/api/sms/send-code', { phone: findIdInfo.phone });
            setMessage(response.data);
            setShowCodeInput(true);
            setTimer(180);
        } catch (err) {
            setError(err.response?.data || "SMS 발송에 실패했습니다.");
        }
    };
    
    const handleVerifyCode = async () => {
        setError('');
        if (!findIdInfo.code) {
            setError("인증번호를 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post('/api/sms/verify-code', { phone: findIdInfo.phone, code: findIdInfo.code });
            setMessage(response.data);
            setIsVerified(true);
            setShowCodeInput(false);
            setTimer(0);
        } catch (err) {
            setError(err.response?.data || "인증에 실패했습니다.");
        }
    };

    // TODO: 아이디 찾기 최종 로직 구현 필요
    
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    const resetStates = () => {
        setMessage(''); setError(''); setTimer(0); setShowCodeInput(false); setFoundId('');
        setIsVerified(false); setFindIdInfo({ name: '', phone: '', code: '' });
    };

    return (
        <div className="user-form-container">
            <div className="user-form find-form">
                <div className="tab-buttons">
                    <button onClick={() => { setActiveTab('id'); resetStates(); }} className={activeTab === 'id' ? 'active' : ''}>아이디 찾기</button>
                    <button onClick={() => setActiveTab('pw')} className={activeTab === 'pw' ? 'active' : ''}>비밀번호 찾기</button>
                </div>
                
                {message && <div className="info-box">{message}</div>}
                {error && <div className="error-box">{error}</div>}

                {activeTab === 'id' ? (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h2>아이디 찾기</h2>
                        <div className="form-group"><label>이름</label><input type="text" name="name" onChange={handleChange} required /></div>
                        <div className="form-group">
                            <label>전화번호</label>
                            <div className="input-with-button">
                                <input type="tel" name="phone" onChange={handleChange} readOnly={isVerified || showCodeInput} required />
                                <button type="button" onClick={handleSendCode} disabled={timer > 0}>
                                    {timer > 0 ? `재전송(${formatTime(timer)})` : '인증번호 전송'}
                                </button>
                            </div>
                        </div>
                        {showCodeInput &&
                            <div className="form-group">
                                <label>인증번호</label>
                                <div className="input-with-button">
                                    <input type="text" name="code" onChange={handleChange} required />
                                    <button type="button" onClick={handleVerifyCode}>인증 확인</button>
                                </div>
                            </div>
                        }
                        <button type="submit" className="submit-btn" disabled={!isVerified}>아이디 찾기</button>
                    </form>
                ) : (
                    <form>
                        <h2>비밀번호 찾기 (구현 예정)</h2>
                    </form>
                )}
                <div className="link-group">
                    <span onClick={() => navigate('/login')}>로그인 페이지로</span>
                </div>
            </div>
        </div>
    );
}

export default Find;