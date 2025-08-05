import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../util/Buttons";
import "../../css/admin/PdEdit.css";

// ENUM 옵션
const MAIN_CATEGORY = ["소고기", "돼지고기", "선물세트"];
const ADMIN_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];
const USER_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];

function PdEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const { pid } = useParams();
  
  // 디버깅 로그 추가
  console.log('=== PdEdit Component Rendered ===');
  console.log('All params:', params);
  console.log('params.pid:', params.pid);
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  console.log('Extracted pid:', pid);

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
    image: null,         // 새로 등록할 이미지
    oldImage: "",        // 기존 이미지 파일명(수정 전)
  });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  // 1. 상품 데이터 불러오기
  useEffect(() => {
    async function fetchProduct() {
      console.log(`🔄 Fetching product with ID: ${pid}`);
      try {
        const token = localStorage.getItem("token");
        console.log('Using token:', token ? 'Present' : 'Missing');
        
        const res = await axios.get(`/api/admin/products/${pid}`, {
          headers: {
            "Authorization": "Bearer " + token
          }
        });
        console.log('✅ Product data received:', res.data);
        
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
          image: null,
          oldImage: data.image || ""
        });
        if (data.image) {
          setPreview(`/api/images/${data.image}`);
        }
      } catch (err) {
        console.error('❌ Error fetching product:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        alert("상품 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    }
    
    if (pid) {
      fetchProduct();
    } else {
      console.error('❌ Cannot fetch product: pid is undefined');
    }
    // eslint-disable-next-line
  }, [pid]);

  // 2. 입력 변경 핸들러
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
        // 이미지 파일을 새로 안 올릴 때는 기존 이미지 미리보기 그대로
        setPreview(form.oldImage ? `/api/images/${form.oldImage}` : null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 3. 메인카테고리 변경 시 서브카테고리 리셋
  const handleMainCategoryChange = (e) => {
    setForm({ ...form, mainCategory: e.target.value});
  };

  // 4. 수정 저장 (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 이미지 제외하고 JSON으로 전송
    const productData = {
      pnm: form.pnm,
      mainCategory: form.mainCategory,
      price: parseInt(form.price),
      pdesc: form.pdesc,
      origin: form.origin,
      expDate: form.expDate,
      hit: form.hit,
      soldout: form.soldout,
      userStatus: form.userStatus,
      adminStatus: form.adminStatus
    };
  
    try {
      await axios.put(`/api/admin/products/${pid}`, productData, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
      });
      alert("상품이 수정되었습니다!");
      navigate("/admin/pdlist");
    } catch (err) {
      alert("수정 실패! " + (err.response?.data?.message || err.message));
    }
  };

  // pid가 없으면 에러 처리 (조건부 렌더링을 맨 아래로)
  if (!pid) {
    console.error('❌ PID is missing from URL parameters');
    return (
      <div style={{padding: '20px', textAlign: 'center'}}>
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
      {/* ---- 미리보기 ---- */}
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