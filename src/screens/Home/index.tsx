import React from 'react';
import { View, Text, StyleSheet, BackHandler, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import SoundToggle from '../../components/SoundToggle';
import AnimatedButton from '../../components/AnimatedButton';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);

  React.useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 800 });
    titleScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  // Manejar el botón back de Android
  React.useEffect(() => {
    const backAction = () => {
      handleExit();
      return true; // Prevenir el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ scale: titleScale.value }],
    };
  });

  const handleExit = () => {
    Alert.alert(
      "Salir de la aplicación",
      "¿Estás seguro que deseas salir?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            console.log('🚪 Cerrando aplicación...');
            
            if (Platform.OS === 'android') {
              // En Android, BackHandler funciona perfectamente
              BackHandler.exitApp();
            } else {
              // En iOS/simulador, mostrar mensaje informativo
              Alert.alert(
                "Cerrar aplicación",
                "En iOS, usa el botón Home o desliza hacia arriba para cerrar la app. En el simulador, usa Cmd+Q.",
                [{ text: "Entendido" }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#5D5FEF', '#1E2A3E']} style={styles.container}>
      <SafeAreaWrapper backgroundColor="transparent">
        <View style={styles.header}>
          <SoundToggle />
        </View>
        <View style={styles.content}>
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <Text style={styles.title}>¡ADIVINA QUÉ!</Text>
            <Text style={styles.subtitle}>¿Conoces bien a tus amig@s?</Text>
          </Animated.View>
          
          <LottieView
            source={require('../../../assets/lottie/welcome.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          
          <View style={styles.buttonsContainer}>
            <AnimatedButton
              text="Jugar"
              onPress={() => {
                console.log('🎮 Botón Jugar presionado');
                navigation.navigate('Lobby');
              }}
              style={styles.playButton}
              textStyle={styles.playButtonText}
            />
            <AnimatedButton
              text="Reglas"
              onPress={() => {
                console.log('📖 Botón Reglas presionado');
                navigation.navigate('Rules');
              }}
              style={styles.rulesButton}
              textStyle={styles.buttonText}
            />
            <AnimatedButton
              text="Salir"
              onPress={() => {
                console.log('🚪 Botón Salir presionado');
                handleExit();
              }}
              style={styles.exitButton}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </SafeAreaWrapper>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
    paddingTop: 20, // Espacio adicional para Android
  },
  content: {
    flex: 1,
    justifyContent: Platform.OS === 'android' ? 'space-between' : 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: Platform.OS === 'android' ? 56 : 64,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: Platform.OS === 'android' ? 18 : 18,
    color: '#FFF813',
    marginTop: Platform.OS === 'android' ? 6 : 8,
    fontWeight: '600',
    marginBottom: Platform.OS === 'android' ? 15 : 20,
  },
  lottie: {
    width: Platform.OS === 'android' ? 280 : 320,
    height: Platform.OS === 'android' ? 280 : 320,
    marginBottom: Platform.OS === 'android' ? 10 : 20,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: Platform.OS === 'android' ? 280 : 300,
    marginTop: Platform.OS === 'android' ? 0 : 'auto',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playButton: { backgroundColor: '#4CAF50' },
  playButtonText: { color: 'white' },
  rulesButton: { backgroundColor: '#2196F3' },
  exitButton: { backgroundColor: '#F44336' },
  buttonText: { 
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
});

export default HomeScreen; 