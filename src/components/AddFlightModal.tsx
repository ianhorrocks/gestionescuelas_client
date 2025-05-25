import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import CustomSelect from "./CustomSelect";
import { createFlight } from "../services/flightService";
import { fetchPlanes } from "../services/planeService";
import { fetchUsersFromSchool } from "../services/userService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import airportCodes from "../data/designadores_locales.json";
import { FlightUser, FlightData, Plane } from "../types/types";
import { AxiosError } from "axios"; // arriba del archivo si no está

interface AddFlightModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  showTemporaryMessage: (
    type: "success" | "error" | "warning",
    message: string
  ) => void;
}

const AddFlightModal: React.FC<AddFlightModalProps> = ({
  show,
  onClose,
  onSuccess,
}) => {
  const { message, showTemporaryMessage } = useTemporaryMessage();
  const [currentUser, setCurrentUser] = useState<FlightUser | null>(null);
  const [schools, setSchools] = useState<
    { value: string; label: string; role: string }[]
  >([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [users, setUsers] = useState<FlightUser[]>([]);
  const [isPilotDisabled, setIsPilotDisabled] = useState(false);
  const [isInstructorDisabled, setIsInstructorDisabled] = useState(false);
  const [oilUnit, setOilUnit] = useState("lt");
  const [chargeUnit, setChargeUnit] = useState("lt");

  const [flight, setFlight] = useState<FlightData>({
    date: "",
    flightType: "" as FlightData["flightType"],
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
  });

  const updateField = (name: keyof FlightData, value: string) => {
    setFlight((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof FlightData, value);
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

      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      const formattedToday = `${year}-${month}-${day}`;
      updateField("date", formattedToday);
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

  const prefillFieldsBasedOnRole = (usersData: FlightUser[]) => {
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

    if (!flight.flightType) {
      showTemporaryMessage("error", "Debes seleccionar el tipo de vuelo.");
      return;
    }

    if (!flight.pilot || !flight.school || !flight.airplane) {
      showTemporaryMessage("error", "Faltan campos obligatorios.");
      return;
    }

    if (!flight.departureTime || !flight.arrivalTime) {
      showTemporaryMessage(
        "error",
        "Debes ingresar las horas de salida y llegada."
      );
      return;
    }

    try {
      const [year, month, day] = flight.date.split("-");

      const fullDate = new Date(`${year}-${month}-${day}T00:00:00`);
      const departureDate = new Date(
        `${year}-${month}-${day}T${flight.departureTime}:00`
      );
      const arrivalDate = new Date(
        `${year}-${month}-${day}T${flight.arrivalTime}:00`
      );

      const flightData = {
        ...flight,
        date: fullDate,
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        instructor: flight.instructor === "" ? null : flight.instructor,
        oil: flight.oil ? flight.oil : undefined,
        oilUnit,
        charge: flight.charge ? flight.charge : undefined,
        chargeUnit,
      };

      console.log("Flight data que estoy mandando:", flightData);

      await createFlight(flightData);
      showTemporaryMessage("success", "Vuelo agregado exitosamente");
      onSuccess?.("Vuelo agregado exitosamente");
      onClose();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;

      console.error(
        "Error real del servidor:",
        axiosError.response?.data || error
      );

      showTemporaryMessage(
        "error",
        axiosError.response?.data?.message || "No se pudo agregar el vuelo."
      );
    }
  };

  const airportOptions = (airportCodes as { designador: string }[]).map(
    (a) => ({
      value: a.designador,
      label: a.designador,
    })
  );

  const planeOptions = planes
    .filter((p) => p._id) // Ensure _id is not undefined
    .map((p) => ({
      value: p._id as string,
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

  const handleReset = () => {
    setFlight({
      date: "",
      flightType: "" as FlightData["flightType"],
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
    });
    setSelectedSchool(""); // También reseteamos la escuela seleccionada
  };

  const handleFieldFocus = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <Modal show={show} onHide={onClose} className="fade add-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      {message && <Alert variant={message.type}>{message.message}</Alert>}
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDate" className="form-group">
            <Form.Control
              type="date"
              lang="es"
              name="date"
              value={flight.date}
              onChange={(e) => updateField("date", e.target.value)}
              min="2020-01-01"
              max={new Date().toISOString().split("T")[0]}
              required
              className="floating-input"
            />
            <Form.Label className="floating-label">Fecha</Form.Label>
          </Form.Group>

          <Form.Group
            controlId="formFlightType"
            className="form-group"
            onFocus={handleFieldFocus}
          >
            <CustomSelect
              options={[
                { value: "Vuelo Privado", label: "Vuelo Privado" },
                { value: "Instruccion Alumno", label: "Instruccion Alumno" },
                { value: "Navegacion", label: "Navegacion" },
                { value: "Readaptacion", label: "Readaptacion" },
                { value: "Bautismo", label: "Bautismo" },
              ]}
              value={flight.flightType}
              onChange={(value) => updateField("flightType", value)}
              placeholder="Tipo de Vuelo"
            />
          </Form.Group>

          <Form.Group
            controlId="formSchool"
            className="form-group"
            onFocus={handleFieldFocus}
          >
            <CustomSelect
              options={schools}
              value={selectedSchool}
              onChange={handleSchoolChange}
              placeholder="Escuela"
            />
          </Form.Group>

          <Form.Group
            controlId="formAirplane"
            className="form-group"
            onFocus={handleFieldFocus}
          >
            <CustomSelect
              options={planeOptions}
              value={flight.airplane}
              onChange={(value) => updateField("airplane", value)}
              placeholder="Aeronave"
            />
          </Form.Group>

          <Form.Group
            controlId="formPilot"
            className="form-group"
            onFocus={handleFieldFocus}
          >
            <CustomSelect
              options={pilotOptions}
              value={flight.pilot}
              onChange={(value) => updateField("pilot", value)}
              placeholder="Piloto"
              disabled={isPilotDisabled}
            />
          </Form.Group>

          <Form.Group
            controlId="formInstructor"
            className="form-group"
            onFocus={handleFieldFocus}
          >
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

          <Form.Group
            controlId="formOrigin"
            className="form-group"
            onFocus={handleFieldFocus}
          >
            <CustomSelect
              options={airportOptions}
              value={flight.origin}
              onChange={(value) => updateField("origin", value)}
              placeholder="Origen"
            />
          </Form.Group>

          <Form.Group
            controlId="formDestination"
            className="form-group"
            onFocus={handleFieldFocus}
          >
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
              onFocus={handleFieldFocus}
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
              onFocus={handleFieldFocus}
            />
            <Form.Label className="floating-label">Hora de llegada</Form.Label>
          </Form.Group>

          <Form.Group controlId="formLandings" className="form-group">
            <Form.Control
              type="number"
              name="landings"
              value={flight.landings}
              onChange={handleInputChange}
              required
              className="floating-input"
              min={0}
              step={1}
              inputMode="numeric"
              tabIndex={1}
              autoComplete="off"
              onFocus={handleFieldFocus}
            />
            <Form.Label className="floating-label">Aterrizajes</Form.Label>
          </Form.Group>

          <Form.Group controlId="formOil" className="form-group">
            <div className="double-field-group">
              <div style={{ position: "relative", flex: 3 }}>
                <Form.Control
                  type="number"
                  name="oil"
                  value={flight.oil || ""}
                  onChange={handleInputChange}
                  className="floating-input"
                  min="0"
                  step="any"
                  placeholder=" "
                  style={{ minHeight: 38 }}
                  tabIndex={2}
                  autoComplete="off"
                  onFocus={handleFieldFocus}
                />
                <Form.Label className="floating-label">Aceite</Form.Label>
              </div>
              <div style={{ position: "relative", flex: 1 }}>
                <Form.Select
                  value={oilUnit}
                  onChange={(e) => setOilUnit(e.target.value)}
                  className="floating-input"
                  style={{ minHeight: 38, paddingLeft: 5 }}
                  onFocus={handleFieldFocus}
                >
                  <option value="" disabled hidden></option>
                  <option value="lt">Litros</option>
                  <option value="qt">Cuartos</option>
                </Form.Select>
                <Form.Label className="floating-label">Unidad</Form.Label>
              </div>
            </div>
          </Form.Group>

          <Form.Group controlId="formCharge" className="form-group">
            <div className="double-field-group">
              <div style={{ position: "relative", flex: 3 }}>
                <Form.Control
                  type="number"
                  name="charge"
                  value={flight.charge || ""}
                  onChange={handleInputChange}
                  className="floating-input"
                  min="0"
                  step="any"
                  placeholder=" "
                  style={{ minHeight: 38 }}
                  tabIndex={3}
                  autoComplete="off"
                  onFocus={handleFieldFocus}
                />
                <Form.Label className="floating-label">Combustible</Form.Label>
              </div>
              <div style={{ position: "relative", flex: 1 }}>
                <Form.Select
                  value={chargeUnit}
                  onChange={(e) => setChargeUnit(e.target.value)}
                  className="floating-input"
                  style={{ minHeight: 38, paddingLeft: 5 }}
                >
                  <option value="" disabled hidden></option>
                  <option value="lt">Litros</option>
                  <option value="gal">Galones</option>
                </Form.Select>
                <Form.Label className="floating-label">Unidad</Form.Label>
              </div>
            </div>
          </Form.Group>
          <Form.Group controlId="formComment" className="form-group">
            <Form.Control
              as="textarea"
              name="comment"
              value={flight.comment || ""}
              onChange={handleInputChange}
              className="floating-input"
              maxLength={150} // máximo 100 caracteres
              rows={1}
              placeholder=" "
              style={{ resize: "vertical" }}
              tabIndex={4}
              onFocus={handleFieldFocus}
            />
            <Form.Label className="floating-label">
              Comentario (opcional)
            </Form.Label>
            <div
              style={{
                textAlign: "right",
                fontSize: 12,
                color:
                  (flight.comment ? flight.comment.length : 0) >= 150
                    ? "#c0392b"
                    : "#888",
                fontWeight:
                  (flight.comment ? flight.comment.length : 0) >= 150
                    ? 600
                    : 400,
                transition: "color 0.2s",
              }}
            >
              {flight.comment ? flight.comment.length : 0}/150
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="form-buttons">
          <Button
            variant="secondary"
            onClick={handleReset}
            className="modal-button mt-3"
          >
            Resetear
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="modal-button mt-3"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            Agregar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFlightModal;
