function getWeekKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  const tempDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = tempDate.getUTCDay() || 7;

  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);

  return `${tempDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

module.exports = { getWeekKey };
