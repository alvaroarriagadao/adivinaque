import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';

const SoundToggle = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { soundEnabled, toggleSound } = useSettingsStore();

  const handlePresentModalPress = useCallback(() => {
    console.log('SoundToggle pressed'); // Para debug
    bottomSheetModalRef.current?.present();
  }, []);
  
  const handleCloseModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const snapPoints = ['30%'];

  return (
    <>
      <TouchableOpacity 
        onPress={handlePresentModalPress}
        style={styles.settingsButton}
        activeOpacity={0.7}
      >
        <Feather name="settings" size={28} color="white" />
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.modalBackground}
        handleIndicatorStyle={styles.modalHandle}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.modalTitle}>Configuración</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Música de fondo</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
              onValueChange={toggleSound}
              value={soundEnabled}
            />
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleCloseModalPress}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBackground: {
    backgroundColor: '#1E2A3E',
    borderTopWidth: 2,
    borderTopColor: '#5D5FEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHandle: {
    backgroundColor: '#5D5FEF',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: 'white',
    marginBottom: 24,
    textAlign: 'center'
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  settingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#5D5FEF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: 'white',
  },
});

export default SoundToggle; 