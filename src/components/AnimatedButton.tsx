import React from 'react';
import { Pressable, StyleSheet, Text, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface AnimatedButtonProps {
  onPress: () => void;
  text: string;
  style?: object;
  textStyle?: object;
}

const AnimatedButton = ({ onPress, text, style, textStyle }: AnimatedButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[styles.button, style, animatedStyle]}>
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: Platform.OS === 'android' ? 12 : 15,
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 8 : 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    color: '#0A4B8F',
    fontSize: Platform.OS === 'android' ? 18 : 20,
  },
});

export default AnimatedButton; 