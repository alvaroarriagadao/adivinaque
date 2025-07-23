export const formatConceptName = (name: string): string => {
  if (!name) return '';
  // Reemplaza guiones bajos por espacios
  const withSpaces = name.replace(/_/g, ' ');
  // Pone en mayúscula la primera letra
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

// Función para calcular el contraste entre dos colores
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) return c / 12.92;
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// Función para oscurecer un color
export const darkenColor = (color: string, amount: number = 0.3): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Función para obtener un color de fondo optimizado para contraste
export const getOptimizedBackgroundColor = (playerColor: string): string => {
  // Crear una versión más suave y oscura del color para el fondo
  const hex = playerColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Reducir la intensidad y oscurecer el color
  const darkenFactor = 0.6; // Hacer más oscuro
  const desaturateFactor = 0.3; // Reducir saturación
  
  const newR = Math.floor(r * darkenFactor * (1 - desaturateFactor) + 128 * desaturateFactor);
  const newG = Math.floor(g * darkenFactor * (1 - desaturateFactor) + 128 * desaturateFactor);
  const newB = Math.floor(b * darkenFactor * (1 - desaturateFactor) + 128 * desaturateFactor);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Función para determinar el color del texto basado en el fondo
export const getTextColor = (backgroundColor: string): string => {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#FFFFFF');
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000');
  
  // Si el contraste con blanco es mejor, usamos blanco
  if (contrastWithWhite > contrastWithBlack) {
    return '#FFFFFF';
  }
  
  return '#000000';
}; 

// Función para determinar si necesitamos un overlay adicional
export const needsOverlay = (backgroundColor: string): boolean => {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#FFFFFF');
  return contrastWithWhite < 4.5; // Estándar WCAG AA para texto normal
};

// Función para obtener un overlay sutil que mejore el contraste
export const getContrastOverlay = (backgroundColor: string): string => {
  if (needsOverlay(backgroundColor)) {
    return 'rgba(0, 0, 0, 0.3)'; // Overlay negro sutil
  }
  return 'transparent';
};

// Función para obtener el color de texto óptimo con overlay
export const getOptimalTextColor = (backgroundColor: string): string => {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#FFFFFF');
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000');
  
  // Si el contraste con blanco es mejor, usamos blanco
  if (contrastWithWhite > contrastWithBlack) {
    return '#FFFFFF';
  }
  
  return '#000000';
}; 