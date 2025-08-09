import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import TopHeader from "../../component/TopHeader";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "../../css/user/UQnA.css";

const PAGE_SIZE = 5;

const UQnA = () => {
    const navigate = useNavigate();
    const { isLoggedIn, userId } = useContext(AuthContext);

    const [inquiries, setInquiries] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const fetchInquiries = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeCategory && activeCategory !== "전체") params.category = activeCategory;
            if (searchKeyword) params.keyword = searchKeyword;

            const response = await axios.get("/api/uqna", { params });
            setInquiries(response.data || []);
        } catch (error) {
            console.error("목록 불러오기 실패:", error);
            alert("문의 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [activeCategory, searchKeyword]);
    useEffect(() => {
        fetchInquiries();
        setCurrentPage(1); 
    }, [fetchInquiries]);
    const filteredInquiries = inquiries;
    const totalPages = Math.ceil(filteredInquiries.length / PAGE_SIZE);
    const paginatedInquiries = filteredInquiries.slice(
        (currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE
    );
    const renderPagination = () => (
        <div className="pagination">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
            >
                &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i+1}
                    className={currentPage === i+1 ? "active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                >
                    {i + 1}
                </button>
            ))}
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                &gt;
            </button>
        </div>
    );

    const handleToggle = (inq) => {
        if (inq.isPrivate && (!isLoggedIn || inq.user?.uid !== userId)) {
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
        fetchInquiries();
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
                        <button className="uqna-search-btn" onClick={handleSearch}>
                          <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                    <button className="write-btn" onClick={handleWriteClick}>
                        글쓰기
                    </button>
                </div>

                <div className="uqna-header">
                    <span>No</span>
                    <span>카테고리</span>
                    <span>제목</span>
                    <span>작성자</span>
                    <span>작성시간</span>
                </div>

                {loading ? (
                    <div className="loading">로딩 중...</div>
                ) : (
                    <>
                        <ul className="uqna-list">
                            {paginatedInquiries.length > 0 ? (
                                paginatedInquiries.map((inq, index) => (
                                    <li key={inq.inquiryId || inq.id} className="uqna-item">
                                        <div
                                            className={`inquiry-title ${openId === inq.inquiryId ? "open" : ""}`}
                                            onClick={() => handleToggle(inq)}
                                        >
                                            <span>{(currentPage - 1) * PAGE_SIZE + index + 1}</span>
                                            <span>{inq.category}</span>
                                            <span>
                                                {inq.isPrivate && (!isLoggedIn || inq.user?.uid !== userId)
                                                    ? "비밀글입니다"
                                                    : inq.title}
                                                {inq.isPrivate && " 🔒"}
                                            </span>
                                            <span>{inq.user?.uid || inq.uid || "-"}</span>
                                            <span>{inq.createdAt?.slice(0,10) || "-"}</span>
                                        </div>
                                        {openId === inq.inquiryId && (
                                            <div className="inquiry-content">
                                                {(inq.isPrivate && (!isLoggedIn || inq.user?.uid !== userId))
                                                    ? <p>비밀글은 작성자만 볼 수 있습니다.</p>
                                                    : <p>{inq.content}</p>}
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
                        {totalPages > 1 && renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default UQnA;