import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getSchoolDetails } from "../services/schoolService";

interface AddFlightModalProps {
  show: boolean;
  onClose: () => void;
  schoolId: string; // ID de la escuela para obtener los datos
  newFlight: {
    date: string;
    airplane: string;
    pilot: string;
    instructor: string;
    departureTime: string;
    arrivalTime: string;
    landings: string;
    oil: string;
    charge: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const AddFlightModal: React.FC<AddFlightModalProps> = ({
  show,
  onClose,
  schoolId,
  newFlight: initialFlight,
  handleChange,
  handleSubmit,
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

  useEffect(() => {
    if (show) {
      const storedSchoolId = localStorage.getItem("selectedSchoolId");
      const effectiveSchoolId = schoolId || storedSchoolId;

      console.log("schoolId efectivo en AddFlightModal:", effectiveSchoolId); // Log para verificar

      const fetchSchoolDetails = async () => {
        try {
          const data = await getSchoolDetails(effectiveSchoolId || "");
          console.log("Datos recibidos del backend:", data); // Log para verificar la respuesta

          setPlanes(data.planes || []);
          setPilots(data.pilots || []);
          setInstructors(data.instructors || []);
        } catch (error) {
          console.error("Error fetching school details:", error);
        }
      };

      if (effectiveSchoolId) {
        fetchSchoolDetails();
      } else {
        console.error("schoolId está vacío o undefined");
      }
    }
  }, [show, schoolId]);

  const handleLocalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewFlight((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={onClose} className="fade add-flight-modal">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            />
            <Form.Label className="floating-label">Fecha</Form.Label>
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
              <option value="">Aeronave</option>
              {planes.length > 0 ? (
                planes.map((plane) => (
                  <option key={plane._id} value={plane._id}>
                    {plane.registrationNumber} - {plane.model}
                  </option>
                ))
              ) : (
                <option disabled>Cargando aeronaves...</option>
              )}
            </Form.Control>
            <Form.Label className="floating-label">Aeronave</Form.Label>
          </Form.Group>

          <Form.Group controlId="formPilot" className="form-group">
            <Form.Control
              as="select"
              name="pilot"
              value={newFlight.pilot}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="">Piloto</option>
              {pilots.map(
                (pilot: { _id: string; name: string; lastname: string }) => (
                  <option key={pilot._id} value={pilot._id}>
                    {pilot.name} {pilot.lastname}
                  </option>
                )
              )}
            </Form.Control>
            <Form.Label className="floating-label">Piloto</Form.Label>
          </Form.Group>

          <Form.Group controlId="formInstructor" className="form-group">
            <Form.Control
              as="select"
              name="instructor"
              value={newFlight.instructor}
              onChange={handleChange}
              required
              className="floating-input"
            >
              <option value="">Instructor</option>
              {instructors.map(
                (instructor: {
                  _id: string;
                  name: string;
                  lastname: string;
                }) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} {instructor.lastname}
                  </option>
                )
              )}
            </Form.Control>
            <Form.Label className="floating-label">Instructor</Form.Label>
          </Form.Group>

          <Form.Group controlId="formDepartureTime" className="form-group">
            <Form.Control
              type="datetime-local"
              name="departureTime"
              value={newFlight.departureTime}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Hora de Salida</Form.Label>
          </Form.Group>
          <Form.Group controlId="formArrivalTime" className="form-group">
            <Form.Control
              type="datetime-local"
              name="arrivalTime"
              value={newFlight.arrivalTime}
              onChange={handleChange}
              required
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Hora de Llegada</Form.Label>
          </Form.Group>
          <Form.Group controlId="formLandings" className="form-group">
            <Form.Control
              type="number"
              name="landings"
              value={newFlight.landings}
              onChange={handleChange}
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Aterrizajes</Form.Label>
          </Form.Group>
          <Form.Group controlId="formOil" className="form-group">
            <Form.Control
              type="number"
              name="oil"
              value={newFlight.oil}
              onChange={handleChange}
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">Aceite</Form.Label>
          </Form.Group>
          <Form.Group controlId="formCharge" className="form-group">
            <Form.Control
              type="number"
              name="charge"
              value={newFlight.charge}
              onChange={handleChange}
              className="floating-input"
              placeholder=" "
            />
            <Form.Label className="floating-label">LTS Combustible</Form.Label>
          </Form.Group>
          <div className="text-end">
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
