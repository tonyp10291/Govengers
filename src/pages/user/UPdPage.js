import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/user/UPdPage.css';

const API_PREFIX = '/api';
const getRole = () => localStorage.getItem('role') || 'USER'; // 'ADMIN' | 'USER'
const getUserId = () => localStorage.getItem('userId') || ''; // 로그인한 아이디

const maskId = (id) => {
  if (!id) return '';
  if (id.length <= 3) return id[0] + '**';
  return id.slice(0, id.length - 3) + '***';
};

const MENU_ITEMS = [
  { key: 'description', label: '상품정보' },
  { key: 'purchase', label: '구매정보' },
  { key: 'related', label: '관련상품' },
  { key: 'reviews', label: '구매후기' },
  { key: 'qna', label: '상품문의' },
];

const categoryLinks = [
  { name: '소고기', to: '/products?cate=소고기' },
  { name: '돼지고기', to: '/products?cate=돼지고기' },
  { name: '닭고기', to: '/products?cate=닭고기' },
  { name: '선물세트', to: '/products?cate=선물세트' },
  { name: '소스류', to: '/products?cate=소스류' },
  { name: '구매리뷰', to: '/products?cate=구매리뷰' },
];

const VISIBLE_CNT = 5;

function UPdPage() {
  const { pid } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relIndex, setRelIndex] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [qnas, setQnas] = useState([]);

  const [eligible, setEligible] = useState(false); // 구매자 여부
  const [revForm, setRevForm] = useState({ content: '', file: null, rating: 5 });
  const [qnaForm, setQnaForm] = useState({ title: '', content: '', secret: false, password: '' });

  // 클릭해서 펼치는 상세(Q&A, 리뷰 코멘트)
  const [openQnaId, setOpenQnaId] = useState(null);
  const [qnaDetail, setQnaDetail] = useState(null);
  const [adminReply, setAdminReply] = useState({ targetType: '', targetId: null, text: '' }); // targetType: 'review'|'qna'

  const sectionRefs = {
    description: useRef(null),
    purchase: useRef(null),
    related: useRef(null),
    reviews: useRef(null),
    qna: useRef(null),
  };

  // 상품 상세 조회 (fetch + 상대경로)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_PREFIX}/products/${pid}`);
        if (!res.ok) throw new Error('상품 정보를 불러올 수 없습니다');
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError('상품 정보를 불러올 수 없습니다');
      }
    };
    fetchProduct();
  }, [pid]);

  // 관련상품 조회 (mainCategory 기준, 현재 상품 제외)
  useEffect(() => {
    const getMainCategory = (p) =>
      p?.mainCategory ?? p?.main_category ?? p?.category ?? null;

    const fetchPage = async (qs) => {
      const res = await fetch(`/api/products?${qs}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      // Page<ProductDto> or { list: [...] } 형태 모두 대응
      let list = Array.isArray(data?.content) ? data.content
        : Array.isArray(data?.list) ? data.list
          : Array.isArray(data) ? data
            : [];
      return { list, raw: data };
    };

    const fetchRelated = async () => {
      const mc = getMainCategory(product);
      if (!mc) {
        console.warn('관련상품: mainCategory 없음', product);
        setRelatedProducts([]);
        return;
      }

      // 1) mainCategory로 0/1 페이지 인덱스 모두 시도
      const tryQueries = [
        new URLSearchParams({ page: '1', size: '30', mainCategory: mc }).toString(),
        new URLSearchParams({ page: '0', size: '30', mainCategory: mc }).toString(),
        new URLSearchParams({ page: '1', size: '30', main_category: mc }).toString(),
        new URLSearchParams({ page: '0', size: '30', main_category: mc }).toString(),
      ];

      let rel = null;
      for (const q of tryQueries) {
        rel = await fetchPage(q);
        if (rel && rel.list) break;
      }

      if (!rel) {
        console.warn('관련상품: 응답 파싱 실패');
        setRelatedProducts([]);
        return;
      }

      // 디버그: 실제 응답 구조 눈으로 확인
      console.debug('[관련상품] mainCategory=', mc, '응답(raw)=', rel.raw);

      // 2) 현재 상품 제외
      const filtered = rel.list.filter((p) => p.pid !== product.pid);

      // 3) 만약 filtered가 0이면 (해당 카테고리에 현재 상품만 있는 경우) → 대체 목록 노출
      if (filtered.length === 0) {
        console.info('관련상품: 동일 카테고리 결과 0 → 대체 목록(전체 최신) 사용');
        const fallbackQs = new URLSearchParams({ page: '1', size: '10' }).toString();
        const fb = await fetchPage(fallbackQs);
        const fbList = (fb?.list ?? []).filter((p) => p.pid !== product.pid).slice(0, 5);
        setRelatedProducts(fbList);
        setRelIndex(0);
        return;
      }

      // 4) 정상 세팅
      setRelatedProducts(filtered);
      setRelIndex(0);
    };

    if (product) fetchRelated();
  }, [product]);

  useEffect(() => {
    if (!product) return;

    // 1) 리뷰 목록
    (async () => {
      try {
        const res = await fetch(`/api/reviews?pid=${product.pid}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : (data.content || []));
        }
      } catch (e) { console.error(e); }
    })();

    // 2) 문의 목록
    (async () => {
      try {
        const res = await fetch(`/api/qna?pid=${product.pid}`);
        if (res.ok) {
          const data = await res.json();
          setQnas(Array.isArray(data) ? data : (data.content || []));
        }
      } catch (e) { console.error(e); }
    })();

    // 3) 리뷰 작성 자격(구매자) 확인
    (async () => {
      try {
        const res = await fetch(`/api/orders/eligible-review?pid=${product.pid}`);
        if (res.ok) {
          const data = await res.json();
          setEligible(!!data?.eligible);
        } else {
          setEligible(false);
        }
      } catch { setEligible(false); }
    })();
  }, [product]);

  // 리뷰 등록 (구매자만)
  const submitReview = async (e) => {
    e.preventDefault();
    if (!eligible) return alert('이 상품을 구매하신 분만 후기를 작성할 수 있습니다.');
    if (!revForm.content.trim()) return alert('후기 내용을 입력해 주세요.');

    const fd = new FormData();
    fd.append('pid', product.pid);
    fd.append('content', revForm.content);
    fd.append('rating', revForm.rating);
    if (revForm.file) fd.append('file', revForm.file);

    try {
      const res = await fetch('/api/reviews', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('리뷰 등록 실패');
      const saved = await res.json();
      setReviews((prev) => [saved, ...prev]);
      setRevForm({ content: '', file: null, rating: 5 });
    } catch (e) {
      alert('리뷰 등록에 실패했습니다.');
      console.error(e);
    }
  };

  // 리뷰 삭제 (작성자 or 관리자)
  const deleteReview = async (rid, writerId) => {
    const me = getUserId();
    const isAdmin = getRole() === 'ADMIN';
    if (!isAdmin && me !== writerId) return alert('삭제 권한이 없습니다.');
    if (!window.confirm('이 후기를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/reviews/${rid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setReviews((prev) => prev.filter((r) => r.rid !== rid));
    } catch {
      alert('삭제 실패');
    }
  };

  // 관리자 리뷰 답글
  const submitAdminReplyToReview = async (rid) => {
    if (getRole() !== 'ADMIN') return;
    const text = adminReply.text?.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/reviews/${rid}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      // 간단히 목록 재조회 (가벼우면 상태 갱신해도 됨)
      const r2 = await fetch(`/api/reviews?pid=${product.pid}`);
      const d2 = await r2.json();
      setReviews(Array.isArray(d2) ? d2 : (d2.content || []));
      setAdminReply({ targetType: '', targetId: null, text: '' });
    } catch {
      alert('답글 등록 실패');
    }
  };

  // Q&A 등록 (비밀글 가능)
  const submitQna = async (e) => {
    e.preventDefault();
    const { title, content, secret, password } = qnaForm;
    if (!title.trim()) return alert('제목을 입력해 주세요.');
    if (!content.trim()) return alert('내용을 입력해 주세요.');
    if (secret && !password.trim()) return alert('비밀글 비밀번호를 입력해 주세요.');
    if (getRole() === 'ADMIN') return alert('관리자는 상품문의를 작성할 수 없습니다.');

    try {
      const res = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pid: product.pid, title, content, secret, password: secret ? password : undefined
        })
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setQnas((prev) => [saved, ...prev]);
      setQnaForm({ title: '', content: '', secret: false, password: '' });
    } catch {
      alert('문의 등록 실패');
    }
  };

  // Q&A 삭제 (작성자 or 관리자)
  const deleteQna = async (qid, writerId) => {
    const me = getUserId();
    const isAdmin = getRole() === 'ADMIN';
    if (!isAdmin && me !== writerId) return alert('삭제 권한이 없습니다.');
    if (!window.confirm('이 문의를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/qna/${qid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setQnas((prev) => prev.filter((q) => q.qid !== qid));
    } catch {
      alert('삭제 실패');
    }
  };

  // Q&A 클릭 -> 상세 열람 (비밀글 비번검증 포함)
  const openQna = async (q) => {
    // 본인 또는 관리자면 바로 열람
    const me = getUserId();
    const isAdmin = getRole() === 'ADMIN';
    if (!q.secret || q.writerId === me || isAdmin) {
      const r = await fetch(`/api/qna/${q.qid}`);
      const d = await r.json();
      setQnaDetail(d); setOpenQnaId(q.qid);
      return;
    }
    // 비밀글: 비번 검증
    const pw = prompt('비밀글 비밀번호를 입력해 주세요.');
    if (!pw) return;
    const v = await fetch(`/api/qna/${q.qid}/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw })
    });
    if (!v.ok) return alert('비밀번호가 올바르지 않습니다.');
    const ok = await v.json();
    if (!ok?.ok) return alert('비밀번호가 올바르지 않습니다.');
    const r = await fetch(`/api/qna/${q.qid}`);
    const d = await r.json();
    setQnaDetail(d); setOpenQnaId(q.qid);
  };

  // 관리자 Q&A 답글
  const submitAdminReplyToQna = async (qid) => {
    if (getRole() !== 'ADMIN') return;
    const text = adminReply.text?.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/qna/${qid}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      // 상세 다시 가져오기
      const r = await fetch(`/api/qna/${qid}`); const d = await r.json();
      setQnaDetail(d); setAdminReply({ targetType: '', targetId: null, text: '' });
    } catch {
      alert('답글 등록 실패');
    }
  };

  const handleMenuClick = (key) => {
    setActiveTab(key);
    sectionRefs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryClick = (to) => navigate(to);
  const handleQuantityChange = (delta) => setQuantity(q => Math.max(1, q + delta));

  // ✅ 장바구니 담기 함수 수정 (회원/비회원 모두 지원)
  const handleAddToCart = async () => {
    if (!product) {
      alert('상품 정보를 불러오는 중입니다.');
      return;
    }

    const userId = getUserId();
    
    try {
      // 회원인 경우: DB에 저장
      if (userId) {
        const cartData = {
          pid: product.pid,
          quantity: quantity,
          price: product.price,
          pnm: product.pnm,
          imgFilename: product.image
        };

        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // 토큰이 있다면
          },
          body: JSON.stringify(cartData)
        });

        if (!response.ok) {
          throw new Error('장바구니 추가에 실패했습니다.');
        }
      }
      
      // 회원/비회원 모두: localStorage에 저장 (비회원은 localStorage만 사용)
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItemIndex = cartItems.findIndex(item => item.pid === product.pid);
      
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].amount = cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
      } else {
        cartItems.push({
          pid: product.pid,
          productName: product.pnm,
          productImage: product.image 
            ? `${API_PREFIX}/images/${product.image}` 
            : `${API_PREFIX}/images/default-product.jpg`,
          description: product.pdesc,
          quantity: quantity,
          price: product.price,
          amount: product.price * quantity
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      // 장바구니 추가 후 선택지 제공
      const goToCart = window.confirm('장바구니에 담았습니다. 장바구니로 이동하시겠습니까?');
      if (goToCart) {
        navigate('/cart');
      }
      
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      // 회원인데 DB 저장에 실패한 경우에도 localStorage는 저장되도록 처리
      if (userId) {
        console.log('DB 저장 실패, localStorage로 대체');
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const existingItemIndex = cartItems.findIndex(item => item.pid === product.pid);
        
        if (existingItemIndex >= 0) {
          cartItems[existingItemIndex].quantity += quantity;
          cartItems[existingItemIndex].amount = cartItems[existingItemIndex].price * cartItems[existingItemIndex].quantity;
        } else {
          cartItems.push({
            pid: product.pid,
            productName: product.pnm,
            productImage: product.image 
              ? `${API_PREFIX}/images/${product.image}` 
              : `${API_PREFIX}/images/default-product.jpg`,
            description: product.pdesc,
            quantity: quantity,
            price: product.price,
            amount: product.price * quantity
          });
        }
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        alert('장바구니에 담았습니다. (임시 저장)');
      } else {
        alert('장바구니 추가에 실패했습니다.');
      }
    }
  };

  // ✅ 구매하기 함수 수정 (회원/비회원 모두 지원)
  const handleBuyNow = () => {
    if (!product) {
      alert('상품 정보를 불러오는 중입니다.');
      return;
    }

    // PaymentPage로 전달할 상품 정보 구성
    const productInfo = {
      productName: product.pnm,
      productImage: product.image 
        ? `${API_PREFIX}/images/${product.image}` 
        : `${API_PREFIX}/images/default-product.jpg`,
      description: product.pdesc,
      quantity: quantity,
      amount: product.price * quantity,
      pid: product.pid,
      price: product.price, // 단가 추가
      isGuest: !getUserId() // 비회원 여부 표시
    };

    console.log('구매하기 - 상품 정보:', productInfo);

    // PaymentPage로 navigate (state로 상품 정보 전달)
    navigate('/payment', { 
      state: productInfo 
    });
  };

  const handleRelPrev = () => relIndex > 0 && setRelIndex(i => i - 1);
  const handleRelNext = () => {
    if (relIndex + VISIBLE_CNT < relatedProducts.length) setRelIndex(i => i + 1);
  };

  const infoLabels = [
    { label: '적립금', value: product ? `${Math.floor(product.price * 0.01)}원` : '-' },
    { label: '원산지', value: product?.origin || '국내' },
    { label: '카테고리', value: product?.mainCategory },
    { label: '유통기한', value: product?.expDate || '-' },
  ];

  const totalPrice = product ? product.price * quantity : 0;

  if (error) {
    return (
      <div className="upd-container">
        <div className="upd-tab-content" style={{ textAlign: 'center' }}>
          <p>{error}</p>
          <button className="upd-buy-btn" onClick={() => navigate(-1)}>뒤로가기</button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="upd-container">
        <div className="upd-tab-content" style={{ textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="upd-container">
      {/* 상단 카테고리 네비 */}
      <div className="upd-categories">
        {categoryLinks.map((c) => (
          <span
            key={c.name}
            className="upd-category-item"
            onClick={() => handleCategoryClick(c.to)}
            style={{ userSelect: 'none' }}
          >
            {c.name}
          </span>
        ))}
      </div>

      {/* 메인(이미지 + 정보) */}
      <div className="upd-main-flex">
        {/* 메인 이미지 */}
        <div className="upd-img-box">
          <img
            src={
              product.image
                ? `${API_PREFIX}/images/${product.image}`
                : `${API_PREFIX}/images/default-product.jpg`
            }
            alt={product.pnm}
            className="upd-main-img"
          />
        </div>

        {/* 상품 정보 */}
        <div className="upd-info-box">
          <div className="upd-title-row">
            <span className="upd-title">{product.pnm}</span>
            {product.hit > 0 && <span className="upd-hit">HIT</span>}
          </div>

          <div className="upd-price">₩{Number(product.price).toLocaleString()}</div>

          <div className="upd-vertical-info-list">
            {infoLabels.map((item) => (
              <div className="upd-vertical-row" key={item.label}>
                <span className="upd-v-label">{item.label}</span>
                <span className="upd-v-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="upd-desc-box">{product.pdesc}</div>

          {/* 수량/금액 */}
          <div className="upd-order-row">
            <span>{product.pnm}</span>
            <button className="upd-quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
            <span>{quantity}</span>
            <button className="upd-quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
            <span style={{ fontWeight: 600, marginLeft: 13 }}>
              ₩{Number(product.price).toLocaleString()} <span style={{ color: '#aaa', fontWeight: 400, fontSize: '0.96rem' }}>(250g)</span>
            </span>
          </div>

          <div className="upd-total-row">
            TOTAL <b style={{ marginLeft: 9 }}>₩{Number(totalPrice).toLocaleString()} <span className="upd-total-cnt">({quantity}개)</span></b>
          </div>

          <div className="upd-btn-group">
            <button className="upd-buy-btn" onClick={handleBuyNow}>구매하기</button>
            <div className="upd-cart-wish-row">
              <button className="upd-cart-btn" onClick={handleAddToCart}>장바구니</button>
              <button className="upd-wish-btn">관심상품</button>
            </div>
          </div>
        </div>
      </div>

      {/* 나머지 섹션들은 동일... */}
      {/* 상단 고정 탭 메뉴 */}
      <div className="upd-sticky-menu">
        {MENU_ITEMS.map((m) => (
          <button
            key={m.key}
            className={`upd-menu-btn ${activeTab === m.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 상품정보 섹션 */}
      <section ref={sectionRefs.description} className="upd-section">
        <h3>상품정보</h3>
        <div className="upd-desc-box">{product.pdesc}</div>
      </section>

      {/* 구매정보 섹션 */}
      <section ref={sectionRefs.purchase} className="upd-section">
        <div className="upd-purchase-info-wrap">
          <div className="upd-purchase-flex">
            <div className="upd-purchase-col">
              <div className="upd-purchase-title">상품결제정보</div>
              <div className="upd-purchase-content">
                <p>고액결제의 경우 안전을 위해 카드사에서 확인전화를 드릴 수도 있습니다. 확인과정에서 도난 카드의 사용이나 타인 명의의 주문 등 정상적인 주문이 아니라고 판단될 경우 임의로 주문을 보류 또는 취소할 수 있습니다.</p>
                <p>무통장 입금은 상품 구매 대금은 PC뱅킹, 인터넷뱅킹, 텔레뱅킹 혹은 가까운 은행에서 직접 입금하시면 됩니다.</p>
                <p>주문시 입력한 입금자명과 실제입금자의 성명이 반드시 일치하여야 하며, 7일 이내로 입금을 하셔야 하며 입금되지 않은 주문은 자동취소 됩니다.</p>
              </div>
            </div>
            <div className="upd-purchase-col">
              <div className="upd-purchase-title">배송정보</div>
              <div className="upd-purchase-content">
                <ul>
                  <li>배송 방법 : 택배</li>
                  <li>배송 지역 : 전국지역</li>
                  <li>배송 비용 : ₩3,500</li>
                  <li>배송 기간 : 1일 ~ 2일</li>
                  <li>배송 안내 : 택배사 - 우체국 택배</li>
                  <li>- 배송비: 기본배송료 4,000원이며, 50,000원 이상 구매 시 무료배송입니다.<br />(제주, 도서, 산간, 오지 일부지역은 배송되지 않습니다.)</li>
                  <li>- 본 상품의 평균 배송일은 택배 배송의 경우 출고 후 1일입니다.<br />(주문시점(주문순서)에 따른 유동성으로 평균 배송일과 차이가 있을 수 있습니다.)</li>
                  <li>- 오후 12시 이전 주문은 당일 발송, 12시 이후 주문은 익일 발송됩니다.</li>
                  <li>- 금요일 12시 이후~일요일 주문은 월요일 발송되어 화요일 도착합니다.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="upd-exchange-info">
            <div className="upd-exchange-icon" />
            <div>
              <div className="upd-exchange-title">교환 및 반품정보</div>
              <ul>
                <li>- 교환/환불 요청: 문의 게시판 및 카카오플러스친구 이용 시 빠르게 처리됩니다.</li>
                <li>- 제품 이상/변질 시 즉시 연락 주시면 바로 처리해 드립니다.</li>
                <li>- 문제 발생 시 사진을 보내주시면 보다 빠른 지원이 가능합니다.</li>
                <li>- 신선식품 특성상 단순 변심 사유는 교환/환불이 불가합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 관련상품 섹션 */}
      <section ref={sectionRefs.related} className="upd-section">
        <h3>관련상품</h3>
        {relatedProducts.length === 0 ? (
          <p className="upd-related-empty">해당 카테고리의 관련 상품이 없습니다.</p>
        ) : (
          <div className="upd-related-wrap">
            {relatedProducts.length > VISIBLE_CNT && (
              <button
                className="upd-rel-arrow upd-rel-prev"
                onClick={handleRelPrev}
                disabled={relIndex === 0}
                aria-label="이전"
              >
                ‹
              </button>
            )}

            <div className="upd-related-viewport">
              <div
                className="upd-related-track"
                style={{ transform: `translateX(-${relIndex * (100 / VISIBLE_CNT)}%)` }}
              >
                {relatedProducts.map((rp) => (
                  <div
                    key={rp.pid}
                    className="upd-related-card"
                    onClick={() => navigate(`/product/${rp.pid}`)}
                  >
                    <div className="upd-related-thumb">
                      <img
                        src={
                          rp.image
                            ? `${API_PREFIX}/images/${rp.image}`
                            : `${API_PREFIX}/images/default-product.jpg`
                        }
                        alt={rp.pnm}
                      />
                    </div>
                    <div className="upd-related-info">
                      <div className="upd-related-name" title={rp.pnm}>{rp.pnm}</div>
                      <div className="upd-related-price">₩{Number(rp.price).toLocaleString()}</div>
                    </div>
                    {rp.hit > 0 && <span className="upd-related-hit">HIT</span>}
                  </div>
                ))}
              </div>
            </div>

            {relatedProducts.length > VISIBLE_CNT && (
              <button
                className="upd-rel-arrow upd-rel-next"
                onClick={handleRelNext}
                disabled={relIndex + VISIBLE_CNT >= relatedProducts.length}
                aria-label="다음"
              >
                ›
              </button>
            )}
          </div>
        )}
      </section>

      {/* 구매후기 섹션 */}
      <section ref={sectionRefs.reviews} className="upd-section">
        <h3>구매후기</h3>

        {/* 작성 폼 (구매자만) */}
        {eligible ? (
          <form className="rev-form" onSubmit={submitReview}>
            <div className="rev-row">
              <label>평점</label>
              <select
                value={revForm.rating}
                onChange={(e) => setRevForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="rev-row">
              <label>내용</label>
              <textarea
                value={revForm.content}
                onChange={(e) => setRevForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="구매 후기를 남겨주세요."
              />
            </div>
            <div className="rev-row">
              <label>파일</label>
              <input type="file" accept="image/*"
                onChange={(e) => setRevForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              />
            </div>
            <button className="upd-buy-btn" type="submit">후기 등록</button>
          </form>
        ) : (
          <p className="muted">이 상품 구매 이력이 있어야 후기를 작성할 수 있습니다.</p>
        )}

        {/* 목록 */}
        <div className="rev-list">
          {reviews.length === 0 && <p className="muted">등록된 후기가 없습니다.</p>}
          {reviews.map((r) => (
            <div key={r.rid} className="rev-item">
              <div className="rev-meta">
                <b>{maskId(r.writerId)}</b>
                <span className="rev-rating">★ {r.rating}</span>
                <span className="rev-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                {(getRole() === 'ADMIN' || getUserId() === r.writerId) && (
                  <button className="tiny danger" onClick={() => deleteReview(r.rid, r.writerId)}>삭제</button>
                )}
              </div>
              <div className="rev-content">{r.content}</div>
              {r.imageUrl && (
                <div className="rev-image">
                  <img src={r.imageUrl.startsWith('http') ? r.imageUrl : `/api/images/${r.imageUrl}`} alt="review" />
                </div>
              )}
              {/* 관리자 답글 쓰기 */}
              {getRole() === 'ADMIN' && (
                <div className="admin-reply">
                  <input
                    value={adminReply.targetType === 'review' && adminReply.targetId === r.rid ? adminReply.text : ''}
                    onChange={(e) => setAdminReply({ targetType: 'review', targetId: r.rid, text: e.target.value })}
                    placeholder="관리자 답글 작성..."
                  />
                  <button className="tiny" onClick={() => submitAdminReplyToReview(r.rid)}>등록</button>
                </div>
              )}
              {/* 기존 댓글(관리자/운영자 답변) 목록 노출 가정 */}
              {Array.isArray(r.comments) && r.comments.length > 0 && (
                <div className="rev-comments">
                  {r.comments.map((c) => (
                    <div key={c.cid} className="rev-comment">
                      <span className="badge">관리자</span> {c.content}
                      <span className="rev-date">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 상품문의 섹션 */}
      <section ref={sectionRefs.qna} className="upd-section">
        <h3>상품문의</h3>

        {/* ⬇️ 관리자면 폼 숨김 */}
        {getRole() !== 'ADMIN' && (
          <form className="qna-form" onSubmit={submitQna}>
            {/* 제목 */}
            <div className="q-row">
              <label>제목</label>
              <div className="q-field">
                <input
                  className="q-input"
                  value={qnaForm.title}
                  onChange={(e) => setQnaForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="제목을 입력하세요"
                />
              </div>
            </div>

            {/* 내용 */}
            <div className="q-row">
              <label>내용</label>
              <div className="q-field">
                <textarea
                  className="q-textarea"
                  maxLength={200}
                  value={qnaForm.content}
                  onChange={(e) => setQnaForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="문의 내용을 입력하세요"
                />
                <div className="q-counter">{qnaForm.content.length}/200</div>
              </div>
            </div>

            {/* 비밀글 */}
            <div className="q-row q-secret-row">
              <label className="q-secret-label">
                <input
                  type="checkbox"
                  checked={qnaForm.secret}
                  onChange={(e) => setQnaForm((f) => ({ ...f, secret: e.target.checked }))}
                /> 비밀글
              </label>
              {qnaForm.secret && (
                <input
                  type="password"
                  className="q-pass"
                  value={qnaForm.password}
                  onChange={(e) => setQnaForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="비밀글 비밀번호"
                />
              )}
            </div>

            <button className="qna-submit-btn" type="submit">문의 등록</button>
          </form>
        )}

        {/* 목록 */}
        <div className="qna-list">
          {qnas.length === 0 && <p className="muted">등록된 문의가 없습니다.</p>}
          {qnas.map((q) => (
            <div key={q.qid} className="qna-item">
              <div className="qna-head">
                <b className="qna-title" onClick={() => openQna(q)} style={{ cursor: 'pointer' }}>
                  {q.secret && <span className="lock">🔒</span>} {q.title}
                </b>
                <span className="qna-writer">{maskId(q.writerId)}</span>
                <span className="qna-date">{new Date(q.createdAt).toLocaleDateString()}</span>
                {(getRole() === 'ADMIN' || getUserId() === q.writerId) && (
                  <button className="tiny danger" onClick={() => deleteQna(q.qid, q.writerId)}>삭제</button>
                )}
              </div>

              {/* 펼침 상세 */}
              {openQnaId === q.qid && qnaDetail && (
                <div className="qna-detail">
                  <div className="qna-content">{qnaDetail.content}</div>

                  {/* 관리자 답글 입력 */}
                  {getRole() === 'ADMIN' && (
                    <div className="admin-reply">
                      <input
                        value={adminReply.targetType === 'qna' && adminReply.targetId === q.qid ? adminReply.text : ''}
                        onChange={(e) => setAdminReply({ targetType: 'qna', targetId: q.qid, text: e.target.value })}
                        placeholder="관리자 답글 작성..."
                      />
                      <button className="tiny" onClick={() => submitAdminReplyToQna(q.qid)}>등록</button>
                    </div>
                  )}

                  {/* 댓글 목록 */}
                  {Array.isArray(qnaDetail.comments) && qnaDetail.comments.length > 0 && (
                    <div className="qna-comments">
                      {qnaDetail.comments.map((c) => (
                        <div key={c.cid} className="qna-comment">
                          <span className="badge">관리자</span> {c.content}
                          <span className="qna-date">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default UPdPage;