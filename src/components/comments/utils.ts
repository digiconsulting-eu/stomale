
/**
 * Format date to display full date and time in Italian format
 */
export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
