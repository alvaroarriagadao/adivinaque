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
            <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
              <AnimatedButton
                text="Jugar"
                onPress={() => navigation.navigate('Lobby')}
                style={styles.playButton}
                textStyle={styles.playButtonText}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(400).duration(800).springify()}>
              <AnimatedButton
                text="Reglas"
                onPress={() => navigation.navigate('Rules')}
                style={styles.rulesButton}
                textStyle={styles.buttonText}
              />
            </Animated.View>
             <Animated.View entering={FadeInDown.delay(600).duration(800).springify()}>
              <AnimatedButton
                text="Salir"
                onPress={handleExit}
                style={styles.exitButton}
                textStyle={styles.buttonText}
              />
            </Animated.View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20, // Espacio adicional para Android
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LuckiestGuy-Regular',
    fontSize: 64,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#FFF813',
    marginTop: 8,
    fontWeight: '600',
    marginBottom: 20,
  },
  lottie: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
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
  rulesButton: { backgroundColor: '#FDB813' },
  exitButton: { backgroundColor: '#607D8B' },
  buttonText: { 
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
});

export default HomeScreen; 