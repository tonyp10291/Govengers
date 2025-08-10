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
     const [checkedItems, setCheckedItems] = useState([]);
     const [isAllChecked, setIsAllChecked] = useState(false);
     const API_BASE_URL = "http://localhost:8080";

     const handleCheckboxChange = (id, isChecked) => {
         let newCheckedItems = [];

         if (isChecked) {
             newCheckedItems = [...checkedItems, id];
         } else {
             newCheckedItems = checkedItems.filter(item => item !== id);
         }
         setCheckedItems(newCheckedItems);
         //모든 체크박스가 체크되어 있으면 상단 체크박스도 체크 / 아니면 false
         setIsAllChecked(newCheckedItems.length === wishlist.length);
     }

     const handleAllCheckboxChange = (isChecked) => {
         setIsAllChecked(isChecked);
         if (isChecked) {
             const allIds = wishlist.map(item => item.id);
             setCheckedItems(allIds);
         } else {
             setCheckedItems([]);
         }
     }
     
     const deleteWishlistChecked = () => {
        
         if (!guest_id){
             alert('잘못된 접근입니다.\n메인페이지로 돌아갑니다.');
             navigate('/');
         } else {
             if(checkedItems.length === 0){
                 alert("선택된 상품이 없습니다.");
                 return;
             }
             const result = window.confirm("정말로 삭제하시겠습니까?");
             if (result) {
                 if (!token){
                     const deleteGuestWishlistChecked = async () => {
                         try{
                             //여러개의 요청을 한꺼번에 보냄
                             await Promise.all(checkedItems.map(id => 
                                 axios.post(`/api/wishlist/guest/delete?guestId=${guest_id}&id=${id}`)
                             ));
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         } catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteGuestWishlistChecked();
                 } else {
                     const deleteUserWishlistChecked = async () => {
                         try{
                             await Promise.all(checkedItems.map(id => 
                                 axios.post(`/api/wishlist/user/delete?id=${id}`,{}, {
                                     headers: {
                                         'Authorization': `Bearer ${token}`
                                     }
                                 })
                             ));
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         } catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteUserWishlistChecked();
                 }
             }
         }
     }

     const deleteWishlist = (id) => {
         if (!guest_id){
             alert('잘못된 접근입니다.\n메인페이지로 돌아갑니다.');
             navigate('/');
         } else {
             const result = window.confirm("선택한 항목을 삭제하시겠습니까?");
             if(result){
                 if (!token){
                     const deleteGuestWishlist = async () => {
                         try{
                             await axios.post(`/api/wishlist/guest/delete?guestId=${guest_id}&id=${id}`);
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         } catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteGuestWishlist();
                 } else if(token){
                     const deleteUserWishlist = async () => {
                         try{
                             await axios.post(`/api/wishlist/user/delete?id=${id}`,{}, {
                                 headers: {
                                     'Authorization': `Bearer ${token}`
                                 }
                             });
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         }catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteUserWishlist();
                 }
             }
         }
     } 

     const deleteWishlistAll = () => {
         if (!guest_id){
             alert('잘못된 접근입니다.\n메인페이지로 돌아갑니다.');
             navigate('/');
         } else {
             const result = window.confirm("모든 목록을 삭제하시겠습니까?");
             if(result){
                 if (!token){
                     const deleteGuestWishlistAll = async () => {
                         try{
                             await axios.post(`/api/wishlist/guest/delete/all?guestId=${guest_id}`);
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         } catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteGuestWishlistAll();
                 }else{
                     const deleteUserWishlistAll = async () => {
                         try{
                             await axios.post('/api/wishlist/user/delete/all?', {}, {
                                 headers: {
                                     'Authorization': `Bearer ${token}`
                                 }
                             });
                             alert("목록이 삭제 되었습니다.");
                             window.location.reload();
                         } catch(err){
                             console.error(err.response.data);
                             if(err.response.data === "wishlist 삭제 실패"){
                                 console.error(err.response.data);
                             }else{
                                 console.error(err.response.data);
                                 alert("알수없는 에러");
                             }
                         }
                     }
                     deleteUserWishlistAll();
                 }
             }
         }
     }

     useEffect(() => {

         if (!guest_id){
             window.location.reload();
         } else {
             if (!token){
                 const fetchUserWishlist = async () => {
                     try{
                         const response = await axios.get(`/api/wishlist/guest?page=${page}&guestId=${guest_id}`, {
                             headers: {
                                 'Content-Type': 'application/json',
                             }
                         });
                         setWishlist(response.data.content);
                         setTotalPages(response.data.totalPages);
                     } catch(err){
                         console.error(err.response.data);
                         alert('서버와 통신중 오류가 발생 했습니다.\n메인페이지로 돌아갑니다.');
                         navigate('/');
                     }
                 }
                 fetchUserWishlist();
             } else if(token) {
                 const fetchUserWishlist = async () => {
                     try {
                         if (guest_id) {
                             await axios.post(`/api/wishlist/migrate?guestId=${guest_id}`, {}, {
                                 headers: {
                                     'Authorization': `Bearer ${token}`
                                 }
                             });
                         }
                         
                         const response = await axios.get(`/api/wishlist/user?page=${page}`, {
                             headers: {
                                 'Authorization': `Bearer ${token}`
                             }
                         });
                         setWishlist(response.data.content);
                         setTotalPages(response.data.totalPages);
                     } catch (err) {
                         console.error("로그인 위시리스트를 가져오는 중 오류 발생:", err.response.data);
                         alert('위시리스트를 가져오는 중 오류가 발생했습니다. 메인 페이지로 돌아갑니다.');
                         navigate('/');
                     }
                 };
                 fetchUserWishlist();
             }
         }
     }, [page, token, guest_id]);

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
                 {wishlist && wishlist.length > 0 && <Button text={"✖️선택 삭제"} type={"delete"} style={{fontSize : "13px"}} onClick={(e) => deleteWishlistChecked()} />}
                 {wishlist && wishlist.length > 0 && <Button text={"✖️전체 삭제"} type={"delete"} style={{fontSize : "13px"}} onClick={() => deleteWishlistAll()} />}
                 <div className="table_wrap">
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
                                         <th scope="col"><input type="checkbox" className="allCheckbox" checked={isAllChecked} onChange={(e) => handleAllCheckboxChange(e.target.checked)}/></th>
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
                                             <td className="" style={{textAlign : "center"}}><input type="checkbox" className="itemCheckbox" checked={checkedItems.includes(list.id)} onChange={(e) => handleCheckboxChange(list.id, e.target.checked)}/></td>
                                             <td style={{textAlign : "center"}}><img
                                            src={list.image ? `${API_BASE_URL}/api/images/${list.image}` : '/api/images/default-product.jpg'}
                                            alt={list.productName}
                                            onError={(e) => {
                                                e.target.src = '/api/images/default-product.jpg'
                                            }}
                                            /></td>
                                             <td style={{textAlign : "left"}}>
                                                 <Link to={`/product/${list.pid}`}>{list.pnm}</Link>
                                             </td>
                                             <td>{list.price.toLocaleString()}원</td>
                                             <td>{list.point.toLocaleString()}P</td>
                                             <td>{list.shippingCost.toLocaleString()}원</td>
                                             <td>{list.totalPrice.toLocaleString()}원</td>
                                             <td>
                                                 <div className="delete_wrap">
                                                     <Button text={"주문하기"} type={"delete"} style={{fontSize : "13px"}} />
                                                 </div>
                                                 <div className="delete_wrap">
                                                     <Button text={"장바구니 담기"} type={"delete"} style={{fontSize : "13px"}} />
                                                 </div>
                                                 <div className="delete_wrap">
                                                     <Button text={"✖️삭제"} type={"delete"} style={{fontSize : "13px"}} onClick={() => deleteWishlist(list.id)} />
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         ) : (
                             <p>관심상품 내역이 존재하지 않습니다.</p>
                         )}
                 </div>
                 {wishlist && wishlist.length > 0 && renderPagination()}
             </div>             
         </div>
     );
     
 }

 export default Wishlist;
