import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../util/Buttons";
import "../../css/admin/PdEdit.css";

const MAIN_CATEGORY = ["소고기", "돼지고기", "선물세트"];
const SUB_CATEGORY = ["등심", "안심", "목살", "갈비", "삼겹살", "앞다리살", "뒷다리살"];
const ADMIN_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];
const USER_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];

function PdEdit() {
  const { pid } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    pnm: "",
    mainCategory: "",
    subCategory: "",
    price: "",
    pdesc: "",
    origin: "",
    expDate: "",
    hit: 0,
    soldout: 0,
    userStatus: "배송완료",
    adminStatus: "배송완료",
    image: null,         
    oldImage: "",        
  });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`/api/products/${pid}`);
        const data = res.data;
        setForm({
          ...form,
          pnm: data.pnm || "",
          mainCategory: data.mainCategory || "",
          subCategory: data.subCategory || "",
          price: data.price || "",
          pdesc: data.pdesc || "",
          origin: data.origin || "",
          expDate: data.expDate || "",
          hit: data.hit || 0,
          soldout: data.soldout || 0,
          userStatus: data.userStatus || "배송완료",
          adminStatus: data.adminStatus || "배송완료",
          image: null,
          oldImage: data.image || ""
        });
        if (data.image) {
          setPreview(`/api/images/${data.image}`);
        }
      } catch (err) {
        alert("상품 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    }
    fetchProduct();
    // eslint-disable-next-line
  }, [pid]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked ? 1 : 0 });
    } else if (type === "file") {
      const file = files[0];
      setForm({ ...form, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(form.oldImage ? `/api/images/${form.oldImage}` : null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleMainCategoryChange = (e) => {
    setForm({ ...form, mainCategory: e.target.value, subCategory: "" });
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
      await axios.put(`/api/products/${pid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      alert("상품이 수정되었습니다!");
      navigate("/admin/pdlist");
    } catch (err) {
      alert("수정 실패! " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="pdedit-container">
      <h2>상품 정보 수정</h2>
      <form className="pdedit-form" onSubmit={handleSubmit}>
        <div className="pdedit-form-group">
          <label>상품명</label>
          <input name="pnm" value={form.pnm} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group">
          <label>메인카테고리</label>
          <select name="mainCategory" value={form.mainCategory} onChange={handleMainCategoryChange} required>
            <option value="">선택</option>
            {MAIN_CATEGORY.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="pdedit-form-group">
          <label>서브카테고리</label>
          <select name="subCategory" value={form.subCategory} onChange={handleChange} required>
            <option value="">선택</option>
            {SUB_CATEGORY.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="pdedit-form-group">
          <label>가격</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group">
          <label>상품설명</label>
          <textarea name="pdesc" value={form.pdesc} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group">
          <label>원산지</label>
          <input name="origin" value={form.origin} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group">
          <label>유통기한</label>
          <input type="date" name="expDate" value={form.expDate} onChange={handleChange} required />
        </div>
        <div className="pdedit-form-group-checkbox">
          <label>
            <input type="checkbox" name="hit" checked={form.hit === 1} onChange={handleChange} />
            히트상품
          </label>
          <label>
            <input type="checkbox" name="soldout" checked={form.soldout === 1} onChange={handleChange} />
            품절
          </label>
        </div>
        <div className="pdedit-form-group">
          <label>관리자 상태</label>
          <select name="adminStatus" value={form.adminStatus} onChange={handleChange} required>
            {ADMIN_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="pdedit-form-group">
          <label>유저 상태</label>
          <select name="userStatus" value={form.userStatus} onChange={handleChange} required>
            {USER_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="pdedit-form-group">
          <label>상품이미지</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            ref={fileInputRef}
          />
          <span className="pdedit-fileinfo">※ 이미지를 새로 등록하지 않으면 기존 이미지가 유지됩니다.</span>
        </div>
        <div className="pdedit-btn-box">
          <Button type="submit" text="수정 완료" />
        </div>
      </form>
      
      <div className="pdedit-preview">
        <div className="pdedit-preview-title">미리보기</div>
        <div className="pdedit-preview-box">
          {preview ? (
            <img src={preview} alt="미리보기" className="pdedit-preview-img" />
          ) : (
            <div className="pdedit-preview-img" style={{display:'flex',alignItems:'center',justifyContent:'center',color:'#ccc'}}>이미지 없음</div>
          )}
          <div className="pdedit-preview-info">
            <div className="prod-name">
              {form.pnm}
              {form.hit ? <span className="prod-hit">HIT!</span> : null}
              {form.soldout ? <span className="prod-soldout">[품절]</span> : null}
            </div>
            <div className="prod-price">
              {form.price ? form.price.toLocaleString() + "원" : ""}
            </div>
            <div>
              <span className="prod-label">카테고리:</span> {form.mainCategory} / {form.subCategory}
            </div>
            <div>
              <span className="prod-label">유통기한:</span> {form.expDate}
            </div>
            <div className="prod-desc">{form.pdesc}</div>
            <div>
              <span className="prod-label">원산지:</span> {form.origin}
            </div>
            <div>
              <span className="prod-label">관리자상태:</span> {form.adminStatus}
              <span style={{marginLeft:"8px"}} />
              <span className="prod-label">유저상태:</span> {form.userStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdEdit;