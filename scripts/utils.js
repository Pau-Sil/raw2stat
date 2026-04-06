export function formatIntervalNumber(num) {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return num;

  // Si es entero, devolver sin decimales
  if (Number.isInteger(parsed)) return parsed.toString();

  // Convertir a string para manipular decimales
  const str = parsed.toString();

  // Si tiene formato n.n0, eliminar el .0
  if (str.match(/^\d+\.\d+0$/)) {
    return str.replace(/\.0$/, '');
  }

  // Si tiene más de 2 decimales, truncar a 2
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts[1].length > 2) {
      return parsed.toFixed(2);
    }
  }

  return str;
}