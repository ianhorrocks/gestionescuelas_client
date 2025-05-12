import React, { useState } from "react";
import { Card, Modal, Button, Form } from "react-bootstrap";
import { TrashFill } from "react-bootstrap-icons";
import defaultPlane from "../assets/images/default-plane.jpg";
import ReactCrop, { Crop as ReactCropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "../styles/GeneralComponents/Items/_UserItem.scss";
import {
  assignEmbeddedIdToPlane,
  removeEmbeddedIdFromPlane,
} from "../services/planeService";
import useTemporaryMessage from "../hooks/useTemporaryMessage";
import Alert from "./Alert";
import { Plane } from "../types/types";

interface Crop extends ReactCropType {
  aspect?: number;
}
interface PlaneItemProps {
  plane: Plane;
  onDelete: (id: string) => void;
  onUpdatePhoto: (id: string, formData: FormData) => Promise<void>;
  onIdAssigned: () => void;
}

const PlaneItem: React.FC<PlaneItemProps> = ({
  plane,
  onDelete,
  onUpdatePhoto,
  onIdAssigned,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    aspect: 1,
    x: 0,
    y: 0,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { message, showTemporaryMessage } = useTemporaryMessage();

  const planePhoto = plane.photoUrl || defaultPlane;

  const handleShowModal = () => setShowDetailModal(true);
  const handleCloseModal = () => {
    onIdAssigned();
    setShowDetailModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setPreviewUrl(reader.result as string)
      );
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoaded = (image: HTMLImageElement) => {
    setImageRef(image);
  };

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  const handleSavePhoto = async () => {
    if (!completedCrop || !imageRef) return;

    const canvas = document.createElement("canvas");
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = completedCrop.width!;
    canvas.height = completedCrop.height!;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        imageRef,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width! * scaleX,
        completedCrop.height! * scaleY,
        0,
        0,
        completedCrop.width!,
        completedCrop.height!
      );

      canvas.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("photo", blob, "plane-photo.jpg");

          try {
            await onUpdatePhoto(plane._id, formData);
            setPreviewUrl(null);
            showTemporaryMessage("success", "Foto actualizada correctamente");
          } catch (err) {
            console.error("Failed to update plane photo");
            showTemporaryMessage("error", "Error al actualizar la foto");
          }
        }
      });
    }
  };

  const handleCancelPhoto = () => {
    setPreviewUrl(null);
    setCompletedCrop(null);
  };

  const [currentIdEmbebbedState, setCurrentEmbebbedState] = useState(
    plane?.idEmbebbed || ""
  );

  const handleAssignId = async () => {
    setLoading(true);
    try {
      await assignEmbeddedIdToPlane(plane._id, idInput);
      setCurrentEmbebbedState(idInput);
      showTemporaryMessage("success", "ID EMBEBIDO ASIGNADO");
      setIdInput("");
    } catch (err) {
      console.error("FAILED TO ASSIGN EMBEDDED ID:", err);
      showTemporaryMessage("error", "ERROR AL ASIGNAR ID EMBEBIDO");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveId = async () => {
    setLoading(true);
    try {
      await removeEmbeddedIdFromPlane(plane._id);
      setCurrentEmbebbedState("");
      showTemporaryMessage("success", "ID EMBEBIDO ELIMINADO");
    } catch (err) {
      console.error("Error eliminando ID embebido");
      showTemporaryMessage("error", "Error al eliminar el ID embebido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="plane-item" onClick={handleShowModal}>
        <Card.Img
          variant="top"
          src={planePhoto}
          alt={plane.registrationNumber}
        />
        <Card.Body>
          <Card.Title className="plane-registration">
            {plane.registrationNumber}
          </Card.Title>
          <Card.Text className="plane-details">
            {plane.brand} - {plane.model}
          </Card.Text>
          <Card.Text>
            ID Escaner:{" "}
            <strong
              className={`plane-id ${!plane.idEmbebbed ? "text-danger" : ""}`}
            >
              {plane.idEmbebbed || "Sin asignar"}
            </strong>
          </Card.Text>
        </Card.Body>
      </Card>

      <Modal show={showDetailModal} onHide={handleCloseModal} keyboard={true}>
        <Modal.Header closeButton>
          <Modal.Title>Ficha de aeronave</Modal.Title>
        </Modal.Header>
        <Modal.Body className="plane-modal-body">
          <div className="plane-photo-container">
            <img
              src={planePhoto}
              alt={plane.model}
              className="plane-photo img-fluid mb-3"
            />
          </div>

          <h5 className="section-title">Detalles de la aeronave:</h5>
          <p className="subtitle">
            Aeródromo base: <strong>{plane.baseAerodrome}</strong>
          </p>
          <p className="subtitle">
            Marca: <strong>{plane.brand}</strong>
          </p>
          <p className="subtitle">
            Modelo: <strong>{plane.model}</strong>
          </p>
          <p className="subtitle">
            Matrícula: <strong>{plane.registrationNumber}</strong>
          </p>
          <p className="subtitle">
            ID Escaner:{" "}
            <strong className={!currentIdEmbebbedState ? "id-unassigned" : ""}>
              {currentIdEmbebbedState || "Sin asignar"}
            </strong>
          </p>

          <h5 className="section-title mt-4">Relación con la escuela:</h5>
          <p className="subtitle">
            Agregado el: <strong>{plane.addedDate || "-"}</strong>
          </p>

          <h5 className="section-title mt-4">Asignar ID Escaner:</h5>
          <div className="tag-assignment-container">
            <input
              type="text"
              className="form-control"
              placeholder="Ingresa el ID"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
            />
            <div className="tag-action-buttons">
              <button
                className="btn btn-assign"
                disabled={loading || !idInput}
                onClick={handleAssignId}
              >
                {loading ? "..." : "Asignar"}
              </button>
              <button
                className="btn btn-delete-tag"
                onClick={handleRemoveId}
                disabled={loading}
              >
                <TrashFill />
              </button>
            </div>
          </div>

          {message && <Alert message={message.message} type={message.type} />}

          <h5 className="section-title">Acciones:</h5>
          {previewUrl ? (
            <>
              <ReactCrop
                crop={crop}
                onComplete={handleCropComplete}
                onChange={(newCrop) => setCrop(newCrop)}
              >
                <img
                  src={previewUrl || ""}
                  alt="Crop preview"
                  onLoad={(e) => handleImageLoaded(e.currentTarget)}
                />
              </ReactCrop>
              <Button
                variant="primary"
                onClick={handleSavePhoto}
                className="mt-3 d-block w-100"
              >
                Guardar
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelPhoto}
                className="mt-3 d-block w-100"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => document.getElementById("fileInput")?.click()}
                className="btn-change-photo mt-3 d-block"
              >
                Cambiar foto principal
              </Button>
              <Form.Control
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </>
          )}
          <Button
            onClick={() => {
              onDelete(plane._id);
              handleCloseModal();
            }}
            className="btn-delete-school mt-3 d-block"
          >
            Eliminar de la escuela
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlaneItem;
