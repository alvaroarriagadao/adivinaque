import { useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useSettingsStore } from './settingsStore';

export const useSoundManager = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const { soundEnabled } = useSettingsStore();

  useEffect(() => {
    const loadSound = async () => {
      if (soundRef.current) return;

      try {
        console.log('🎵 Cargando música de fondo...');
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/song.mp3'),
          { 
            shouldPlay: soundEnabled, // Reproducir automáticamente si está habilitado
            isLooping: true, 
            volume: 0.5 
          }
        );
        soundRef.current = sound;
        console.log('✅ Música de fondo cargada exitosamente');
        
        // Asegurar que se reproduzca si soundEnabled es true
        if (soundEnabled) {
          await sound.playAsync();
          console.log('🎵 Música iniciada automáticamente');
        }
      } catch (error) {
        console.log('⚠️ Error cargando música (continuando sin sonido):', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [soundEnabled]); // Agregar soundEnabled como dependencia

  useEffect(() => {
    const updateSoundState = async () => {
      if (!soundRef.current) return;

      try {
        if (soundEnabled) {
          await soundRef.current.setIsMutedAsync(false);
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await soundRef.current.playAsync();
            console.log('🎵 Música reanudada');
          }
        } else {
          await soundRef.current.pauseAsync();
          await soundRef.current.setIsMutedAsync(true);
          console.log('🔇 Música pausada');
        }
      } catch (error) {
        console.log('⚠️ Error controlando música:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    updateSoundState();
  }, [soundEnabled]);

  return null;
}; 