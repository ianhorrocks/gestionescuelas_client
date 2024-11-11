import React, { useEffect, useState } from "react";
import UserItem from "../components/UserItem";
import AddUserModal from "../components/AddUserModal";
import { fetchUsers, deleteUser } from "../services/userService";

interface User {
  _id: string;
  name: string;
  lastname: string;
  roles: string[];
  email: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users");
      }
    };

    getUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  return (
    <div>
      <h1>Usuarios</h1>
      {error && <p className="text-danger">{error}</p>}
      <ul className="list-group">
        {users.map((user) => (
          <UserItem key={user._id} user={user} onDelete={handleDelete} />
        ))}
      </ul>
      <button className="add-user-button" onClick={() => setShowModal(true)}>
        +
      </button>
      <AddUserModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Users;
