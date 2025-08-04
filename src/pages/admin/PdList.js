import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/admin/PdList.css";
import { Button } from "../../util/Buttons";
import TopHeader from "../../component/TopHeader";
import { useNavigate } from "react-router-dom";

const MAIN_CATEGORY = [
  { value: "", label: "전체" },
  { value: "소고기", label: "소고기" },
  { value: "돼지고기", label: "돼지고기" },
  { value: "선물세트", label: "선물세트" },
];
const SUB_CATEGORY = [
  { value: "", label: "전체" },
  { value: "등심", label: "등심" },
  { value: "안심", label: "안심" },
  { value: "목살", label: "목살" },
  { value: "갈비", label: "갈비" },
  { value: "삼겹살", label: "삼겹살" },
  { value: "앞다리살", label: "앞다리살" },
  { value: "뒷다리살", label: "뒷다리살" },
];

const ITEMS_PER_PAGE = 10;

function PdList() {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const btnStyle = {
    fontSize: "0.96rem",
    padding: "5px 14px",
    borderRadius: "8px",
    marginRight: "8px",
    minWidth: "62px",
    minHeight: "34px",
    fontWeight: "500",
    border: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
    cursor: "pointer",
    transition: "background 0.14s"
  };

  const [products, setProducts] = useState([]);
const [totalPages, setTotalPages] = useState(1);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      setProducts(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 1);
    })
    .catch(err => console.error('상품 불러오기 실패:', err));
}, []);
  
  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get("/api/products", {
        params: {
          page,
          size: ITEMS_PER_PAGE,
          mainCategory: mainCategory || undefined,
          subCategory: subCategory || undefined,
          search: search || undefined,
        },
      });
      let arr = [];
      if (res.data && Array.isArray(res.data.content)) {
        arr = res.data.content;
      } else if (res.data && res.data.content && typeof res.data.content === "object" && res.data.content !== null) {
        arr = Object.values(res.data.content);
      }
      setProducts(arr);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (e) {
      setProducts([]);  
      alert("상품 목록을 불러오지 못했습니다.");
    }
  };

 useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      setProducts(Array.isArray(data.content) ? data.content : []);
    })
    .catch(err => console.error('상품 불러오기 실패:', err));
}, []);

  const goPage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };

  const handleHit = async (pid, isHit) => {
    try {
      await axios.patch(`/api/products/${pid}/hit`, { hit: isHit ? 0 : 1 });
      fetchProducts(currentPage);
    } catch (e) {
      alert("HIT 변경 실패");
    }
  };

  const handleSoldout = async (pid, isSoldout) => {
    try {
      await axios.patch(`/api/products/${pid}/soldout`, { soldout: isSoldout ? 0 : 1 });
      fetchProducts(currentPage);
    } catch (e) {
      alert("품절 변경 실패");
    }
  };


  const handleDelete = async (pid) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/products/${pid}`);
      fetchProducts(currentPage);
    } catch (e) {
      alert("삭제 실패");
    }
  };


  const goEdit = (pid) => navigate(`/admin/PdEdit/${pid}`);

  return (
    <div className="admin-pdlist-root">
      <TopHeader />

      <div className="admin-pdlist-nav">
        <div className="nav-category-group">
          <select
            className="nav-category main"
            value={mainCategory}
            onChange={e => { setMainCategory(e.target.value); }}
          >
            {MAIN_CATEGORY.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            className="nav-category sub"
            value={subCategory}
            onChange={e => setSubCategory(e.target.value)}
          >
            {SUB_CATEGORY.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <input
          className="nav-search"
          type="text"
          placeholder="상품명 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="admin-pdlist-table-wrapper">
        <table className="admin-pdlist-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>이미지</th>
              <th>상품명</th>
              <th>메인카테고리</th>
              <th>서브카테고리</th>
              <th>유통기한</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">상품이 없습니다.</td>
              </tr>
            ) : (
              Array.isArray(products) ?
              products.map((p, idx) => (
                <tr key={p.pid}>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td>
                    {p.image ? (
                      <img src={`/api/images/${p.image}`} alt={p.pnm} className="pdlist-img" />
                    ) : (
                      <span className="img-none">-</span>
                    )}
                  </td>
                  <td>{p.pnm}</td>
                  <td>{p.mainCategory || "-"}</td>
                  <td>{p.subCategory || "-"}</td>
                  <td>{p.expDate || "-"}</td>
                  <td>
                    {p.hit === 1 && <span className="status-hit">HIT</span>}
                    {p.soldout === 1 && <span className="status-soldout">품절</span>}
                  </td>
                  <td>
                    <div className="btn-group">
                      <Button text="수정" style={{ ...btnStyle, background: "#3b82f6", color: "#fff" }} onClick={() => goEdit(p.pid)} />
                      <Button text="삭제" style={{ ...btnStyle, background: "#ef4444", color: "#fff" }} onClick={() => handleDelete(p.pid)} />
                      <Button text={p.hit === 1 ? "히트해제" : "히트"} style={{ ...btnStyle, background: "#fde047", color: "#333" }} onClick={() => handleHit(p.pid, p.hit === 1)} />
                      <Button text={p.soldout === 1 ? "판매중" : "품절"} style={{ ...btnStyle, background: "#a1a1aa", color: "#fff" }} onClick={() => handleSoldout(p.pid, p.soldout === 1)} />
                    </div>
                  </td>
                </tr>
              ))
              : (
                <tr>
                  <td colSpan={8} className="empty-row">데이터 오류</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="paging-wrapper" style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
        <Button
          text="이전"
          style={{ marginRight: 8, minWidth: 50, background: "#eee" }}
          onClick={() => goPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i + 1}
            text={i + 1}
            style={{
              minWidth: 40,
              margin: "0 2px",
              background: currentPage === i + 1 ? "#3b82f6" : "#fff",
              color: currentPage === i + 1 ? "#fff" : "#333",
              border: currentPage === i + 1 ? "none" : "1px solid #ccc"
            }}
            onClick={() => goPage(i + 1)}
          />
        ))}
        <Button
          text="다음"
          style={{ marginLeft: 8, minWidth: 50, background: "#eee" }}
          onClick={() => goPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        />
      </div>
    </div>
  );
}

export default PdList;