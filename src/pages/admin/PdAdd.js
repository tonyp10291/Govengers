import React, { useState, useRef, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../../util/Buttons";
import "../../css/admin/PdAdd.css";

const MAIN_CATEGORY = ["소고기", "돼지고기", "닭고기", "선물세트", "소스류" ];

function PdAdd() {
  const { isLoggedIn, userRole, isAuthLoading } = useContext(AuthContext);
  const isAdmin = isLoggedIn && userRole === 'ROLE_ADMIN';
  const navigate = useNavigate();

  useEffect(() => {
    if(!isAuthLoading && !isAdmin){
        navigate("/alert");
    }
  }, [isAdmin, navigate, isAuthLoading]);

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    pnm: "",
    mainCategory: "",
    price: "",
    pdesc: "",
    origin: "",
    expDate: "",
    hit: 0,
    soldout: 0,
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked ? 1 : 0 });
    } else if (type === "file") {
      const file = e.target.files[0];
      setForm({ ...form, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleMainCategoryChange = (e) => {
    setForm({ ...form, mainCategory: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, val]) => {
      if (key === "image") {
        if (val) formData.append("image", val);
      } else {
        formData.append(key, val);
      }
    });

    try {
      await axios.post("/api/admin/products/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        withCredentials: true,  
      });
      alert("상품이 등록되었습니다!");
      setForm({
        pnm: "",
        mainCategory: "",
        price: "",
        pdesc: "",
        origin: "",
        expDate: "",
        hit: 0,
        soldout: 0,
        image: null,
      });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("상품 등록 실패! " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="pdadd-container">
      <h2>상품 등록</h2>
      <form className="pdadd-form" onSubmit={handleSubmit}>
        <div className="pdadd-form-group">
          <label>상품명</label>
          <input name="pnm" value={form.pnm} onChange={handleChange} required />
        </div>
        <div className="pdadd-form-group">
          <label>메인카테고리</label>
          <select name="mainCategory" value={form.mainCategory} onChange={handleMainCategoryChange} required>
            <option value="">선택</option>
            {MAIN_CATEGORY.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
         <div className="pdedit-form-group">
          <label>가격</label>
          <input
            type="number"
            name="price"
            min="0"
            value={form.price}
            onChange={e => {
              const value = Math.max(0, Number(e.target.value));
              setForm(prev => ({ ...prev, price: value }));
            }}
            required
          />
        </div>
        <div className="pdedit-form-group">
          <label>상품설명</label>
          <textarea
            name="pdesc"
            maxLength={200}
            rows={5}
            style={{
              resize: "none",        
              overflowY: "auto",      
              width: "100%",
              minHeight: "100px",
              maxHeight: "120px"
            }}
            value={form.pdesc}
            onChange={e => {
              setForm(prev => ({
                ...prev,
                pdesc: e.target.value.slice(0, 200)
              }));
            }}
            required
          />
          <div style={{ textAlign: "right", fontSize: 12, color: "#888" }}>
            {form.pdesc.length}/200
          </div>
        </div>
        <div className="pdadd-form-group">
          <label>원산지</label>
          <input name="origin" value={form.origin} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group">
          <label>유통기한</label>
          <input
            type="date"
            name="expDate"
            value={form.expDate}
            onChange={handleChange}
            required
            min={today}
          />
        </div>
        <div className="pdadd-form-group-checkbox">
          <label>
            <input type="checkbox" name="hit" checked={form.hit === 1} onChange={handleChange} />
            히트상품
          </label>
          <label>
            <input type="checkbox" name="soldout" checked={form.soldout === 1} onChange={handleChange} />
            품절
          </label>
        </div>
        <div className="pdadd-form-group">
          <label>상품이미지</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            ref={fileInputRef}
            required
          />
        </div>
        <div className="pdadd-btn-box">
          <Button type="submit" text="상품 등록" />
        </div>
      </form>
      <div className="pdadd-preview">
        <div className="pdadd-preview-title">미리보기</div>
        <div className="pdadd-preview-box">
          {preview ? (
            <img src={preview} alt="미리보기" className="pdadd-preview-img" />
          ) : (
            <div className="pdadd-preview-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>이미지 없음</div>
          )}
          <div className="pdadd-preview-info">
            <div className="prod-name">
              {form.pnm}
              {form.hit ? <span className="prod-hit">HIT!</span> : null}
              {form.soldout ? <span className="prod-soldout">[품절]</span> : null}
            </div>
            <div className="prod-price">
              {form.price ? form.price.toLocaleString() + "원" : ""}
            </div>
            <div>
              <span className="prod-label">카테고리:</span> {form.mainCategory}
            </div>
            <div>
              <span className="prod-label">유통기한:</span> {form.expDate}
            </div>
            <div className="prod-desc">{form.pdesc}</div>
            <div>
              <span className="prod-label">원산지:</span> {form.origin}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdAdd;
