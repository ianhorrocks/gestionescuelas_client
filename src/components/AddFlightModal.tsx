import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import CustomSelect from "./CustomSelect";
import { createFlight } from "../services/flightService";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersFromSchool } from "../services/userService";
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
  onSuccess?: (message: string) => void;
  showTemporaryMessage: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
}

interface Plane {
  _id: string;
  registrationNumber: string;
  model: string;
}

interface User {
  _id: string;
  name: string;
  lastname: string;
  role: string;
}

const AddFlightModal: React.FC<AddFlightModalProps> = ({
  show,
  onClose,
  onSuccess,
}) => {
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schools, setSchools] = useState<
    { value: string; label: string; role: string }[]
  >([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isPilotDisabled, setIsPilotDisabled] = useState(false);
  const [isInstructorDisabled, setIsInstructorDisabled] = useState(false);

  const [flight, setFlight] = useState<LocalFlightData>({
    date: "",
    airplane: "",
    pilot: "",
    instructor: "",
    departureTime: "",
    arrivalTime: "",
    landings: "",
    oil: "",
    charge: "",
    school: "",
    origin: "",
    destination: "",
    initialOdometer: "",
    finalOdometer: "",
  });

  const updateField = (name: keyof LocalFlightData, value: string) => {
    setFlight((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "departureTime" || name === "arrivalTime") {
      const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
      if (!isValidTime) return;
    }
    updateField(name as keyof LocalFlightData, value);
  };

  useEffect(() => {
    if (show) {
      const profile = localStorage.getItem("profile");
      if (profile) {
        const parsed = JSON.parse(profile);
        setCurrentUser({
          _id: parsed._id,
          name: parsed.name,
          lastname: parsed.lastname,
          role: parsed.role,
        });
        const assigned = parsed.assignedSchools.map(
          (a: { school: { _id: string; name: string }; role: string }) => ({
            value: a.school._id,
            label: a.school.name,
            role: a.role,
          })
        );
        setSchools(assigned);
      }

      const today = new Date().toISOString().split("T")[0];
      updateField("date", today);
    }
  }, [show]);

  const handleSchoolChange = async (value: string) => {
    setSelectedSchool(value);
    updateField("school", value);

    if (!value) {
      resetFields();
      return;
    }

    resetFields();

    try {
      const [planesData, usersData] = await Promise.all([
        fetchPlanes(value),
        fetchUsersFromSchool(value),
      ]);
      setPlanes(planesData);
      setUsers(usersData);

      const selected = schools.find((s) => s.value === value);
      if (selected) {
        setTimeout(() => prefillFieldsBasedOnRole(usersData), 0);
      }
    } catch {
      showTemporaryMessage("error", "No se pudieron cargar los datos.");
    }
  };

  const resetFields = () => {
    setPlanes([]);
    setUsers([]);
    setIsPilotDisabled(false);
    setIsInstructorDisabled(false);
  };

  const prefillFieldsBasedOnRole = (usersData: User[]) => {
    const user = usersData.find((u) => u._id === currentUser?._id);
    if (!user) return;

    if (user.role === "Alumno" || user.role === "Piloto") {
      updateField("pilot", user._id);
      setIsPilotDisabled(true);
    } else if (user.role === "Instructor") {
      updateField("instructor", user._id);
      setIsInstructorDisabled(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convertir "" a null para el campo instructor
    const flightData = {
      ...flight,
      instructor: flight.instructor === "" ? null : flight.instructor,
    };

    if (!flightData.pilot || !flightData.school || !flightData.airplane) {
      showTemporaryMessage("error", "Faltan campos obligatorios.");
      return;
    }

    try {
      console.log("Submitting flight:", flightData);
      await createFlight(flightData);
      showTemporaryMessage("success", "Vuelo agregado exitosamente");
      onSuccess?.("Vuelo agregado exitosamente");
      onClose();
    } catch {
      showTemporaryMessage("error", "No se pudo agregar el vuelo.");
    }
  };

  const airportOptions = (airportCodes as { designador: string }[]).map(
    (a) => ({
      value: a.designador,
      label: a.designador,
    })
  );

  const planeOptions = planes.map((p) => ({
    value: p._id,
    label: `${p.registrationNumber} - ${p.model}`,
  }));

  const pilotOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === "Alumno" || u.role === "Piloto")
        .map((u) => ({ value: u._id, label: `${u.name} ${u.lastname}` })),
    [users]
  );

  const instructorOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === "Instructor")
        .map((u) => ({ value: u._id, label: `${u.name} ${u.lastname}` })),
    [users]
  );

  return (
    <Modal show={show} onHide={onClose} className="fade add-modal">
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
              value={flight.date.split("/").reverse().join("-")}
              onChange={(e) => {
                const [yyyy, mm, dd] = e.target.value.split("-");
                updateField("date", `${dd}/${mm}/${yyyy}`);
              }}
              min="2020-01-01"
              max={new Date().toISOString().split("T")[0]}
              required
              className="floating-input"
            />

            <Form.Label className="floating-label">Fecha</Form.Label>
          </Form.Group>

          <Form.Group controlId="formSchool" className="form-group">
            <CustomSelect
              options={schools}
              value={selectedSchool}
              onChange={handleSchoolChange}
              placeholder="Escuela"
            />
          </Form.Group>

          <Form.Group controlId="formAirplane" className="form-group">
            <CustomSelect
              options={planeOptions}
              value={flight.airplane}
              onChange={(value) => updateField("airplane", value)}
              placeholder="Aeronave"
            />
          </Form.Group>

          <Form.Group controlId="formPilot" className="form-group">
            <CustomSelect
              options={pilotOptions}
              value={flight.pilot}
              onChange={(value) => updateField("pilot", value)}
              placeholder="Piloto"
              disabled={isPilotDisabled}
            />
          </Form.Group>

          <Form.Group controlId="formInstructor" className="form-group">
            <CustomSelect
              options={[
                { value: "", label: "Sin instructor" }, // Opción adicional
                ...instructorOptions,
              ]}
              value={flight.instructor || ""}
              onChange={(value) => updateField("instructor", value)}
              placeholder="Instructor"
              disabled={isInstructorDisabled}
            />
          </Form.Group>

          <Form.Group controlId="formOrigin" className="form-group">
            <CustomSelect
              options={airportOptions}
              value={flight.origin}
              onChange={(value) => updateField("origin", value)}
              placeholder="Origen"
            />
          </Form.Group>

          <Form.Group controlId="formDestination" className="form-group">
            <CustomSelect
              options={airportOptions}
              value={flight.destination}
              onChange={(value) => updateField("destination", value)}
              placeholder="Destino"
            />
          </Form.Group>

          <Form.Group controlId="formDepartureTime" className="form-group">
            <Form.Control
              type="time" // Cambiado a formato 24 horas
              name="departureTime"
              value={flight.departureTime}
              onChange={handleInputChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Hora de salida</Form.Label>
          </Form.Group>

          <Form.Group controlId="formArrivalTime" className="form-group">
            <Form.Control
              type="time" // Cambiado a formato 24 horas
              name="arrivalTime"
              value={flight.arrivalTime}
              onChange={handleInputChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Hora de llegada</Form.Label>
          </Form.Group>

          <Form.Group controlId="formInitialOdometer" className="form-group">
            <Form.Control
              type="number"
              name="initialOdometer"
              value={flight.initialOdometer}
              onChange={handleInputChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Odómetro inicial</Form.Label>
          </Form.Group>

          <Form.Group controlId="formFinalOdometer" className="form-group">
            <Form.Control
              type="number"
              name="finalOdometer"
              value={flight.finalOdometer}
              onChange={handleInputChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Odómetro final</Form.Label>
          </Form.Group>

          <Form.Group controlId="formLandings" className="form-group">
            <Form.Control
              type="number"
              name="landings"
              value={flight.landings}
              onChange={handleInputChange}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Aterrizajes</Form.Label>
          </Form.Group>

          <Form.Group controlId="formOil" className="form-group">
            <Form.Control
              type="text"
              name="oil"
              value={flight.oil || ""}
              onChange={handleInputChange}
              className="floating-input"
            />
            <Form.Label className="floating-label">Aceite</Form.Label>
          </Form.Group>

          <Form.Group controlId="formCharge" className="form-group">
            <Form.Control
              type="text"
              name="charge"
              value={flight.charge || ""}
              onChange={handleInputChange}
              className="floating-input"
            />
            <Form.Label className="floating-label">Combustible</Form.Label>
          </Form.Group>

          <div className="form-buttons">
            <Button variant="secondary" onClick={onClose}>
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
