import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  totalHours: number;
  flightData: { date: string; flights: number }[];
}

const FlightHoursCard: React.FC<Props> = ({ totalHours, flightData }) => {
  const hasData = flightData.length > 0;

  return (
    <div className="flight-hours-card">
      <div className="hours-header">
        <div className="hours-value">
          <div className="number">{totalHours.toFixed(1)}</div>
          <div className="label">Horas Totales de Vuelo</div>
        </div>
      </div>

      {hasData && (
        <div className="hours-chart">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={flightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="flights"
                stroke="#7b6983"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default FlightHoursCard;
