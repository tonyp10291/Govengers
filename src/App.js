import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import TopHeader from './component/TopHeader';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './pages/common/Login';
import Join from './pages/common/Join';
import Find from './pages/common/Find';
import ResetPassword from './pages/common/ResetPassword';
import UPdList from './pages/user/UPdList';
import UPdPage from './pages/user/UPdPage';
import UQnA from './pages/user/UQnA';
import UQAdd from "./pages/user/UQAdd";
import Wishlist from './pages/user/UPic';
import Cart from './pages/user/UCart';
import MQnA from './pages/admin/MQnA';
import Mypage from './pages/user/Mypage';
import ShippingGuide from './pages/guides/ShippingGuide';
import PointGuide from './pages/guides/PointGuide';
import CookingGuide from './pages/guides/CookingGuide';
import NTWrt from './pages/admin/NTWrt';
import NTList from "./pages/common/NTList";
import NTView from './pages/common/NTView';
import NTEdit from './pages/admin/NTEdit';
import PaymentPage from './pages/user/PaymentPage';
import PaymentSuccess from './pages/user/PaymentSuccess';
import MUser from './pages/admin/MUser';
import MRv from './pages/admin/MRv';
import PdAdd from './pages/admin/PdAdd';
import PdOrder from './pages/admin/PdOrder';
import PdList from './pages/admin/PdList';
import PdEdit from './pages/admin/PdEdit';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  useEffect(() => {
    const guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      localStorage.setItem("guest_id", crypto.randomUUID());
    }
  }, []);
  return (
    <BrowserRouter>
      <TopHeader />
      <main>
        <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/find" element={<Find />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/uqna" element={<UQnA />} />
            <Route path="/uqadd" element={<UQAdd />} /> 
            <Route path="/products" element={
              <ProductProvider>
                <UPdList />
              </ProductProvider>
            } />

          <Route
            path="/products"
            element={
              <ProductProvider>
                <UPdList />
              </ProductProvider>
            }
          />
          <Route path="/product/:pid" element={<UPdPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/mypage" element={<Mypage />} />

          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />

          <Route path="/ntlist" element={<NTList />} />
          <Route path="/notice/view/:id" element={<NTView />} />
          <Route path="/admin/mqna" element={<MQnA />} />
          <Route path="/admin/ntwrt" element={<NTWrt />} />
          <Route path="/admin/notice/edit/:id" element={<NTEdit />} />
          <Route path="/admin/muser" element={<MUser />} />
          <Route path="/admin/mrv" element={<MRv />} />
          <Route path="/admin/pdAdd" element={<PdAdd />} />
          <Route path="/admin/pdorder" element={<PdOrder />} />
          <Route path="/admin/pdlist" element={<PdList />} />
          <Route path="/admin/PdEdit/:pid" element={<PdEdit />} />

          <Route path="/shipping-guide" element={<ShippingGuide />} />
          <Route path="/point-guide" element={<PointGuide />} />
          <Route path="/cooking-guide" element={<CookingGuide />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;