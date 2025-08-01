import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import TopHeader from './component/TopHeader';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './pages/common/Login';
import Join from './pages/common/Join';
import Find from './pages/common/Find';
import ResetPassword from './pages/common/ResetPassword';
import PdList from './pages/common/PdList'; 
import UQnA from './pages/user/UQnA';
import UQAdd from "./pages/user/UQAdd";
import MQnA from './pages/admin/MQnA';
import ShippingGuide from './pages/guides/ShippingGuide';
import PointGuide from './pages/guides/PointGuide';
import CookingGuide from './pages/guides/CookingGuide';
import NTWrt from './pages/admin/NTWrt';
import MUser from './pages/admin/MUser';
import PdAdd from './pages/admin/PdAdd';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
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
                <PdList />
              </ProductProvider>
            } />


            <Route path="/shipping-guide" element={<ShippingGuide />} />
            <Route path="/point-guide" element={<PointGuide />} />
            <Route path="/cooking-guide" element={<CookingGuide />} />


            <Route path="/admin/ntwrt" element={<NTWrt />} />
            <Route path="/admin/muser" element={<MUser />} />
            <Route path="/admin/mqna" element={<MQnA />} /> 
            <Route path="/admin/pdAdd" element={<PdAdd />} /> 
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
  );
}

export default App;
