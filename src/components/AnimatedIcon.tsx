import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface AnimatedIconProps {
  children: React.ReactNode;
  size?: number;
  style?: any;
  animationType?: 'bounce' | 'pulse' | 'rotate' | 'scale';
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  children, 
  size = 250, 
  style,
  animationType = 'bounce'
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    switch (animationType) {
      case 'bounce':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.1, { damping: 2, stiffness: 80 }),
            withSpring(1, { damping: 2, stiffness: 80 })
          ),
          -1,
          true
        );
        break;
      case 'pulse':
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'rotate':
        rotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1,
          false
        );
        break;
      case 'scale':
        scale.value = withRepeat(
          withSequence(
            withSpring(1.05, { damping: 3, stiffness: 100 }),
            withSpring(1, { damping: 3, stiffness: 100 })
          ),
          -1,
          true
        );
        break;
    }
  }, [animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedIcon; 