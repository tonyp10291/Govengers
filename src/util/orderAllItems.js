import axios from "axios";

export const fetchAllCartItems = async (token, guestId, navigate) => {
    try {
        let response;
        if (token) {
            if (guestId) {
                await axios.post(`/api/cart/migrate?guestId=${guestId}`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
            }
            response = await axios.get(`/api/cart/user/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        } else {
            response = await axios.get(`/api/cart/guest/all?guestId=${guestId}`);
        }
        return response.data;
    } catch (err) {
        console.error("장바구니 전체 상품을 가져오는 중 오류 발생:", err.response?.data || err);
        alert('장바구니를 가져오는 중 오류가 발생했습니다. 메인 페이지로 돌아갑니다.');
        navigate('/');
        return [];
    }
};

export const handleOrderItems = (navigate, cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        alert("주문할 상품이 없습니다.");
        return;
    }

    navigate('/payment', {
        state: cartItems
    });
};