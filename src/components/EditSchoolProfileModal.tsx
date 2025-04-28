import React, { useState } from "react";

interface EditSchoolProfileModalProps {
  onClose: () => void;
}

const EditSchoolProfileModal: React.FC<EditSchoolProfileModalProps> = ({
  onClose,
}) => {
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolImage, setSchoolImage] = useState<File | null>(null);

  const handleSave = () => {
    // Aquí puedes manejar la lógica para guardar los cambios
    console.log("Guardando cambios:", {
      schoolName,
      schoolAddress,
      schoolImage,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Perfil de la Escuela</h2>
        <form>
          <label>
            Nombre de la escuela:
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </label>
          <label>
            Dirección:
            <input
              type="text"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
            />
          </label>
          <label>
            Foto:
            <input
              type="file"
              onChange={(e) =>
                setSchoolImage(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchoolProfileModal;
