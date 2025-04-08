import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import CustomSelect from "./CustomSelect";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersFromSchool } from "../services/userService";
import { createFlight } from "../services/flightService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import airportCodes from "../data/designadores_locales.json";

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
  }, [show, showTemporaryMessage]);

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
      } catch (error) {
        showTemporaryMessage(
          "error",
          "No se pudieron cargar los datos de la escuela."
        );
      }
    };

    loadSchoolData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFlight.school]); // Solo se ejecuta cuando cambia la escuela seleccionada

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

    // Pre-cargar piloto si el usuario es Alumno o Piloto
    if (
      (currentUser.role === "Alumno" || currentUser.role === "Piloto") &&
      newFlight.pilot === ""
    ) {
      setField("pilot", currentUser._id);
    }

    // Pre-cargar instructor si el usuario es Instructor
    if (currentUser.role === "Instructor" && newFlight.instructor === "") {
      setField("instructor", currentUser._id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, newFlight.school]); // Solo se ejecuta cuando cambia el usuario actual o la escuela

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
    (airport) => ({
      value: airport.designador,
      label: airport.designador,
    })
  );

  const handleCustomSelectChange = (fieldName: string, value: string) => {
    handleChange({
      target: { name: fieldName, value },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const schoolOptions = useMemo(
    () =>
      schools.map((school) => ({
        value: school._id,
        label: school.name,
      })),
    [schools]
  );

  const planeOptions = useMemo(
    () =>
      planes.map((plane) => ({
        value: plane._id,
        label: `${plane.registrationNumber} - ${plane.model}`,
      })),
    [planes]
  );

  const pilotOptions = useMemo(
    () =>
      users
        .filter((user) => user.role === "Alumno" || user.role === "Piloto")
        .map((user) => ({
          value: user._id,
          label: `${user.name} ${user.lastname}`,
        })),
    [users]
  );

  const instructorOptions = useMemo(
    () =>
      users
        .filter((user) => user.role === "Instructor")
        .map((user) => ({
          value: user._id,
          label: `${user.name} ${user.lastname}`,
        })),
    [users]
  );

  return (
    <Modal show={show} onHide={handleClose} className="fade add-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.message}</Alert>}
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
            <CustomSelect
              options={schoolOptions}
              value={newFlight.school}
              onChange={(value) => handleCustomSelectChange("school", value)}
              placeholder="Selecciona una escuela"
            />
          </Form.Group>

          {/* Aeronave */}
          <Form.Group controlId="formAirplane" className="form-group">
            <CustomSelect
              options={planeOptions}
              value={newFlight.airplane}
              onChange={(value) => handleCustomSelectChange("airplane", value)}
              placeholder="Selecciona una aeronave"
            />
          </Form.Group>

          {/* Piloto */}
          <Form.Group controlId="formPilot" className="form-group">
            <CustomSelect
              options={pilotOptions}
              value={newFlight.pilot}
              onChange={(value) => handleCustomSelectChange("pilot", value)}
              placeholder="Selecciona un piloto"
            />
          </Form.Group>

          {/* Instructor */}
          <Form.Group controlId="formInstructor" className="form-group">
            <CustomSelect
              options={instructorOptions}
              value={newFlight.instructor || ""}
              onChange={(value) =>
                handleCustomSelectChange("instructor", value)
              }
              placeholder="Selecciona un instructor"
            />
          </Form.Group>

          {/* Origen */}
          <Form.Group controlId="formOrigin" className="form-group">
            <CustomSelect
              options={airportOptions}
              value={newFlight.origin}
              onChange={(value) => handleCustomSelectChange("origin", value)}
              placeholder="Origen"
            />
          </Form.Group>

          {/* Destino */}
          <Form.Group controlId="formDestination" className="form-group">
            <CustomSelect
              options={airportOptions}
              value={newFlight.destination}
              onChange={(value) =>
                handleCustomSelectChange("destination", value)
              }
              placeholder="Destino"
            />
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
              placeholder=" "
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
              placeholder=" "
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
              placeholder=" "
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
              placeholder=" "
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
              placeholder=" "
            />
            <Form.Label className="floating-label">Combustible</Form.Label>
          </Form.Group>

          <div className="form-buttons">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="modal-button mt-3"
            >
              Agregar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFlightModal;
