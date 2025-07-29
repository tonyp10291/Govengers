import React, { useState, useContext } from "react";
import axios from "axios";
import { Button } from "../util/Buttons";
// 만약 AuthContext 또는 user관리방식 다르면 수정해서 적용!

// 예시: 유저 정보/권한 전역관리 컨텍스트(필요시)
import { AuthContext } from "../context/AuthContext"; // 실제 경로 맞게 조정

function PdAdd() {
  const { user } = useContext(AuthContext); // 예시: 전역 로그인 유저
  // (만약 props, redux, recoil 등 다르게 관리 중이면 거기에 맞게 수정!)

  // 권한체크
  if (!user || (user.role !== "admin" && user.role !== "seller")) {
    return <div>접근 권한이 없습니다.</div>;
    // 또는 <Navigate to="/" /> 등 라우터 사용도 가능
  }

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    stock: "",
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });
    try {
      await axios.post("/api/products/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // 인증토큰 필요시 'Authorization': 'Bearer ' + user.token 등 추가
        },
        withCredentials: true // 쿠키/세션 인증일 때
      });
      alert("상품 등록 성공!");
      setForm({
        name: "",
        category: "",
        price: "",
        description: "",
        stock: "",
        image: null,
      });
    } catch (err) {
      alert("등록 실패!");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "40px auto", display: "flex", flexDirection: "column", gap: 10 }}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="상품명" required />
      <input name="category" value={form.category} onChange={handleChange} placeholder="카테고리" required />
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="가격" required />
      <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="재고" required />
      <input name="description" value={form.description} onChange={handleChange} placeholder="설명" required />
      <input name="image" type="file" accept="image/*" onChange={handleChange} required />

      {/* 공통 버튼 사용 */}
      <Button
        text="등록"
        type="submit"
        style={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.2rem" }}
        onClick={handleSubmit}
      />
    </form>
  );
}

export default PdAdd;