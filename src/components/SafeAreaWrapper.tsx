import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default SafeAreaWrapper; 