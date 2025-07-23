import { create } from 'zustand';
import { fetchConceptNames, fetchImageUrlsForConcept } from '../services/firebaseService';

// Paleta de colores para jugadores - máxima diferenciación visual
export const PLAYER_COLORS = [
  '#DC2626', // Rojo terracota
  '#3B82F6', // Azul cielo
  '#10B981', // Verde esmeralda
  '#F59E0B', // Amarillo dorado
  '#8B5CF6', // Púrpura
  '#F97316', // Naranja
  '#EC4899', // Rosa
  '#6366F1', // Índigo
  '#14B8A6', // Teal
  '#84CC16', // Verde lima
  '#EF4444', // Rojo brillante
  '#06B6D4', // Cian
  '#F43F5E', // Rose
  '#8B5A2B', // Marrón
  '#9F1239', // Rojo vino
];

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string; // Color asignado al jugador
}

export interface Guess {
  playerId: string;
  image: any; // La imagen que el jugador adivinó
}

interface GameState {
  // Game State
  players: Player[];
  jetIndex: number; // Índice del Jugador en Turno (JET)
  turnCount: number; // El número de turnos que han pasado
  totalTurns: number; // El total de turnos para terminar el juego
  gamePhase: 'initializing' | 'lobby' | 'turn_selection' | 'guessing' | 'reveal' | 'final_results';
  isLoading: boolean; // Para mostrar feedback de carga en la UI

  // Asset Management State
  allConcepts: string[]; // Todos los conceptos cargados desde Firebase
  conceptImageCache: Record<string, string[]>; // Cache para las URLs de imágenes
  
  // Current Round State
  currentConcept: string | null;
  currentImages: any[];
  jetSelection: any | null;
  guesses: Guess[];
  
  // Control de cambios de imagen
  hasChangedImages: boolean;
  hasChangedConcept: boolean;
  
  // Acciones
  initializeAssets: () => Promise<void>;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerColor: (playerId: string, color: string) => void;
  startGame: () => Promise<void>;
  setJetSelection: (image: any) => void;
  addGuess: (playerId: string, image: any) => void;
  nextTurn: () => Promise<void>;
  resetGame: (keepPlayers?: boolean) => void;
  playAgain: () => Promise<void>;
  refreshImages: () => Promise<void>;
  changeConcept: () => Promise<void>;
}

const initialState = {
  players: [],
  jetIndex: 0,
  turnCount: 0,
  totalTurns: 0,
  gamePhase: 'initializing' as GameState['gamePhase'],
  isLoading: true,
  allConcepts: [],
  conceptImageCache: {},
  currentConcept: null,
  currentImages: [],
  jetSelection: null,
  guesses: [],
  hasChangedImages: false,
  hasChangedConcept: false,
};

export const useGameStore = create<GameState>((set, get) => {
  /**
   * --- Private Helper Functions ---
   */

  // Obtiene un concepto aleatorio que no sea el actual.
  const getNewRandomConcept = (): string => {
    const { allConcepts, currentConcept } = get();
    if (allConcepts.length === 0) return '';
    if (allConcepts.length === 1) return allConcepts[0];

    let availableConcepts = allConcepts.filter(c => c !== currentConcept);
    if (availableConcepts.length === 0) {
      availableConcepts = allConcepts; // Fallback si solo hay un concepto
    }
    
    const randomIndex = Math.floor(Math.random() * availableConcepts.length);
    return availableConcepts[randomIndex];
  };
  
  // Baraja un array y toma los primeros 'count' elementos.
  const shuffleAndPick = (arr: string[], count: number): string[] => {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
  };

  /**
   * Prepara un nuevo concepto y sus imágenes, obteniéndolas de Firebase si no están en caché.
   * @param newConcept El concepto para el cual preparar las imágenes.
   */
  const prepareConceptImages = async (newConcept: string) => {
    const { conceptImageCache } = get();
    set({ isLoading: true });

    let imagesForConcept = conceptImageCache[newConcept];

    if (!imagesForConcept || imagesForConcept.length === 0) {
      console.log(`Cache miss for "${newConcept}". Fetching from Firebase...`);
      const fetchedUrls = await fetchImageUrlsForConcept(newConcept);
      set(state => ({
        conceptImageCache: { ...state.conceptImageCache, [newConcept]: fetchedUrls }
      }));
      // Usar las URLs recién obtenidas para el siguiente paso
      imagesForConcept = fetchedUrls;
    } else {
      console.log(`Cache hit for "${newConcept}".`);
    }

    const pickedImageUrls = shuffleAndPick(imagesForConcept, 4);
    const formattedImages = pickedImageUrls.map(url => ({ uri: url }));
    
    set({
      currentConcept: newConcept,
      currentImages: formattedImages, // <-- USAR IMÁGENES FORMATEADAS
      isLoading: false,
      hasChangedImages: false,
      hasChangedConcept: false,
      jetSelection: null,
      guesses: [],
    });
  };
  
  /**
   * --- Public Actions ---
   */
  return {
    ...initialState,

    initializeAssets: async () => {
      console.log('🚀 Iniciando carga de assets...');
      set({ isLoading: true });

      // Esperar mínimo 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Intentar cargar conceptos (sin bloquear si falla)
      try {
        const concepts = await fetchConceptNames();
        console.log('✅ Conceptos cargados exitosamente:', concepts.length);
        set({ allConcepts: concepts });
      } catch (error) {
        console.log('⚠️ Error cargando conceptos (continuando sin conceptos):', error);
        set({ allConcepts: [] });
      }
      
      // SIEMPRE avanzar después de 3 segundos
      console.log('🎯 Transicionando a la pantalla de inicio...');
      set({ isLoading: false, gamePhase: 'lobby' });
      console.log('✅ Transición completada');
    },

    addPlayer: (name) => {
      if (get().players.length >= 10) return;
      
      // Obtener colores ya asignados para evitar duplicados
      const usedColors = get().players.map(p => p.color);
      
      // Filtrar colores disponibles (no usados)
      const availableColors = PLAYER_COLORS.filter(color => !usedColors.includes(color));
      
      // Si no hay colores disponibles, usar todos los colores
      const colorPool = availableColors.length > 0 ? availableColors : PLAYER_COLORS;
      
      // Seleccionar color aleatorio
      const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];
      
      const newPlayer: Player = { id: `player-${Date.now()}`, name, score: 0, color: randomColor };
      set((state) => ({ players: [...state.players, newPlayer] }));
    },

    removePlayer: (id) => {
      set((state) => ({ players: state.players.filter((p) => p.id !== id) }));
    },

    updatePlayerColor: (playerId: string, color: string) => {
      set((state) => ({
        players: state.players.map(player =>
          player.id === playerId ? { ...player, color } : player
        )
      }));
    },

    startGame: async () => {
      const { players, allConcepts } = get();
      if (players.length < 2 || allConcepts.length === 0) return;

      set({ isLoading: true }); // Activar el estado de carga
      
      const roundsPerPlayer = players.length >= 6 ? 2 : 3;
      
      // La preparación de imágenes ocurre primero
      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
      
      // Una vez que las imágenes están listas, se transiciona
      set({
        gamePhase: 'turn_selection',
        jetIndex: 0,
        turnCount: 1,
        totalTurns: players.length * roundsPerPlayer,
        isLoading: false, // Desactivar la carga al final
      });
    },

    setJetSelection: (image: any) => {
      const { currentImages } = get();
      
      // Reordenar las imágenes aleatoriamente para evitar que los votantes
      // puedan deducir la posición de la imagen elegida por el JET
      const shuffledImages = [...currentImages].sort(() => 0.5 - Math.random());
      
      set({
        jetSelection: image,
        currentImages: shuffledImages, // Imágenes reordenadas
        gamePhase: 'guessing',
      });
    },

    addGuess: (playerId: string, image: any) => {
      const newGuess: Guess = { playerId, image };
      const { players, jetIndex, jetSelection, guesses } = get();
      const voters = players.filter((_, index) => index !== jetIndex);
      const updatedGuesses = [...guesses, newGuess];
      
      set({ guesses: updatedGuesses });

      if (updatedGuesses.length === voters.length) {
        // Todos han votado, calcular puntos y revelar
        let jetGainedPoints = false;
        
        const updatedPlayers = players.map(p => {
          if (p.id !== players[jetIndex].id) {
            const guess = updatedGuesses.find(g => g.playerId === p.id);
            if (guess && guess.image === jetSelection) {
              jetGainedPoints = true;
              return { ...p, score: p.score + 3 };
            }
          }
          return p;
        });

        if (jetGainedPoints) {
          const jetPlayer = updatedPlayers.find(p => p.id === players[jetIndex].id);
          if(jetPlayer) {
            jetPlayer.score += 1;
          }
        }
        
        set({ players: updatedPlayers, gamePhase: 'reveal' });
      }
    },

    nextTurn: async () => {
      const { turnCount, totalTurns, players, jetIndex } = get();
      set({ isLoading: true });

      if (turnCount >= totalTurns) {
        set({ gamePhase: 'final_results', isLoading: false });
        return;
      }

      set({
        jetIndex: (jetIndex + 1) % players.length,
        turnCount: turnCount + 1,
        gamePhase: 'turn_selection',
      });
      
      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
      set({ isLoading: false });
    },

    resetGame: (keepPlayers = false) => {
      const { players } = get();
      const resetPlayers = players.map(p => ({ ...p, score: 0 }));
      set({
        ...initialState,
        players: keepPlayers ? resetPlayers : [],
        gamePhase: 'lobby', // Vuelve al lobby, no a inicializar
        isLoading: false,
        allConcepts: get().allConcepts, // Conserva los conceptos ya cargados
        conceptImageCache: get().conceptImageCache, // Conserva el cache
      });
    },

    playAgain: async () => {
      const { players, allConcepts } = get();
      if (players.length < 2 || allConcepts.length === 0) return;

      set({ isLoading: true });
      const resetedPlayers = players.map(p => ({ ...p, score: 0 }));
      const roundsPerPlayer = players.length >= 6 ? 2 : 3;
      
      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
      
      set({
        players: resetedPlayers,
        gamePhase: 'turn_selection',
        jetIndex: 0,
        turnCount: 1,
        totalTurns: players.length * roundsPerPlayer,
        isLoading: false,
      });
    },

    refreshImages: async () => {
      const { currentConcept, hasChangedImages, conceptImageCache, currentImages } = get();
      if (!currentConcept || hasChangedImages) return;
    
      const imagesForConcept = conceptImageCache[currentConcept] || [];
      const currentImageUris = new Set(currentImages.map(img => img.uri));
    
      // Filtrar el pool para excluir las imágenes actuales
      const availableImages = imagesForConcept.filter(url => !currentImageUris.has(url));
    
      let newImageUrls;
      // Si hay suficientes imágenes nuevas, tomarlas de ahí. Si no, usar todo el pool barajado.
      if (availableImages.length >= 4) {
        console.log(`Refrescando con ${availableImages.length} imágenes disponibles.`);
        newImageUrls = shuffleAndPick(availableImages, 4);
      } else {
        console.warn(`No hay suficientes imágenes nuevas. Usando el pool completo de ${imagesForConcept.length} como fallback.`);
        newImageUrls = shuffleAndPick(imagesForConcept, 4);
      }
    
      const formattedImages = newImageUrls.map(url => ({ uri: url }));
    
      set({ 
        currentImages: formattedImages,
        hasChangedImages: true 
      });
    },

    changeConcept: async () => {
      const { hasChangedConcept } = get();
      if (hasChangedConcept) return;

      const newConcept = getNewRandomConcept();
      // Se prepara el nuevo concepto. Esto resetea hasChangedConcept a false.
      await prepareConceptImages(newConcept);
      // Se setea inmediatamente a true para que no se pueda volver a usar en este turno.
      set({ hasChangedConcept: true });
    },
  };
}); 