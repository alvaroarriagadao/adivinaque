import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { getOptimizedBackgroundColor } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp, FadeIn, ZoomIn, SlideInUp, SlideInLeft, SlideInRight, withRepeat, withSequence, withTiming, withDelay, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import AnimatedButton from '../../components/AnimatedButton';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

// Componente para animar las medallas del podio
const AnimatedMedal = ({ emoji, delay }: { emoji: string, delay: number }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    // Animación de entrada con escala
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 600 });
    }, delay);
    
    // Animación de rotación continua
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 }),
        withTiming(-5, { duration: 2000 })
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
    <Animated.Text style={[styles.animatedMedal, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

// Componente de serpentinas animadas
const ConfettiAnimation = () => {
  const confettiPieces = Array.from({ length: 40 }, (_, i) => i);
  
  const ConfettiPiece = ({ index }: { index: number }) => {
    const translateY = useSharedValue(-50);
    const translateX = useSharedValue(0);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF8A80', '#80CBC4', '#FFD700', '#FF69B4'];
    const color = colors[index % colors.length];
    
    // Posición inicial aleatoria
    const initialX = (index * 12) % 400;
    const initialDelay = index * 30;

    React.useEffect(() => {
      const duration = 5000 + Math.random() * 3000;
      
      // Animación de caída
      translateY.value = withDelay(
        initialDelay,
        withTiming(1000, { duration })
      );
      
      // Movimiento lateral aleatorio
      translateX.value = withDelay(
        initialDelay,
        withRepeat(
          withSequence(
            withTiming(80, { duration: 1000 }),
            withTiming(-80, { duration: 1000 }),
            withTiming(50, { duration: 1000 }),
            withTiming(-50, { duration: 1000 })
          ),
          -1,
          true
        )
      );
      
      // Rotación continua
      rotation.value = withDelay(
        initialDelay,
        withRepeat(
          withTiming(360, { duration: 2000 }),
          -1,
          false
        )
      );
      
      // Fade out al final
      opacity.value = withDelay(
        initialDelay + duration - 1000,
        withTiming(0, { duration: 1000 })
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateY: translateY.value },
          { translateX: translateX.value },
          { rotate: `${rotation.value}deg` }
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

const FinalResultsScreen = ({ navigation }: { navigation: any }) => {
  const { players, resetGame, playAgain } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const highestScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;
  const winners = sortedPlayers.filter(p => p.score === highestScore);
  
  const podium = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  // Se crea un array de puntajes únicos para determinar el rango correcto.
  const podiumScores = [...new Set(sortedPlayers.map(p => p.score))];

  const titleText = winners.length > 1 ? "🎉 ¡Es un Empate! 🎉" : "🏆 ¡Juego Terminado! 🏆";
  const subtitleText = "🎊 Resultados Finales 🎊";

  // Fondo gris oscuro fijo para la pantalla de resultados
  const getBackgroundColor = () => {
    return '#1E2A3E'; // Gris oscuro consistente
  };

  const handlePlayAgain = () => {
    // Resetear el juego manteniendo los jugadores y comenzar inmediatamente
    playAgain(); // Usa la nueva función que hace todo en una operación
  };

  const handleSelectNewPlayers = () => {
    resetGame(false); // Reseteo completo
    navigation.navigate('Lobby');
  };

  const handleBackToMenu = () => {
    resetGame(false); // Reseteo completo
    navigation.navigate('Home');
  };
  
  const getPodiumIcon = (index: number) => {
    if (index === 0) return { name: "award" as const, color: "#FFD700" }; // Oro
    if (index === 1) return { name: "award" as const, color: "#C0C0C0" }; // Plata
    if (index === 2) return { name: "award" as const, color: "#CD7F32" }; // Bronce
    return null;
  }

  const getPodiumEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🏅";
  }

  return (
    <SafeAreaWrapper backgroundColor={getBackgroundColor()}>
      <TouchableOpacity style={styles.exitButton} onPress={handleBackToMenu}>
        <Text style={styles.exitButtonText}>← Salir</Text>
      </TouchableOpacity>
      
      <LottieView
        source={require('../../../assets/lottie/confetti.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
      <ConfettiAnimation />
      <View style={styles.container}>
        <Animated.Text style={styles.title} entering={FadeInUp.duration(800)}>{titleText}</Animated.Text>
        <Animated.Text style={styles.subtitle} entering={FadeInUp.delay(200).duration(800)}>{subtitleText}</Animated.Text>
        
        <Animated.View style={styles.podiumContainer} entering={SlideInUp.delay(400).duration(800)}>
            {podium.map((player, index) => {
              const isWinner = winners.some(w => w.id === player.id);
              const rank = podiumScores.indexOf(player.score); // Se calcula el rango real
              return (
                <Animated.View 
                  key={player.id} 
                  entering={FadeInUp.delay(600 + index * 200).duration(800)}
                  style={[styles.podiumItem, isWinner && styles.winnerPodium]}
                >
                    <AnimatedMedal emoji={getPodiumEmoji(rank)} delay={800 + index * 200} />
                    <Animated.Text 
                      style={styles.podiumName}
                      entering={SlideInLeft.delay(1000 + index * 200).duration(600)}
                    >
                      {rank + 1}. {player.name}
                    </Animated.Text>
                    <Animated.Text 
                      style={styles.podiumScore}
                      entering={SlideInRight.delay(1200 + index * 200).duration(600)}
                    >
                      {player.score} pts
                    </Animated.Text>
                </Animated.View>
              );
            })}
        </Animated.View>

        <FlatList
          data={rest}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const rank = podiumScores.indexOf(item.score); // Rango para el resto de jugadores
            return (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{rank + 1}. {item.name}</Text>
                <Text style={styles.playerScore}>{item.score} pts</Text>
              </View>
            )
          }}
          style={{width: '100%', marginTop: 20, maxHeight: 100}}
        />

        <Animated.View style={styles.actionButtons} entering={SlideInUp.delay(1600).duration(800)}>
          <AnimatedButton
            text="🎮 Jugar otra vez"
            onPress={handlePlayAgain}
            style={styles.playAgainButton}
            textStyle={styles.buttonText}
          />
          <AnimatedButton
            text="👥 Seleccionar nuevos jugadores"
            onPress={handleSelectNewPlayers}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </Animated.View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
    exitButton: { 
      position: 'absolute', 
      top: 45, // Ajustado para Android
      left: 20, 
      zIndex: 3, // Por encima del overlay y contenido
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20
    },
    exitButtonText: { 
      color: 'white', 
      fontSize: 16,
      fontFamily: 'LuckiestGuy-Regular'
    },
    lottie: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
    container: { 
      flex: 1, 
      padding: 20, 
      alignItems: 'center', 
      zIndex: 2, // Para aparecer por encima del overlay de contraste
      paddingTop: 80,
      paddingBottom: 20, // Espacio adicional para Android
    },
    title: { 
      fontSize: 28, 
      fontFamily: 'LuckiestGuy-Regular', 
      color: 'white', 
      marginBottom: 10,
      textAlign: 'center'
    },
    subtitle: { 
      fontSize: 20, 
      fontFamily: 'LuckiestGuy-Regular',
      color: '#FDB813', 
      marginBottom: 30,
      textAlign: 'center'
    },
    podiumContainer: { width: '100%' },
    podiumItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent' // Borde transparente por defecto
    },
    winnerPodium: {
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    podiumEmoji: {
        fontSize: 32,
        marginRight: 10,
    },
    animatedMedal: {
        fontSize: 32,
        marginRight: 10,
    },
    podiumName: { 
      flex: 1, 
      fontSize: 18, 
      fontFamily: 'Poppins-Bold', 
      color: 'white', 
      marginLeft: 5 
    },
    podiumScore: { 
      fontSize: 18, 
      fontFamily: 'Poppins-Bold', 
      color: 'white' 
    },
    playerRow: { 
      flexDirection: 'row', 
      padding: 12, 
      borderBottomWidth: 1, 
      borderBottomColor: 'rgba(255,255,255,0.2)' 
    },
    playerName: { 
      flex: 1, 
      color: 'white', 
      fontSize: 16, 
      fontFamily: 'Poppins-Bold' 
    },
    playerScore: { 
      color: 'white', 
      fontSize: 16, 
      fontFamily: 'Poppins-Bold' 
    },

    actionButtons: { 
      width: '100%', 
      marginTop: 20,
      paddingBottom: 10, // Espacio adicional para Android
    },
    button: { 
      backgroundColor: '#607D8B', 
      marginBottom: 10 
    },
    playAgainButton: { 
      backgroundColor: '#4CAF50', 
      marginBottom: 10 
    },
    buttonText: { 
      color: 'white', 
      fontSize: 16, 
      fontFamily: 'LuckiestGuy-Regular' 
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
        width: 12,
        height: 12,
        borderRadius: 6,
        top: -40,
    },
});

export default FinalResultsScreen; 