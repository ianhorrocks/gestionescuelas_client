// src/pages/AdminFlights.tsx
import React, { useEffect, useState } from "react";
import { getAllSchoolFlights } from "../services/flightService";
import { Flight as FlightBase } from "../types/types";
import ValidateFlightsModal from "../components/ValidateFlightsModal";
import Navbar from "../components/NavbarAdmin";
import FlightValidationTable from "../components/FlightValidationTable";
import FlightHistoryTable from "../components/FlightHistoryTable";
import { getLoggedUser } from "../services/auth";
import PlaneLoader from "../components/PlaneLoader";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "../components/Alert";

type Flight = FlightBase & { validated: boolean };

enum Tab {
  HISTORY = "history",
  VALIDATOR = "validator",
}

const AdminFlights: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
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
        const sid = user.assignedSchools[0]?.school?._id;
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
    if (validationStep === 2 && flights.every((f) => f.status !== "pending")) {
      setValidationStep(3); // Avanza al paso 3
    }
  }, [flights, validationStep]);

  const handleStatusChange = (
    id: string,
    status: "confirmed" | "cancelled"
  ) => {
    setFlights((prev) =>
      prev.map((f) =>
        f._id === id ? { ...f, status, validated: status === "confirmed" } : f
      )
    );
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

  type HistoryFlight = Omit<Flight, "status"> & {
    status: "confirmed" | "cancelled";
  };
  const historyFlights = flights.filter(
    (f): f is HistoryFlight =>
      f.status === "confirmed" || f.status === "cancelled"
  );

  return (
    <>
      <Navbar title="Vuelos" links={links} logoutPath="/" />
      <div className="admin-flights-container">
        {message && <Alert type={message.type} message={message.message} />}

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

        {activeTab === Tab.HISTORY && (
          <div className="tab-content history-tab">
            <FlightHistoryTable flights={historyFlights} />
          </div>
        )}

        {activeTab === Tab.VALIDATOR && (
          <div className="tab-content validator-tab">
            {/* Stepper flotante */}
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
                  <div className={stepClass(1)}>Cargar CSV</div>
                  <div className={stepClass(2)}>Revisar Validos</div>
                  <div className={stepClass(3)}>Finalizado</div>
                </div>
              </div>
            </div>

            {/* Botón "Validar vuelos" */}
            <div className="button-container">
              <button
                className="csv-button"
                onClick={() => {
                  setValidationStep(1);
                  setShowModal(true);
                }}
              >
                Cargar Vuelos
              </button>
            </div>

            {/* Tabla de validación */}
            <FlightValidationTable
              flights={flights.filter((f) => f.status === "pending")}
              onStatusChange={handleStatusChange}
              validationStep={validationStep}
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
    </>
  );
};

export default AdminFlights;
