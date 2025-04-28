// components/ValidateFlightsModal.tsx

import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import Papa from "papaparse";
import {
  EmbeddedFlightInput,
  EmbeddedFlight,
  DiscardedRow,
} from "../types/types";
import {
  createEmbebedFlights,
  validateEmbebedFlights,
} from "../services/flightService";
import { Player } from "@lottiefiles/react-lottie-player";
import checkAnimation from "../assets/animations/ckeck-animation.json";
import uploadAnimation from "../assets/animations/upload-files.json";
import type { AnimationItem } from "lottie-web";
import type { BMEnterFrameEvent } from "lottie-web";
import { FaFileUpload } from "react-icons/fa";

interface Props {
  show: boolean;
  onHide: () => void;
  onResult: (
    embeddedFlights: EmbeddedFlight[],
    discardedRows: DiscardedRow[]
  ) => void;
  schoolId: string;
}

const ValidateFlightsModal: React.FC<Props> = ({
  show,
  onHide,
  onResult,
  schoolId,
}) => {
  const [embeddedFlights, setEmbeddedFlights] = useState<EmbeddedFlight[]>([]);
  const [discardedRows, setDiscardedRows] = useState<DiscardedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const playerRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const animation = playerRef.current;
    if (!animation?.addEventListener || !animation?.removeEventListener) return;

    const listener = (e: BMEnterFrameEvent) => {
      if (e?.currentTime >= 50 && isDragging) {
        animation.pause();
      }
    };

    try {
      animation.addEventListener("enterFrame", listener);
    } catch (err) {
      console.warn("addEventListener failed:", err);
    }

    return () => {
      try {
        animation.removeEventListener("enterFrame", listener);
      } catch (err) {
        console.warn("removeEventListener failed:", err);
      }
    };
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      playerRef.current?.goToAndPlay(0, true);
    } else {
      playerRef.current?.play();
    }
  }, [isDragging]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setLoading(true);

    Papa.parse<EmbeddedFlightInput>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const parsedRows = result.data;
          const response = await createEmbebedFlights({
            schoolId,
            data: parsedRows,
          });
          setEmbeddedFlights(response.embebedFlights);
          setDiscardedRows(response.discardedRows);
        } catch (err) {
          console.error("Error uploading file:", err);
        }
        setLoading(false);
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        setLoading(false);
      },
    });
  };

  const handleValidateClick = async () => {
    try {
      setValidating(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await validateEmbebedFlights({
        schoolId,
        embebedFlights: embeddedFlights,
      });
      setValidationCompleted(true);
      setTimeout(() => {
        setValidating(false);
        setValidationCompleted(false);
        onResult(embeddedFlights, discardedRows);
        onHide();
        setEmbeddedFlights([]);
        setDiscardedRows([]);
        setUploadedFileName(null);
      }, 1800);
    } catch (err) {
      console.error("Error during validation:", err);
      setValidating(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName="validate-flights-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Validar Vuelos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="validate-flights-modal-body">
          {loading || validating ? (
            <div
              className={
                validating ? "validation-feedback" : "loading-feedback"
              }
            >
              {validating && validationCompleted ? (
                <Player
                  autoplay
                  keepLastFrame
                  src={checkAnimation}
                  style={{ height: "150px", width: "150px" }}
                />
              ) : (
                <>
                  <Spinner
                    animation="border"
                    style={{ color: "#7e6aa5", width: "3rem", height: "3rem" }}
                  />
                  <p>
                    {validating ? "Validando vuelos..." : "Cargando archivo..."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {!uploadedFileName ? (
                <div
                  className={`upload-zone ${isDragging ? "dragging" : ""}`}
                  onClick={() => document.getElementById("fileInput")?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => {
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const event = {
                        target: { files: [file] },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleFileChange(event);
                    }
                  }}
                >
                  <Player
                    lottieRef={(instance) => (playerRef.current = instance)}
                    src={uploadAnimation}
                    style={{
                      height: "160px",
                      width: "160px",
                      marginBottom: "10px",
                    }}
                    autoplay={false}
                    loop={false}
                    keepLastFrame
                  />
                  <div className="upload-placeholder">
                    <span className="upload-text">
                      Arrastre aquí o elija un archivo
                    </span>
                  </div>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div className="file-uploaded-msg">
                  <FaFileUpload />
                  <div>
                    <strong className="filename">{uploadedFileName}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFileName(null);
                      setEmbeddedFlights([]);
                      setDiscardedRows([]);
                    }}
                  >
                    Cambiar archivo
                  </button>
                </div>
              )}

              {embeddedFlights.length > 0 && (
                <>
                  <h5 className="text-success mt-4">
                    Vuelos generados por Escaner:
                  </h5>
                  <div className="table-wrapper">
                    <table className="embedded-flights-table">
                      <thead>
                        <tr>
                          <th>Aeronave</th>
                          <th>Piloto</th>
                          <th>Instructor</th>
                          <th>Inicio</th>
                          <th>Fin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {embeddedFlights.map((flight, i) => (
                          <tr key={i}>
                            <td>
                              {flight.planeRegistration}
                              <span className="text-muted">
                                {" "}
                                ( {flight.id_embebbed} )
                              </span>
                            </td>
                            <td>
                              {flight.pilotName ? (
                                <>
                                  {flight.pilotName}
                                  <span className="text-muted">
                                    {" "}
                                    ( {flight.pilot_tag} )
                                  </span>
                                </>
                              ) : (
                                "Sin piloto"
                              )}
                            </td>
                            <td>
                              {flight.instructorName ? (
                                <>
                                  {flight.instructorName}
                                  <span className="text-muted">
                                    {" "}
                                    ( {flight.instructor_tag} )
                                  </span>
                                </>
                              ) : (
                                "Sin instructor"
                              )}
                            </td>
                            <td>
                              {new Date(flight.departureTime).toLocaleString()}
                            </td>
                            <td>
                              {new Date(flight.arrivalTime).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {discardedRows.length > 0 && (
                <>
                  <h5 className="text-danger mt-4">Líneas descartadas:</h5>
                  <div className="table-wrapper">
                    <table className="discarded-rows-table">
                      <thead>
                        <tr>
                          <th>ID_Escaner</th>
                          <th>ID_Tag</th>
                          <th>Tiempo de lectura</th>
                          <th>Razon Descarte</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discardedRows.map((row, i) => (
                          <tr key={i}>
                            <td>{row.id_embebed}</td>
                            <td>{row.id_tag}</td>
                            <td>{new Date(row.timestamp).toLocaleString()}</td>
                            <td>{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onHide}
          disabled={validating}
          className="modal-button-cancel"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={embeddedFlights.length === 0 || validating}
          onClick={handleValidateClick}
          className="modal-button"
        >
          Cargar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidateFlightsModal;
