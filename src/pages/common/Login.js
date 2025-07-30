import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // ✅ 중괄호로!

import '../css/common/Login.css';

function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({ uid: '', upw: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setUserInfo({
            ...userInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!userInfo.uid || !userInfo.upw) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post('/api/login', userInfo, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const receivedToken = response.data.token;
            login(receivedToken);

            alert('로그인에 성공했습니다.');

            setTimeout(() => {
                navigate('/');
            }, 20);

        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || '로그인에 실패했습니다.');
            } else {
                setError('서버와 통신 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="user-form-container">
            <form onSubmit={handleSubmit} className="user-form">
                <h2>로그인</h2>
                {error && <div className="error-box">{error}</div>}
                <div className="form-group">
                    <label htmlFor="uid">아이디</label>
                    <input
                        type="text"
                        id="uid"
                        name="uid"
                        value={userInfo.uid}
                        onChange={handleChange}
                        placeholder="아이디를 입력하세요"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="upw">비밀번호</label>
                    <input
                        type="password"
                        id="upw"
                        name="upw"
                        value={userInfo.upw}
                        onChange={handleChange}
                        placeholder="비밀번호를 입력하세요"
                        required
                    />
                </div>
                <button type="submit" className="submit-btn">로그인</button>
                <div className="link-group">
                    <span onClick={() => navigate('/join')}>회원가입</span>
                    <span onClick={() => navigate('/find')}>아이디/비밀번호 찾기</span>
                </div>
            </form>
        </div>
    );
}

export default Login;
