import React, { useState } from 'react';

const AdminProductEdit = ({ product }) => {
  const [form, setForm] = useState(product);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`/api/products/${form.pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => alert('수정 완료!'));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ...상품명, 카테고리 등... */}
      <label>
        <input
          type="checkbox"
          checked={form.hit === 1}
          onChange={e => setForm({ ...form, hit: e.target.checked ? 1 : 0 })}
        />
        HIT 상품
      </label>
      <button type="submit">저장</button>
    </form>
  );
};

export default AdminProductEdit;