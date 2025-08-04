import React from "react";
import { Button } from "../../util/Buttons";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../../css/user/UPic.css';
import axios from "axios";

const Wishlist = () => {

    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const token = localStorage.getItem("token");
    const guest_id = localStorage.getItem("guest_id");

    useEffect(() => {  
        if (!token){
            if (!guest_id){
                alert('잘못된 접근입니다.\n메인페이지로 돌아갑니다.');
                navigate('/');
            } else {
                try{
                    const response = axios.get(`/api/wishlist/guest?page=${page}&guestId=${guest_id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    setWishlist(response.data);
                    setTotalPages(response.data.totalPages);
                } catch(err){
                    console.error("찜 목록 조회 오류:", err);
                    // alert('서버와 통신중 오류가 발생 했습니다.\n메인페이지로 돌아갑니다.');
                    // navigate('/');
                }
            }           
        } else {
            // alert('로그인 했을시');
            try {
            const response = axios.get(`/api/wishlist/user?page=${page}&guestId=${guest_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setWishlist(response.data);
            setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error("로그인 찜 목록 조회 오류:", err);
                // alert('로그인된 찜 목록을 가져오는 중 오류가 발생했습니다.\n메인페이지로 돌아갑니다.');
                // navigate('/');
            }
        }
    }, [page, token]);

    //페이징
    const renderPagination = () => {
        const maxVisiblePages = 5;
        const currentGroup = Math.floor(page / maxVisiblePages);
        const startPage = currentGroup * maxVisiblePages;
        const endPage = Math.min(startPage + maxVisiblePages, totalPages);

        const pageNumbers = [];
        for (let i = startPage; i < endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination-container">
                <div className="pagination-info">
                    <span>총 {totalPages}페이지 중 {page + 1}페이지</span>
                </div>
                
                <div className="pagination">

                    <button 
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                        className="pagination-btn prev-next"
                        title="이전 페이지"
                    >
                        ‹
                    </button>

                    {startPage > 0 && (
                        <>
                        <button
                            onClick={() => setPage(0)}
                            className="pagination-btn page-number"
                        >
                            1
                        </button>
                        <span className="pagination-dots">...</span>
                        </>
                    )}

                    {pageNumbers.map(pageNum => (
                        <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`pagination-btn page-number ${page === pageNum ? "active" : ""}`}
                        >
                        {pageNum + 1}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                        <span className="pagination-dots">...</span>
                        <button
                            onClick={() => setPage(totalPages - 1)}
                            className="pagination-btn page-number"
                        >
                            {totalPages}
                        </button>
                        </>
                    )}

                    <button 
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={page === totalPages - 1}
                        className="pagination-btn prev-next"
                        title="다음 페이지"
                    >
                        ›
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="wishList_wrap"> 
            <div className="wishList_contents">
                <div className="title_area">
                    <h2>WISH LIST</h2>    
                </div>
                <div className="table_wrap">
                {/* wishlist존재시만 랜더링 */}
                {wishlist && wishlist.length > 0 ? (
                        <table className="contents_wrap">
                            <colgroup>
                                <col style={{width : "10px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "60px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "30px"}} />
                                <col style={{width : "30px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "40px"}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col"><input type="checkbox"/></th>
                                    <th scope="col">이미지</th>
                                    <th scope="col">상품정보</th>
                                    <th scope="col">판매가</th>
                                    <th scope="col">적립금(포인트)</th>
                                    <th scope="col">배송비</th>
                                    <th scope="col">합계</th>
                                    <th scope="col">선택</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlist.map((list) => (
                                    <tr key={list.id}>
                                        {/* 체크박스 */}
                                        <td className="" style={{textAlign : "center"}}><input type="checkbox"/></td>
                                        {/* 상품 이미지 */}
                                        <td style={{textAlign : "center"}}><img src={list.imageUrl} alt={list.name} /></td>
                                        {/* 상품정보 */}
                                        <td style={{textAlign : "left"}}>
                                            <Link to={`/상품상세페이지URL/${list.id}`}>{list.name}</Link>
                                        </td>
                                        {/* 판매가격 */}
                                        <td>{list.price}</td>
                                        {/* 포인트 - 판매가격의 5% */}
                                        <td>{list.point}</td>
                                        {/* 배송구분 */}
                                        <td>배송비</td>
                                        <td>합계</td>
                                        {/* 주문하기, 장바구니 담기, 삭제 -> 버튼으로 */}
                                        <td>주문하기, 장바구니 담기, 삭제</td>
                                    </tr>
                                    ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>관심상품 내역이 존재하지 않습니다.</p>
                    )}
                </div>
                {renderPagination()}
            </div>            
        </div>
    );
    
}

export default Wishlist;
