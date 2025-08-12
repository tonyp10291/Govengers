// src/pages/admin/PdEdit.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../util/Buttons";
import "../../css/admin/PdEdit.css";
import api from "../../api/axiosInstance";

const MAIN_CATEGORY = ["소고기", "돼지고기", "닭고기", "선물세트", "소스류"];
const ADMIN_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];
const USER_STATUS = ["배송완료", "배송중", "배송준비중", "주문완료", "주문취소"];
const MAX_IMAGE_BYTES = 100 * 1024 * 1024; // 100MB

// 상세이미지 업로드 (pid, files를 인자로!)
const uploadDetailImages = async (pid, files) => {
  if (!pid || !Array.isArray(files) || files.length === 0) return;
  const dfd = new FormData();
  files.forEach((f) => dfd.append("files", f));
  await api.post(`/products/${pid}/images`, dfd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

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
    file: null,     // 대표 이미지(교체)
    oldImage: "",   // 기존 대표 이미지 경로
  });

  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  // 상세 이미지: 기존 + 새로 추가
  const [detailExisting, setDetailExisting] = useState([]); // 서버 저장 경로[]
  const [detailFiles, setDetailFiles] = useState([]);       // File[]
  const [detailPreviews, setDetailPreviews] = useState([]); // objectURL[]

  // objectURL 정리
  useEffect(() => {
    return () => {
      detailPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [detailPreviews]);

  // 상품정보 + 기존 상세이미지 로드
  useEffect(() => {
    if (!pid) return;
    (async () => {
      try {
        const res = await api.get(`/admin/products/${pid}`);
        const d = res.data;
        setForm((prev) => ({
          ...prev,
          pnm: d.pnm || "",
          mainCategory: d.mainCategory || "",
          price: d.price || "",
          pdesc: d.pdesc || "",
          origin: d.origin || "",
          expDate: d.expDate || "",
          hit: d.hit || 0,
          soldout: d.soldout || 0,
          userStatus: d.userStatus || "배송완료",
          adminStatus: d.adminStatus || "배송완료",
          file: null,
          oldImage: d.image || "",
        }));
        setPreview(d.image ? `/api/images/${d.image}` : null);
      } catch (err) {
        alert("상품 정보를 불러오지 못했습니다.\n" + (err.response?.data?.message || ""));
        navigate(-1);
        return;
      }

      try {
        const ir = await api.get(`/products/${pid}/images`, { meta: { silent: true } });
        setDetailExisting(Array.isArray(ir.data) ? ir.data : []);
      } catch {
        setDetailExisting([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else if (type === "file" && name === "file") {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(form.oldImage ? `/api/images/${form.oldImage}` : null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMainCategoryChange = (e) => {
    setForm((prev) => ({ ...prev, mainCategory: e.target.value }));
  };

  // 상세 이미지 추가(여러 장)
  const handleDetailFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const f of files) {
      if (!/^image\//.test(f.type)) return alert("상세이미지는 이미지 파일만 가능합니다.");
      if (f.size > MAX_IMAGE_BYTES) return alert("상세이미지는 파일당 100MB까지 업로드 가능합니다.");
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setDetailFiles((prev) => [...prev, ...files]);
    setDetailPreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeDetailAt = (idx) => {
    setDetailFiles((prev) => prev.filter((_, i) => i !== idx));
    setDetailPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) 기본정보 + 대표이미지 수정
      const formData = new FormData();
      formData.append("productData", JSON.stringify({
        pnm: form.pnm,
        mainCategory: form.mainCategory,
        price: form.price,
        pdesc: form.pdesc,
        origin: form.origin,
        expDate: form.expDate,
        hit: form.hit,
        soldout: form.soldout,
      }));
      if (form.file) formData.append("file", form.file);

      await api.post(`/admin/products/${pid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2) 상세이미지 업로드
      await uploadDetailImages(pid, detailFiles);

      alert("상품이 수정되었습니다!");
      navigate("/admin/pdlist");
    } catch (err) {
      console.error("수정 에러:", err);
      alert("수정 실패!\n" + (err.response?.data?.message || err.message));
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "이미지 로드 실패";
    errorDiv.style.cssText =
      "display:flex;align-items:center;justify-content:center;color:#ccc;font-size:12px;height:100px;border:1px dashed #ccc;";
    e.target.parentNode.appendChild(errorDiv);
  };

  if (!pid) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>오류: 상품 ID가 없습니다</h2>
        <p>URL: {window.location.href}</p>
        <button onClick={() => navigate("/admin/pdlist")}>목록으로 돌아가기</button>
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
            {MAIN_CATEGORY.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="pdedit-form-group">
          <label>가격</label>
          <input
            type="number"
            name="price"
            min="0"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: Math.max(0, Number(e.target.value)) }))}
            required
          />
        </div>

        <div className="pdedit-form-group">
          <label>상품설명</label>
          <textarea
            name="pdesc"
            maxLength={200}
            rows={5}
            style={{ resize: "none", overflowY: "auto", width: "100%", minHeight: 100, maxHeight: 120 }}
            value={form.pdesc}
            onChange={(e) => setForm((prev) => ({ ...prev, pdesc: e.target.value.slice(0, 200) }))}
            required
          />
          <div style={{ textAlign: "right", fontSize: 12, color: "#888" }}>{form.pdesc.length}/200</div>
        </div>

        <div className="pdedit-form-group">
          <label>원산지</label>
          <input name="origin" value={form.origin} onChange={handleChange} required />
        </div>

        <div className="pdedit-form-group">
          <label>유통기한</label>
          <input type="date" name="expDate" value={form.expDate} onChange={handleChange} required min={today} />
        </div>

        <div className="pdedit-form-group">
          <label>관리자 상태</label>
          <select name="adminStatus" value={form.adminStatus} onChange={handleChange} required>
            {ADMIN_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="pdedit-form-group">
          <label>유저 상태</label>
          <select name="userStatus" value={form.userStatus} onChange={handleChange} required>
            {USER_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="pdedit-form-group">
          <label>대표 이미지</label>
          <input type="file" name="file" accept="image/*" onChange={handleChange} ref={fileInputRef} />
          <span className="pdedit-fileinfo">※ 이미지를 새로 등록하지 않으면 기존 이미지가 유지됩니다.</span>
        </div>

        {/* 상세 이미지: 기존 목록 + 추가 업로드 */}
        <div className="pdedit-form-group">
          <label>상세 이미지 추가 (여러 장, 파일당 최대 100MB)</label>
          <input type="file" accept="image/*" multiple onChange={handleDetailFiles} />

          {detailExisting.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>기존 상세 이미지</div>
              <div className="pdedit-detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
                {detailExisting.map((p) => (
                  <img
                    key={p}
                    src={`/api/images/${p}`}
                    alt="상세"
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ))}
              </div>
            </div>
          )}

          {detailPreviews.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>추가될 이미지</div>
              <div className="pdedit-detail-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10 }}>
                {detailPreviews.map((src, idx) => (
                  <div key={src} style={{ position: "relative" }}>
                    <img src={src} alt={`추가-${idx}`} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                    <button
                      type="button"
                      onClick={() => removeDetailAt(idx)}
                      title="삭제"
                      style={{ position: "absolute", top: 4, right: 4, border: "none", borderRadius: 6, padding: "2px 6px", cursor: "pointer", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pdedit-btn-box">
          <Button type="submit" text="수정 완료" />
        </div>
      </form>

      <div className="pdedit-preview">
        <div className="pdedit-preview-title">미리보기</div>
        <div className="pdedit-preview-box">
          {preview ? (
            <img src={preview} alt="미리보기" className="pdedit-preview-img" onError={handleImageError} />
          ) : (
            <div className="pdedit-preview-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
              이미지 없음
            </div>
          )}
          <div className="pdedit-preview-info">
            <div className="prod-name">
              {form.pnm}
              {form.hit ? <span className="prod-hit">HIT!</span> : null}
              {form.soldout ? <span className="prod-soldout">[품절]</span> : null}
            </div>
            <div className="prod-price">{form.price ? `${form.price.toLocaleString()}원` : ""}</div>
            <div><span className="prod-label">카테고리:</span> {form.mainCategory}</div>
            <div><span className="prod-label">유통기한:</span> {form.expDate}</div>
            <div className="prod-desc">{form.pdesc}</div>
            <div><span className="prod-label">원산지:</span> {form.origin}</div>
            <div>
              <span className="prod-label">관리자상태:</span> {form.adminStatus}
              <span style={{ marginLeft: 8 }} />
              <span className="prod-label">유저상태:</span> {form.userStatus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdEdit;
