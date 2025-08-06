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

    const [totalProductPrice, setTotalProductPrice] = useState(0);
    const [totalShippingCost, setTotalShippingCost] = useState(0);
    const [finalTotalPrice, setFinalTotalPrice] = useState(0);

    useEffect(() => {
        if (!guest_id && !token) {
            alert('잘못된 접근입니다.\n메인페이지로 돌아갑니다.');
            navigate('/');
        } else {
            fetchCartItems();
        }
    }, [page, token, guest_id, navigate]);

    useEffect(() => {
        calculateTotals();
        console.log("현재 체크된 상품 ID:", checkedItems);
        console.log("현재 장바구니 상품 목록:", cartItems);
        console.log("계산된 총 상품 금액:", totalProductPrice);
    }, [cartItems, checkedItems]);

    const calculateTotals = () => {
        const checkedItemsData = cartItems.filter(item => checkedItems.includes(item.cartId));

        const productPrice = checkedItemsData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const shippingCost = checkedItemsData.reduce((sum, item) => sum + item.shippingCost, 0);

        setTotalProductPrice(productPrice);
        setTotalShippingCost(shippingCost);
        setFinalTotalPrice(productPrice + shippingCost);
    };

    const cartTest = () => {
        const testFunction = async () => {
            if (!guest_id && !token) {
                alert('로그인 또는 비회원 ID가 필요합니다.');
                return;
            }
            const pid = 3;
            const quantity = 1;
            let url = '';
            let headers = {};
            if (token) {
                url = `/api/cart/add?pid=${pid}&quantity=${quantity}`;
                headers = { 'Authorization': `Bearer ${token}` };
            } else {
                url = `/api/cart/add?guestId=${guest_id}&pid=${pid}&quantity=${quantity}`;
            }
            try {
                await axios.post(url, {}, { headers });
                alert("상품이 장바구니에 담겼습니다.");
                fetchCartItems();
            } catch (err) {
                if (err.response && err.response.data) {
                    if(err.response.data.includes("이미 리스트에 있는 상품입니다.")){
                        console.error(err.response.data);
                        let result = window.confirm("이미 리스트에 있는 상품입니다.\n장바구니로 이동하시겠습니까?");
                        if(result){
                            navigate("/cart");
                        }
                    } else if (err.response.data === "사용자 정보가 없습니다.") {
                        alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
                    } else if (err.response.data === "장바구니 추가 실패") {
                        alert("장바구니 추가에 실패했습니다. 잠시 후 다시 시도해주세요.");
                    } else {
                        alert("알 수 없는 에러: " + err.response.data);
                    }
                } else {
                    alert("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
                    console.error(err);
                }
            }
        };
        testFunction();
    };

    const fetchCartItems = async () => {
        setIsLoading(true);
        try {
            let response;
            if (token) {
                response = await axios.get(`/api/cart?page=${page}`, { headers: { 'Authorization': `Bearer ${token}` } });
            } else {
                response = await axios.get(`/api/cart?page=${page}&guestId=${guest_id}`);
            }
            setCartItems(response.data.content);
            setTotalPages(response.data.totalPages);
            setCheckedItems([]);
            setIsAllChecked(false);
        } catch (err) {
            console.error("장바구니 목록을 가져오는 중 오류 발생:", err);
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
            let url = '';
            let headers = {};
            if (token) {
                url = `/api/cart/update-quantity?cartId=${cartId}&quantity=${newQuantity}`;
                headers = { 'Authorization': `Bearer ${token}` };
            } else if (guest_id) {
                url = `/api/cart/update-quantity?cartId=${cartId}&quantity=${newQuantity}`;
            }
            await axios.post(url, {}, { headers });
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
        if(ids.length === 0 && type !== 'all'){
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
                    url = '/api/cart/delete/all';
                } else if (type === 'checked') {
                    url = '/api/cart/delete/checked';
                    data = ids;
                } else {
                    if (ids[0] === undefined) {
                        throw new Error("삭제할 상품 ID가 유효하지 않습니다.");
                    }
                    url = `/api/cart/delete/${ids[0]}`;
                    method = 'delete';
                }
            } else {
                if (type === 'all') {
                    url = `/api/cart/delete/all?guestId=${guest_id}`;
                } else if (type === 'checked') {
                    url = `/api/cart/delete/checked?guestId=${guest_id}`;
                    data = ids;
                } else {
                    if (ids[0] === undefined) {
                        throw new Error("삭제할 상품 ID가 유효하지 않습니다.");
                    }
                    url = `/api/cart/delete/${ids[0]}?guestId=${guest_id}`;
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
            console.log("cartId " + cartId);
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
            <div className="pagination_wrap">
                <span>총 {totalPages}페이지 중 {page + 1}페이지</span>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                >
                    ‹
                </button>
                {startPage > 0 && (
                    <>
                    <button onClick={() => setPage(0)}>1</button>
                    <span>...</span>
                    </>
                )}
                {pageNumbers.map(pageNum => (
                    <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={page === pageNum ? "active" : ""}
                    >
                    {pageNum + 1}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                    <span>...</span>
                    <button onClick={() => setPage(totalPages - 1)}>{totalPages}</button>
                    </>
                )}
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                >
                    ›
                </button>
            </div>
        );
    };

    return (
        <div className="cart_wrap">
            <div className="cart_contents">
                <div className="title_area">
                    <h2>CART</h2>
                    <button onClick={cartTest}>상품등록</button>
                </div>
                {isLoading && <p>장바구니 정보를 불러오는 중입니다...</p>}
                {!isLoading && cartItems.length > 0 && (
                    <div className="top_buttons">
                        <Button text={"✖️선택 상품 삭제"} className="delete_btn" onClick={deleteCartChecked} />
                        <Button text={"장바구니 비우기"} className="delete_btn" onClick={deleteCartAll} />
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
                                        <td><img src={item.imageFilename} alt={item.productName} /></td>
                                        <td><Link to={`/상품상세페이지URL/${item.productId}`}>{item.productName}</Link></td>
                                        <td>{item.price.toLocaleString()}원</td>
                                        <td>
                                            <div className="quantity_control">
                                                <button onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}>-</button>
                                                <input type="text" value={item.quantity} onChange={(e) => handleQuantityChange(item.cartId, parseInt(e.target.value) || 0)} className="quantity_input" />
                                                <button onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}>+</button>
                                            </div>
                                        </td>
                                        <td>{item.point}P</td>
                                        <td>{item.shippingCost.toLocaleString()}원</td>
                                        <td>{(item.price * item.quantity).toLocaleString()}원</td>
                                        <td>
                                            <button className="delete_btn" onClick={() => deleteCart(item.cartId)}>✖️삭제</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : !isLoading && <p>장바구니에 담긴 상품이 없습니다.</p>}
                </div>
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
                        <button className="checkout_btn" onClick={orderAllItems}>전체 상품 주문</button>
                        <button className="select_checkout_btn" onClick={orderCheckedItems}>선택 상품 주문</button>
                    </div>
                )}
                {!isLoading && cartItems.length > 0 && renderPagination()}
            </div>
        </div>
    );
};

export default UCart;