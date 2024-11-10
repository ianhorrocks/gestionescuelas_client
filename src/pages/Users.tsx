import React, { useEffect, useState } from "react";

const Users: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      {error && <p className="text-danger">{error}</p>}
      <ul>
        {users.map((user: any) => (
          <li key={user._id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
