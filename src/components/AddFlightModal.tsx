import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface AddFlightModalProps {
  show: boolean;
  onClose: () => void;
  newFlight: {
    date: string;
    initialOdometer: string;
    finalOdometer: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    landings: string;
    oil: string;
    charge: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const AddFlightModal: React.FC<AddFlightModalProps> = ({
  show,
  onClose,
  newFlight,
  handleChange,
  handleSubmit,
}) => {
  return (
    <Modal show={show} onHide={onClose} className="fade">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Vuelo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDate">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={newFlight.date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formInitialOdometer">
            <Form.Label>Odómetro Inicial</Form.Label>
            <Form.Control
              type="number"
              name="initialOdometer"
              value={newFlight.initialOdometer}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formFinalOdometer">
            <Form.Label>Odómetro Final</Form.Label>
            <Form.Control
              type="number"
              name="finalOdometer"
              value={newFlight.finalOdometer}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formOrigin">
            <Form.Label>Origen</Form.Label>
            <Form.Control
              type="text"
              name="origin"
              value={newFlight.origin}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formDestination">
            <Form.Label>Destino</Form.Label>
            <Form.Control
              type="text"
              name="destination"
              value={newFlight.destination}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formDepartureTime">
            <Form.Label>Hora de Salida</Form.Label>
            <Form.Control
              type="datetime-local"
              name="departureTime"
              value={newFlight.departureTime}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formArrivalTime">
            <Form.Label>Hora de Llegada</Form.Label>
            <Form.Control
              type="datetime-local"
              name="arrivalTime"
              value={newFlight.arrivalTime}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formLandings">
            <Form.Label>Aterrizajes</Form.Label>
            <Form.Control
              type="number"
              name="landings"
              value={newFlight.landings}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formOil">
            <Form.Label>Aceite</Form.Label>
            <Form.Control
              type="number"
              name="oil"
              value={newFlight.oil}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formCharge">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              type="number"
              name="charge"
              value={newFlight.charge}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="modal-button mt-3">
            Agregar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFlightModal;
