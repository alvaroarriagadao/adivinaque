import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { needsOverlay, getContrastOverlay } from '../utils/textFormatters';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: any;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  backgroundColor = '#5D5FEF',
  edges = ['top', 'bottom', 'left', 'right'],
  style 
}) => {
  const overlayColor = getContrastOverlay(backgroundColor);
  const showOverlay = needsOverlay(backgroundColor);

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      edges={edges}
    >
      {showOverlay && (
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
      )}
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default SafeAreaWrapper; 