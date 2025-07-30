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
    const [findPwInfo, setFindPwInfo] = useState({ uid: '', phone: '', code: '' });
    const [showNewPwInput, setShowNewPwInput] = useState(false);
    const [newPw, setNewPw] = useState({ password: '', confirm: '' });
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
        if (activeTab === 'id') setFindIdInfo(prev => ({ ...prev, [name]: value }));
        else if (activeTab === 'pw') setFindPwInfo(prev => ({ ...prev, [name]: value }));
        else if (name === 'password' || name === 'confirm') setNewPw(prev => ({ ...prev, [name]: value }));
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
        setShowNewPwInput(false); setFindIdInfo({ name: '', phone: '', code: '' });
        setFindPwInfo({ uid: '', phone: '', code: '' }); setNewPw({ password: '', confirm: '' });
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
                                <input type="tel" name="phone" onChange={handleChange} required />
                                <button type="button" disabled>인증번호 전송</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form>
                        <h2>비밀번호 찾기</h2>
                        <div className="form-group"><label>아이디</label><input type="text" name="uid" onChange={handleChange} required /></div>
                        <div className="form-group">
                            <label>전화번호</label>
                            <div className="input-with-button">
                                <input type="tel" name="phone" onChange={handleChange} required />
                                <button type="button" disabled>인증번호 전송</button>
                            </div>
                        </div>
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