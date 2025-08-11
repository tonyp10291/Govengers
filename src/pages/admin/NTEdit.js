import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import TopHeader from "../../component/TopHeader";
import "../../css/admin/NTWrt.css";
import "../../css/util/Buttons.css";
import { Button } from "../../util/Buttons";

export default function NoticeEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, userRole, isAuthLoading, token } = useContext(AuthContext);
    const isAdmin = isLoggedIn && userRole === 'ROLE_ADMIN';
    
    const [notice, setNotice] = useState({
        title: '',
        content: '',
        isEvent: false,
        isFixed: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if(!isAuthLoading && !isAdmin){
            navigate("/alert");
        }
      }, [isAdmin, navigate, isAuthLoading]);

    useEffect(() => {
        if (!id || !token) return;

        const fetchNotice = async () => {
            try {
                setLoading(true);
                
                console.log('📡 공지사항 조회 시작 - ID:', id);
                console.log('🔑 사용할 토큰:', token ? token.substring(0, 20) + '...' : '없음');
                
                const response = await fetch(`/api/admin/notices/view/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 응답 상태:', response.status);

                if (response.status === 401) {
                    alert('로그인이 만료되었습니다.');
                    navigate('/login');
                    return;
                }

                if (response.status === 403) {
                    alert('관리자 권한이 필요합니다.');
                    console.error('🚨 403 Forbidden - 권한 부족');
                    navigate('/');
                    return;
                }

                if (response.status === 404) {
                    alert('공지사항을 찾을 수 없습니다.');
                    navigate('/notice');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('📄 받은 공지사항 데이터:', data);

                setNotice({
                    title: data.title || '',
                    content: data.content || '',
                    isEvent: Boolean(data.isEvent),
                    isFixed: Boolean(data.isFixed)
                });

                console.log('✅ 공지사항 데이터 설정 완료');

            } catch (error) {
                console.error('❌ 공지사항 조회 실패:', error);
                setError('공지사항을 불러오는데 실패했습니다: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [id, token, navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === "title" || id === "content") {
            setNotice((prev) => ({
                ...prev,
                [id]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🧾 notice 값 확인:", notice);
        
        if (!notice.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        
        if (!notice.content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        if (notice.title.length > 50) {
            alert('제목은 50자 이내여야 합니다.');
            return;
        }

        if (notice.content.length > 1500) {
            alert('내용은 1500자 이내여야 합니다.');
            return;
        }

        const requestData = {
            title: notice.title,
            content: notice.content,
            isEvent: notice.isEvent,
            isFixed: notice.isFixed
        };
        
        console.log("📤 전송할 데이터:", requestData);
        console.log("📤 isEvent:", requestData.isEvent, "타입:", typeof requestData.isEvent);
        console.log("📤 isFixed:", requestData.isFixed, "타입:", typeof requestData.isFixed);
        console.log("📤 JSON.stringify:", JSON.stringify(requestData));

        try {
            console.log('📝 수정 요청 시작:', notice);

            const response = await fetch(`/api/notices/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('📡 수정 응답 상태:', response.status);

            if (response.status === 401) {
                alert('로그인이 만료되었습니다.');
                navigate('/login');
                return;
            }

            if (response.status === 403) {
                alert('관리자 권한이 필요합니다.');
                return;
            }

            const responseText = await response.text();
            console.log("📥 응답:", responseText);

            if (response.ok) {
                alert('공지사항이 수정되었습니다.');
                navigate('/ntlist');
            } else {
                alert('수정 실패: ' + responseText);
            }

        } catch (error) {
            console.error('❌ 공지사항 수정 실패:', error);
            alert(error.message || '수정에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div>
                <TopHeader />
                <div className="notice-container">
                    <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
                        데이터를 불러오는 중...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <TopHeader />
                <div className="notice-container">
                    <div className="error" style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Button text={"목록으로 돌아가기"} type={"cancel"} onClick={() => navigate('/ntlist')} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <TopHeader />
            <div className="notice-container">
                <h2 className="notice-title">공지사항 수정</h2>
                <form className="notice-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="noticeId">공지 번호</label>
                        <input
                            type="text"
                            id="noticeId"
                            value={id}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="isEvent">카테고리</label>
                        <div className="category-fixed-inline">
                            <select
                                id="isEvent"
                                value={notice.isEvent ? "event" : "notice"}
                                onChange={(e) => {
                                    console.log("🔄 카테고리 변경:", e.target.value);
                                    setNotice((prev) => ({
                                        ...prev,
                                        isEvent: e.target.value === "event",
                                    }));
                                }}
                            >
                                <option value="notice">공지</option>
                                <option value="event">이벤트</option>
                            </select>

                            <label className="fixed-checkbox">
                                <input
                                    type="checkbox"
                                    checked={notice.isFixed}
                                    onChange={(e) => {
                                        console.log("🔄 고정 변경:", e.target.checked);
                                        setNotice((prev) => ({
                                            ...prev,
                                            isFixed: e.target.checked,
                                        }));
                                    }}
                                />
                                <span>상단 고정</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title">제목</label>
                        <input
                            type="text"
                            id="title"
                            value={notice.title}
                            maxLength={50}
                            onChange={handleChange}
                            placeholder="제목을 입력해주세요 (최대 50자)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">내용</label>
                        <textarea
                            id="content"
                            value={notice.content}
                            maxLength={1500}
                            onChange={handleChange}
                            placeholder="내용을 입력해주세요 (최대 1500자)"
                        ></textarea>
                    </div>

                    <div className="notice-buttons">
                        <Button text={"수정"} type={"submit"} />
                        <Button text={"취소"} type={"cancel"} onClick={() => navigate("/ntlist")} />
                    </div>
                </form>
            </div>
        </div>
    );
}