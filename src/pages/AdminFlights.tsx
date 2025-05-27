// src/pages/AdminFlights.tsx
import React, { useEffect, useState } from "react";
import { getAllSchoolFlights } from "../services/flightService";
import { ExtendedFlight, HistoryFlight } from "../types/types";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/NavbarAdmin";
import FlightValidationTable from "../components/FlightValidationTable";
import FlightHistoryTable from "../components/FlightHistoryTable";
import { getLoggedUser } from "../services/auth";
import PlaneLoader from "../components/PlaneLoader";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "../components/Alert";
import { MdRestartAlt } from "react-icons/md";

enum Tab {
  HISTORY = "history",
  VALIDATOR = "validator",
}

const AdminFlights: React.FC = () => {
  const [flights, setFlights] = useState<ExtendedFlight[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VALIDATOR);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [validationStep, setValidationStep] = useState<1 | 2 | 3>(1);

  const fetchFlights = async (sid: string) => {
    try {
      const data = await getAllSchoolFlights(sid);
      setFlights(
        data.map((f) => ({ ...f, validated: f.status === "confirmed" }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await getLoggedUser();
        const schoolField = user.assignedSchools[0]?.school;
        const sid =
          typeof schoolField === "string" ? schoolField : schoolField?._id;
        if (!sid) throw new Error("No school assigned");
        setSchoolId(sid);
        await fetchFlights(sid);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const pendingFlights = flights.filter((f) => f.status === "pending");
    const hasPrevalidated = pendingFlights.some((f) => f.preValidated);

    if (pendingFlights.length === 0) {
      setValidationStep(3); // No hay pendientes, finalizado
    } else if (hasPrevalidated) {
      setValidationStep(2); // Hay pendientes y al menos uno prevalidado
    } else {
      setValidationStep(1); // Solo pendientes, ninguno prevalidado
    }
  }, [flights]);

  const handleStatusChange = (
    id: string,
    status: "confirmed" | "cancelled" | "pending"
  ) => {
    // Solo actualiza status y validated, nunca preValidated
    setFlights((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, status, validated: status === "confirmed" } : f
      )
    );
    // Refresca los vuelos desde el backend para mantener preValidated correcto
    if (schoolId) fetchFlights(schoolId);
  };

  const stepClass = (step: number) => {
    if (validationStep > step) return "step done"; // Pasos completados
    if (validationStep === step && validationStep < 3) return "step active"; // Paso actual (excepto el último)
    if (validationStep === 3) return "step done"; // Marca el último paso como "done" si está en el paso 3
    return "step"; // Pasos pendientes
  };

  const links = [
    { path: "/admin/users", label: "Usuarios" },
    { path: "/admin/planes", label: "Aeronaves" },
    { path: "/admin/flights", label: "Vuelos" },
  ];

  if (loading) {
    return (
      <>
        <Navbar title="Vuelos" links={links} logoutPath="/" />
        <div className="admin-flights-container">
          <PlaneLoader />
        </div>
      </>
    );
  }

  const historyFlights = flights.filter(
    (f): f is HistoryFlight =>
      f.status === "confirmed" || f.status === "cancelled"
  );

  return (
    <>
      <Navbar title="Vuelos" links={links} logoutPath="/" />
      <div className="admin-flights-navbar">
        <div className="flights-tabs">
          <button
            className={activeTab === Tab.VALIDATOR ? "active" : ""}
            onClick={() => setActiveTab(Tab.VALIDATOR)}
          >
            Validador
          </button>
          <button
            className={activeTab === Tab.HISTORY ? "active" : ""}
            onClick={() => setActiveTab(Tab.HISTORY)}
          >
            Historial
          </button>
        </div>
      </div>
      <div className="admin-flights-container">
        {message && <Alert type={message.type} message={message.message} />}

        {activeTab === Tab.HISTORY && (
          <div className="tab-content history-tab">
            <FlightHistoryTable
              flights={historyFlights}
              onStatusChange={(id, status) => {
                // Actualiza el estado de los vuelos en AdminFlights
                setFlights((prev) =>
                  prev.map((flight) =>
                    flight._id === id ? { ...flight, status } : flight
                  )
                );
              }}
              showTemporaryMessage={showTemporaryMessage}
            />
          </div>
        )}

        {activeTab === Tab.VALIDATOR && (
          <div className="tab-content validator-tab">
            <div
              className={`floating-stepper ${
                activeTab === Tab.VALIDATOR ? "fade-in" : ""
              }`}
            >
              <div className="controls-card">
                <div
                  className={`validation-steps ${
                    validationStep === 1
                      ? "progress-0"
                      : validationStep === 2
                      ? "progress-50"
                      : "progress-100"
                  }`}
                >
                  <div
                    className={stepClass(1)}
                    onClick={() => {
                      setValidationStep(1);
                      setShowModal(true); // Abre el modal al hacer clic
                    }}
                    aria-label="Cargar vuelos desde un archivo CSV"
                  >
                    1. Cargar CSV
                  </div>
                  <div className={stepClass(2)}>2. Revisar Válidos</div>
                  <div className={stepClass(3)}>3. Finalizado</div>
                </div>
              </div>
            </div>
            {validationStep === 2 && (
              <button
                className="reset-button"
                onClick={() => setValidationStep(1)}
                aria-label="Reiniciar validación"
              >
                <MdRestartAlt size={20} />
              </button>
            )}

            <FlightValidationTable
              flights={flights.filter((f) => f.status === "pending")}
              onStatusChange={handleStatusChange}
              validationStep={validationStep}
              setValidationStep={setValidationStep}
              showTemporaryMessage={showTemporaryMessage}
            />
          </div>
        )}

        {schoolId && (
          <ValidateFlightsModal
            show={showModal}
            onHide={() => setShowModal(false)}
            schoolId={schoolId}
            onResult={async () => {
              setValidationStep(2);
              await fetchFlights(schoolId);
              showTemporaryMessage("success", "Validación ejecutada");
            }}
          />
        )}
      </div>
      <div className="admin-flights-footer"></div>
    </>
  );
};

export default AdminFlights;
