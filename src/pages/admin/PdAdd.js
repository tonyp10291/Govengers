<<<<<<< HEAD
import React, { useState, useRef, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
=======
import React, { useState, useRef, useEffect } from "react";
>>>>>>> origin/JongYun_merge
import { Button } from "../../util/Buttons";
import "../../css/admin/PdAdd.css";
import api from "../../api/axiosInstance";

const MAIN_CATEGORY = ["소고기", "돼지고기", "닭고기", "선물세트", "소스류"];
const MAX_IMAGE_BYTES = 100 * 1024 * 1024; // 100MB

// 응답에서 pid 추출 (product.pid / location 헤더 모두 커버)
const extractPidFromResponse = (res) => {
  const d = res?.data;
  if (!d) return null;

  if (typeof d === "number") return d;

  if (typeof d === "string") {
    const m = d.match(/(\d+)/);
    if (m) return Number(m[1]);
  }

  if (typeof d === "object") {
    const p = d.product ?? d;
    const pid = p.pid ?? p.id ?? p.productId ?? p.pno ?? null;
    if (pid) return Number(pid);
  }

  const loc = res?.headers?.location || res?.headers?.Location;
  if (loc) {
    const m = String(loc).match(/\/products\/(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
};

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

  // 대표 이미지 포함 기본 폼
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

  // 상세 이미지(여러 장)
  const [detailFiles, setDetailFiles] = useState([]);       // File[]
  const [detailPreviews, setDetailPreviews] = useState([]); // objectURL[]
  useEffect(() => () => detailPreviews.forEach(URL.revokeObjectURL), [detailPreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: checked ? 1 : 0 }));
    } else if (type === "file" && name === "image") {
      const file = files?.[0] || null;
      setForm((p) => ({ ...p, image: file }));
      if (file) {
        const r = new FileReader();
        r.onload = (ev) => setPreview(ev.target.result);
        r.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleMainCategoryChange = (e) =>
    setForm((p) => ({ ...p, mainCategory: e.target.value }));

  // 상세 이미지 선택
  const handleDetailFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const f of files) {
      if (!/^image\//.test(f.type)) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        alert("파일당 최대 100MB까지 가능합니다.");
        return;
      }
    }

    const urls = files.map((f) => URL.createObjectURL(f));
    setDetailFiles((prev) => [...prev, ...files]);
    setDetailPreviews((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeDetailAt = (idx) => {
    setDetailFiles((prev) => prev.filter((_, i) => i !== idx));
    setDetailPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const resetAll = () => {
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
    detailPreviews.forEach(URL.revokeObjectURL);
    setDetailPreviews([]);
    setDetailFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) 대표 이미지 포함 등록  (팀 약속: await api.post)
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "image") {
          if (v) fd.append("image", v);
        } else {
          fd.append(k, v);
        }
      });

      const res = await api.post("/admin/products/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2) 신규 pid 추출
      const newPid = extractPidFromResponse(res);
      if (!newPid) {
        console.warn("신규 상품 ID를 응답에서 찾지 못했습니다.", res);
        alert("상품은 등록됐지만, 상세이미지 업로드는 상품ID 확인 실패로 건너뛰었습니다.");
        resetAll();
        return;
      }

      // 3) 상세 이미지 업로드 (여러 장) — 백엔드: POST /products/{pid}/images/upload
      if (detailFiles.length > 0) {
        const dfd = new FormData();
        detailFiles.forEach((f) => dfd.append("files", f));
        await api.post(`/products/${newPid}/images/upload`, dfd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("상품이 등록되었습니다!");
      resetAll();
    } catch (err) {
      console.error(err);
      alert("상품 등록 실패! " + (err?.response?.data?.message || err.message));
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
          <select
            name="mainCategory"
            value={form.mainCategory}
            onChange={handleMainCategoryChange}
            required
          >
            <option value="">선택</option>
            {MAIN_CATEGORY.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
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
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                price: Math.max(0, Number(e.target.value)),
              }))
            }
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
            <input type="checkbox" name="hit" checked={form.hit === 1} onChange={handleChange} /> 히트상품
          </label>
          <label>
            <input type="checkbox" name="soldout" checked={form.soldout === 1} onChange={handleChange} /> 품절
          </label>
        </div>

        <div className="pdadd-form-group">
          <label>대표 이미지</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} ref={fileInputRef} required />
        </div>

        {/* 상세 이미지 업로더 */}
        <div className="pdadd-form-group">
          <label>상세 이미지 (여러 장, 파일당 최대 100MB)</label>
          <input type="file" accept="image/*" multiple onChange={handleDetailFiles} />
          {detailPreviews.length > 0 && (
            <div
              className="pdadd-detail-grid"
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
                gap: 10,
              }}
            >
              {detailPreviews.map((src, idx) => (
                <div key={src} style={{ position: "relative" }}>
                  <img
                    src={src}
                    alt={`상세-${idx}`}
                    style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                  />
                  <button
                    type="button"
                    title="삭제"
                    onClick={() => removeDetailAt(idx)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      border: "none",
                      borderRadius: 6,
                      padding: "2px 6px",
                      cursor: "pointer",
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,.15)",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
            <div className="pdadd-preview-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
              이미지 없음
            </div>
          )}

          <div className="pdadd-preview-info">
            <div className="prod-name">
              {form.pnm}
              {form.hit ? <span className="prod-hit">HIT!</span> : null}
              {form.soldout ? <span className="prod-soldout">[품절]</span> : null}
            </div>
            <div className="prod-price">
              {form.price ? `${Number(form.price).toLocaleString()}원` : ""}
            </div>
            <div><span className="prod-label">카테고리:</span> {form.mainCategory}</div>
            <div><span className="prod-label">유통기한:</span> {form.expDate}</div>
            <div className="prod-desc">{form.pdesc}</div>
            <div><span className="prod-label">원산지:</span> {form.origin}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdAdd;