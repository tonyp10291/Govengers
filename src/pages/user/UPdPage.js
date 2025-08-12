import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/user/UPdPage.css';
import { Button } from '../../util/Buttons';
import api from '../../api/axiosInstance';

const API_PREFIX = '/api';

const parseSafeDate = (v) => {
  if (!v) return null;
  if (typeof v === 'number') return new Date(v);
  if (Array.isArray(v)) {
    const [y, M, d, h = 0, m = 0, s = 0] = v;
    return new Date(y, (M || 1) - 1, d || 1, h, m, s);
  }
  if (typeof v === 'string') {
    let s = v.trim();
    if (s.indexOf('T') < 0 && s.indexOf(' ') > -1) s = s.replace(' ', 'T');
    s = s.replace(/\.(\d{3})\d+/, '.$1');
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(\.\d+)?$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  }
  return null;
};
const formatDateTime = (v) => {
  const d = parseSafeDate(v);
  return d ? d.toLocaleString() : '';
};

// ===== JWT helpers =====
const getToken = () =>
  (localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('Authorization') ||
    ''
  ).replace(/^Bearer\s+/i, '');

const readRoleRaw = () =>
  (localStorage.getItem('role') ||
    sessionStorage.getItem('role') ||
    localStorage.getItem('auth') ||
    ''
  ).replace(/["\[\]\s]/g, '').toUpperCase();

const rolesFromToken = () => {
  try {
    const t = getToken();
    if (!t) return [];
    const payload = JSON.parse(atob((t.split('.')[1] || '')));
    const r = payload?.role || payload?.roles || payload?.authorities;
    if (!r) return [];
    return Array.isArray(r) ? r.map(x => String(x).toUpperCase())
      : String(r).toUpperCase().split(',');
  } catch {
    return [];
  }
};

const isAdmin = () =>
  readRoleRaw().includes('ADMIN') || rolesFromToken().some(r => r.includes('ADMIN'));

const getUserId = () => {
  try {
    const t = getToken();
    if (t) {
      const p = JSON.parse(atob((t.split('.')[1] || '')));
      const fromToken = p?.sub || p?.uid;
      if (fromToken) return String(fromToken);
    }
  } catch { }
  return (localStorage.getItem('userId') || '').replace(/"/g, '');
};

const getPid = (p) => p?.pid ?? p?.id ?? p?.productId ?? p?.pno ?? null;
const maskId = (id) => {
  if (!id) return '';
  if (id.includes('.entity.User')) id = id.split('.').pop();
  return id.length <= 3 ? id[0] + '**' : id.slice(0, id.length - 3) + '***';
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

/* 반응형 관련상품 */
const getVisibleCnt = () => {
  const w = window.innerWidth || 1200;
  if (w < 480) return 1;
  if (w < 768) return 2;
  if (w < 1024) return 3;
  if (w < 1280) return 4;
  return 5;
};

function UPdPage() {
  const topRef = useRef(null);
  const revTopRef = useRef(null);
  const { pid } = useParams();
  const navigate = useNavigate();

  const imgUrl = (s) => (s?.startsWith('/api/images/') ? s : `${API_PREFIX}/images/${s}`);

  /* 공통 */
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  /* 관련상품 */
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relIndex, setRelIndex] = useState(0);
  const [visibleCnt, setVisibleCnt] = useState(getVisibleCnt());
  const clampRelIndex = (i, len = relatedProducts.length, vc = visibleCnt) =>
    Math.min(Math.max(0, i), Math.max(0, len - vc));
  const handleRelPrev = () => setRelIndex((i) => clampRelIndex(i - 1));
  const handleRelNext = () => setRelIndex((i) => clampRelIndex(i + 1));

  /* 상세 이미지 (상품정보 섹션 하단) */
  const [detailImages, setDetailImages] = useState([]);

  // ✅ 상세 이미지: POST /products/{pid}/images/list 우선, 실패 시 GET /products/{pid}/images 폴백
  useEffect(() => {
    if (!pid) return;
    (async () => {
      const normalize = (raw) => {
        const arr = Array.isArray(raw) ? raw : raw?.content || raw?.list || [];
        return arr
          .map(it => (typeof it === 'string' ? it
            : (it?.savedFilename || it?.filename || it?.fileName || it?.path || it?.image || it?.url || '')))
          .filter(Boolean)
          .map(s => s.replace(/^.*[\\/]/, ''));
      };

      try {
        const r = await api.post(`/products/${pid}/images/list`, null, { meta: { silent: true } });
        setDetailImages(normalize(r.data));
      } catch {
        try {
          const r = await api.get(`/products/${pid}/images`, { meta: { silent: true } });
          setDetailImages(normalize(r.data));
        } catch (e2) {
          console.warn('상세 이미지 불러오기 실패/없음:', e2);
          setDetailImages([]);
        }
      }
    })();
  }, [pid]);

  // ✅ 관련상품 클릭 시: 이동 + 상단 스크롤
  const goProductAndTop = (rid) => {
    navigate(`/product/${rid}`);
    setActiveTab('description');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pid]);

  useEffect(() => {
    const onResize = () => {
      const cnt = getVisibleCnt();
      setVisibleCnt((prev) => {
        if (prev !== cnt) setRelIndex((i) => clampRelIndex(i, relatedProducts.length, cnt));
        return cnt;
      });
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedProducts.length]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement?.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handleRelPrev();
      if (e.key === 'ArrowRight') handleRelNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [relIndex, relatedProducts.length, visibleCnt]);

  /* ===== 상품 상세 ===== */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${pid}`, { meta: { silent: true } });
        setProduct(res.data);
        setError('');
      } catch (err) {
        if (err?.response?.status === 404) setError('상품을 찾을 수 없습니다.');
        else {
          console.error('상품 정보 로드 실패:', err);
          setError('상품 정보를 불러올 수 없습니다');
        }
      }
    };
    if (pid) fetchProduct();
  }, [pid]);

  /* ===== 관련상품 ===== */
  useEffect(() => {
    if (!product) return;

    const getMainCategory = (p) => p?.mainCategory ?? p?.main_category ?? p?.category ?? null;

    const fetchPage = async (qs) => {
      try {
        const res = await api.get(`/products?${qs}`, { meta: { silent: true } });
        const data = res.data;
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.list)
            ? data.list
            : Array.isArray(data)
              ? data
              : [];
        return list;
      } catch {
        return [];
      }
    };

    const run = async () => {
      const mc = getMainCategory(product);
      if (!mc) return setRelatedProducts([]);

      const tries = [
        new URLSearchParams({ page: '1', size: '30', mainCategory: mc }).toString(),
        new URLSearchParams({ page: '0', size: '30', mainCategory: mc }).toString(),
        new URLSearchParams({ page: '1', size: '30', main_category: mc }).toString(),
        new URLSearchParams({ page: '0', size: '30', main_category: mc }).toString(),
      ];
      let list = [];
      for (const q of tries) {
        list = await fetchPage(q);
        if (list.length) break;
      }
      list = list.filter((p) => getPid(p) && getPid(p) !== product.pid);
      setRelatedProducts(list);
      setRelIndex(0);
    };

    run();
  }, [product]);

  /* ===== 리뷰 ===== */
  const [reviews, setReviews] = useState([]);
  const [revPage, setRevPage] = useState(1);
  const [revSize, setRevSize] = useState(10);
  const [revTotal, setRevTotal] = useState(0);
  const [revShowForm, setRevShowForm] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [revForm, setRevForm] = useState({ content: '', file: null, rating: 5 });
  const [revDeleteMode, setRevDeleteMode] = useState(false);
  const [selectedRevs, setSelectedRevs] = useState([]);
  const revLastPage = Math.max(1, Math.ceil((revTotal || 0) / revSize) || 1);
  const [openRevId, setOpenRevId] = useState(null);
  const [revDetail, setRevDetail] = useState(null);
  const [revReplyTextByRid, setRevReplyTextByRid] = useState({});
  const setRevReplyText = (rid, val) =>
    setRevReplyTextByRid(prev => ({ ...prev, [rid]: val }));

  const fetchReviewDetailById = async (rid) => {
    try {
      const r = await api.get(`/reviews/${rid}`, { meta: { silent: true } });
      return r.data;
    } catch (e) {
      try { const r = await api.get('/reviews/detail', { params: { rid }, meta: { silent: true } }); return r.data; } catch (_) { }
      try { const r = await api.post('/reviews/detail', { rid }, { meta: { silent: true } }); return r.data; } catch (_) { }
      throw e;
    }
  };

  const openReviewForReply = async (r) => {
    try {
      const d = await fetchReviewDetailById(r.rid);
      setRevDetail(d);
      setOpenRevId(r.rid);
    } catch (err) {
      console.error('리뷰 상세 조회 실패:', err);
      alert('후기 내용을 불러올 수 없습니다.');
    }
  };

  const submitAdminReplyToReview = async (e, rid) => {
    e.preventDefault();
    if (!isAdmin()) return;
    const text = (revReplyTextByRid[rid] || '').trim();
    if (!text) return;
    try {
      await api.post(`/reviews/${rid}/comments`, { content: text });
      const d = await fetchReviewDetailById(rid);
      setRevDetail(d);
      setRevReplyTextByRid(prev => ({ ...prev, [rid]: '' }));
    } catch (err) {
      console.error('리뷰 답글 등록 실패:', err);
      alert('답글 등록 실패');
    }
  };

  /* ===== 리뷰 목록 ===== */
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.pid) return;
      try {
        const res = await api.get('/reviews', {
          params: { pid: product.pid, page: revPage, size: revSize },
          meta: { silent: true },
        });
        const data = res.data;
        setReviews(Array.isArray(data) ? data : data.content || []);
        setRevTotal(data?.totalElements ?? data?.total ?? (Array.isArray(data) ? data.length : 0));
      } catch (err) {
        if (err?.response?.status !== 404) console.error('리뷰 목록 로드 실패:', err);
        setReviews([]);
        setRevTotal(0);
      }
    };
    fetchReviews();
  }, [product?.pid, revPage, revSize]);

  /* ===== 후기 자격(구매자) 확인 ===== */
  useEffect(() => {
    const checkEligibility = async () => {
      if (!product?.pid) return;
      try {
        const res = await api.get('/orders/eligible-review', {
          params: { pid: product.pid },
          meta: { silent: true },
        });
        setEligible(Boolean(res.data?.eligible));
      } catch (err) {
        if (err?.response?.status !== 404) console.error('리뷰 자격 확인 실패:', err);
        setEligible(false);
      }
    };
    checkEligibility();
  }, [product?.pid]);

  /* ===== QnA ===== */
  const [qnas, setQnas] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const lastPage = Math.max(1, Math.ceil((total || 0) / size) || 1);
  const [showForm, setShowForm] = useState(false);
  const [qnaForm, setQnaForm] = useState({ title: '', content: '', secret: false, password: '' });
  const [openQnaId, setOpenQnaId] = useState(null);
  const [qnaDetail, setQnaDetail] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedQnas, setSelectedQnas] = useState([]);
  const [replyTextByQid, setReplyTextByQid] = useState({});
  const setReplyText = (qid, val) => setReplyTextByQid(prev => ({ ...prev, [qid]: val }));

  const sectionRefs = {
    description: useRef(null),
    purchase: useRef(null),
    related: useRef(null),
    reviews: useRef(null),
    qna: useRef(null),
  };

  const makeListNo = (idx) => (total > 0 ? total - ((page - 1) * size + idx) : qnas.length - idx);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToRevTop = () => revTopRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchQna = async () => {
    if (!product?.pid) return;
    try {
      const res = await api.get('/qna', {
        params: { pid: product.pid, page, size },
        meta: { silent: true },
      });
      const pg = res.data;
      setQnas(pg.content || []);
      setTotal(pg.totalElements || 0);
    } catch (err) {
      if (err?.response?.status !== 404) console.error('QnA 목록 로드 실패:', err);
      setQnas([]);
      setTotal(0);
    }
  };
  useEffect(() => { fetchQna(); }, [product?.pid, page, size]);

  const onClickWriteReview = () => {
    if (!eligible) return alert('구매이력이 있어야 작성이 가능합니다!');
    setRevShowForm(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!revForm.content.trim()) return alert('후기 내용을 입력해 주세요.');
    const fd = new FormData();
    fd.append('pid', product.pid);
    fd.append('content', revForm.content);
    fd.append('rating', revForm.rating);
    if (revForm.file) fd.append('file', revForm.file);
    try {
      const res = await api.post('/reviews', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const saved = res.data;
      setReviews((prev) => [saved, ...prev]);
      setRevForm({ content: '', file: null, rating: 5 });
      setRevShowForm(false);
      alert('리뷰가 등록되었습니다.');
    } catch (err) {
      console.error('리뷰 등록 실패:', err);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  const deleteReview = async (rid, writerId) => {
    const me = getUserId();
    if (!isAdmin() && me !== writerId) return alert('삭제 권한이 없습니다.');
    if (!window.confirm('이 후기를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/reviews/${rid}`);
      setReviews((prev) => prev.filter((r) => r.rid !== rid));
      alert('후기가 삭제되었습니다.');
    } catch (err) {
      console.error('리뷰 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  const toggleRevDeleteMode = () => { setRevDeleteMode((v) => !v); setSelectedRevs([]); };
  const handleRevSelection = (rid) => {
    setSelectedRevs((prev) => (prev.includes(rid) ? prev.filter((id) => id !== rid) : [...prev, rid]));
  };
  const deleteSelectedRevs = async () => {
    if (selectedRevs.length === 0) return alert('삭제할 후기를 선택하세요.');
    if (!window.confirm(`선택한 ${selectedRevs.length}개의 후기를 삭제하시겠습니까?`)) return;
    try {
      for (const rid of selectedRevs) await api.delete(`/reviews/${rid}`);
      setReviews((prev) => prev.filter((r) => !selectedRevs.includes(r.rid)));
      setSelectedRevs([]);
      setRevDeleteMode(false);
      alert('선택한 후기가 삭제되었습니다.');
    } catch (err) {
      console.error('선택 후기 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  const submitQna = async (e) => {
    e.preventDefault();
    if (isAdmin()) { alert('관리자는 문의를 등록할 수 없습니다.'); return; }
    if (!qnaForm.title.trim()) return alert('제목을 입력해주세요.');
    if (!qnaForm.content.trim()) return alert('내용을 입력해주세요.');
    if (qnaForm.secret && !qnaForm.password.trim()) return alert('비밀글 비밀번호를 입력해주세요.');

    const body = {
      pid: product.pid,
      title: qnaForm.title,
      content: qnaForm.content,
      secret: qnaForm.secret,
      password: qnaForm.secret ? qnaForm.password : null,
    };

    try {
      await api.post('/qna', body);
      alert('등록되었습니다.');
      setQnaForm({ title: '', content: '', secret: false, password: '' });
      setShowForm(false);
      setPage(1);
      await fetchQna();
    } catch (err) {
      console.error('QnA 등록 실패:', err);
      if (err?.response?.status === 401) alert('다시 로그인 해주세요.');
      else if (err?.response?.status === 403) alert('작성 권한이 없습니다.');
      else alert('등록 실패');
    }
  };

  const deleteOwnQna = async (qid, writerId) => {
    if (isAdmin()) return;
    const me = getUserId();
    if (me !== writerId) return alert('삭제 권한이 없습니다.');
    if (!window.confirm('이 문의를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/qna/${qid}`);
      await fetchQna();
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('QnA 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  const handleDeleteModeToggle = () => {
    setDeleteMode(!deleteMode);
    setSelectedQnas([]);
    setOpenQnaId(null);
    setQnaDetail(null);
  };
  const handleQnaSelection = (qid) => {
    setSelectedQnas((prev) => (prev.includes(qid) ? prev.filter((id) => id !== qid) : [...prev, qid]));
  };
  const handleDeleteSelectedQnas = async () => {
    if (selectedQnas.length === 0) return alert('삭제할 문의를 선택하세요.');
    if (!window.confirm(`선택한 ${selectedQnas.length}개의 문의를 삭제하시겠습니까?`)) return;
    try {
      for (const qid of selectedQnas) await api.delete(`/qna/${qid}`);
      setSelectedQnas([]); setDeleteMode(false);
      await fetchQna();
      alert('선택한 문의가 삭제되었습니다.');
    } catch (err) {
      console.error('QnA 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  const openQna = async (q) => {
    if (deleteMode) return;
    const me = getUserId();

    if (isAdmin() || q.writerId === me || !q.secret) {
      try {
        const [detailRes, commentsRes] = await Promise.all([
          api.get(`/qna/${q.qid}`, { meta: { silent: true } }),
          api.get(`/qna/${q.qid}/comments`, { meta: { silent: true } }),
        ]);
        const detail = detailRes.data || {};
        const comments = commentsRes.data || [];
        setQnaDetail({ ...detail, comments });
        setOpenQnaId(q.qid);
      } catch (err) {
        console.error('QnA 상세 조회 실패:', err);
        alert('문의 내용을 불러올 수 없습니다.');
      }
      return;
    }

    const pw = prompt('비밀글 비밀번호를 입력해 주세요.');
    if (!pw) return;

    try {
      const v = await api.post(`/qna/${q.qid}/verify`, { password: pw });
      if (!v.data?.ok) return alert('비밀번호가 올바르지 않습니다.');
      const r = await api.get(`/qna/${q.qid}`);
      setQnaDetail(r.data);
      setOpenQnaId(q.qid);
    } catch (err) {
      console.error('비밀글 확인 실패:', err);
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const submitAdminReplyInline = async (e, qid) => {
    e.preventDefault();
    if (!isAdmin()) return;
    const text = (replyTextByQid[qid] || '').trim();
    if (!text) return;

    try {
      const { data: saved } = await api.post(`/qna/${qid}/comments`, { content: text });
      if (!saved.createdAt) saved.createdAt = new Date().toISOString();

      setQnaDetail(prev => prev ? { ...prev, comments: [...(prev.comments || []), saved] } : prev);
      setQnas(prev => prev.map(item =>
        item.qid === qid
          ? { ...item, comments: [...(item.comments || []), saved], commentCount: (item.commentCount ?? (item.comments?.length ?? 0)) + 1 }
          : item
      ));
      setReplyTextByQid(prev => ({ ...prev, [qid]: '' }));
    } catch (err) {
      console.error('관리자 답글 등록 실패:', err);
      alert('답글 등록 실패');
    }
  };

  const handleMenuClick = (key) => {
    setActiveTab(key);
    sectionRefs[key].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleCategoryClick = (to) => {
    navigate(to);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };
  const handleQuantityChange = (delta) => setQuantity((q) => Math.max(1, q + delta));
  const handleAddToCart = () => alert('장바구니에 담았습니다 (실제 기능 연동 필요)');
  const handleBuyNow = () => alert('구매하기 기능은 개발중입니다!');

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
      {/* 카테고리 네비 */}
      <div className="upd-categories">
        {categoryLinks.map((c) => (
          <span key={c.name} className="upd-category-item" onClick={() => handleCategoryClick(c.to)} style={{ userSelect: 'none', cursor: 'pointer' }}>
            {c.name}
          </span>
        ))}
      </div>

      {/* 메인 */}
      <div className="upd-main-flex">
        {/* 이미지 */}
        <div className="upd-img-box">
          <img
            src={product.image ? `${API_PREFIX}/images/${product.image}` : `${API_PREFIX}/images/default-product.jpg`}
            alt={product.pnm}
            className="upd-main-img"
            onError={(e) => { e.target.src = `${API_PREFIX}/images/default-product.jpg`; }}
          />
        </div>

        {/* 정보 */}
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

      {/* 상단 고정 탭 메뉴 */}
      <div className="upd-sticky-menu">
        {MENU_ITEMS.map((m) => (
          <button key={m.key} className={`upd-menu-btn ${activeTab === m.key ? 'active' : ''}`} onClick={() => handleMenuClick(m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      {/* 상품정보 섹션 (텍스트 + 상세이미지 그리드) */}
      <section ref={sectionRefs.description} className="upd-section">
        <h3>상품정보</h3>
        <div className="upd-desc-box">{product.pdesc}</div>

        {detailImages.length > 0 && (
          <div className="upd-desc-images full">
            {detailImages.map((fn) => (
              <img
                key={fn}
                src={imgUrl(fn)}
                alt="상세 이미지"
                className="upd-desc-img full"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ))}
          </div>
        )}
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

      {/* 관련상품 */}
      <section ref={sectionRefs.related} className="upd-section">
        <h3>관련상품</h3>
        {relatedProducts.length === 0 ? (
          <p className="upd-related-empty">해당 카테고리의 관련 상품이 없습니다.</p>
        ) : (
          <div className="upd-related-wrap">
            <button className="upd-rel-arrow upd-rel-prev" onClick={handleRelPrev} disabled={relIndex === 0} aria-label="이전" type="button">‹</button>
            <div className="upd-related-viewport" style={{ '--cards-per-view': visibleCnt }}>
              <div className="upd-related-track" style={{ transform: `translateX(-${relIndex * (100 / visibleCnt)}%)` }}>
                {relatedProducts.map((rp) => {
                  const rid = getPid(rp);
                  if (!rid) return null;
                  return (
                    <div
                      key={rid}
                      className="upd-related-card"
                      onClick={() => goProductAndTop(rid)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="upd-related-thumb">
                        <img
                          src={rp.image ? `${API_PREFIX}/images/${rp.image}` : `${API_PREFIX}/images/default-product.jpg`}
                          alt={rp.pnm}
                          onError={(e) => { e.target.src = `${API_PREFIX}/images/default-product.jpg`; }}
                        />
                      </div>
                      <div className="upd-related-info">
                        <div className="upd-related-name" title={rp.pnm}>{rp.pnm}</div>
                        <div className="upd-related-price">₩{Number(rp.price).toLocaleString()}</div>
                      </div>
                      {rp.hit > 0 && <span className="upd-related-hit">HIT</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <button className="upd-rel-arrow upd-rel-next" onClick={handleRelNext} disabled={relIndex + visibleCnt >= relatedProducts.length} aria-label="다음" type="button">›</button>
          </div>
        )}
      </section>

      {/* 구매후기 */}
      <section ref={sectionRefs.reviews} className="upd-section">
        <div ref={revTopRef} />
        <h3>구매후기</h3>

        <div className="qna-toolbar">
          {!revShowForm && <button className="qna-write-btn" onClick={onClickWriteReview}>WRITE</button>}
          {isAdmin() && (
            <>
              <button className="qna-delete-btn" onClick={toggleRevDeleteMode}>{revDeleteMode ? 'CANCEL' : 'DELETE'}</button>
              {revDeleteMode && <button className="qna-delete-confirm-btn" onClick={deleteSelectedRevs}>DELETE SELECTED ({selectedRevs.length})</button>}
            </>
          )}
        </div>

        {revShowForm && (
          <form className="qna-form" onSubmit={submitReview}>
            <div className="q-row">
              <label>평점</label>
              <div className="q-field">
                <select value={revForm.rating} onChange={(e) => setRevForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="q-input">
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                </select>
              </div>
            </div>

            <div className="q-row">
              <label>내용</label>
              <div className="q-field">
                <textarea className="q-textarea" value={revForm.content} onChange={(e) => setRevForm((f) => ({ ...f, content: e.target.value }))} placeholder="구매 후기를 남겨주세요." maxLength={500} />
                <div className="q-counter">{revForm.content.length}/500</div>
              </div>
            </div>

            <div className="q-row">
              <label>파일</label>
              <div className="q-field">
                <input type="file" accept="image/*" onChange={(e) => setRevForm((f) => ({ ...f, file: e.target.files?.[0] || null }))} className="q-input" />
              </div>
            </div>

            <div className="qna-btn-group">
              <button className="qna-submit-btn" type="submit">후기 등록</button>
              <button type="button" className="qna-cancel-btn" onClick={() => setRevShowForm(false)}>취소</button>
            </div>
          </form>
        )}

        <div className="qna-table">
          <div className="qna-row qna-header">
            {isAdmin() && revDeleteMode && <div className="col-checkbox">선택</div>}
            <div className="col-no">번호</div>
            <div className="col-title">내용</div>
            <div className="col-writer">작성자</div>
            <div className="col-date">작성일</div>
          </div>

          {reviews.length === 0 ? (
            <div className="qna-row qna-empty">
              {isAdmin() && revDeleteMode && <div className="col-checkbox">-</div>}
              <div className="col-no">-</div>
              <div className="col-title muted">등록된 후기가 없습니다.</div>
              <div className="col-writer">-</div>
              <div className="col-date">-</div>
            </div>
          ) : (
            reviews.map((r, idx) => (
              <div key={r.rid} className="qna-row">
                {isAdmin() && revDeleteMode && (
                  <div className="col-checkbox">
                    <input type="checkbox" checked={selectedRevs.includes(r.rid)} onChange={() => handleRevSelection(r.rid)} />
                  </div>
                )}
                <div className="col-no">{revTotal ? (revTotal - ((revPage - 1) * revSize + idx)) : (reviews.length - idx)}</div>
                <div className="col-title">
                  <span className="rev-rating">★ {r.rating}</span>&nbsp;
                  <span className="qna-title">{r.content}</span>
                  {r.imageUrl && <span className="rev-hasimg" style={{ marginLeft: 6 }}>📷</span>}
                  {!isAdmin() && getUserId() === r.writerId && !revDeleteMode && (
                    <button className="delete-btn" onClick={() => deleteReview(r.rid, r.writerId)} style={{ marginLeft: 8, fontSize: '12px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                      삭제
                    </button>
                  )}
                  {isAdmin() && !revDeleteMode && (
                    <button className="tiny" onClick={() => openReviewForReply(r)} style={{ marginLeft: 8 }}>답글</button>
                  )}
                </div>
                <div className="col-writer">{maskId(r.writerId)}</div>
                <div className="col-date">{formatDateTime(r.createdAt)}</div>

                {openRevId === r.rid && revDetail && !revDeleteMode && (
                  <div className="qna-detail">
                    <div className="qna-content">{revDetail.content || r.content}</div>
                    {isAdmin() && (
                      <form className="admin-reply inline" onSubmit={(e) => submitAdminReplyToReview(e, r.rid)}>
                        <textarea
                          rows={4}
                          className="fixed-textarea"
                          value={revReplyTextByRid[r.rid] || ''}
                          onChange={(e) => setRevReplyText(r.rid, e.target.value)}
                          placeholder="관리자 답글을 입력하세요"
                        />
                        <button type="submit" className="tiny">등록</button>
                      </form>
                    )}
                    {Array.isArray(revDetail.comments) && revDetail.comments.length > 0 && (
                      <div className="qna-comments">
                        {[...revDetail.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .map((c) => (
                            <div key={c.cid} className="qna-comment">
                              <span className="badge">관리자</span> {c.content}
                              <span className="qna-date">{formatDateTime(c.createdAt)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="qna-pagination">
          <Button text="≪" onClick={() => setRevPage(1)} disabled={revPage === 1} />
          <Button text="‹" onClick={() => setRevPage(p => Math.max(1, p - 1))} disabled={revPage === 1} />
          <span className="current">{revPage}</span>
          <Button text="›" onClick={() => setRevPage(p => Math.min(revLastPage, p + 1))} disabled={revPage === revLastPage} />
          <Button text="≫" onClick={() => setRevPage(revLastPage)} disabled={revPage === revLastPage} />
        </div>

        <button className="qna-top-btn" onClick={scrollToRevTop} aria-label="Go to top" title="Top">↑</button>
      </section>

      {/* Q & A */}
      <section ref={sectionRefs.qna} className="upd-section">
        <div ref={topRef} />
        <h3>Q & A</h3>

        <div className="qna-toolbar">
          {!isAdmin() && !showForm && <button className="qna-write-btn" onClick={() => setShowForm(true)}>WRITE</button>}
          {isAdmin() && (
            <>
              <button className="qna-delete-btn" onClick={handleDeleteModeToggle}>{deleteMode ? 'CANCEL' : 'DELETE'}</button>
              {deleteMode && <button className="qna-delete-confirm-btn" onClick={handleDeleteSelectedQnas}>DELETE SELECTED ({selectedQnas.length})</button>}
            </>
          )}
        </div>

        {!isAdmin() && showForm && (
          <form className="qna-form" onSubmit={submitQna}>
            <div className="q-row">
              <label>제목</label>
              <div className="q-field">
                <input className="q-input" value={qnaForm.title} onChange={(e) => setQnaForm((f) => ({ ...f, title: e.target.value }))} placeholder="제목을 입력하세요" required />
              </div>
            </div>

            <div className="q-row">
              <label>내용</label>
              <div className="q-field">
                <textarea className="q-textarea" maxLength={200} value={qnaForm.content} onChange={(e) => setQnaForm((f) => ({ ...f, content: e.target.value }))} placeholder="문의 내용을 입력하세요" required />
                <div className="q-counter">{qnaForm.content.length}/200</div>
              </div>
            </div>

            <div className="q-row q-secret-row">
              <label className="q-secret-label">
                <input type="checkbox" checked={qnaForm.secret} onChange={(e) => setQnaForm((f) => ({ ...f, secret: e.target.checked }))} /> 비밀글
              </label>
              {qnaForm.secret && (
                <input type="password" className="q-pass" value={qnaForm.password} onChange={(e) => setQnaForm((f) => ({ ...f, password: e.target.value }))} placeholder="비밀글 비밀번호" required={qnaForm.secret} />
              )}
            </div>

            <div className="qna-btn-group">
              <button className="qna-submit-btn" type="submit">문의 등록</button>
              <button type="button" className="qna-cancel-btn" onClick={() => { setShowForm(false); setQnaForm({ title: '', content: '', secret: false, password: '' }); }}>취소</button>
            </div>
          </form>
        )}

        <div className="qna-table">
          <div className="qna-row qna-header">
            {deleteMode && isAdmin() && <div className="col-checkbox">선택</div>}
            <div className="col-no">번호</div>
            <div className="col-title">제목</div>
            <div className="col-writer">작성자</div>
            <div className="col-date">작성일</div>
          </div>

          {qnas.length === 0 ? (
            <div className="qna-row qna-empty">
              {deleteMode && isAdmin() && <div className="col-checkbox">-</div>}
              <div className="col-no">-</div>
              <div className="col-title muted">등록된 문의가 없습니다.</div>
              <div className="col-writer">-</div>
              <div className="col-date">-</div>
            </div>
          ) : (
            qnas.map((q, idx) => (
              <div key={q.qid} className="qna-row">
                {deleteMode && isAdmin() && (
                  <div className="col-checkbox">
                    <input type="checkbox" checked={selectedQnas.includes(q.qid)} onChange={() => handleQnaSelection(q.qid)} />
                  </div>
                )}
                <div className="col-no">{makeListNo(idx)}</div>
                <div className="col-title">
                  <span className="qna-title" onClick={() => openQna(q)} style={{ cursor: deleteMode ? 'default' : 'pointer', color: deleteMode ? '#666' : 'inherit' }}>
                    {q.secret && <span className="lock">🔒</span>} {q.title}
                  </span>
                  {(q.commentCount ?? (q.comments?.length ?? 0)) > 0 && (
                    <span className="qna-count"> [{q.commentCount ?? q.comments.length}]</span>
                  )}
                  {!isAdmin() && getUserId() === q.writerId && !deleteMode && (
                    <button className="delete-btn" onClick={() => deleteOwnQna(q.qid, q.writerId)} style={{ marginLeft: 8, fontSize: '12px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
                      삭제
                    </button>
                  )}
                </div>
                <div className="col-writer">{maskId(q.writerId)}</div>
                <div className="col-date">{formatDateTime(q.createdAt)}</div>

                {openQnaId === q.qid && qnaDetail && !deleteMode && (
                  <div className="qna-detail">
                    {/* 문의 본문 */}
                    <div className="qna-content">{qnaDetail.content}</div>

                    {/* 관리자 댓글 입력: 본문 바로 밑 */}
                    {isAdmin() && (
                      <form className="admin-reply inline" onSubmit={(e) => submitAdminReplyInline(e, q.qid)}>
                        <textarea
                          rows={4}
                          className="fixed-textarea"
                          value={replyTextByQid[q.qid] || ''}
                          onChange={(e) => setReplyText(q.qid, e.target.value)}
                          placeholder="관리자 답글을 입력하세요"
                        />
                        <button type="submit" className="tiny">등록</button>
                      </form>
                    )}

                    {/* 댓글 목록 최신순 */}
                    {Array.isArray(qnaDetail.comments) && qnaDetail.comments.length > 0 && (
                      <div className="qna-comments">
                        {[...qnaDetail.comments]
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .map((c) => (
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
            ))
          )}
        </div>

        <div className="qna-pagination">
          <Button text="≪" onClick={() => setPage(1)} disabled={page === 1} />
          <Button text="‹" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
          <span className="current">{page}</span>
          <Button text="›" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} />
          <Button text="≫" onClick={() => setPage(lastPage)} disabled={page === lastPage} />
        </div>

        <button className="qna-top-btn" onClick={scrollToTop} aria-label="Go to top" title="Top">↑</button>
      </section>
    </div>
  );
}

export default UPdPage;
