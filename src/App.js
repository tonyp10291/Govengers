// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { ProductProvider } from './context/ProductContext';
import TopHeader from './component/TopHeader';
import Footer from './component/Footer';

// 공용/유저 페이지
import Home from './pages/Home';
import Login from './pages/common/Login';
import Join from './pages/common/Join';
import Find from './pages/common/Find';
import ResetPassword from './pages/common/ResetPassword';
import NTList from './pages/common/NTList';
import NTView from './pages/common/NTView';

import UPdList from './pages/user/UPdList';
import UPdPage from './pages/user/UPdPage';
import UQnA from './pages/user/UQnA';
import UQAdd from './pages/user/UQAdd';
import Wishlist from './pages/user/UPic';
import Cart from './pages/user/UCart';
import Mypage from './pages/user/Mypage';
import PaymentPage from './pages/user/PaymentPage';
import PaymentSuccess from './pages/user/PaymentSuccess';
import ShippingGuide from './pages/guides/ShippingGuide';
import PointGuide from './pages/guides/PointGuide';
import CookingGuide from './pages/guides/CookingGuide';

// 관리자 페이지
import MQnA from './pages/admin/MQnA';
import NTWrt from './pages/admin/NTWrt';
import NTEdit from './pages/admin/NTEdit';
import MUser from './pages/admin/MUser';
import MRv from './pages/admin/MRv';
import PdAdd from './pages/admin/PdAdd';
import PdOrder from './pages/admin/PdOrder';
import PdList from './pages/admin/PdList';
import PdEdit from './pages/admin/PdEdit';
import QnaDetailAdmin from './pages/admin/QnaDetailAdmin';

// ✅ 간단 어드민 가드 (토큰 유무만 체크; 실제 권한은 백엔드가 검증)
function RequireAdmin({ children }) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  useEffect(() => {
    const guestId = localStorage.getItem('guest_id');
    if (!guestId) localStorage.setItem('guest_id', crypto.randomUUID());
  }, []);

  return (
    <BrowserRouter>
      <TopHeader />
      <main>
        <Routes>
          {/* 기본 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/find" element={<Find />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 공지 */}
          <Route path="/ntlist" element={<NTList />} />
          <Route path="/notice/view/:id" element={<NTView />} />

          {/* 상품(유저) */}
          <Route
            path="/products"
            element={
              <ProductProvider>
                <UPdList />
              </ProductProvider>
            }
          />
          <Route path="/product/:pid" element={<UPdPage />} />

          {/* 유저 QnA */}
          <Route path="/uqna" element={<UQnA />} />
          <Route path="/uqadd" element={<UQAdd />} />

          {/* 유저 기타 */}
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/mypage" element={<Mypage />} />

          {/* 결제 */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />

          {/* 가이드 */}
          <Route path="/shipping-guide" element={<ShippingGuide />} />
          <Route path="/point-guide" element={<PointGuide />} />
          <Route path="/cooking-guide" element={<CookingGuide />} />

          {/* 관리자 */}
          <Route path="/admin/mqna" element={<MQnA />} />
          <Route path="/admin/ntwrt" element={<NTWrt />} />
          <Route path="/admin/notice/edit/:id" element={<NTEdit />} />
          <Route path="/admin/muser" element={<MUser />} />
          <Route path="/admin/mrv" element={<MRv />} />
          <Route path="/admin/pdadd" element={<PdAdd />} />
          <Route path="/admin/pdorder" element={<PdOrder />} />
          <Route path="/admin/pdlist" element={<PdList />} />
          <Route path="/admin/PdEdit/:pid" element={<PdEdit />} />

          {/* 관리자 QnA 상세 (답변 작성) */}
          <Route
            path="/admin/qna/:qid"
            element={
              <RequireAdmin>
                <QnaDetailAdmin />
              </RequireAdmin>
            }
          />

          {/* 기타 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
