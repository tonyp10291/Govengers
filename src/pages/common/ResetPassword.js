import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/common/Find.css'; // Find.js와 동일한 스타일 사용

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [passwordInfo, setPasswordInfo] = useState({ newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!token) {
        return (
            <div className="user-form-container">
                <div className="user-form">
                    <h2>잘못된 접근</h2>
                    <div className="error-box">유효하지 않은 비밀번호 재설정 링크입니다.</div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setPasswordInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await axios.post('/api/reset-password', {
                token: token,
                newPassword: passwordInfo.newPassword
            });
            alert(response.data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || "비밀번호 변경에 실패했습니다.");
        }
    };

    return (
        <div className="user-form-container">
            <form onSubmit={handleSubmit} className="user-form">
                <h2>비밀번호 재설정</h2>
                {message && <div className="info-box">{message}</div>}
                {error && <div className="error-box">{error}</div>}

                <div className="form-group">
                    <label>새 비밀번호</label>
                    <input type="password" name="newPassword" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>새 비밀번호 확인</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-btn">비밀번호 변경 완료</button>
            </form>
        </div>
    );
}

export default ResetPassword;