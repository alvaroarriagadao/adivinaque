import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';

const AudioToggle = () => {
  const { soundEnabled, toggleSound } = useSettingsStore();

  return (
    <TouchableOpacity 
      onPress={toggleSound}
      style={styles.audioButton}
      activeOpacity={0.7}
    >
      <Feather 
        name={soundEnabled ? "volume-2" : "volume-x"} 
        size={24} 
        color="white" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default AudioToggle; 