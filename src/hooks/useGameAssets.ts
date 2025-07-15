import { concepts, ConceptName } from '../data/concepts';

let lastConcept: ConceptName | null = null;

/**
 * Baraja un array en su lugar usando el algoritmo Fisher-Yates.
 * @param array El array a barajar.
 */
const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

/**
 * Obtiene un concepto aleatorio, asegurándose de que no sea el mismo que el último.
 * @returns El nombre de un concepto.
 */
export const getRandomConcept = (): ConceptName => {
  const conceptNames = Object.keys(concepts) as ConceptName[];
  let availableConcepts = conceptNames;

  if (lastConcept && conceptNames.length > 1) {
    availableConcepts = conceptNames.filter(c => c !== lastConcept);
  }

  const randomConcept = availableConcepts[Math.floor(Math.random() * availableConcepts.length)];
  lastConcept = randomConcept;
  return randomConcept;
};

/**
 * Obtiene un número específico de imágenes aleatorias de un concepto dado.
 * @param concept El concepto del cual obtener las imágenes.
 * @param count El número de imágenes a obtener.
 * @returns Un array de rutas de imagen.
 */
export const getRandomImages = (concept: ConceptName, count: number): any[] => {
  const imagePool = concepts[concept];
  if (!imagePool || imagePool.length < count) {
    console.warn(`No hay suficientes imágenes para el concepto "${concept}". Se necesitan ${count}, pero hay ${imagePool?.length || 0}.`);
    return [];
  }

  const shuffledImages = shuffle([...imagePool]);
  return shuffledImages.slice(0, count);
}; 