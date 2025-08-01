import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // 실제 API 사용시 주석 해제
import AuthContext from "../../context/AuthContext";
import TopHeader from "../../component/TopHeader";
import "../../css/user/UQnA.css";

const UQnA = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userId } = useContext(AuthContext);

    const [inquiries, setInquiries] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInquiries = useCallback(async () => {
        try {
            setLoading(true);
            
            // --- 임시 데이터 ---
            const tempData = [
                { 
                    inquiryId: 1, 
                    title: "비밀글 문의입니다.", 
                    category: "상품문의", 
                    content: "이것은 비밀글 내용입니다.", 
                    isPrivate: true, 
                    user: { uid: userId || "test" },
                    createdAt: "2024-01-15"
                },
                { 
                    inquiryId: 2, 
                    title: "배송 언제 오나요?", 
                    category: "배송문의", 
                    content: "배송 관련 내용입니다.", 
                    isPrivate: false, 
                    user: { uid: "다른사람" },
                    createdAt: "2024-01-14"
                },
                { 
                    inquiryId: 3, 
                    title: "결제 오류 문의", 
                    category: "결제문의", 
                    content: "결제 오류 내용입니다.", 
                    isPrivate: false, 
                    user: { uid: "test" },
                    createdAt: "2024-01-13"
                },
            ];
            setInquiries(tempData);

        } catch (error) {
            console.error("목록 불러오기 실패:", error);
            alert("문의 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const filteredInquiries = inquiries.filter((inq) => {
        const categoryMatch = activeCategory === "전체" || inq.category === activeCategory;
        const keywordMatch = !searchKeyword || 
            inq.title.toLowerCase().includes(searchKeyword.toLowerCase());
        return categoryMatch && keywordMatch;
    });

    const handleToggle = (inq) => {
        if (inq.isPrivate && (!isLoggedIn || inq.user.uid !== userId)) {
            alert("비밀글은 작성자만 볼 수 있습니다.");
            return;
        }
        setOpenId(openId === inq.inquiryId ? null : inq.inquiryId);
    };

    const handleWriteClick = () => {
        if (!isLoggedIn) {
            alert("로그인이 필요한 기능입니다.");
            navigate("/login");
        } else {
            navigate("/uqadd"); 
        }
    };

    const handleSearch = () => {

        console.log("검색 실행:", searchKeyword);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div>
            <TopHeader />
            <div className="uqna-container">
                <h2 className="uqna-title">문의하기</h2>

                <div className="uqna-tabs">
                    {["전체", "상품문의", "배송문의", "결제문의", "회원문의", "기타문의"].map((cat) => (
                        <div
                            key={cat}
                            className={`tab ${activeCategory === cat ? "active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </div>
                    ))}
                </div>

                <div className="uqna-top-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={handleSearch}>검색</button>
                    </div>
                    <button className="write-btn" onClick={handleWriteClick}>
                        글쓰기
                    </button>
                </div>

                {loading ? (
                    <div className="loading">로딩 중...</div>
                ) : (
                    <ul className="uqna-list">
                        {filteredInquiries.length > 0 ? (
                            filteredInquiries.map((inq) => (
                                <li key={inq.inquiryId} className="uqna-item">
                                    <div
                                        className={`inquiry-title ${openId === inq.inquiryId ? "open" : ""}`}
                                        onClick={() => handleToggle(inq)}
                                    >
                                        <span>
                                            {inq.title} {inq.isPrivate && "🔒"}
                                        </span>
                                        <div className="inquiry-meta">
                                            <span className="category">{inq.category}</span>
                                            {inq.createdAt && (
                                                <span className="date">{inq.createdAt}</span>
                                            )}
                                        </div>
                                    </div>
                                    {openId === inq.inquiryId && (
                                        <div className="inquiry-content">
                                            <p>{inq.content}</p>
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="no-results">
                                검색 결과가 없습니다.
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UQnA;