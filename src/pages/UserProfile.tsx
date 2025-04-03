import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../services/auth";
import Navbar from "../components/Navbar";
import defaultProfilePhoto from "../assets/images/Logosmalluserprofilephoto.png";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: "",
    lastname: "",
    email: "",
    dni: "",
    role: "",
    photo: null,
  });
  const [userName, setUserName] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = () => {
      const user = getCurrentUser(); // Obtener los datos del usuario desde localStorage
      setProfile(user);
      setUserName(`${user.name} ${user.lastname}`);
    };

    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <Navbar
        title="Mi Perfil"
        userName={userName}
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />
      <div className="profile-content">
        <div className="profile-photo-container">
          <img
            src={profile.photo || defaultProfilePhoto}
            alt="Foto de perfil"
            className="profile-photo"
          />
          <button className="change-photo-btn">
            <i className="fas fa-camera"></i>
          </button>
        </div>
        <div className="profile-details">
          <h2>{`${profile.name} ${profile.lastname}`}</h2>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>DNI:</strong> {profile.dni}
          </p>
          <p>
            <strong>Rol:</strong> {profile.role}
          </p>
        </div>
        <>
          <div className="profile-actions">
            <button
              className="btn btn-primary"
              onClick={() => setEditModalOpen(true)}
            >
              Editar Perfil
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPasswordModalOpen(true)}
            >
              Cambiar Contraseña
            </button>
          </div>
          {isEditModalOpen && (
            <EditProfileModal
              profile={profile}
              onClose={() => setEditModalOpen(false)}
              onSave={(updatedProfile) =>
                setProfile({
                  ...profile,
                  ...updatedProfile,
                })
              }
            />
          )}
          {isPasswordModalOpen && (
            <ChangePasswordModal
              onClose={() => setPasswordModalOpen(false)}
              onSave={(passwords) =>
                console.log("Contraseñas enviadas:", passwords)
              }
            />
          )}
        </>
      </div>
    </div>
  );
};

export default UserProfile;
