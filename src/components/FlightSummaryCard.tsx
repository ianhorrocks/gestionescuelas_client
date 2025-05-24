import React from "react";

interface Props {
  total: number;
  confirmed: number;
  pending: number;
  onBoxClick?: (filter: "all" | "confirmed" | "pending") => void;
}

const FlightSummaryCard: React.FC<Props> = ({
  total,
  confirmed,
  pending,
  onBoxClick,
}) => {
  return (
    <div className="flight-summary-row">
      <div
        className="summary-box total"
        onClick={() => onBoxClick && onBoxClick("all")}
        style={{ cursor: onBoxClick ? "pointer" : "default" }}
      >
        <div className="number">{total}</div>
        <div className="label">Vuelos</div>
      </div>
      <div
        className="summary-box confirmed"
        onClick={() => onBoxClick && onBoxClick("confirmed")}
        style={{ cursor: onBoxClick ? "pointer" : "default" }}
      >
        <div className="number">{confirmed}</div>
        <div className="label">Confirmados</div>
      </div>
      <div
        className="summary-box pending"
        onClick={() => onBoxClick && onBoxClick("pending")}
        style={{ cursor: onBoxClick ? "pointer" : "default" }}
      >
        <div className="number">{pending}</div>
        <div className="label">Pendientes</div>
      </div>
    </div>
  );
};

export default FlightSummaryCard;
