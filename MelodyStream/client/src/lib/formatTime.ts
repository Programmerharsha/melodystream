export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const secondsRemainder = Math.floor(seconds % 60);
  
  return `${minutes}:${secondsRemainder.toString().padStart(2, '0')}`;
}
