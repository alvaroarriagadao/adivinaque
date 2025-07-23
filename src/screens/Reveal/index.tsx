import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useGameStore, Player, Guess } from '../../store/gameStore';
import { getOptimizedBackgroundColor } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import AnimatedButton from '../../components/AnimatedButton';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

// Componente para la animación festiva
const CelebrationIcon = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // Animación de escala (pulso)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      true
    );

    // Animación de rotación
    rotation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 200 }),
        withTiming(-10, { duration: 200 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  return (
    <Animated.View style={[styles.celebrationContainer, animatedStyle]}>
      <Text style={styles.celebrationIcon}>🎉</Text>
    </Animated.View>
  );
};

// Componente de serpentinas animadas mejorado
const ConfettiAnimation = () => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
  
  const ConfettiPiece = ({ index }: { index: number }) => {
    const translateY = useSharedValue(-100);
    const translateX = useSharedValue(0);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF8A80', '#80CBC4', '#FFD700', '#FF69B4', '#00CED1', '#FF4500'];
    const color = colors[index % colors.length];
    
    // Propiedades aleatorias para cada pieza
    const size = 6 + Math.random() * 8; // Tamaños variados entre 6-14px
    const initialX = Math.random() * 400; // Posición inicial completamente aleatoria
    const fallDuration = 4000 + Math.random() * 2000; // Duración equilibrada
    const swingAmplitude = 20 + Math.random() * 40; // Amplitud de balanceo variable
    const swingSpeed = 800 + Math.random() * 600; // Velocidad de balanceo variable
    const rotationSpeed = 1000 + Math.random() * 1000; // Velocidad de rotación variable

    React.useEffect(() => {
      // Animación de caída muy lenta para que dure toda la pantalla
      translateY.value = withTiming(1000, { 
        duration: fallDuration,
      });
      
      // Movimiento de balanceo natural (como confeti real)
      translateX.value = withRepeat(
        withSequence(
          withTiming(swingAmplitude, { duration: swingSpeed }),
          withTiming(-swingAmplitude, { duration: swingSpeed }),
          withTiming(swingAmplitude * 0.7, { duration: swingSpeed }),
          withTiming(-swingAmplitude * 0.7, { duration: swingSpeed })
        ),
        -1,
        true
      );
      
      // Rotación natural y continua
      rotation.value = withRepeat(
        withTiming(360, { duration: rotationSpeed }),
        -1,
        false
      );
      
      // Ligero escalado para efecto de "flotación"
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(0.9, { duration: 1500 })
        ),
        -1,
        true
      );
      
      // Sin fade out - el confeti se mantiene visible
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateY: translateY.value },
          { translateX: translateX.value },
          { rotate: `${rotation.value}deg` },
          { scale: scale.value }
        ],
        opacity: opacity.value,
      };
    });

    return (
      <Animated.View 
        style={[
          styles.confettiPiece, 
          { 
            backgroundColor: color,
            left: initialX,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle
        ]} 
      />
    );
  };

  return (
    <View style={styles.confettiContainer}>
      {confettiPieces.map((index) => (
        <ConfettiPiece key={index} index={index} />
      ))}
    </View>
  );
};

const RevealScreen = () => {
  const { players, jetIndex, jetSelection, guesses, nextTurn, turnCount, totalTurns } = useGameStore();
  const jet = players[jetIndex];
  
  // Estado para controlar el timer de revelación
  const [canContinue, setCanContinue] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(3); // 3 segundos de revelación obligatoria
  
  // Timer para habilitar el botón de continuar
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanContinue(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getNextJetName = () => {
    const nextJetIndex = (jetIndex + 1) % players.length;
    return players[nextJetIndex].name;
  };

  const isLastTurn = turnCount >= totalTurns;
  const buttonText = isLastTurn ? "🎉 Ver Resultados Finales" : `Turno de ${getNextJetName()}`;

  if (!jet || !jetSelection) return null;

  // Calcular la ronda actual
  const currentRound = Math.ceil(turnCount / players.length);
  const totalRounds = Math.ceil(totalTurns / players.length);

  // Obtener el color del jugador que hizo la selección optimizado para contraste
  const jetColor = getOptimizedBackgroundColor(jet.color || '#1E2A3E');

  const getPlayerGuess = (player: Player): Guess | undefined => {
      return guesses.find(g => g.playerId === player.id);
  }

  const renderPlayerResult = ({ item: player }: { item: Player }) => {
    const guess = getPlayerGuess(player);
    const isJet = player.id === jet.id;
    const isCorrect = guess && jetSelection && guess.image === jetSelection;

    let icon = "👤";
    if (isJet) {
      icon = "🎯"; // El JET siempre aparece con este icono
    } else if (isCorrect) {
      icon = "✅";
    } else if (guess) {
      icon = "❌";
    }

    return (
      <Animated.View 
        style={[
          styles.playerRow, 
          isJet && styles.jetRow,
          isCorrect && styles.correctRow,
          guess && !isCorrect && styles.incorrectRow
        ]}
        entering={FadeIn.delay(100).duration(600)}
      >
        <Text style={styles.playerIcon}>{icon}</Text>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerScore}>{player.score}</Text>
        {isCorrect && <CelebrationIcon />}
      </Animated.View>
    );
  };

  return (
    <SafeAreaWrapper backgroundColor={jetColor}>
      {canContinue && <ConfettiAnimation />}
      <View style={styles.container}>
        <View style={styles.audioButton}>
          <AudioToggle />
        </View>
        
        <Animated.Text style={styles.roundIndicator} entering={FadeIn.duration(600)}>
          Ronda {currentRound} de {totalRounds}
        </Animated.Text>
        
        <Animated.Text style={styles.title} entering={FadeIn.duration(800)}>
          ¡La elección de {jet.name} era!
        </Animated.Text>
        
        <Animated.View style={styles.revealImageContainer} entering={ZoomIn.delay(200).duration(800).springify()}>
            <Image source={jetSelection} style={styles.revealImage} />
            <View style={styles.revealOverlay}>
              <Text style={styles.revealText}>¡ESTA ERA LA ELEGIDA!</Text>
            </View>
        </Animated.View>
        


        <Text style={styles.resultsTitle}>Puntaje Acumulado</Text>
        <FlatList
          data={players}
          renderItem={renderPlayerResult}
          keyExtractor={item => item.id}
          style={styles.list}
        />

        <TouchableOpacity 
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={nextTurn}
          disabled={!canContinue}
        >
          <Text style={styles.nextButtonText}>
            {canContinue ? buttonText : `⏰ Espera ${timeLeft}s...`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 20, 
      alignItems: 'center',
      paddingTop: 40, // Espacio adicional para Android
      zIndex: 2, // Para aparecer por encima del overlay de contraste
    },
    audioButton: { 
      position: 'absolute', 
      top: 20, // Ajustado para Android
      right: 20, 
      zIndex: 1,
    },
    roundIndicator: {
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 10,
      marginTop: 30, // Reducido para Android
      textAlign: 'center',
    },
    title: { 
      fontSize: 22, 
      fontFamily: 'LuckiestGuy-Regular', 
      color: 'white', 
      textAlign: 'center', 
      marginBottom: 20 
    },
    revealImageContainer: {
        width: '60%',
        aspectRatio: 1,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 8,
    },
    revealImage: { width: '100%', height: '100%', borderRadius: 20 },
    resultsTitle: { 
      fontSize: 20, 
      fontFamily: 'LuckiestGuy-Regular', 
      color: 'white', 
      marginTop: 10, 
      marginBottom: 10 
    },
    list: { width: '100%' },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 0,
        elevation: 0,
    },
    jetRow: {
        backgroundColor: 'rgba(255, 193, 7, 0.3)',
        borderWidth: 1,
        borderColor: '#FFC107',
        elevation: 0,
    },
    correctRow: { 
      backgroundColor: 'rgba(76, 175, 80, 0.3)',
      borderWidth: 1,
      borderColor: '#4CAF50',
      elevation: 0,
    },
    incorrectRow: { 
      backgroundColor: 'rgba(244, 67, 54, 0.3)',
      borderWidth: 1,
      borderColor: '#F44336',
      elevation: 0,
    },
    playerIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    playerName: { 
      flex: 1, 
      color: 'white', 
      fontSize: 16, 
      marginLeft: 10,
      fontFamily: 'Poppins-Bold'
    },
    playerScore: { 
      color: 'white', 
      fontSize: 16, 
      fontFamily: 'Poppins-Bold'
    },
    // Estilos para la animación de celebración
    celebrationContainer: {
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    celebrationIcon: {
      fontSize: 24,
    },
    nextButton: {
        backgroundColor: '#2A8BF2',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 40,
        marginTop: 'auto',
        marginBottom: 10, // Espacio adicional para Android
    },
    nextButtonDisabled: {
        backgroundColor: '#666',
        opacity: 0.6,
    },
    // Estilos para la revelación
    revealOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 215, 0, 0.9)',
        paddingVertical: 8,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
    },
    revealText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'LuckiestGuy-Regular',
        textAlign: 'center',
    },

    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'LuckiestGuy-Regular',
    },
    // Estilos para las serpentinas/confeti
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
    },
    confettiPiece: {
        position: 'absolute',
        top: -50,
    },
});

export default RevealScreen; 