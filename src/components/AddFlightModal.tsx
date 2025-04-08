import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersFromSchool } from "../services/userService";
import { createFlight } from "../services/flightService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import airportCodes from "../../public/designadores_locales.json";

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
    { _id: string; name: string; lastname: string; role: string }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    name: string;
    lastname: string;
    role: string;
  } | null>(null);
  const { message, showTemporaryMessage } = useTemporaryMessage();

  const handleClose = () => {
    onClose();
  };

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
              role: "",
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
          showTemporaryMessage(
            "error",
            "Error al cargar los datos del usuario."
          );
        }
      };

      loadProfile();
    }
  }, [show]);

  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        if (!newFlight.school) return;

        const selectedSchool = schools.find(
          (school) => school._id === newFlight.school
        );

        if (selectedSchool) {
          setCurrentUser((prev) =>
            prev ? { ...prev, role: selectedSchool.role } : null
          );

          const planesData = await fetchPlanes(selectedSchool._id);
          setPlanes(planesData);

          const usersData = await fetchUsersFromSchool(selectedSchool._id);
          setUsers(usersData);
        }
      } catch {
        showTemporaryMessage(
          "error",
          "No se pudieron cargar los datos de la escuela."
        );
      }
    };

    loadSchoolData();
  }, [newFlight.school, schools]);

  const setField = React.useCallback(
    (name: string, value: string) => {
      handleChange({
        target: { name, value },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    [handleChange]
  );

  useEffect(() => {
    if (!currentUser || !newFlight.school) return;

    if (
      (currentUser.role === "Alumno" || currentUser.role === "Piloto") &&
      newFlight.pilot === ""
    ) {
      setField("pilot", currentUser._id);
    }

    if (currentUser.role === "Instructor" && newFlight.instructor === "") {
      setField("instructor", currentUser._id);
    }
  }, [
    currentUser,
    newFlight.school,
    newFlight.pilot,
    newFlight.instructor,
    setField,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createFlight(newFlight);
      showTemporaryMessage("success", "Vuelo agregado exitosamente");
      onSuccess?.("Vuelo agregado exitosamente");
      onClose();
    } catch {
      showTemporaryMessage("error", "No se pudo agregar el vuelo.");
    }
  };

  const airportOptions = (airportCodes as { designador: string }[]).map(
    (airport) => airport.designador
  );

  return (
    <Modal show={show} onHide={handleClose} className="fade add-flight-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.message}</Alert>}
        <Form onSubmit={handleSubmit}>
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
          </Form.Group>

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
          </Form.Group>

          <Form.Group controlId="formPilot" className="form-group">
            <Form.Control
              as="select"
              name="pilot"
              value={newFlight.pilot}
              onChange={handleChange}
              required
              className="floating-input"
              disabled={
                currentUser?.role === "Alumno" || currentUser?.role === "Piloto"
              }
            >
              <option value="" disabled hidden>
                Selecciona un piloto
              </option>
              {users
                .filter(
                  (user) => user.role === "Alumno" || user.role === "Piloto"
                )
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formInstructor" className="form-group">
            <Form.Control
              as="select"
              name="instructor"
              value={newFlight.instructor || ""}
              onChange={handleChange}
              required
              className="floating-input"
              disabled={currentUser?.role === "Instructor"}
            >
              <option value="" disabled hidden>
                Selecciona un instructor
              </option>
              {users
                .filter((user) => user.role === "Instructor")
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} {user.lastname}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formOrigin" className="form-group">
            <Form.Control
              as="select"
              name="origin"
              value={newFlight.origin}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona origen
              </option>
              {airportOptions.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Origen</Form.Label>
          </Form.Group>

          <Form.Group controlId="formDestination" className="form-group">
            <Form.Control
              as="select"
              name="destination"
              value={newFlight.destination}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona destino
              </option>
              {airportOptions.map((code, index) => (
                <option key={index} value={code}>
                  {code}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Destino</Form.Label>
          </Form.Group>

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

          <Form.Group controlId="formLandings" className="form-group">
            <Form.Control
              type="number"
              name="landings"
              value={newFlight.landings}
              onChange={handleChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Aterrizajes</Form.Label>
          </Form.Group>

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

          <div className="form-buttons">
            <Button variant="secondary" onClick={handleClose}>
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
