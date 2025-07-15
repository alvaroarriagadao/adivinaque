import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AnimatedButton from '../../components/AnimatedButton';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const FinalResultsScreen = ({ navigation }: { navigation: any }) => {
  const { players, resetGame, playAgain } = useGameStore();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const highestScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;
  const winners = sortedPlayers.filter(p => p.score === highestScore);
  
  const podium = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  const titleText = winners.length > 1 ? "🎉 ¡Es un Empate! 🎉" : "🏆 ¡Juego Terminado! 🏆";
  const subtitleText = "🎊 Resultados Finales 🎊";

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
    <SafeAreaWrapper backgroundColor="#1E2A3E">
      <TouchableOpacity style={styles.exitButton} onPress={handleBackToMenu}>
        <Text style={styles.exitButtonText}>← Salir</Text>
      </TouchableOpacity>
      
      <LottieView
        source={require('../../../assets/lottie/confetti.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
      <View style={styles.container}>
        <Animated.Text style={styles.title} entering={FadeInUp.duration(800)}>{titleText}</Animated.Text>
        <Animated.Text style={styles.subtitle} entering={FadeInUp.delay(200).duration(800)}>{subtitleText}</Animated.Text>
        
        <View style={styles.podiumContainer}>
            {podium.map((player, index) => {
              const isWinner = winners.some(w => w.id === player.id);
              return (
                <Animated.View key={player.id} entering={FadeInUp.delay(600 + index * 200).duration(800)}>
                    <View key={player.id} style={[styles.podiumItem, isWinner && styles.winnerPodium]}>
                        <Text style={styles.podiumEmoji}>{getPodiumEmoji(index)}</Text>
                        <Text style={styles.podiumName}>{index + 1}. {player.name}</Text>
                        <Text style={styles.podiumScore}>{player.score} pts</Text>
                    </View>
                </Animated.View>
              );
            })}
        </View>

        <FlatList
          data={rest}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.playerRow}>
              <Text style={styles.playerName}>{index + 4}. {item.name}</Text>
              <Text style={styles.playerScore}>{item.score} pts</Text>
            </View>
          )}
          style={{width: '100%', marginTop: 20}}
        />

        <View style={styles.actionButtons}>
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
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
    exitButton: { 
      position: 'absolute', 
      top: 20, // Ajustado para Android
      left: 20, 
      zIndex: 2,
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
      zIndex: 1, 
      paddingTop: 60, // Reducido para Android
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
});

export default FinalResultsScreen; 