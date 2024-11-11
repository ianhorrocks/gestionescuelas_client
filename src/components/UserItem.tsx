import React from "react";

interface UserItemProps {
  user: {
    _id: string;
    name: string;
    lastname: string;
    roles: string[];
    email: string;
  };
  onDelete: (id: string) => void;
}

const UserItem: React.FC<UserItemProps> = ({ user, onDelete }) => {
  return (
    <li className="list-group-item d-flex align-items-center">
      <img
        src="https://via.placeholder.com/50"
        alt="User"
        className="rounded-circle mr-3"
        style={{ width: "50px", height: "50px", marginRight: "15px" }}
      />
      <div style={{ flex: 1 }}>
        <strong>{`${user.name} ${user.lastname}`}</strong> <br />
        <span className="text-muted" style={{ fontWeight: "lighter" }}>
          {user.roles.join(", ")}
        </span>
      </div>
      <button
        className="btn btn-danger btn-sm"
        style={{ marginLeft: "auto" }}
        onClick={() => onDelete(user._id)}
      >
        Eliminar
      </button>
    </li>
  );
};

export default UserItem;
