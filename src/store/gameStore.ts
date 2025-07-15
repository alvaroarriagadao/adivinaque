import { create } from 'zustand';
import { fetchConceptNames, fetchImageUrlsForConcept } from '../services/firebaseService';

export interface Player {
  id: string;
  name: string;
  score: number;
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
  
  // Acciones
  initializeAssets: () => Promise<void>;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
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
      const newPlayer: Player = { id: `player-${Date.now()}`, name, score: 0 };
      set((state) => ({ players: [...state.players, newPlayer] }));
    },

    removePlayer: (id) => {
      set((state) => ({ players: state.players.filter((p) => p.id !== id) }));
    },

    startGame: async () => {
      const { players } = get();
      if (players.length < 2) return;

      const roundsPerPlayer = players.length >= 6 ? 2 : 3;
      set({
        gamePhase: 'turn_selection',
        jetIndex: 0,
        turnCount: 1,
        totalTurns: players.length * roundsPerPlayer,
      });

      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
    },

    setJetSelection: (image: any) => {
      set({
        jetSelection: image,
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

      if (turnCount >= totalTurns) {
        set({ gamePhase: 'final_results' });
        return;
      }

      set({
        jetIndex: (jetIndex + 1) % players.length,
        turnCount: turnCount + 1,
        gamePhase: 'turn_selection',
      });
      
      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
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
      const { players } = get();
      if (players.length < 2) return;

      const resetedPlayers = players.map(p => ({ ...p, score: 0 }));
      const roundsPerPlayer = players.length >= 6 ? 2 : 3;
      
      set({
        players: resetedPlayers,
        gamePhase: 'turn_selection',
        jetIndex: 0,
        turnCount: 1,
        totalTurns: players.length * roundsPerPlayer,
      });

      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
    },

    refreshImages: async () => {
      const { currentConcept, hasChangedImages, conceptImageCache, currentImages } = get();
      if (!currentConcept || hasChangedImages) return;

      const imagesForConcept = conceptImageCache[currentConcept] || [];
      if (imagesForConcept.length <= 4) {
        console.warn("No hay suficientes imágenes en el pool para refrescar.");
        return;
      }
      
      // Asegurarse de no repetir las mismas 4 imágenes exactas
      let newImageUrls;
      let attempts = 0;
      do {
        newImageUrls = shuffleAndPick(imagesForConcept, 4);
        attempts++;
      } while (
        attempts < 10 &&
        newImageUrls.every(url => currentImages.some(img => img.uri === url))
      );

      const formattedImages = newImageUrls.map(url => ({ uri: url }));

      set({ 
        currentImages: formattedImages,
        hasChangedImages: true 
      });
    },

    changeConcept: async () => {
      const newConcept = getNewRandomConcept();
      await prepareConceptImages(newConcept);
    },
  };
}); 