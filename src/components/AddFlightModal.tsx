import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { getSchoolDetails } from "../services/schoolService";
import { createFlight } from "../services/flightService";

export interface LocalFlightData {
  date: string;
  airplane: string;
  pilot: string;
  instructor: string | null;
  departureTime: string;
  arrivalTime: string;
  landings: string;
  oil?: string; // Opcional
  oilUnit?: string; // Opcional
  charge?: string; // Opcional
  chargeUnit?: string; // Opcional
  school: string;
  origin: string;
  destination: string;
  initialOdometer: string;
  finalOdometer: string;
}

interface AddFlightModalProps {
  show: boolean;
  onClose: () => void;
  initialFlight: LocalFlightData; // Ya existe
  newFlight: LocalFlightData; // Agregar esta línea
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
  initialFlight,
  onSuccess,
}) => {
  const [newFlight, setNewFlight] = useState(initialFlight);
  const [planes, setPlanes] = useState<
    { _id: string; registrationNumber: string; model: string }[]
  >([]);
  const [pilots, setPilots] = useState<
    { _id: string; name: string; lastname: string }[]
  >([]);
  const [instructors, setInstructors] = useState<
    { _id: string; name: string; lastname: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      const storedSchoolId = localStorage.getItem("selectedSchoolId");
      const effectiveSchoolId = newFlight.school || storedSchoolId;

      if (!effectiveSchoolId) {
        console.error("No se encontró el ID de la escuela.");
        return;
      }

      const fetchSchoolDetails = async () => {
        try {
          const data = await getSchoolDetails(effectiveSchoolId);
          setPlanes(data.planes || []);
          setPilots(data.pilots || []);
          setInstructors(data.instructors || []);
        } catch (error) {
          console.error("Error fetching school details:", error);
        }
      };

      fetchSchoolDetails();
    }
  }, [show, newFlight.school]);

  useEffect(() => {
    if (!show) {
      setNewFlight(initialFlight); // Reiniciar los datos del vuelo al cerrar el modal
    }
  }, [show, initialFlight]);

  const handleLocalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewFlight((prev) => ({
      ...prev,
      [name]: value, // Actualiza el estado con el valor correcto
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const flightData = {
      ...newFlight,
      instructor: newFlight.instructor || null, // Convertir null a cadena vacía
      oil:
        newFlight.oilUnit === "qt"
          ? ((parseFloat(newFlight.oil || "0") || 0) * 946.353).toString()
          : newFlight.oil
          ? parseFloat(newFlight.oil || "0").toString()
          : undefined,
      charge:
        newFlight.chargeUnit === "gal"
          ? ((parseFloat(newFlight.charge || "0") || 0) * 3.78541).toString()
          : newFlight.charge
          ? parseFloat(newFlight.charge || "0").toString()
          : undefined,
    };

    try {
      console.log("Datos enviados al backend:", flightData);
      await createFlight(flightData);
      console.log("Vuelo creado exitosamente");
      if (onSuccess) {
        onSuccess("Vuelo agregado exitosamente");
      }
      onClose();
    } catch (error) {
      console.error("Error al agregar el vuelo:", error);
      setErrorMessage("No se pudo agregar el vuelo. Inténtalo nuevamente.");

      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
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
          <Form.Group controlId="formDate" className="form-group">
            <Form.Control
              type="date"
              name="date"
              value={newFlight.date}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
              max={new Date().toISOString().split("T")[0]}
            />
            <Form.Label className="floating-label">Fecha</Form.Label>
          </Form.Group>

          <Form.Group controlId="formAirplane" className="form-group">
            <Form.Control
              as="select"
              name="airplane"
              value={newFlight.airplane}
              onChange={handleLocalChange}
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

          <Form.Group controlId="formPilot" className="form-group">
            <Form.Control
              as="select"
              name="pilot"
              value={newFlight.pilot}
              onChange={handleLocalChange}
              required
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona un piloto
              </option>
              {pilots.map((pilot) => (
                <option key={pilot._id} value={pilot._id}>
                  {pilot.name} {pilot.lastname}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Piloto</Form.Label>
          </Form.Group>

          <Form.Group controlId="formInstructor" className="form-group">
            <Form.Control
              as="select"
              name="instructor"
              value={newFlight.instructor || ""}
              onChange={handleLocalChange}
              className="floating-input"
            >
              <option value="" disabled hidden>
                Selecciona un instructor
              </option>
              <option value="">Ningún Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name} {instructor.lastname}
                </option>
              ))}
            </Form.Control>
            <Form.Label className="floating-label">Instructor</Form.Label>
          </Form.Group>

          <Form.Group controlId="formDepartureTime" className="form-group">
            <Form.Control
              type="time"
              name="departureTime"
              value={newFlight.departureTime}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Hora de Salida</Form.Label>
          </Form.Group>
          <Form.Group controlId="formArrivalTime" className="form-group">
            <Form.Control
              type="time"
              name="arrivalTime"
              value={newFlight.arrivalTime}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Hora de Llegada</Form.Label>
          </Form.Group>

          <Form.Group controlId="formInitialOdometer" className="form-group">
            <Form.Control
              type="number"
              name="initialOdometer"
              value={newFlight.initialOdometer}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
              min="0"
            />
            <Form.Label className="floating-label">Odómetro Inicial</Form.Label>
          </Form.Group>

          <Form.Group controlId="formFinalOdometer" className="form-group">
            <Form.Control
              type="number"
              name="finalOdometer"
              value={newFlight.finalOdometer}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
              min="0"
            />
            <Form.Label className="floating-label">Odómetro Final</Form.Label>
          </Form.Group>

          <Form.Group controlId="formOrigin" className="form-group">
            <Form.Control
              type="text"
              name="origin" // Asegúrate de que el nombre sea "origin"
              value={newFlight.origin} // Vinculado al estado
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Origen</Form.Label>
          </Form.Group>

          <Form.Group controlId="formDestination" className="form-group">
            <Form.Control
              type="text"
              name="destination"
              value={newFlight.destination}
              onChange={handleLocalChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Destino</Form.Label>
          </Form.Group>

          <Form.Group controlId="formLandings" className="form-group">
            <Form.Control
              type="number"
              name="landings"
              value={newFlight.landings}
              onChange={handleLocalChange}
              className="floating-input"
              placeholder=" "
              min="0"
            />
            <Form.Label className="floating-label">Aterrizajes</Form.Label>
          </Form.Group>

          <Form.Group controlId="formOil" className="form-group">
            <div className="floating-container">
              <Form.Control
                type="number"
                name="oil"
                value={newFlight.oil}
                onChange={handleLocalChange}
                className="floating-input"
                placeholder=" "
                min="0"
              />
              <Form.Label className="floating-label">Aceite</Form.Label>
              <Form.Select
                name="oilUnit"
                value={newFlight.oilUnit || "ml"}
                onChange={handleLocalChange}
                className="unit-select"
              >
                <option value="ml">Mililitros</option>
                <option value="qt">Quarts</option>
              </Form.Select>
            </div>
          </Form.Group>

          <Form.Group controlId="formCharge" className="form-group">
            <div className="floating-container">
              <Form.Control
                type="number"
                name="charge"
                value={newFlight.charge}
                onChange={handleLocalChange}
                className="floating-input"
                placeholder=" "
                min="0"
              />
              <Form.Label className="floating-label">Combustible</Form.Label>
              <Form.Select
                name="chargeUnit"
                value={newFlight.chargeUnit || "lts"}
                onChange={handleLocalChange}
                className="unit-select"
              >
                <option value="lts">Litros</option>
                <option value="gal">Galones</option>
              </Form.Select>
            </div>
          </Form.Group>

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
