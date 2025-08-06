// const UOrder = () => {

//     const renderPagination = () => {
//         const maxVisiblePages = 5;
//         const currentGroup = Math.floor(page / maxVisiblePages);
//         const startPage = currentGroup * maxVisiblePages;
//         const endPage = Math.min(startPage + maxVisiblePages, totalPages);

//         const pageNumbers = [];
//         for (let i = startPage; i < endPage; i++) {
//             pageNumbers.push(i);
//         }

//         return (
//             <div className="pagination-container">
//                 <div className="pagination-info">
//                     <span>총 {totalPages}페이지 중 {page + 1}페이지</span>
//                 </div>
                
//                 <div className="pagination">

//                     <button 
//                         onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
//                         disabled={page === 0}
//                         className="pagination-btn prev-next"
//                         title="이전 페이지"
//                     >
//                         ‹
//                     </button>

//                     {startPage > 0 && (
//                         <>
//                         <button
//                             onClick={() => setPage(0)}
//                             className="pagination-btn page-number"
//                         >
//                             1
//                         </button>
//                         <span className="pagination-dots">...</span>
//                         </>
//                     )}

//                     {pageNumbers.map(pageNum => (
//                         <button
//                         key={pageNum}
//                         onClick={() => setPage(pageNum)}
//                         className={`pagination-btn page-number ${page === pageNum ? "active" : ""}`}
//                         >
//                         {pageNum + 1}
//                         </button>
//                     ))}

//                     {endPage < totalPages && (
//                         <>
//                         <span className="pagination-dots">...</span>
//                         <button
//                             onClick={() => setPage(totalPages - 1)}
//                             className="pagination-btn page-number"
//                         >
//                             {totalPages}
//                         </button>
//                         </>
//                     )}

//                     <button 
//                         onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
//                         disabled={page === totalPages - 1}
//                         className="pagination-btn prev-next"
//                         title="다음 페이지"
//                     >
//                         ›
//                     </button>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="wishList_wrap"> 
//             <div className="wishList_contents">
//                 <div className="title_area">
//                     <h2>WISH LIST</h2>
//                     <button onClick={wishlistTest}>상품등록</button>
//                 </div>                
//                 {wishlist && wishlist.length > 0 && <Button text={"✖️선택 삭제"} style={{fontSize : "13px"}} onClick={(e) => deleteWishlistChecked()} />}
//                 <div className="table_wrap">
//                 {wishlist && wishlist.length > 0 ? (
//                         <table className="contents_wrap">
//                             <colgroup>
//                                 <col style={{width : "10px"}} />
//                                 <col style={{width : "40px"}} />
//                                 <col style={{width : "60px"}} />
//                                 <col style={{width : "40px"}} />
//                                 <col style={{width : "30px"}} />
//                                 <col style={{width : "30px"}} />
//                                 <col style={{width : "40px"}} />
//                                 <col style={{width : "40px"}} />
//                             </colgroup>
//                             <thead>
//                                 <tr>
//                                     <th scope="col"><input type="checkbox" className="allCheckbox" checked={isAllChecked} onChange={(e) => handleAllCheckboxChange(e.target.checked)}/></th>
//                                     <th scope="col">이미지</th>
//                                     <th scope="col">상품정보</th>
//                                     <th scope="col">판매가</th>
//                                     <th scope="col">적립금(포인트)</th>
//                                     <th scope="col">배송비</th>
//                                     <th scope="col">합계</th>
//                                     <th scope="col">선택</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {wishlist.map((list) => (
//                                     <tr key={list.id}>
//                                         <td className="" style={{textAlign : "center"}}><input type="checkbox" className="itemCheckbox" checked={checkedItems.includes(list.id)} onChange={(e) => handleCheckboxChange(list.id, e.target.checked)}/></td>
//                                         <td style={{textAlign : "center"}}><img src={list.image} alt={list.pnm} /></td>
//                                         <td style={{textAlign : "left"}}>
//                                             <Link to={`/상품상세페이지URL/${list.pid}`}>{list.pnm}</Link>
//                                         </td>
//                                         <td>{list.price}원</td>
//                                         <td>{list.point}P</td>
//                                         <td>{list.shippingCost}원</td>
//                                         <td>{list.totalPrice}원</td>
//                                         <td>
//                                             <div className="delete_wrap">
//                                                 <Button text={"주문하기"} style={{fontSize : "13px"}} />
//                                             </div>
//                                             <div className="delete_wrap">
//                                                 <Button text={"장바구니 담기"} style={{fontSize : "13px"}} />
//                                             </div>
//                                             <div className="delete_wrap">
//                                                 <Button text={"✖️삭제"} style={{fontSize : "13px"}} onClick={() => deleteWishlist(list.id)} />
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ) : (
//                         <p>관심상품 내역이 존재하지 않습니다.</p>
//                     )}
//                 </div>
//                 {wishlist && wishlist.length > 0 && <Button text={"✖️전체 삭제"} style={{fontSize : "13px"}} onClick={() => deleteWishlistAll()} />}
//                 {wishlist && wishlist.length > 0 && renderPagination()}
//             </div>            
//         </div>
//     );
// }

// export default UOrder;