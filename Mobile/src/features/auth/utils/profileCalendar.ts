export const getCalendarCells = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export const toPlanDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('.').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

export const isDateInPlanPeriod = (
  date: Date,
  startDate?: string,
  endDate?: string,
) => {
  const start = toPlanDate(startDate);
  const end = toPlanDate(endDate) ?? start;
  if (!start || !end) return false;
  const value = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return value >= start.getTime() && value <= end.getTime();
};
