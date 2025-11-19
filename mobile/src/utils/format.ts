export const formatTimestamp = (dateString: string | undefined, locale: string): string | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export const formatLatency = (ms: number | undefined, locale: string): string | null => {
  if (ms === undefined || ms === null || ms < 0) {
    return null;
  }
  return new Intl.NumberFormat(locale).format(ms);
};
