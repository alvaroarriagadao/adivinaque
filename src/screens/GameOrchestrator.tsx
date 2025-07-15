import React from 'react';
import { useGameStore } from '../store/gameStore';
import GameScreen from './Game';
import GuessingScreen from './Guessing';
import RevealScreen from './Reveal';
import FinalResultsScreen from './FinalResults';

/**
 * Este componente actúa como un controlador que renderiza la pantalla
 * correcta según la fase actual del juego.
 */
const GameOrchestrator = ({ navigation }: { navigation: any }) => {
  const { gamePhase } = useGameStore();

  switch (gamePhase) {
    case 'turn_selection':
      return <GameScreen navigation={navigation} />;
    
    case 'guessing':
      return <GuessingScreen />;
    
    case 'reveal':
      return <RevealScreen />;
      
    case 'final_results':
      return <FinalResultsScreen navigation={navigation} />;

    default:
      // Fallback por si algo sale mal, no debería pasar.
      // No debería haber navegación aquí para evitar efectos secundarios.
      return null;
  }
};

export default GameOrchestrator; 