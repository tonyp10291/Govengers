import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopHeader from './component/TopHeader';
import Footer from './component/Footer';
import Home from './pages/Home';
import Login from './common/Login';
import Join from './common/Join';
import Find from './common/Find';
import NTWrt from './pages/admin/NTWrt';
import UQnA from './pages/user/UQnA';
import ProductList from './component/ProductList';
import { ProductProvider } from './context/ProductContext';

function App() {
  return (
    <BrowserRouter>
      <TopHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ntwrt" element={<NTWrt />} />
          <Route path="/uqna" element={<UQnA />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/find" element={<Find />} />
          <Route path="/products" element={
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