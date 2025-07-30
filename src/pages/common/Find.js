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
    const [findIdInfo, setFindIdInfo] = useState({ name: '', phone: '', code: '' });
    const [foundId, setFoundId] = useState('');
    const [findPwInfo, setFindPwInfo] = useState({ uid: '', phone: '', code: '' });
    const [showNewPwInput, setShowNewPwInput] = useState(false);
    const [newPw, setNewPw] = useState({ password: '', confirm: '' });

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (activeTab === 'id') setFindIdInfo(prev => ({ ...prev, [name]: value }));
        else if (activeTab === 'pw') setFindPwInfo(prev => ({ ...prev, [name]: value }));
        else if (name === 'password' || name === 'confirm') setNewPw(prev => ({ ...prev, [name]: value }));
    };
    
    // (TODO: 아이디/비밀번호 찾기 로직은 백엔드 API 구현 후 연동 필요)
    
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
                    <button onClick={() => { setActiveTab('pw'); resetStates(); }} className={activeTab === 'pw' ? 'active' : ''}>비밀번호 찾기</button>
                </div>
                
                {message && <div className="info-box">{message}</div>}
                {error && <div className="error-box">{error}</div>}

                {activeTab === 'id' ? (
                    <form>
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