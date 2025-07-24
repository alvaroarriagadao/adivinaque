import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, Alert, Vibration } from 'react-native';
import { useGameStore, PLAYER_COLORS } from '../../store/gameStore';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { Layout, Easing, FadeInUp, FadeOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const LobbyScreen = ({ navigation }: { navigation: any }) => {
  const { players, addPlayer, removePlayer, updatePlayerColor, startGame, gamePhase, isLoading } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  useEffect(() => {
    if (gamePhase === 'turn_selection') {
      navigation.navigate('Game');
    }
  }, [gamePhase, navigation]);

  const getUniqueColor = () => {
    const usedColors = players.map(p => p.color);
    const available = PLAYER_COLORS.filter(c => !usedColors.includes(c));
    if (available.length > 0) return available[0];
    // Si no hay colores únicos, retorna uno aleatorio y muestra aviso
    return null;
  };

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      const color = getUniqueColor();
      if (!color) {
        Alert.alert('Colores agotados', 'No hay más colores únicos disponibles. Elige un color diferente para algún jugador.');
        return;
      }
      addPlayer(playerName.trim());
      setPlayerName('');
      if (Platform.OS !== 'web') Vibration.vibrate(80);
    }
  };

  const canStartGame = players.length >= 2;

  // Función para obtener el color del jugador
  const getPlayerColor = (player: any) => {
    return player.color || '#5D5FEF'; // Color por defecto si no tiene
  };

  // Función para abrir el selector de colores
  const openColorPicker = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setColorPickerVisible(true);
  };

  // Función para cambiar el color de un jugador
  const changePlayerColor = (newColor: string) => {
    if (selectedPlayerId) {
      updatePlayerColor(selectedPlayerId, newColor);
    }
    setColorPickerVisible(false);
    setSelectedPlayerId(null);
    if (Platform.OS !== 'web') Vibration.vibrate(80);
  };

  // Obtener colores disponibles (no usados por otros jugadores)
  const getAvailableColors = () => {
    const usedColors = players.map(p => p.color);
    return PLAYER_COLORS.filter(color => !usedColors.includes(color));
  };

  const handleShowTooltip = (playerId: string) => {
    setTooltipVisible(playerId);
    setTimeout(() => setTooltipVisible(null), 1500);
  };

  return (
    <SafeAreaWrapper backgroundColor="#1E2A3E">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Modal
          transparent={true}
          animationType="fade"
          visible={isLoading}
        >
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </Modal>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Feather name="home" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Añade Jugadores</Text>
          <View style={{width: 28}} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputEmoji}>👤</Text>
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
                <View style={styles.playerInfoRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: getPlayerColor(item) }]}> 
                    <MaterialCommunityIcons name="account" size={22} color="#fff" />
                  </View>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.colorChangeButton}
                    onPress={() => { openColorPicker(item.id); handleShowTooltip(item.id); }}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="palette" size={22} color="white" />
                  </TouchableOpacity>
                  {tooltipVisible === item.id && (
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.tooltip}>
                      <Text style={styles.tooltipText}>Cambia tu color</Text>
                    </Animated.View>
                  )}
                  <TouchableOpacity onPress={() => removePlayer(item.id)} style={styles.removeButton}>
                    <Feather name="x-circle" size={22} color="#F44336" />
                  </TouchableOpacity>
                </View>
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

      {/* Modal de selección de colores */}
      <Modal
        visible={colorPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setColorPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerModal}>
            <Text style={styles.colorPickerTitle}>Elige un color</Text>
            <View style={styles.colorGrid}>
              {getAvailableColors().map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => changePlayerColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedPlayerId && players.find(p => p.id === selectedPlayerId)?.color === color && (
                    <Feather name="check" size={20} color="white" style={styles.colorCheckIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setColorPickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerColorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorEditIcon: {
    opacity: 0.8,
  },
  playerName: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  colorChangeButton: {
    marginLeft: 8,
    marginRight: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(42, 139, 242, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A8BF2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  // Estilos del modal de selección de colores
  modalOverlay: {
    flex: 1,
    backgroundColor: '#232B3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerModal: {
    backgroundColor: '#2C3E50',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  colorPickerTitle: {
    fontSize: 20,
    fontFamily: 'LuckiestGuy-Regular',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorCheckIcon: {
    opacity: 0.9,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginLeft: 2 },
  paletteIcon: { fontSize: 16, position: 'absolute', right: -10, bottom: -10, zIndex: 2 },
  tooltip: { position: 'absolute', top: -38, left: -20, backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  tooltipText: { color: 'white', fontSize: 13, fontFamily: 'Poppins-Bold' },
});

export default LobbyScreen; 