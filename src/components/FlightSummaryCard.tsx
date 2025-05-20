import React from "react";

interface Props {
  total: number;
  confirmed: number;
  pending: number;
}

const FlightSummaryCard: React.FC<Props> = ({ total, confirmed, pending }) => {
  return (
    <div className="flight-summary-row">
      <div className="summary-box total">
        <div className="number">{total}</div>
        <div className="label">Vuelos</div>
      </div>
      <div className="summary-box confirmed">
        <div className="number">{confirmed}</div>
        <div className="label">Validados</div>
      </div>
      <div className="summary-box pending">
        <div className="number">{pending}</div>
        <div className="label">Pendientes</div>
      </div>
    </div>
  );
};

export default FlightSummaryCard;
