import React, { useState } from "react";
import { Card, Modal, Button, Form } from "react-bootstrap";
import defaultPlane from "../assets/images/default-plane.jpg"; // Importar la foto por defecto
import ReactCrop, { Crop as ReactCropType } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
// import "../styles/planeItem.css"; // Importar el archivo CSS específico

interface Crop extends ReactCropType {
  aspect?: number;
}
interface PlaneItemProps {
  plane: {
    _id: string;
    registrationNumber: string;
    brand: string;
    model: string;
    photoUrl: string;
    baseAerodrome: string;
    addedDate: string;
  };
  onDelete: (id: string) => void;
  onUpdatePhoto: (id: string, formData: FormData) => Promise<void>;
}

const PlaneItem: React.FC<PlaneItemProps> = ({
  plane,
  onDelete,
  onUpdatePhoto,
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

  const planePhoto = plane.photoUrl || defaultPlane;

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
    if (!completedCrop || !imageRef) {
      return;
    }

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
          } catch (err) {
            console.error("Failed to update plane photo");
          }
        }
      });
    }
  };

  const handleCancelPhoto = () => {
    setPreviewUrl(null);
    setCompletedCrop(null);
  };

  const handleDeletePlane = async () => {
    try {
      await onDelete(plane._id);
      setShowDetailModal(false);
    } catch (err) {
      console.error("Failed to delete plane");
    }
  };

  return (
    <>
      <Card className="plane-item" onClick={() => setShowDetailModal(true)}>
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
        </Card.Body>
      </Card>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ficha de aeronave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={planePhoto} alt={plane.model} className="img-fluid mb-3" />
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
          <h5 className="section-title mt-4">Relación con la escuela:</h5>
          <p className="subtitle">
            Agregado el: <strong>{plane.addedDate}</strong>
          </p>
          <h5 className="section-title mt-4">Acciones:</h5>
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
                className="mt-3 d-block"
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
            variant="danger"
            onClick={handleDeletePlane}
            className="mt-3 d-block"
          >
            Eliminar
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlaneItem;
