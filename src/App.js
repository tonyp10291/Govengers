  import React from "react";  
  import Home from "./pages/Home";
  import "./css/App.css";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import "./css/TopHeader.css";
  import NTWrt from "./pages/admin/NTWrt";
  import UQnA from "./pages/user/UQnA";
  
  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ntwrt" element={<NTWrt />} />
<<<<<<< Updated upstream
          <Route path="/uqna" element={<UQnA />} />
=======
>>>>>>> Stashed changes
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;