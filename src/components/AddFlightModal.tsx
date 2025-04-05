import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersByIds } from "../services/userService";
import { createFlight } from "../services/flightService";

export interface LocalFlightData {
  date: string;
  airplane: string;
  pilot: string;
  instructor: string | null;
  departureTime: string;
  arrivalTime: string;
  landings: string;
  oil?: string;
  charge?: string;
  school: string;
  origin: string;
  destination: string;
  initialOdometer: string;
  finalOdometer: string;
}

interface AddFlightModalProps {
  show: boolean;
  onClose: () => void;
  newFlight: LocalFlightData;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSuccess?: (message: string) => void;
}

const AddFlightModal: React.FC<AddFlightModalProps> = ({
  show,
  onClose,
  newFlight,
  handleChange,
  onSuccess,
}) => {
  const [schools, setSchools] = useState<
    { _id: string; name: string; planes: string[]; role: string }[]
  >([]);
  const [planes, setPlanes] = useState<
    { _id: string; registrationNumber: string; model: string }[]
  >([]);
  const [users, setUsers] = useState<
    { _id: string; name: string; lastname: string }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    name: string;
    lastname: string;
    role: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar perfil del usuario y escuelas al abrir el modal
  useEffect(() => {
    if (show) {
      const loadProfile = () => {
        try {
          const profile = localStorage.getItem("profile");
          if (profile) {
            const parsedProfile = JSON.parse(profile);

            setCurrentUser({
              _id: parsedProfile._id,
              name: parsedProfile.name,
              lastname: parsedProfile.lastname,
              role: "", // El rol se determinará según la escuela seleccionada
            });

            const assignedSchools = parsedProfile.assignedSchools.map(
              (assignment: {
                school: { _id: string; name: string; planes: string[] };
                role: string;
              }) => ({
                _id: assignment.school._id,
                name: assignment.school.name,
                planes: assignment.school.planes,
                role: assignment.role,
              })
            );

            setSchools(assignedSchools);
          } else {
            throw new Error("No se encontró el perfil en el localStorage.");
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
          setErrorMessage("Error al cargar los datos del usuario.");
        }
      };

      loadProfile();
    }
  }, [show]);

  // Cargar aviones y usuarios al seleccionar una escuela
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        if (!newFlight.school) return;

        const selectedSchool = schools.find(
          (school) => school._id === newFlight.school
        );

        if (selectedSchool) {
          // Actualizar el rol del usuario en la escuela seleccionada
          setCurrentUser((prev) =>
            prev ? { ...prev, role: selectedSchool.role } : null
          );

          // Cargar aviones
          const planesData = await fetchPlanes(selectedSchool._id);
          setPlanes(planesData);

          // Cargar usuarios
          const usersData = await fetchUsersByIds(selectedSchool.planes);
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error al cargar los datos de la escuela:", error);
        setErrorMessage(
          "No se pudieron cargar los datos de la escuela. Por favor, inténtalo nuevamente."
        );
      }
    };

    loadSchoolData();
  }, [newFlight.school, schools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createFlight(newFlight);
      if (onSuccess) {
        onSuccess("Vuelo agregado exitosamente");
      }
      onClose();
    } catch (error) {
      console.error("Error al agregar el vuelo:", error);
      setErrorMessage("No se pudo agregar el vuelo. Inténtalo nuevamente.");
    }
  };

  return (
    <Modal show={show} onHide={onClose} className="fade add-flight-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          {/* Fecha */}
          <Form.Group controlId="formDate" className="form-group">
            <Form.Control
              type="date"
              name="date"
              value={newFlight.date}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Fecha</Form.Label>
          </Form.Group>

          {/* Escuela */}
          <Form.Group controlId="formSchool" className="form-group">
            <Form.Control
              as="select"
              name="school"
              value={newFlight.school}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona una escuela
              </option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Escuela</Form.Label>
          </Form.Group>

          {/* Aeronave */}
          <Form.Group controlId="formAirplane" className="form-group">
            <Form.Control
              as="select"
              name="airplane"
              value={newFlight.airplane}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona una aeronave
              </option>
              {planes.map((plane) => (
                <option key={plane._id} value={plane._id}>
                  {plane.registrationNumber} - {plane.model}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Aeronave</Form.Label>
          </Form.Group>

          {/* Piloto */}
          <Form.Group controlId="formPilot" className="form-group">
            <Form.Control
              as="select"
              name="pilot"
              value={newFlight.pilot}
              onChange={handleChange}
              required
              className="floating-input"
              disabled={currentUser?.role === "Instructor"}
            >
              <option value="" disabled hidden>
                Selecciona un piloto
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Piloto</Form.Label>
          </Form.Group>

          {/* Instructor */}
          <Form.Group controlId="formInstructor" className="form-group">
            <Form.Control
              as="select"
              name="instructor"
              value={newFlight.instructor || ""}
              onChange={handleChange}
              required
              className="floating-input"
              disabled={currentUser?.role === "Piloto"}
            >
              <option value="" disabled hidden>
                Selecciona un instructor
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user.lastname}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Instructor</Form.Label>
          </Form.Group>

          {/* Origen */}
          <Form.Group controlId="formOrigin" className="form-group">
            <Form.Control
              type="text"
              name="origin"
              value={newFlight.origin}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Origen</Form.Label>
          </Form.Group>

          {/* Destino */}
          <Form.Group controlId="formDestination" className="form-group">
            <Form.Control
              type="text"
              name="destination"
              value={newFlight.destination}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Destino</Form.Label>
          </Form.Group>

          {/* Hora de salida */}
          <Form.Group controlId="formDepartureTime" className="form-group">
            <Form.Control
              type="time"
              name="departureTime"
              value={newFlight.departureTime}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Hora de salida</Form.Label>
          </Form.Group>

          {/* Hora de llegada */}
          <Form.Group controlId="formArrivalTime" className="form-group">
            <Form.Control
              type="time"
              name="arrivalTime"
              value={newFlight.arrivalTime}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Hora de llegada</Form.Label>
          </Form.Group>

          {/* Odómetro inicial */}
          <Form.Group controlId="formInitialOdometer" className="form-group">
            <Form.Control
              type="number"
              name="initialOdometer"
              value={newFlight.initialOdometer}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Odómetro inicial</Form.Label>
          </Form.Group>

          {/* Odómetro final */}
          <Form.Group controlId="formFinalOdometer" className="form-group">
            <Form.Control
              type="number"
              name="finalOdometer"
              value={newFlight.finalOdometer}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Odómetro final</Form.Label>
          </Form.Group>

          {/* Aceite */}
          <Form.Group controlId="formOil" className="form-group">
            <Form.Control
              type="text"
              name="oil"
              value={newFlight.oil || ""}
              onChange={handleChange}
              className="floating-input"
            />
            <Form.Label className="floating-label">Aceite</Form.Label>
          </Form.Group>

          {/* Combustible */}
          <Form.Group controlId="formCharge" className="form-group">
            <Form.Control
              type="text"
              name="charge"
              value={newFlight.charge || ""}
              onChange={handleChange}
              className="floating-input"
            />
            <Form.Label className="floating-label">Combustible</Form.Label>
          </Form.Group>

          {/* Botones */}
          <div className="button-container">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Agregar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFlightModal;
