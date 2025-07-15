export const formatConceptName = (name: string): string => {
  if (!name) return '';
  // Reemplaza guiones bajos por espacios
  const withSpaces = name.replace(/_/g, ' ');
  // Pone en mayúscula la primera letra
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}; 