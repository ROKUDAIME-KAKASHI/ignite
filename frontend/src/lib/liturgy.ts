export function getLiturgicalSeason(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  const day = date.getDate();

  // Very simplified approximation for Syriac Orthodox Liturgical Year
  // Actual dates depend on movable feasts (Easter) which requires complex calculations.
  
  if (month === 10 && day >= 1 || month === 11 && day <= 24) return "Suboro (Annunciation)";
  if (month === 11 && day >= 25 || month === 0 && day <= 5) return "Yaldo (Nativity)";
  if (month === 0 && day >= 6 || month === 1 && day <= 15) return "Denho (Epiphany)";
  if (month === 1 && day > 15 || month === 2 || month === 3 && day <= 15) return "Sawmo Rabbo (Great Lent)";
  if (month === 3 && day > 15 || month === 4) return "Qyomto (Resurrection/Easter)";
  if (month === 5 || month === 6 || month === 7) return "Kaitho (Summer)";
  if (month === 8 && day >= 14 || month === 9 && day <= 30) return "Sleebo (Holy Cross)";
  if (month === 10 && day <= 7) return "Qudosh Etho (Sanctification of the Church)";
  if (month === 10) return "Eliyah–Sleebo–Moses";

  return "Kaitho (Summer)"; // Fallback
}
