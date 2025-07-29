import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/common/Join.css';

function Join() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        uid: '', upw: '', unm: '', umail: '', ubt: '', utel: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setUserInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!userInfo.uid || !userInfo.upw || !userInfo.unm) {
            setError('아이디, 비밀번호, 이름은 필수 항목입니다.');
            return;
        }

        try {
            await axios.post('/api/join', userInfo, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            navigate('/login');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || '회원가입에 실패했습니다.');
            } else {
                setError('서버와 통신 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="user-form-container">
            <form onSubmit={handleSubmit} className="user-form join-form">
                <h2>회원가입</h2>
                {error && <div className="error-box">{error}</div>}
                <div className="form-group"><label>아이디</label><input type="text" name="uid" value={userInfo.uid} onChange={handleChange} required /></div>
                <div className="form-group"><label>비밀번호</label><input type="password" name="upw" value={userInfo.upw} onChange={handleChange} required /></div>
                <div className="form-group"><label>이름</label><input type="text" name="unm" value={userInfo.unm} onChange={handleChange} required /></div>
                <div className="form-group"><label>생년월일</label><input type="text" name="ubt" value={userInfo.ubt} placeholder="예: 19900101" onChange={handleChange} /></div>
                <div className="form-group"><label>이메일</label><input type="email" name="umail" value={userInfo.umail} onChange={handleChange} required /></div>
                <div className="form-group"><label>전화번호</label><input type="tel" name="utel" value={userInfo.utel} placeholder="01012345678" onChange={handleChange} /></div>
                <button type="submit" className="submit-btn">회원가입 완료</button>
            </form>
        </div>
    );
}

export default Join;