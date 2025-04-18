import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../services/auth";
import Navbar from "../components/NavbarUser";
import defaultProfilePhoto from "../assets/images/LogoSmallUserProfilePhoto.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import EditProfileModal from "../components/EditProfileModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { User } from "../types/types";
import PlaneLoader from "../components/PlaneLoader";

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = () => {
      const user = getCurrentUser() as User;
      setProfile(user);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <Navbar
        title="Mi Perfil"
        links={[
          { path: "/user/dashboard", label: "Dashboard" },
          { path: "/user/profile", label: "Mi Perfil" },
          { path: "/user/flights", label: "Mis Vuelos" },
        ]}
        logoutPath="/user/login"
      />

      {loading ? (
        <PlaneLoader />
      ) : (
        profile && (
          <div className="profile-content">
            <div className="profile-photo-container">
              <img
                src={profile.photo || defaultProfilePhoto}
                alt="Foto de perfil"
                className="profile-photo"
              />
              <button className="change-photo-btn">
                <FontAwesomeIcon icon={faCamera} />
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
                <strong>Escuelas Asignadas:</strong>
              </p>
              <ul className="assigned-schools">
                {profile.assignedSchools.map((school) => (
                  <li key={school._id} className="school-item">
                    <p>
                      <strong>Escuela:</strong> {school.school.name}
                    </p>
                    <p>
                      <strong>Rol:</strong> {school.role}
                    </p>
                    <p>
                      <strong>Aeródromo:</strong> {school.school.aerodrome}
                    </p>
                    <p>
                      <strong>Agregado el:</strong>{" "}
                      {new Date(school.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
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
          </div>
        )
      )}

      {isEditModalOpen && profile && (
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
    </div>
  );
};

export default UserProfile;
