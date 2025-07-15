import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { formatConceptName } from '../../utils/textFormatters';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import AudioToggle from '../../components/AudioToggle';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

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
    setSelectedImage(image);
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

  return (
    <SafeAreaWrapper backgroundColor="#5D5FEF">
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
            <Animated.Text 
              style={styles.title}
              entering={FadeIn.duration(600)}
              key={`title-${currentPlayer.name}`}
            >
              Jugador en turno: {currentPlayer.name}
            </Animated.Text>
            <Animated.Text 
              style={styles.question}
              entering={FadeIn.delay(200).duration(600)}
              key={`question-${currentConcept}`}
            >
              ¿Cuál <Text style={styles.conceptName}>{formatConceptName(currentConcept)}</Text> te gusta más?
            </Animated.Text>
          </View>

          <View style={styles.imageGrid}>
            {currentImages.map((img, index) => (
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
            ))}
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
                  style={[styles.button, hasChangedImages && styles.buttonDisabled]} 
                  onPress={handleRefreshImages}
                  disabled={hasChangedImages}
                >
                  <Text style={[styles.buttonText, hasChangedImages && styles.buttonTextDisabled]}>
                    {hasChangedImages ? "Ya cambiaste las imágenes" : "Ver otras imágenes"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.changeConceptButton, hasChangedConcept && styles.changeConceptButtonDisabled]} 
                  onPress={handleChangeConcept}
                  disabled={hasChangedConcept}
                >
                    <Text style={[styles.buttonText, styles.changeConceptButtonText, hasChangedConcept && styles.changeConceptButtonTextDisabled]}>
                      {hasChangedConcept ? "Ya cambiaste el concepto" : "Cambiar concepto"}
                    </Text>
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
  container: { flex: 1 },
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
    marginBottom: 10,
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
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  changeConceptButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
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