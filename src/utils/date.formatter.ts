export function formatConcertDate(date: string | Date, time?: string, includeWeekday: boolean = false): string {
  if (!date) return '';
  const dateStr = new Date(date).toLocaleDateString('fr-FR', {
    weekday: includeWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return dateStr + (time ? ` à ${time}` : '');
}
