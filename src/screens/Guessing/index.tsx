import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Vibration, Modal, Pressable, Platform } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatConceptName, getOptimizedBackgroundColor } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import Animated, { ZoomIn, ZoomOut, useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence } from 'react-native-reanimated';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';
import { Audio } from 'expo-av';

// Componente de Skeleton Loading para las imágenes
const ImageSkeleton = () => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.7, { duration: 800 }),
      withTiming(0.3, { duration: 800 })
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
  const jet = players[jetIndex];
  
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [showTurnOverlay, setShowTurnOverlay] = useState(true);
  const [overlayKey, setOverlayKey] = useState(0); // Para forzar re-render
  const [overlayVisible, setOverlayVisible] = useState(true);
  const overlayScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  // Determinar quién debe adivinar
  const guessingPlayerIndex = guesses.length;
  const playersExceptJet = players.filter((_, index) => index !== jetIndex);
  const currentGuesser = playersExceptJet[guessingPlayerIndex];

  // Mostrar overlay cada vez que cambia el votante
  React.useEffect(() => {
    setShowTurnOverlay(true);
    setOverlayVisible(true);
    setOverlayKey((k) => k + 1);
    overlayScale.value = 1;
    overlayOpacity.value = 1;
    if (Platform.OS !== 'web') {
      Vibration.vibrate(200);
    }
  }, [guessingPlayerIndex]);

  // Animación de cierre del overlay
  const handleCloseOverlay = () => {
    overlayScale.value = withTiming(0.7, { duration: 500 });
    overlayOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setShowTurnOverlay)(false);
        runOnJS(setOverlayVisible)(false);
        // runOnJS(playTransitionSound)();
      }
    });
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
    opacity: overlayOpacity.value,
  }));

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
      {/* Overlay de turno para votante */}
      <Modal
        visible={showTurnOverlay}
        animationType="fade"
        transparent={true}
        key={overlayKey}
      >
        <Pressable
          style={styles.turnOverlayContainer}
          onPress={handleCloseOverlay}
        >
          {overlayVisible && (
            <Animated.View style={[styles.turnOverlayBox, overlayAnimatedStyle]} entering={ZoomIn.duration(400)} exiting={ZoomOut.duration(400)}>
              <Text style={styles.turnOverlayIcon}>🤔</Text>
              <Text style={styles.turnOverlayTitle}>Es el turno de</Text>
              <Text style={styles.turnOverlayName}>{currentGuesser.name}</Text>
              <Text style={styles.turnOverlayInstruction}>
                Pasa el dispositivo a <Text style={{fontWeight:'bold', color: '#007A3D', textDecorationLine: 'underline'}}>{currentGuesser.name}</Text> y toca para comenzar
              </Text>
              <View style={styles.turnOverlayButton}>
                <Text style={styles.turnOverlayButtonText}>¡Comenzar turno!</Text>
              </View>
            </Animated.View>
          )}
        </Pressable>
      </Modal>
      <View style={styles.container}>
        <View style={styles.audioButton}>
          <AudioToggle />
        </View>
        
        <View style={styles.headerSection}>
          <Text style={styles.roundIndicator}>Ronda {currentRound} de {totalRounds}</Text>
          {/* Badge grande del votante */}
          <Animated.View style={styles.playerTurnBadgeBig} entering={showTurnOverlay ? undefined : ZoomIn.duration(500).springify()}>
            <Text style={styles.playerTurnTextBig}>¡TU TURNO! {currentGuesser.name}</Text>
          </Animated.View>
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
  // Badge grande y animado
  playerTurnBadgeBig: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#000',
    elevation: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  playerTurnTextBig: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 24,
    color: '#002800',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  // Overlay de turno
  turnOverlayContainer: {
    flex: 1,
    backgroundColor: '#FFE14D',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  turnOverlayBox: {
    backgroundColor: '#FFF',
    borderColor: '#000',
    borderWidth: 5,
    borderRadius: 32,
    paddingVertical: 44,
    paddingHorizontal: 34,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  turnOverlayIcon: {
    fontSize: 60,
    marginBottom: 10,
    textAlign: 'center',
  },
  turnOverlayTitle: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 32,
    color: '#014421',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  turnOverlayName: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 38,
    color: '#014421',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  turnOverlayInstruction: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#111',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  turnOverlayButton: {
    backgroundColor: '#014421',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  turnOverlayButtonText: {
    color: '#FFE14D',
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default GuessingScreen; 