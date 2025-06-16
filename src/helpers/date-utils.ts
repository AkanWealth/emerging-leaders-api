// helpers/date-utils.ts
export function getDateRange(filter: 'weekly' | 'monthly' | 'yearly') {
  const now = new Date();
  let startDate: Date;

  if (filter === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (filter === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  return { startDate, endDate: now };
}
