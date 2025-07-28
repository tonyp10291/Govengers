import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/admin/MUser.css";

const MUser = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/admin/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("❌ 사용자 목록 불러오기 실패:", err);
      });
  }, []);

  return (
    <div className="admin-user-wrap">
      <h2>Users & Permissions</h2>
      <p>Assign locations to your users.</p>
      <div className="admin-card">
        <div className="admin-header">
          <input type="text" placeholder="Find user" className="search-input" />
          <div className="button-group">
            <button>Edit</button>
            <button>Remove</button>
            <button>Email instructions</button>
            <button className="add-btn">Add user</button>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Role</th>
              <th>Assigned locations</th>
              <th>Project level access</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td><input type="checkbox" /></td>
                <td><button className="user-link-btn">{user.unm}</button></td>
                <td>{user.role || "N/A"}</td>
                <td>{user.locations || 0}</td>
                <td>{user.access || "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MUser;
