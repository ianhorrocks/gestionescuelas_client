import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";

const RegisterSchool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("Escuela de vuelo");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [aerodrome, setAerodrome] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [publicEmail, setPublicEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [useContactEmail, setUseContactEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          name,
          country,
          aerodrome,
          address,
          openingHours,
          publicPhone,
          publicEmail,
          adminEmail,
          adminPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      setSuccess("School registration successful");
      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="centered-form">
      <div>
        <Link to="/" className="back-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 7.5H14.5A.5.5 0 0 1 15 8z"
            />
          </svg>
          Back
        </Link>
        <h1>Registrar Escuela</h1>
        {error && <p className="text-danger">{error}</p>}
        {step === 1 && (
          <div>
            <h2>Información de la escuela</h2>
            <form>
              <div className="form-group">
                <label htmlFor="type">Tipo</label>
                <select
                  className="form-control"
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="Aeroclub">Aeroclub</option>
                  <option value="Escuela de vuelo">Escuela de vuelo</option>
                  <option value="Club de planeadores">
                    Club de planeadores
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">País</label>
                <select
                  className="form-control"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  <option value="Argentina">🇦🇷 Argentina</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="aerodrome">Aeródromo</label>
                <input
                  type="text"
                  className="form-control"
                  id="aerodrome"
                  value={aerodrome}
                  onChange={(e) => setAerodrome(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2>Datos de contacto</h2>
            <form>
              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="openingHours">Horarios de apertura</label>
                <input
                  type="text"
                  className="form-control"
                  id="openingHours"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="publicPhone">Teléfono público</label>
                <input
                  type="text"
                  className="form-control"
                  id="publicPhone"
                  value={publicPhone}
                  onChange={(e) => setPublicPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="publicEmail">Email público</label>
                <input
                  type="email"
                  className="form-control"
                  id="publicEmail"
                  value={publicEmail}
                  onChange={(e) => setPublicEmail(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Atrás
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2>Cuenta</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="adminEmail">Email del administrador</label>
                <input
                  type="email"
                  className="form-control"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="useContactEmail"
                    checked={useContactEmail}
                    onChange={(e) => {
                      setUseContactEmail(e.target.checked);
                      if (e.target.checked) {
                        setAdminEmail(publicEmail);
                      } else {
                        setAdminEmail("");
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="useContactEmail">
                    Usar email de contacto
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="adminPassword">
                  Contraseña del administrador
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Atrás
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear cuenta
                </button>
              </div>
            </form>
          </div>
        )}
        {success && <Alert message={success} type="success" />}
      </div>
    </div>
  );
};

export default RegisterSchool;
