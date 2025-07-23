import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatConceptName, getOptimizedBackgroundColor } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
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

const GameScreen = ({ navigation }: { navigation: any }) => {
  const { 
    players, jetIndex, resetGame, currentConcept, 
    currentImages, setJetSelection, refreshImages, changeConcept, hasChangedImages,
    hasChangedConcept,
    turnCount, totalTurns
  } = useGameStore();
  
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  
  const currentPlayer = players[jetIndex];

  const handleSelectImage = (image: any) => {
    // Si la imagen ya está seleccionada, la deseleccionamos
    if (selectedImage === image) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      setJetSelection(selectedImage);
    }
  };

  const handleRefreshImages = () => {
    if (!hasChangedImages) {
      refreshImages();
    }
  };

  const handleChangeConcept = () => {
    changeConcept();
  };

  const handleExit = () => {
    Alert.alert(
      "Salir del juego",
      "¿Estás seguro? Perderás todo el progreso de la partida.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, salir", onPress: () => {
            resetGame();
            navigation.navigate('Home');
          }, style: 'destructive' }
      ]
    );
  };

  if (!currentPlayer || !currentConcept) return null;

  // Calcular la ronda actual
  const currentRound = Math.ceil(turnCount / players.length);
  const totalRounds = Math.ceil(totalTurns / players.length);

  // Obtener el color del jugador en turno optimizado para contraste
  const currentPlayerColor = getOptimizedBackgroundColor(currentPlayer.color || '#5D5FEF');

  return (
    <SafeAreaWrapper backgroundColor={currentPlayerColor}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleExit}>
            <Text style={styles.backButtonText}>← Salir</Text>
        </TouchableOpacity>
        
        <View style={styles.audioButton}>
          <AudioToggle />
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Animated.Text 
              style={styles.roundIndicator}
              entering={FadeIn.duration(600)}
            >
              Ronda {currentRound} de {totalRounds}
            </Animated.Text>
            <Animated.View 
              style={styles.playerTurnBadge}
              entering={FadeIn.duration(600)}
              key={`badge-${currentPlayer.name}`}
            >
              <Text style={styles.playerTurnText}>¡TU TURNO! {currentPlayer.name}</Text>
            </Animated.View>
            <Animated.Text 
              style={styles.question}
              entering={FadeIn.delay(200).duration(600)}
              key={`question-${currentConcept}`}
            >
              ¿Cuál <Text style={styles.conceptName}>{formatConceptName(currentConcept)}</Text> te gusta más?
            </Animated.Text>
          </View>

          <View style={styles.imageGrid}>
            {currentImages.length > 0 ? (
              // Mostrar imágenes cuando están cargadas
              currentImages.map((img, index) => (
                <Animated.View 
                  key={index}
                  style={styles.imageWrapper}
                  entering={FadeIn.delay(index * 100).duration(600)}
                >
                  <TouchableOpacity
                    style={[
                      styles.imageContainer,
                      selectedImage === img && styles.selectedImage
                    ]}
                    onPress={() => handleSelectImage(img)}
                    activeOpacity={0.8}
                  >
                    <Image source={img} style={styles.image} />
                    {selectedImage === img && (
                      <View style={styles.selectedOverlay}>
                        <Feather name="check-circle" size={40} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              // Mostrar skeletons mientras cargan
              Array.from({ length: 4 }).map((_, index) => (
                <Animated.View 
                  key={`skeleton-${index}`}
                  style={styles.imageWrapper}
                  entering={FadeIn.delay(index * 100).duration(600)}
                >
                  <ImageSkeleton />
                </Animated.View>
              ))
            )}
          </View>

          <View style={{ flex: 1 }} /> 

          <Animated.View 
            style={styles.actionButtons}
            layout={Layout.duration(300)}
          >
            {selectedImage ? (
              <Animated.View
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(200)}
              >
                <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirmSelection}>
                  <Text style={styles.confirmButtonText}>Confirmar Elección</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(200)}
              >
                <TouchableOpacity 
                  style={[styles.button, hasChangedImages ? styles.buttonDisabled : styles.buttonAvailable]} 
                  onPress={handleRefreshImages}
                  disabled={hasChangedImages}
                >
                  <View style={styles.buttonContent}>
                    <Feather 
                      name="refresh-cw" 
                      size={20} 
                      color={hasChangedImages ? 'rgba(93, 95, 239, 0.4)' : '#5D5FEF'} 
                    />
                    <Text style={[styles.buttonText, hasChangedImages && styles.buttonTextDisabled]}>
                      {hasChangedImages ? "Ya cambiaste las imágenes" : "Cambiar imágenes"}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.changeConceptButton, hasChangedConcept ? styles.changeConceptButtonDisabled : styles.changeConceptButtonAvailable]} 
                  onPress={handleChangeConcept}
                  disabled={hasChangedConcept}
                >
                  <View style={styles.buttonContent}>
                    <Feather 
                      name="shuffle" 
                      size={20} 
                      color={hasChangedConcept ? 'rgba(255, 255, 255, 0.4)' : 'white'} 
                    />
                    <Text style={[styles.buttonText, styles.changeConceptButtonText, hasChangedConcept && styles.changeConceptButtonTextDisabled]}>
                      {hasChangedConcept ? "Ya cambiaste el concepto" : "Cambiar concepto"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2, // Para aparecer por encima del overlay de contraste
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 80, // Reducido para mejor spacing
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roundIndicator: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', fontSize: 22, fontFamily: 'LuckiestGuy-Regular' },
  backButton: { 
    position: 'absolute', 
    top: 45, // Ajustado para mejor posición
    left: 20, 
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  audioButton: { 
    position: 'absolute', 
    top: 45, // Ajustado para mejor posición
    right: 20, 
    zIndex: 1,
  },
  backButtonText: { 
    color: 'white', 
    fontSize: 16,
    fontFamily: 'LuckiestGuy-Regular'
  },
  title: { 
    fontFamily: 'LuckiestGuy-Regular', 
    fontSize: 22, 
    color: 'white', 
    textAlign: 'center',
    marginBottom: 8,
  },
  // Badge del jugador en turno
  playerTurnBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#0093311',
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
  question: { 
    fontFamily: 'Poppins-Regular', 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.9)', 
    textAlign: 'center' 
  },
  conceptName: { 
    fontFamily: 'LuckiestGuy-Regular', 
    fontSize: 20, 
    color: '#FDB813' 
  },
  imageGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  imageWrapper: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  // Estilos para el skeleton loading
  skeletonContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonImage: {
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: 'white',
    elevation: 4,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 12,
    resizeMode: 'cover'
  },
  actionButtons: { 
    width: '100%',
    paddingBottom: 10, // Espacio adicional del bottom
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonAvailable: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 0,
    elevation: 1,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 0,
    elevation: 0,
  },
  buttonText: { 
    color: '#5D5FEF', 
    fontSize: 18, 
    fontFamily: 'LuckiestGuy-Regular'
  },
  buttonTextDisabled: {
    color: 'rgba(93, 95, 239, 0.4)',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LuckiestGuy-Regular',
  },
  changeConceptButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 0,
    elevation: 0,
  },
  changeConceptButtonAvailable: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 0,
    elevation: 0,
  },
  changeConceptButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0,
    elevation: 0,
  },

  changeConceptButtonText: {
    color: 'white',
  },
  changeConceptButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  selectedImage: {
    borderColor: '#FDB813',
    borderWidth: 4,
    transform: [{ scale: 1.02 }],
  },
});

export default GameScreen; 