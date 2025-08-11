import React, { useState, useEffect } from 'react';
import '../../css/admin/PdOrd.css';

const DEBUG = true;
const dbg = (...args) => { if (DEBUG) console.log('[PDORD]', ...args); };
const group = (title) => { if (DEBUG) console.groupCollapsed(`[PDORD] ${title}`); };
const groupEnd = () => { if (DEBUG) console.groupEnd(); };
const redact = (t = '') => (t ? `${t.slice(0, 12)}...(${t.length})` : '(none)');

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload;
  } catch {
    return null;
  }
}

function getToken() {
  const keys = ['token','accessToken','Authorization','authToken','jwt','id_token'];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v.startsWith('Bearer ') ? v.slice(7) : v;
  }
  return '';
}

let __reqSeq = 0;
async function safeFetch(url, options = {}) {
  const requestId = `${Date.now()}-${++__reqSeq}`;
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
    'X-Debug-Request-Id': requestId,
  };

  const method = (options.method || 'GET').toUpperCase();
  const bodyPreview = options.body
    ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
    : '';

  group(`REQ ${requestId} ${method} ${url}`);
  dbg('Headers:', {
    Accept: headers.Accept,
    'Content-Type': headers['Content-Type'],
    Authorization: headers.Authorization ? `Bearer ${redact(token)}` : '(none)',
  });
  if (bodyPreview) dbg('Body:', bodyPreview);
  groupEnd();

  const t0 = performance.now();
  let res;
  try {
    res = await fetch(url, { ...options, headers, credentials: 'include' });
  } catch (netErr) {
    group(`NET-ERR ${requestId}`);
    console.error(netErr);
    groupEnd();
    const err = new Error(`Network error: ${netErr.message}`);
    err.status = 0;
    err.requestId = requestId;
    throw err;
  }
  const t1 = performance.now();

  const ct = res.headers.get('content-type') || '';
  const wwwAuth = res.headers.get('www-authenticate') || '';
  const text = await res.text().catch(() => '');

  group(`RES ${requestId} ${method} ${url}`);
  dbg('Status:', res.status, res.statusText, `(${Math.round(t1 - t0)}ms)`);
  dbg('Content-Type:', ct);
  if (wwwAuth) dbg('WWW-Authenticate:', wwwAuth);
  dbg('Body (first 400 chars):', text.slice(0, 400));
  groupEnd();

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    err.requestId = requestId;
    throw err;
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (parseErr) {
    group(`JSON-PARSE-ERR ${requestId}`);
    console.error(parseErr);
    dbg('Raw text:', text.slice(0, 400));
    groupEnd();
    const err = new Error('Invalid JSON response');
    err.status = res.status;
    err.body = text;
    err.requestId = requestId;
    throw err;
  }
}

// 상품 정보 정규화
function normalizeOrderDetail(detail = {}) {
    const srcItems =
      Array.isArray(detail.items) ? detail.items :
      Array.isArray(detail.orderItems) ? detail.orderItems :
      Array.isArray(detail.orderItemResponses) ? detail.orderItemResponses :
      [];
  
    const items = srcItems.map((oi, idx) => {
      const quantity = oi.quantity ?? oi.qty ?? oi.count ?? 1;
      const unitPriceRaw =
        oi.unitPrice ?? oi.pricePerUnit ?? oi.unit_price ??
        (oi.totalPrice && quantity ? Math.round(oi.totalPrice / quantity) : oi.price);
  
      const unitPrice = Number(unitPriceRaw ?? 0);
      const subtotal = oi.subtotal ?? oi.totalPrice ?? unitPrice * quantity;
  
      return {
        id: oi.orderItemId ?? oi.id ?? `oi-${idx}`,
        orderItemId: oi.orderItemId ?? oi.id,
        name: oi.pnm ?? oi.productName ?? oi.name ?? '(상품명 없음)',
        quantity,
        unitPrice,
        subtotal,
        status: oi.status ?? oi.itemStatus ?? detail.adminStatus ?? '결제완료',
        __raw: oi,
      };
    });
  
    const shippingCost = Number(
      detail.shippingCost ?? detail.deliveryFee ?? detail.shipping_fee ?? 0
    );
    const discount = Number(
      detail.discount ?? detail.couponAmount ?? detail.pointUsed ?? 0
    );
  
    const productTotal =
      Number(detail.productTotalPrice ?? detail.totalAmount ?? 0) ||
      items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  
    const finalPayment = Number(
      detail.finalPayment ?? detail.payAmount ?? detail.paymentAmount ??
      (productTotal + shippingCost - discount)
    );
  
    const receiverName =
      detail.receiverName ?? detail.recipientName ?? detail.shipping?.receiverName ?? '';
    const receiverPhone =
      detail.receiverPhone ?? detail.recipientPhone ?? detail.shipping?.phone ?? '';
    const receiverPostcode =
      detail.receiverPostcode ?? detail.postcode ?? detail.shipping?.postcode ?? '';
    const receiverAddress =
      detail.receiverAddress ??
      [detail.address, detail.address1, detail.addr1, detail.shipping?.address1].find(Boolean) ?? '';
    const receiverAddress2 =
      detail.receiverAddress2 ?? detail.address2 ?? detail.addr2 ?? detail.shipping?.address2 ?? '';
    const deliveryRequest =
      detail.deliveryRequest ?? detail.requestMemo ?? detail.shipping?.memo ?? '';
  
    return {
      items,
      shippingCost,
      discount,
      productTotal,
      finalPayment,
      receiverName,
      receiverPhone,
      receiverPostcode,
      receiverAddress: [receiverAddress, receiverAddress2].filter(Boolean).join(' '),
      deliveryRequest,
      impUid: detail.impUid || detail.imp_uid || detail.paymentUid || '', // 다양한 필드명 시도
    };
}
  
const toMoney = (n) => (Number(n || 0)).toLocaleString();

const DETAIL_KEYS = [
    'items','shippingCost','discount','productTotalPrice','finalPayment',
    'receiverName','receiverPhone','receiverPostcode','receiverAddress','deliveryRequest','impUid'
];

const PdOrd = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    pendingOrders: 0,
    confirmedOrders: 0,
    shippingOrders: 0,
    todayOrders: 0,
    todayAmount: 0
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    status: '',
    paymentMethod: ''
  });

  useEffect(() => {
    const token = getToken();
    const payload = token ? decodeJwt(token) : null;
    group('INIT TOKEN INFO');
    dbg('Token:', redact(token));
    dbg('Payload:', payload);
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      const exp = payload.exp;
      dbg('exp:', exp, 'now:', now, 'secondsLeft:', exp ? (exp - now) : '(n/a)');
      const roles = payload.roles || payload.authorities || payload.role || [];
      dbg('roles/authorities:', roles);
      const hasAdmin =
        (Array.isArray(roles) && roles.includes('ROLE_ADMIN')) ||
        roles === 'ROLE_ADMIN' ||
        (payload.scope && String(payload.scope).includes('ROLE_ADMIN'));
      dbg('has ROLE_ADMIN:', !!hasAdmin);
    }
    groupEnd();

    (async () => {
      dbg('== load: fetchOrders + fetchStatistics ==');
      await Promise.allSettled([fetchOrders(), fetchStatistics()]);
      setLoading(false);
    })();
  }, []);

  const handleAuthError = (e, actionLabel = '요청') => {
    group(`HANDLE-ERR for ${actionLabel}`);
    dbg('status:', e.status, 'requestId:', e.requestId);
    dbg('body(first 400):', (e.body || '').slice(0, 400));
    groupEnd();

    if (e.status === 401 || e.status === 403) {
      alert(`접근 권한이 없어 ${actionLabel}에 실패했어.\n(HTTP ${e.status})\n로그인이 필요하거나 토큰/권한이 부족할 수 있어.`);
    } else {
      alert(`${actionLabel} 중 오류: ${e.message}`);
    }
  };

  const fetchOrders = async () => {
    dbg('fetchOrders() start');
    try {
      const data = await safeFetch('/api/admin/pdord/orders?page=0&size=100');
      const incoming = data?.content || data || [];
  
      setOrders(prev => {
        const prevMap = new Map(prev.map(o => [o.orderId, o]));
        return incoming.map(o => {
          const old = prevMap.get(o.orderId);
          if (!old) return o;
          const keep = {};
          for (const k of DETAIL_KEYS) {
            if (old[k] !== undefined) keep[k] = old[k];
          }
          return { ...o, ...keep };
        });
      });
  
      dbg('orders length:', incoming.length);
    } catch (e) {
      handleAuthError(e, '주문 목록 가져오기');
      setOrders([]);
    }
  };

  const fetchStatistics = async () => {
    dbg('fetchStatistics() start');
    try {
      const data = await safeFetch('/api/admin/pdord/orders/statistics');
      dbg('fetchStatistics() data:', data);
      setStatistics({
        pendingOrders: data?.pendingOrders || 0,
        confirmedOrders: data?.confirmedOrders || 0,
        shippingOrders: data?.shippingOrders || 0,
        todayOrders: data?.todayOrders || 0,
        todayAmount: data?.todayAmount || 0
      });
    } catch (e) {
      handleAuthError(e, '통계 가져오기');
      setStatistics({
        pendingOrders: 0,
        confirmedOrders: 0,
        shippingOrders: 0,
        todayOrders: 0,
        todayAmount: 0
      });
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const detail = await safeFetch(`/api/admin/pdord/orders/${orderId}`);
      dbg('fetchOrderDetail raw response:', detail);
      const norm = normalizeOrderDetail(detail);
      dbg('fetchOrderDetail normalized:', norm);
  
      setOrders(prev =>
        prev.map(o =>
          o.orderId === orderId
            ? {
                ...o,
                items: norm.items,
                shippingCost: norm.shippingCost,
                discount: norm.discount,
                productTotalPrice: norm.productTotal,
                finalPayment: norm.finalPayment,
                receiverName: norm.receiverName,
                receiverPhone: norm.receiverPhone,
                receiverPostcode: norm.receiverPostcode,
                receiverAddress: norm.receiverAddress,
                deliveryRequest: norm.deliveryRequest,
                impUid: norm.impUid,
              }
            : o
        )
      );
    } catch (e) {
      handleAuthError(e, '주문 상세 조회');
    }
  };

  const handleSearch = async () => {
    dbg('handleSearch() start with', searchParams);
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams.keyword) params.append('keyword', searchParams.keyword);
      if (searchParams.startDate) params.append('startDate', `${searchParams.startDate}T00:00:00`);
      if (searchParams.endDate) params.append('endDate', `${searchParams.endDate}T23:59:59`);
      if (searchParams.status) params.append('orderStatus', searchParams.status);
      if (searchParams.paymentMethod) params.append('paymentMethod', searchParams.paymentMethod);

      const url = `/api/admin/pdord/orders?page=0&size=100&${params.toString()}`;
      dbg('handleSearch() url:', url);

      const data = await safeFetch(url);
      dbg('handleSearch() data:', data);
      setOrders(data?.content || data || []);
    } catch (e) {
      handleAuthError(e, '검색');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    dbg('resetFilters()');
    setSearchParams({
      keyword: '',
      startDate: '',
      endDate: '',
      status: '',
      paymentMethod: ''
    });
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
  };

  const toggleOrderExpansion = async (order) => {
    const orderId = order.orderId;
    const next = new Set(expandedOrders);
    const willExpand = !next.has(orderId);

    if (willExpand) {
      if (!Array.isArray(order.items) || order.items.length === 0) {
        await fetchOrderDetail(orderId);
      }
      next.add(orderId);
    } else {
      next.delete(orderId);
    }
    setExpandedOrders(next);
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : '0');

  const getStatusClass = (status) => {
    const statusMap = {
      '주문완료': 'status-confirmed',
      '결제완료': 'status-confirmed',
      '배송준비중': 'status-preparing',
      '배송중': 'status-shipping', 
      '배송완료': 'status-delivered',
      '주문취소완료': 'status-cancelled',
      '주문취소요청': 'status-cancelled',
      '주문실패': 'status-cancelled',
      '환불완료': 'status-cancelled',
    };
    return statusMap[status] || 'status-confirmed';
  };

  // 포트원 연동 주문 취소 (전체 주문만)
  const cancelOrder = async (order) => {
    if (!window.confirm('정말로 이 주문을 취소하시겠습니까? (결제 취소도 함께 진행됩니다)')) return;
    
    const orderId = order.orderId;
    let impUid = order.impUid;
    
    // 상세 정보가 로드되지 않은 경우 먼저 로드
    if (!impUid && (!order.items || order.items.length === 0)) {
      await fetchOrderDetail(orderId);
      // 상태에서 업데이트된 주문 정보 가져오기
      const updatedOrder = orders.find(o => o.orderId === orderId);
      impUid = updatedOrder?.impUid;
    }
    
    dbg('cancelOrder()', { orderId, impUid, hasItems: !!order.items?.length });
    
    try {
        // 포트원 결제 취소 (전체)
        if (impUid) {
            await safeFetch('/api/payment/cancel/order', {
                method: 'POST',
                body: JSON.stringify({ 
                    orderId: orderId,
                    impUid: impUid,
                    reason: '관리자 취소' 
                })
            });
            alert('주문이 취소되었습니다. (결제 취소 완료)');
        } else {
            // impUid가 없는 경우 DB만 변경
            await safeFetch(`/api/admin/pdord/orders/${orderId}/cancel`, {
                method: 'PUT',
                body: JSON.stringify({ cancelReason: '관리자 취소' })
            });
            alert('주문이 취소되었습니다.');
        }
      
        // 리스트/통계 갱신
        await fetchOrders();
        await fetchStatistics();
        if (expandedOrders.has(orderId)) {
          await fetchOrderDetail(orderId);
        }
    } catch (e) {
        handleAuthError(e, '주문 취소');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    dbg('updateOrderStatus()', { orderId, newStatus });
    try {
        await safeFetch(`/api/admin/pdord/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ orderStatus: newStatus })
        });
        alert('주문 상태가 변경되었습니다.');
      
        await fetchOrders();
        await fetchStatistics();
        if (expandedOrders.has(orderId)) {
          await fetchOrderDetail(orderId);
        }
    } catch (e) {
        handleAuthError(e, '주문 상태 변경');
    }      
  };

  if (loading) {
    return (
      <div className="admin-pdord-wrap">
        <div className="pdord-container">
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pdord-wrap">
      <div className="pdord-container">
        <h1 className="pdord-title">주문 관리</h1>

        {/* 통계 대시보드 */}
        <div className="stats-dashboard">
          <div className="stat-card"><h3>주문취소</h3><span className="stat-number">{statistics.pendingOrders || 0}</span></div>
          <div className="stat-card"><h3>배송중</h3><span className="stat-number">{statistics.shippingOrders || 0}</span></div>
          <div className="stat-card"><h3>배송완료</h3><span className="stat-number">{statistics.confirmedOrders || 0}</span></div>
          <div className="stat-card"><h3>오늘 주문</h3><span className="stat-number">{statistics.todayOrders || 0}</span></div>
          <div className="stat-card"><h3>오늘 매출</h3><span className="stat-amount">{formatPrice(statistics.todayAmount)}원</span></div>
        </div>

        {/* 검색 및 필터 */}
        <div className="filter-section">
          <div className="search-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="주문번호, 주문자명으로 검색"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              />
              <button onClick={handleSearch}>🔍</button>
            </div>
            <div className="date-range">
              <input type="date" value={searchParams.startDate} onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })} />
              <span>~</span>
              <input type="date" value={searchParams.endDate} onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })} />
            </div>
          </div>

          <div className="filter-controls">
            <select className="filter-select" value={searchParams.status} onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}>
              <option value="">전체 상태</option>
              <option value="주문완료">주문완료</option>
              <option value="배송준비중">배송준비</option>
              <option value="배송중">배송중</option>
              <option value="배송완료">배송완료</option>
              <option value="주문취소완료">주문취소</option>
            </select>

            <select className="filter-select" value={searchParams.paymentMethod} onChange={(e) => setSearchParams({ ...searchParams, paymentMethod: e.target.value })}>
              <option value="">전체 결제수단</option>
              <option value="card">신용카드</option>
            </select>

            <button className="reset-btn" onClick={resetFilters}>초기화</button>
          </div>
        </div>

        {/* 주문 테이블 */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>주문번호</th><th>주문자</th><th>주문일시</th><th>주문금액</th><th>결제수단</th><th>주문상태</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {(!orders || orders.length === 0) ? (
              <tr><td colSpan="7" style={{ padding: '40px', color: '#666', fontStyle: 'italic' }}>총 0개의 주문 내역이 있습니다</td></tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <tr
                    className={`summary-row ${expandedOrders.has(order.orderId) ? 'expanded' : ''}`}
                    onClick={() => toggleOrderExpansion(order)}
                  >
                    <td className="order-number-cell">{order.orderId}</td>
                    <td>{order.uid || order.receiverName}</td>
                    <td>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                    <td className="amount-cell">
                        {formatPrice(order.finalPayment ?? order.totalAmount ?? 0)}원
                    </td>
                    <td>{order.paymentMethod}</td>
                    <td><span className={`status-badge ${getStatusClass(order.adminStatus)}`}>{order.adminStatus}</span></td>
                    <td>
                      <div className="action-buttons">
                        <select
                          className="status-select"
                          value={order.adminStatus}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="주문완료">주문완료</option>
                          <option value="배송준비중">배송준비</option>
                          <option value="배송중">배송중</option>
                          <option value="배송완료">배송완료</option>
                          <option value="주문취소완료">주문취소</option>
                        </select>
                        <button
                          className="cancel-btn"
                          onClick={(e) => { e.stopPropagation(); cancelOrder(order); }}
                          disabled={order.adminStatus === '주문취소완료' || order.adminStatus === '배송완료'}
                        >취소</button>
                      </div>
                    </td>
                  </tr>

                  {expandedOrders.has(order.orderId) && (
                    <tr className="pdord-detail-row">
                      <td colSpan="7">
                        <div className="pdord-detail-box">
                          <div className="pdord-detail-content">
                            <div className="pdord-detail-section">
                              <h4>주문 정보</h4>
                              <div className="pdord-info-grid">
                                <div className="info-item"><span className="label">주문번호:</span><span className="value">{order.orderId}</span></div>
                                <div className="info-item"><span className="label">주문일시:</span><span className="value">{order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</span></div>
                                <div className="info-item"><span className="label">결제방법:</span><span className="value">{order.paymentMethod}</span></div>
                                <div className="info-item"><span className="label">결제금액:</span><span className="value">{formatPrice(order.finalPayment)}원</span></div>
                                {order.impUid && (
                                  <div className="info-item"><span className="label">결제ID:</span><span className="value">{order.impUid}</span></div>
                                )}
                              </div>
                            </div>

                            <div className="pdord-detail-section">
                              <h4>상품 정보</h4>
                              <div className="order-items">
                                  {(order.items || []).map((item) => (
                                  <div key={item.id} className="order-item">
                                      <div className="item-info">
                                      <span className="item-name">{item.name}</span>
                                      <div className="item-options">
                                          상태 <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                                      </div>
                                      </div>
                                      <div className="item-details">
                                      <span>수량: {item.quantity}개</span>
                                      <span>단가: {toMoney(item.unitPrice)}원</span>
                                      <span>합계: {toMoney(item.subtotal ?? item.unitPrice * item.quantity)}원</span>
                                      </div>
                                  </div>
                                  ))}

                                  {/* 합계 영역 */}
                                  {(() => {
                                  const productTotal =
                                      order.productTotalPrice ??
                                      order.totalAmount ??
                                      (order.items || []).reduce((s, it) => s + (Number(it.subtotal ?? it.unitPrice * it.quantity) || 0), 0);
                                  const shipping = Number(order.shippingCost ?? 0);
                                  const discount = Number(order.discount ?? 0);
                                  const final =
                                      order.finalPayment ??
                                      (productTotal + shipping - discount);

                                  return (
                                      <div className="order-total">
                                      <div>상품총액: {toMoney(productTotal)}원</div>
                                      <div>배송비: {toMoney(shipping)}원</div>
                                      {!!discount && <div>할인/차감: -{toMoney(discount)}원</div>}
                                      <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                                          총 결제금액: {toMoney(final)}원
                                      </div>
                                      </div>
                                  );
                                  })()}
                              </div>
                              </div>

                            {/* 배송 정보 */}
                            <div className="pdord-detail-section">
                            <h4>배송 정보</h4>
                            <div className="pdord-info-grid">
                                <div className="info-item"><span className="label">아이디:</span><span className="value">{order.uid}</span></div>
                                <div className="info-item"><span className="label">수령인:</span><span className="value">{order.receiverName || '-'}</span></div>
                                <div className="info-item"><span className="label">주소:</span>
                                <span className="value">
                                    {order.receiverPostcode ? `[${order.receiverPostcode}] ` : ''}
                                    {order.receiverAddress || '-'}
                                </span>
                                </div>
                                <div className="info-item"><span className="label">전화번호:</span><span className="value">{order.receiverPhone || '-'}</span></div>
                                <div className="info-item"><span className="label">배송요청:</span><span className="value">{order.deliveryRequest || '없음'}</span></div>
                            </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PdOrd;