import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../util/Buttons";
import "../../css/admin/PdEdit.css";

const MAIN_CATEGORY = ["소고기", "돼지고기", "닭고기", "선물세트", "소스류" ];
const ADMIN_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];
const USER_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];

function PdEdit() {
  const { pid } = useParams();
  const navigate = useNavigate();
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
    userStatus: "배송완료",
    adminStatus: "배송완료",
    file: null,
    oldImage: "",
  });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/admin/products/${pid}`, {
          headers: { "Authorization": "Bearer " + token }
        });
        const data = res.data;
        setForm({
          ...form,
          pnm: data.pnm || "",
          mainCategory: data.mainCategory || "",
          price: data.price || "",
          pdesc: data.pdesc || "",
          origin: data.origin || "",
          expDate: data.expDate || "",
          hit: data.hit || 0,
          soldout: data.soldout || 0,
          userStatus: data.userStatus || "배송완료",
          adminStatus: data.adminStatus || "배송완료",
          file: null,
          oldImage: data.image || ""
        });
        if (data.image) {
          setPreview(`/api/images/${data.image}`);
        }
      } catch (err) {
        alert("상품 정보를 불러오지 못했습니다.\n" + (err.response?.data?.message || ""));
        navigate(-1);
      }
    }
    if (pid) fetchProduct();
    // eslint-disable-next-line
  }, [pid]);


  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked ? 1 : 0 });
    } else if (type === "file") {
      const file = files[0];

      setForm({ ...form, file: file });
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        const oldImageUrl = form.oldImage ? `/api/images/${form.oldImage}` : null;
        setPreview(oldImageUrl);
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
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      const productDto = {
        pnm: form.pnm,
        mainCategory: form.mainCategory,
        price: form.price,
        pdesc: form.pdesc,
        origin: form.origin,
        expDate: form.expDate,
        hit: form.hit,
        soldout: form.soldout,
      };
      formData.append("productData", JSON.stringify(productDto));

      if (form.file) {
        formData.append("file", form.file);
      }

      await axios.post(`/api/admin/products/${pid}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      alert("상품이 수정되었습니다!");
      navigate("/admin/pdlist");
    } catch (err) {
      console.error("수정 에러:", err.response);
      alert("수정 실패!\n" + (err.response?.data?.message || err.message));
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const errorDiv = document.createElement('div');
    errorDiv.textContent = '이미지 로드 실패';
    errorDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 12px; height: 100px; border: 1px dashed #ccc;';
    e.target.parentNode.appendChild(errorDiv);
  };

  if (!pid) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>오류: 상품 ID가 없습니다</h2>
        <p>URL: {window.location.href}</p>
        <button onClick={() => navigate('/admin/pdlist')}>목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="pdedit-container">
      <h2>상품 정보 수정 (ID: {pid})</h2>
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
        <div className="pdedit-form-group">
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
            name="file"
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
            <img
              src={preview}
              alt="미리보기"
              className="pdedit-preview-img"
              onError={handleImageError}
              onLoad={() => console.log(`미리보기 이미지 로드 성공: ${preview}`)}
            />
          ) : (
            <div className="pdedit-preview-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>이미지 없음</div>
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
              <span className="prod-label">카테고리:</span> {form.mainCategory}
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
              <span style={{ marginLeft: "8px" }} />
              <span className="prod-label">유저상태:</span> {form.userStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdEdit;