import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../css/admin/PdOrder.css";

const PdOrder = () => {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statistics, setStatistics] = useState({});

  const token = localStorage.getItem("token");

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': '주문대기',
      'CONFIRMED': '주문확인',
      'PREPARING': '상품준비중',
      'SHIPPING': '배송중',
      'DELIVERED': '배송완료',
      'CANCELLED': '주문취소'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PREPARING': 'status-preparing',
      'SHIPPING': 'status-shipping',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return classMap[status] || 'status-default';
  };

  const getPaymentText = (method) => {
    const methodMap = {
      'CARD': '신용카드',
      'BANK_TRANSFER': '계좌이체',
      'VIRTUAL_ACCOUNT': '가상계좌',
      'MOBILE': '휴대폰결제',
      'KAKAO_PAY': '카카오페이',
      'NAVER_PAY': '네이버페이',
      'PAYCO': '페이코'
    };
    return methodMap[method] || method;
  };

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/orders/statistics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error("통계 조회 실패:", error);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', '10');
      
      if (searchTerm) params.append('keyword', searchTerm);
      if (statusFilter) params.append('orderStatus', statusFilter);
      if (paymentFilter) params.append('paymentMethod', paymentFilter);
      if (startDate) params.append('startDate', startDate + 'T00:00:00');
      if (endDate) params.append('endDate', endDate + 'T23:59:59');

      const response = await axios.get(`/api/admin/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("주문 목록 조회 실패:", error);
      alert("주문 목록을 불러오는데 실패했습니다.");
    }
  }, [page, searchTerm, statusFilter, paymentFilter, startDate, endDate, token]);

  const handleSearch = () => {
    setPage(0);
    fetchOrders();
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentFilter("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`주문 상태를 '${getStatusText(newStatus)}'로 변경하시겠습니까?`)) {
      return;
    }

    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, 
        { orderStatus: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      alert("주문 상태가 변경되었습니다.");
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("주문 상태 변경에 실패했습니다.");
    }
  };

  const handleCancelOrder = async (orderId) => {
    const cancelReason = prompt("취소 사유를 입력해주세요:");
    if (!cancelReason) return;

    try {
      await axios.put(`/api/admin/orders/${orderId}/cancel`, 
        { cancelReason }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      alert("주문이 취소되었습니다.");
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error("주문 취소 실패:", error);
      alert("주문 취소에 실패했습니다.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert("주문이 삭제되었습니다.");
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      console.error("주문 삭제 실패:", error);
      alert("주문 삭제에 실패했습니다.");
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedId(prev => (prev === orderId ? null : orderId));
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
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
            onClick={() => setPage(prev => Math.max(prev - 5, 0))}
            disabled={page < 5}
            className="pagination-btn first-last"
          >
            ⟪
          </button>

          <button 
            onClick={() => setPage(prev => Math.max(prev - 1, 0))}
            disabled={page === 0}
            className="pagination-btn prev-next"
          >
            ‹
          </button>

          {startPage > 0 && (
            <>
              <button onClick={() => setPage(0)} className="pagination-btn page-number">1</button>
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
              <button onClick={() => setPage(totalPages - 1)} className="pagination-btn page-number">
                {totalPages}
              </button>
            </>
          )}

          <button 
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="pagination-btn prev-next"
          >
            ›
          </button>

          <button 
            onClick={() => setPage(prev => Math.min(prev + 5, totalPages - 1))}
            disabled={page >= totalPages - 5}
            className="pagination-btn first-last"
          >
            ⟫
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [fetchOrders, fetchStatistics]);

  useEffect(() => {
    if (page === 0) {
      fetchOrders();
    } else {
      setPage(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter]);

  return (
    <div className="admin-pdord-wrap">
      <div className="pdord-container">
        <h2 className="pdord-title">주문 관리</h2>

        <div className="stats-dashboard">
          <div className="stat-card">
            <h3>주문대기</h3>
            <span className="stat-number">{statistics.pendingCount || 0}</span>
          </div>
          <div className="stat-card">
            <h3>주문확인</h3>
            <span className="stat-number">{statistics.confirmedCount || 0}</span>
          </div>
          <div className="stat-card">
            <h3>배송중</h3>
            <span className="stat-number">{statistics.shippingCount || 0}</span>
          </div>
          <div className="stat-card">
            <h3>오늘 주문</h3>
            <span className="stat-number">{statistics.todayOrderCount || 0}</span>
          </div>
          <div className="stat-card">
            <h3>오늘 매출</h3>
            <span className="stat-amount">{formatAmount(statistics.todaySalesAmount || 0)}</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="주문번호, 주문자명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>🔍</button>
            </div>
            
            <div className="date-range">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-controls">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">전체 상태</option>
              <option value="PENDING">주문대기</option>
              <option value="CONFIRMED">주문확인</option>
              <option value="PREPARING">상품준비중</option>
              <option value="SHIPPING">배송중</option>
              <option value="DELIVERED">배송완료</option>
              <option value="CANCELLED">주문취소</option>
            </select>
            
            <select 
              value={paymentFilter} 
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">전체 결제수단</option>
              <option value="CARD">신용카드</option>
              <option value="BANK_TRANSFER">계좌이체</option>
              <option value="VIRTUAL_ACCOUNT">가상계좌</option>
              <option value="KAKAO_PAY">카카오페이</option>
              <option value="NAVER_PAY">네이버페이</option>
            </select>

            <button onClick={handleReset} className="reset-btn">초기화</button>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>주문자</th>
              <th>주문일시</th>
              <th>주문금액</th>
              <th>결제수단</th>
              <th>주문상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.orderId}>
                <tr 
                  onClick={() => toggleExpand(order.orderId)} 
                  className={`summary-row ${expandedId === order.orderId ? 'expanded' : ''}`}
                >
                  <td className="order-number-cell">{order.orderNumber}</td>
                  <td>{order.orderUserName}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td className="amount-cell">{formatAmount(order.totalAmount)}</td>
                  <td>{getPaymentText(order.paymentMethod)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <select 
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        className="status-select"
                        defaultValue=""
                      >
                        <option value="" disabled>상태변경</option>
                        <option value="PENDING">주문대기</option>
                        <option value="CONFIRMED">주문확인</option>
                        <option value="PREPARING">상품준비중</option>
                        <option value="SHIPPING">배송중</option>
                        <option value="DELIVERED">배송완료</option>
                      </select>
                      
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelOrder(order.orderId)}
                        disabled={order.orderStatus === 'CANCELLED' || order.orderStatus === 'DELIVERED'}
                      >
                        취소
                      </button>
                      
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteOrder(order.orderId)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                
                {expandedId === order.orderId && (
                  <tr className="pdord-detail-row">
                    <td colSpan="7">
                      <div className="pdord-detail-box">
                        <div className="pdord-detail-content">
                          <div className="pdord-detail-section">
                            <h4>주문자 정보</h4>
                            <div className="pdord-info-grid">
                              <div className="info-item">
                                <span className="label">이름:</span>
                                <span className="value">{order.orderUserName}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">연락처:</span>
                                <span className="value">{order.orderUserPhone}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">이메일:</span>
                                <span className="value">{order.orderUserEmail}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pdord-detail-section">
                            <h4>배송 정보</h4>
                            <div className="pdord-info-grid">
                              <div className="info-item">
                                <span className="label">배송주소:</span>
                                <span className="value">{order.deliveryAddress}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">배송연락처:</span>
                                <span className="value">{order.deliveryPhone}</span>
                              </div>
                              <div className="info-item">
                                <span className="label">배송메모:</span>
                                <span className="value">{order.deliveryMemo || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pdord-detail-section">
                            <h4>주문 상품</h4>
                            <div className="order-items">
                              {order.orderItems && order.orderItems.map(item => (
                                <div key={item.orderItemId} className="order-item">
                                  <div className="item-info">
                                    <span className="item-name">{item.productName}</span>
                                    <span className="item-options">{item.productOptions}</span>
                                  </div>
                                  <div className="item-details">
                                    <span className="quantity">수량: {item.quantity}개</span>
                                    <span className="price">단가: {formatAmount(item.unitPrice)}</span>
                                    <span className="total">소계: {formatAmount(item.totalPrice)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="order-total">
                              <strong>총 주문금액: {formatAmount(order.totalAmount)}</strong>
                            </div>
                          </div>

                          {order.orderStatus === 'CANCELLED' && (
                            <div className="pdord-detail-section">
                              <h4>취소 정보</h4>
                              <div className="pdord-info-grid">
                                <div className="info-item">
                                  <span className="label">취소일시:</span>
                                  <span className="value">{formatDate(order.cancelDate)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label">취소사유:</span>
                                  <span className="value">{order.cancelReason}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {renderPagination()}
      </div>
    </div>
  );
};

export default PdOrder;