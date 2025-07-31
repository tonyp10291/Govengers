import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopHeader from './component/TopHeader';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './pages/common/Login';
import Join from './pages/common/Join';
import Find from './pages/common/Find';
import WishList from './pages/user/UPic';
import ProductList from './component/ProductList';
import NTWrt from './pages/admin/NTWrt';
import UQnA from './pages/user/UQnA';
import { ProductProvider } from './context/ProductContext';

function App() {
  //랜덤UUID 생성기
  useEffect(() => {
    let guest_id = localStorage.getItem("guest_id");
    if (!guest_id){
      guest_id = crypto.randomUUID();
      localStorage.setItem("guest_id", guest_id);
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
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/ntwrt" element={<NTWrt />} />
          <Route path="/uqna" element={<UQnA />} />
          <Route 
            path="/products" 
            element={
              <ProductProvider>
                <ProductList />
              </ProductProvider>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
