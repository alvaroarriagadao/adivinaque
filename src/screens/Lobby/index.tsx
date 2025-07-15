import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { Feather } from '@expo/vector-icons';
import Animated, { Layout, Easing, FadeInUp, FadeOutDown } from 'react-native-reanimated';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const LobbyScreen = ({ navigation }: { navigation: any }) => {
  const { players, addPlayer, removePlayer, startGame, gamePhase } = useGameStore();
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    if (gamePhase === 'turn_selection') {
      navigation.navigate('Game');
    }
  }, [gamePhase, navigation]);

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      addPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const canStartGame = players.length >= 2;

  // Avatares de cerebros/monitos
  const avatars = ['🧠', '👾', '🤖', '🐵', '🎭', '🎪', '🎨', '🎯', '🎲', '🎮'];
  
  const getPlayerAvatar = (index: number) => {
    return avatars[index % avatars.length];
  };

  return (
    <SafeAreaWrapper backgroundColor="#1E2A3E">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Feather name="home" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Añade Jugadores</Text>
          <View style={{width: 28}} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputEmoji}>🎮</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del jugador(a)"
            placeholderTextColor="#888"
            value={playerName}
            onChangeText={setPlayerName}
            onSubmitEditing={handleAddPlayer}
            maxLength={15}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
            <Text style={styles.addButtonText}>Añadir</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View 
              entering={FadeInUp.delay(index * 100)} 
              exiting={FadeOutDown}
            >
              <View style={styles.playerItem}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerAvatar}>{getPlayerAvatar(index)}</Text>
                  <Text style={styles.playerName}>{item.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removePlayer(item.id)} style={styles.removeButton}>
                  <Feather name="x-circle" size={22} color="#F44336" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>¡Añade al menos 2 jugadores para empezar!</Text>}
          contentContainerStyle={{ flexGrow: 1 }}
        />

        <TouchableOpacity 
          style={[styles.startButton, !canStartGame && styles.startButtonDisabled]}
          onPress={startGame}
          disabled={!canStartGame}
        >
          <Text style={styles.startButtonText}>Comenzar Juego</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10, // Espacio adicional para Android
  },
  title: {
    fontSize: 24,
    fontFamily: 'LuckiestGuy-Regular',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#5D5FEF',
  },
  inputEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    height: 50,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    backgroundColor: '#2A8BF2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 14,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 95, 239, 0.2)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 95, 239, 0.3)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  playerName: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10, // Espacio adicional para Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#666',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LuckiestGuy-Regular',
  },
});

export default LobbyScreen; 