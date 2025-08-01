import React, { useState, useContext } from "react";
import axios from "axios";
import { Button } from "../../util/Buttons";
import AuthContext from "../../context/AuthContext"; // 1. import 방식 수정

// Enum 값 하드코딩
const MAIN_CATEGORIES = ["소고기", "돼지고기", "닭고기"];
const SUB_CATEGORIES = ["등심", "안심", "목살", "갈비", "삼겹살", "앞다리살", "뒷다리살"];

function PdAdd() {
    // 2. isLoggedIn과 userRole을 직접 가져옵니다.
    const { isLoggedIn, userRole, token } = useContext(AuthContext);

    const [form, setForm] = useState({
        name: "",
        mainCategory: "",
        subCategory: "",
        price: "",
        description: "",
        stock: "",
        image: null,
        hit: 0,
    });
    
    // 3. isLoggedIn과 userRole을 사용하여 권한을 확인합니다.
    if (!isLoggedIn || (userRole !== "ROLE_ADMIN" && userRole !== "ROLE_SELLER")) {
        return <div>접근 권한이 없습니다.</div>;
    }

    const handleChange = (e) => {
        if (e.target.name === "image") {
            setForm({ ...form, image: e.target.files[0] });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleToggleHit = (e) => {
        e.preventDefault();
        setForm(prev => ({ ...prev, hit: prev.hit === 1 ? 0 : 1 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // image를 제외한 나머지 데이터를 JSON 형태의 문자열로 변환하여 'product' 파트로 추가
        const productData = { ...form };
        delete productData.image;
        formData.append('product', new Blob([JSON.stringify(productData)], { type: "application/json" }));

        // 이미지는 'image' 파트로 추가
        if (form.image) {
            formData.append('image', form.image);
        }

        try {
            await axios.post("/api/products/register", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type은 FormData 사용 시 브라우저가 자동으로 설정하므로 명시하지 않습니다.
                },
                withCredentials: true,
            });
            alert("상품 등록 성공!");
            // 폼 초기화
            setForm({
                name: "", mainCategory: "", subCategory: "", price: "",
                description: "", stock: "", image: null, hit: 0,
            });
            // 파일 입력 필드도 초기화
            document.querySelector('input[name="image"]').value = '';
        } catch (err) {
            alert("등록 실패!");
            console.error(err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                maxWidth: 400, margin: "100px auto 40px auto", display: "flex",
                flexDirection: "column", gap: 10, background: "#fff",
                padding: "30px 24px 24px 24px", borderRadius: "16px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)", minHeight: 550,
            }}
        >
            <label>
                상품명
                <input name="name" value={form.name} onChange={handleChange} placeholder="상품명" required />
            </label>
            <label>
                메인카테고리
                <select name="mainCategory" value={form.mainCategory} onChange={handleChange} required>
                    <option value="">선택</option>
                    {MAIN_CATEGORIES.map(mc => (
                        <option key={mc} value={mc}>{mc}</option>
                    ))}
                </select>
            </label>
            <label>
                서브카테고리
                <select name="subCategory" value={form.subCategory} onChange={handleChange} required>
                    <option value="">선택</option>
                    {SUB_CATEGORIES.map(sc => (
                        <option key={sc} value={sc}>{sc}</option>
                    ))}
                </select>
            </label>
            <label>
                가격
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="가격" required />
            </label>
            <label>
                재고
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="재고" required />
            </label>
            <label>
                설명
                <input name="description" value={form.description} onChange={handleChange} placeholder="설명" required />
            </label>
            <label>
                이미지
                <input name="image" type="file" accept="image/*" onChange={handleChange} required />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Button
                    type="button"
                    text={form.hit === 1 ? "HIT!! 해제" : "히트상품 지정"}
                    onClick={handleToggleHit}
                    style={{ background: form.hit === 1 ? "#f60" : "#eee", color: form.hit === 1 ? "#fff" : "#333" }}
                />
                {form.hit === 1 && <span style={{ color: "#f60", fontWeight: "bold" }}>🔥 HIT!!</span>}
            </div>

            <Button
                text="등록"
                type="submit"
                style={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.2rem" }}
            />
        </form>
    );
}

export default PdAdd;