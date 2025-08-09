import React, { useState, useEffect } from "react";
import { Button } from "../../util/Buttons";
import { Link, useNavigate } from "react-router-dom";
import '../../css/user/UCart.css';
import axios from "axios";

const UCart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(0);
    const token = localStorage.getItem("token");
    const guest_id = localStorage.getItem("guest_id");
    const [checkedItems, setCheckedItems] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE_URL = "http://localhost:8090";
    const [totalProductPrice, setTotalProductPrice] = useState(0);
    const [totalShippingCost, setTotalShippingCost] = useState(0);
    const [finalTotalPrice, setFinalTotalPrice] = useState(0);

    useEffect(() => {
        if (!guest_id){
            window.location.reload();
        } else {
            fetchCartItems();
        }
    }, [page, token, guest_id, navigate]);

    useEffect(() => {
        calculateTotals();
    }, [cartItems, checkedItems]);

    const calculateTotals = () => {
        const checkedItemsData = cartItems.filter(item => checkedItems.includes(item.cartId));
        const productPrice = checkedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = checkedItemsData.reduce((sum, item) => sum + item.shippingCost, 0);
        setTotalProductPrice(productPrice);
        setTotalShippingCost(shippingCost);
        setFinalTotalPrice(productPrice + shippingCost);
    };

    const fetchCartItems = async () => {
        setIsLoading(true);
        try {
            let response;
            if (token) {
                if (guest_id) {
                    await axios.post(`/api/cart/migrate?guestId=${guest_id}`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
                }
                response = await axios.get(`/api/cart/user?page=${page}`, { headers: { 'Authorization': `Bearer ${token}` } });
            } else {
                response = await axios.get(`/api/cart/guest?page=${page}&guestId=${guest_id}`);
            }
            setCartItems(response.data.content);
            setTotalPages(response.data.totalPages);
            setCheckedItems([]);
            setIsAllChecked(false);
        } catch (err) {
            console.error("로그인 위시리스트를 가져오는 중 오류 발생:", err.response.data);
            alert('위시리스트를 가져오는 중 오류가 발생했습니다. 메인 페이지로 돌아갑니다.');
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (cartId, isChecked) => {
        const newCheckedItems = isChecked ? [...checkedItems, cartId] : checkedItems.filter(item => item !== cartId);
        setCheckedItems(newCheckedItems);
        setIsAllChecked(newCheckedItems.length === cartItems.length);
    };

    const handleAllCheckboxChange = (isChecked) => {
        setIsAllChecked(isChecked);
        setCheckedItems(isChecked ? cartItems.map(item => item.cartId) : []);
    };

    const handleQuantityChange = async (cartId, newQuantity) => {
        if (newQuantity < 1) newQuantity = 1;
        try {
            await axios.post(`/api/cart/update-quantity?cartId=${cartId}&quantity=${newQuantity}`, {}, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.cartId === cartId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (err) {
            console.error("수량 변경 중 오류 발생:", err.response.data);
            alert("수량 변경에 실패했습니다.");
        }
    };

    const deleteItems = async (ids, type) => {
        if (ids.length === 0 && type !== 'all') {
            alert("선택된 상품이 없습니다.");
            return;
        }
        const confirmationMsg = type === 'all' ? "장바구니를 비우시겠습니까?" : "선택한 상품을 삭제하시겠습니까?";
        if (!window.confirm(confirmationMsg)) return;

        try {
            let url = '';
            let headers = {};
            let data = {};
            let method = 'post';

            if (token) {
                headers = { 'Authorization': `Bearer ${token}` };
                if (type === 'all') {
                    url = `/api/cart/user/clear`;
                } else if (type === 'checked') {
                    url = `/api/cart/user/delete-checked`;
                    data = ids;
                } else {
                    url = `/api/cart/user/delete/${ids[0]}`;
                    method = 'delete';
                }
            } else {
                if (type === 'all') {
                    url = `/api/cart/guest/clear?guestId=${guest_id}`;
                } else if (type === 'checked') {
                    url = `/api/cart/guest/delete-checked?guestId=${guest_id}`;
                    data = ids;
                } else {
                    url = `/api/cart/guest/delete/${ids[0]}?guestId=${guest_id}`;
                    method = 'delete';
                }
            }
            await axios({ method: method, url: url, data: data, headers: headers });
            alert("상품이 삭제되었습니다.");
            fetchCartItems();
        } catch (err) {
            console.error(err.message || err.response?.data || err);
            alert("삭제 중 오류가 발생했습니다: " + (err.message || "알 수 없는 오류"));
        }
    };

    const deleteCartChecked = () => deleteItems(checkedItems, 'checked');
    const deleteCart = (cartId) => {
        if (cartId !== undefined && cartId !== null) {
            deleteItems([cartId], 'single');
        } else {
            alert("삭제할 상품 정보가 없습니다.");
        }
    };
    const deleteCartAll = () => deleteItems(cartItems.map(item => item.cartId), 'all');

    const orderAllItems = () => {
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        } else {
            alert("전체 상품을 주문합니다.");
        }
    };

    const orderCheckedItems = () => {
        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            navigate('/login');
        } else if (checkedItems.length === 0) {
            alert("선택된 상품이 없습니다.");
        } else {
            alert("선택된 상품을 주문합니다.");
            const selectedItems = cartItems.filter(item => checkedItems.includes(item.cartId));
        }
    };

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
        <div className="cart_wrap">
            <div className="cart_contents">
                <div className="title_area">
                    <h2>CART</h2>
                </div>
                {isLoading && <p>장바구니 정보를 불러오는 중입니다...</p>}
                {!isLoading && cartItems.length > 0 && (
                    <div className="top_buttons">
                        <Button text={"✖️선택 상품 삭제"} type="delete" onClick={deleteCartChecked} />
                        <Button text={"장바구니 비우기"} type="delete" onClick={deleteCartAll} />
                    </div>
                )}
                <div className="table_wrap">
                    {!isLoading && cartItems.length > 0 ? (
                        <table className="contents_wrap">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={isAllChecked} onChange={(e) => handleAllCheckboxChange(e.target.checked)} /></th>
                                    <th>이미지</th>
                                    <th>상품정보</th>
                                    <th>판매가</th>
                                    <th>수량</th>
                                    <th>적립금(포인트)</th>
                                    <th>배송비</th>
                                    <th>합계</th>
                                    <th>선택</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.cartId}>
                                        <td><input type="checkbox" checked={checkedItems.includes(item.cartId)} onChange={(e) => handleCheckboxChange(item.cartId, e.target.checked)} /></td>
                                        <td><img
                                            src={item.imageFilename ? `${API_BASE_URL}/api/images/${item.imageFilename}` : '/api/images/default-product.jpg'}
                                            alt={item.productName}
                                            onError={(e) => {
                                                e.target.src = '/api/images/default-product.jpg'
                                            }}
                                            /></td>
                                        <td><Link to={`/상품상세페이지URL/${item.productId}`}>{item.productName}</Link></td>
                                        <td>{item.price.toLocaleString()}원</td>
                                        <td>
                                            <div className="quantity_control">
                                                <Button text={"-"} onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)} />
                                                <input type="text" value={item.quantity} onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 0)} className="quantity_input" />
                                                <Button text={"+"} onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)} />
                                            </div>
                                        </td>
                                        <td>{item.point * item.quantity}P</td>
                                        <td>{item.shippingCost.toLocaleString()}원</td>
                                        <td>{(item.price * item.quantity).toLocaleString()}원</td>
                                        <td>
                                            <Button text={"✖️삭제"} type={"delete"} onClick={() => deleteCart(item.cartId)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !isLoading && <p>장바구니에 담긴 상품이 없습니다.</p>}
                </div>
                {!isLoading && cartItems.length > 0 && renderPagination()}
                {!isLoading && cartItems.length > 0 && (
                    <div className="payment_summary">
                        <h3>결제 예정 금액</h3>
                        <div className="summary_row">
                            <p>상품 금액 합계</p>
                            <span>{totalProductPrice.toLocaleString()}원</span>
                        </div>
                        <div className="summary_row">
                            <p>배송비</p>
                            <span>{totalShippingCost.toLocaleString()}원</span>
                        </div>
                        <div className="summary_row total">
                            <strong>총 결제 예정 금액</strong>
                            <span>{finalTotalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                )}
                {!isLoading && cartItems.length > 0 && (
                    <div className="action_buttons">
                        <Button text={"전체 상품 주문"} type={"checkout"} style={{fontSize : "25px"}} onClick={orderAllItems} />
                        <Button text={"선택 상품 주문"} type={"checkout_selected"} style={{fontSize : "25px"}} onClick={orderCheckedItems} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UCart;