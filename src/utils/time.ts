import { startOfWeek, endOfWeek, format, isAfter, addWeeks } from "date-fns";

// Convierte minutos a horas centesimales según la tabla proporcionada
export function minutesToCentesimal(min: number): number {
  if (min >= 1 && min <= 2) return 0.0;
  if (min >= 3 && min <= 8) return 0.1;
  if (min >= 9 && min <= 14) return 0.2;
  if (min >= 15 && min <= 20) return 0.3;
  if (min >= 21 && min <= 26) return 0.4;
  if (min >= 27 && min <= 33) return 0.5;
  if (min >= 34 && min <= 39) return 0.6;
  if (min >= 40 && min <= 45) return 0.7;
  if (min >= 46 && min <= 51) return 0.8;
  if (min >= 52 && min <= 57) return 0.9;
  if (min >= 57 && min <= 60) return 1.0;
  return 0.0;
}

// Convierte un string "hh:mm" a horas centesimales (ej: "1:27" => 1.5)
export function timeStringToCentesimal(time: string): number {
  if (!time) return 0;
  const [hoursStr, minutesStr] = time.split(":");
  const hours = parseInt(hoursStr, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  return hours + minutesToCentesimal(minutes);
}

// Suma el total de horas centesimales de una lista de vuelos
export function getTotalFlightHoursCentesimal(
  flights: { totalFlightTime?: string }[]
): number {
  return flights.reduce((acc, flight) => {
    if (!flight.totalFlightTime) return acc;
    return acc + timeStringToCentesimal(flight.totalFlightTime);
  }, 0);
}

export function getWeeksInRange(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let current = startOfWeek(start, { weekStartsOn: 1 });
  while (!isAfter(current, end)) {
    weeks.push(current);
    current = addWeeks(current, 1);
  }
  return weeks;
}

export function getFlightsByWeek(flights: { date: string }[]) {
  if (flights.length === 0) return [];
  const sorted = [...flights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const first = new Date(sorted[0].date);
  const last = new Date();
  const weeks = getWeeksInRange(
    startOfWeek(first, { weekStartsOn: 1 }),
    endOfWeek(last, { weekStartsOn: 1 })
  );
  const weekMap = new Map<string, number>();
  weeks.forEach((week: Date) => {
    const key = format(week, "dd/MM/yyyy");
    weekMap.set(key, 0);
  });
  flights.forEach((flight) => {
    const key = format(
      startOfWeek(new Date(flight.date), { weekStartsOn: 1 }),
      "dd/MM/yyyy"
    );
    weekMap.set(key, (weekMap.get(key) || 0) + 1);
  });
  return Array.from(weekMap.entries()).map(([date, flights]) => ({
    date,
    flights,
  }));
}

export function getFlightsByMonth(flights: { date: string }[]) {
  if (flights.length === 0) return [];
  const map = new Map<string, number>();
  flights.forEach((flight) => {
    const key = format(new Date(flight.date), "MM/yyyy");
    map.set(key, (map.get(key) || 0) + 1);
  });
  // Ordenar por fecha ascendente
  return Array.from(map.entries())
    .map(([date, flights]) => ({ date, flights }))
    .sort((a, b) => {
      // MM/yyyy → yyyyMM para comparar
      const [ma, ya] = a.date.split("/");
      const [mb, yb] = b.date.split("/");
      return Number(ya + ma) - Number(yb + mb);
    });
}

/**
 * Convierte un string "hh:mm" o un número decimal de horas a "Xh Ym"
 */
export function formatFlightDuration(time?: string | number): string {
  if (!time) return "Sin duración";

  let totalMinutes = 0;

  if (typeof time === "number") {
    totalMinutes = Math.round(time * 60);
  } else if (typeof time === "string") {
    if (time.includes(":")) {
      // Formato "hh:mm"
      const [h, m] = time.split(":").map(Number);
      totalMinutes = (h || 0) * 60 + (m || 0);
    } else {
      // Puede ser string decimal, ej: "1.5"
      const asNumber = parseFloat(time);
      if (!isNaN(asNumber)) {
        totalMinutes = Math.round(asNumber * 60);
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// Devuelve un string 'HH:mm a HH:mm' para un rango de horas, usando una fecha base
export function formatHourRange(
  date: string,
  departure: string,
  arrival: string
): string {
  // date puede ser YYYY-MM-DD o DD/MM/YYYY
  let baseDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    baseDate = new Date(date);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    baseDate = new Date(`${year}-${month}-${day}`);
  } else {
    baseDate = new Date(date);
  }

  // Helper para crear un Date con la hora/minutos deseados
  function setTime(base: Date, time: string): Date {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(base);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }

  const dep = setTime(baseDate, departure);
  const arr = setTime(baseDate, arrival);
  return `${format(dep, "HH:mm")} a ${format(arr, "HH:mm")}`;
}
