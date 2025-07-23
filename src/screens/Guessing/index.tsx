import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatConceptName, getOptimizedBackgroundColor } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

// Componente de Skeleton Loading para las imágenes
const ImageSkeleton = () => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.skeletonContainer, animatedStyle]}>
      <View style={styles.skeletonImage} />
    </Animated.View>
  );
};

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
    // Si la imagen ya está seleccionada, la deseleccionamos
    if (selectedImage === image) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
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

  // Obtener el color del jugador que está adivinando optimizado para contraste
  const currentGuesserColor = getOptimizedBackgroundColor(currentGuesser.color || '#2C3E50');

  return (
    <SafeAreaWrapper backgroundColor={currentGuesserColor}>
      <View style={styles.container}>
        <View style={styles.audioButton}>
          <AudioToggle />
        </View>
        
        <View style={styles.headerSection}>
          <Text style={styles.roundIndicator}>Ronda {currentRound} de {totalRounds}</Text>
          
          {/* Badge simple del jugador actual */}
          <View style={styles.playerTurnBadge}>
            <Text style={styles.playerTurnText}>¡TU TURNO! {currentGuesser.name}</Text>
          </View>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>
              Adivina qué <Text style={styles.conceptName}>{formatConceptName(currentConcept)}</Text> eligió <Text style={{color: '#FDB813'}}>{jet.name}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.imageGrid}>
          {currentImages.length > 0 ? (
            // Mostrar imágenes cuando están cargadas
            currentImages.map((img, index) => (
              <TouchableOpacity key={index} style={[styles.imageContainer, selectedImage === img && styles.selectedImage]} onPress={() => handleSelectImage(img)}>
                <Image source={img} style={styles.image} />
                {selectedImage === img && (
                  <View style={styles.selectedOverlay}>
                    <Feather name="check-circle" size={40} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            // Mostrar skeletons mientras cargan
            Array.from({ length: 4 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.imageContainer}>
                <ImageSkeleton />
              </View>
            ))
          )}
        </View>
        
        <View style={{flex: 1}} />

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
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    zIndex: 2, // Para aparecer por encima del overlay de contraste
  },
  audioButton: { 
    position: 'absolute', 
    top: 45,
    right: 20, 
    zIndex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
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
  // Badge simple del jugador actual
  playerTurnBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#000000',
    elevation: 2,
  },
  playerTurnText: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 16,
    color: '#002800',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  questionContainer: {
    minHeight: 40, // Muy reducido para mínimo espacio
    justifyContent: 'center',
  },
  question: {
    fontFamily: 'Poppins-Regular',
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 0,
  },
  conceptName: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 22,
    color: '#FDB813',
  },
  imageGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
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
  // Estilos para el skeleton loading
  skeletonContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonImage: {
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 12,
    resizeMode: 'cover'
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedImage: {
    borderColor: '#4CAF50',
    borderWidth: 4,
    transform: [{ scale: 1.05 }],
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },
  actionButtons: {
    width: '100%',
    paddingBottom: 10,
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