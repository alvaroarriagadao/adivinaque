import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing,
  withDelay
} from 'react-native-reanimated';

interface ConfettiPieceProps {
  color: string;
  delay: number;
  position: { x: number; y: number };
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ color, delay, position }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const startAnimation = () => {
      translateY.value = withDelay(
        delay,
        withSequence(
          withSpring(position.y, { damping: 8, stiffness: 50 }),
          withTiming(position.y + 100, { duration: 2000, easing: Easing.out(Easing.quad) })
        )
      );

      translateX.value = withDelay(
        delay,
        withSpring(position.x, { damping: 8, stiffness: 50 })
      );

      rotation.value = withDelay(
        delay,
        withRepeat(
          withTiming(360, { duration: 1500, easing: Easing.linear }),
          -1,
          false
        )
      );

      opacity.value = withDelay(
        delay + 1500,
        withTiming(0, { duration: 500 })
      );
    };

    startAnimation();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.confettiPiece, 
        { backgroundColor: color },
        animatedStyle
      ]} 
    />
  );
};

const Confetti: React.FC = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    delay: Math.random() * 1000,
    position: {
      x: Math.random() * 400 - 200,
      y: Math.random() * 300 + 100
    }
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          color={piece.color}
          delay={piece.delay}
          position={piece.position}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default Confetti; 