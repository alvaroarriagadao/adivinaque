import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatConceptName } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const GuessingScreen = () => {
  const { 
    players, jetIndex, currentConcept, currentImages, guesses, 
    addGuess, turnCount, totalTurns
  } = useGameStore();
  
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const jet = players[jetIndex];
  
  // Determinar quién debe adivinar
  const guessingPlayerIndex = guesses.length;
  const playersExceptJet = players.filter((_, index) => index !== jetIndex);
  const currentGuesser = playersExceptJet[guessingPlayerIndex];

  const handleSelectImage = (image: any) => {
    setSelectedImage(image);
  };

  const handleConfirmGuess = () => {
    if (selectedImage && currentGuesser) {
      addGuess(currentGuesser.id, selectedImage);
      setSelectedImage(null);
    }
  };

  if (!jet || !currentGuesser || !currentConcept) return null;

  // Calcular la ronda actual
  const currentRound = Math.ceil(turnCount / players.length);
  const totalRounds = Math.ceil(totalTurns / players.length);

  return (
    <SafeAreaWrapper backgroundColor="#5D5FEF">
      <View style={styles.container}>
        <View style={styles.audioButton}>
          <AudioToggle />
        </View>
        
        <Text style={styles.roundIndicator}>Ronda {currentRound} de {totalRounds}</Text>
        <Text style={styles.title}>Turno de <Text style={{color: '#FDB813'}}>{currentGuesser.name}</Text></Text>
        <Text style={styles.question}>
          Adivina qué <Text style={styles.conceptName}>{formatConceptName(currentConcept)}</Text> eligió <Text style={{color: '#FDB813'}}>{jet.name}</Text>
        </Text>

        <View style={styles.imageGrid}>
          {currentImages.map((img, index) => (
            <TouchableOpacity key={index} style={[styles.imageContainer, selectedImage === img && styles.selectedImage]} onPress={() => handleSelectImage(img)}>
              <Image source={img} style={styles.image} />
              {selectedImage === img && (
                <View style={styles.selectedOverlay}>
                  <Feather name="check-circle" size={40} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedImage && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmGuess}>
              <Text style={styles.confirmButtonText}>Confirmar Elección</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 22, fontFamily: 'LuckiestGuy-Regular' },
  title: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  question: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  conceptName: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 22,
    color: '#FDB813',
  },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
  imageContainer: {
    width: '45%',
    aspectRatio: 1,
    margin: '2.5%',
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  image: { width: '100%', height: '100%', borderRadius: 15 },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  selectedImage: {
    borderColor: '#FDB813',
    transform: [{ scale: 1.05 }],
  },
  actionButtons: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LuckiestGuy-Regular',
  },
});

export default GuessingScreen; 