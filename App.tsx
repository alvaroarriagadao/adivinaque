import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useSoundManager } from './src/store/useSoundManager';
import { useFonts } from 'expo-font';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from './src/store/gameStore';
import * as SplashScreen from 'expo-splash-screen';

export default function App() {
  useSoundManager();
  const { initializeAssets, gamePhase } = useGameStore();

  const [fontsLoaded, fontError] = useFonts({
    'LuckiestGuy-Regular': require('./assets/fonts/LuckiestGuy-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    // Evita que el splash screen nativo se oculte automáticamente
    SplashScreen.preventAutoHideAsync();
    
    console.log('📱 App iniciando, inicializando assets...');
    initializeAssets();
  }, []);

  // Función para ocultar el splash screen
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && gamePhase !== 'initializing') {
      // Oculta el splash screen una vez que todo está listo
      await SplashScreen.hideAsync();
      console.log('✅ Todo listo, ocultando splash screen.');
    }
  }, [fontsLoaded, gamePhase]);

  // Si las fuentes no están cargadas o el juego se está inicializando, no renderizamos nada.
  // El splash screen nativo seguirá visible.
  if (!fontsLoaded || fontError || gamePhase === 'initializing') {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2A3E', // Fondo consistente
  },
});
