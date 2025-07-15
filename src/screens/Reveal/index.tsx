import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useGameStore, Player, Guess } from '../../store/gameStore';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import AnimatedButton from '../../components/AnimatedButton';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const RevealScreen = () => {
  const { players, jetIndex, jetSelection, guesses, nextTurn, turnCount, totalTurns } = useGameStore();
  const jet = players[jetIndex];

  const getNextJetName = () => {
    const nextJetIndex = (jetIndex + 1) % players.length;
    return players[nextJetIndex].name;
  };

  const isLastTurn = turnCount >= totalTurns;
  const buttonText = isLastTurn ? "🎉 Ver Resultados Finales" : `Turno de ${getNextJetName()}`;

  // Calcular la ronda actual
  const currentRound = Math.ceil(turnCount / players.length);
  const totalRounds = Math.ceil(totalTurns / players.length);

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
          isCorrect && styles.correctRow,
          guess && !isCorrect && styles.incorrectRow
        ]}
        entering={FadeInDown.delay(100).duration(600)}
      >
        <Text style={styles.playerIcon}>{icon}</Text>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerScore}>{player.score}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaWrapper backgroundColor="#1E2A3E">
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
        </Animated.View>

        <Text style={styles.resultsTitle}>Puntaje Acumulado</Text>
        <FlatList
          data={players}
          renderItem={renderPlayerResult}
          keyExtractor={item => item.id}
          style={styles.list}
        />

        <AnimatedButton
          text={buttonText}
          onPress={nextTurn}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
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
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
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
    },
    correctRow: { backgroundColor: 'rgba(76, 175, 80, 0.2)' },
    incorrectRow: { backgroundColor: 'rgba(244, 67, 54, 0.2)' },
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
    nextButton: {
        backgroundColor: '#2A8BF2',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 40,
        marginTop: 'auto',
        marginBottom: 10, // Espacio adicional para Android
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'LuckiestGuy-Regular',
    },
});

export default RevealScreen; 