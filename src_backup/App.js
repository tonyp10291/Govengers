  import React from "react";  
  import Home from "./pages/Home";
  import "./css/App.css";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import "./css/TopHeader.css";
  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ntwrt" element={<NTWrt />} />
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;