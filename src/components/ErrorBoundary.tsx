import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary capturó un error:', error);
    console.error('🚨 Stack trace:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });

    // Aquí podrías enviar el error a un servicio de analytics como Crashlytics
    // this.logErrorToService(error, errorInfo);
  }

  handleRestart = () => {
    Alert.alert(
      'Reiniciar aplicación',
      '¿Estás seguro de que quieres reiniciar la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', onPress: () => this.setState({ hasError: false, error: null, errorInfo: null }) },
      ]
    );
  };

  handleShareError = async () => {
    const errorMessage = `
🚨 Error en Adivina qué

Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}

Fecha: ${new Date().toISOString()}
    `.trim();

    try {
      await Share.share({
        message: errorMessage,
        title: 'Error Report - Adivina qué',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>🚨 Error Detectado</Text>
              <Text style={styles.subtitle}>
                La aplicación encontró un error inesperado
              </Text>
            </View>

            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Detalles del Error:</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || 'Error desconocido'}
              </Text>
            </View>

            {this.state.error?.stack && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>Stack Trace:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.error.stack}
                </Text>
              </View>
            )}

            {this.state.errorInfo?.componentStack && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                <Text style={styles.buttonText}>🔄 Reiniciar App</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={this.handleShareError}>
                <Text style={styles.buttonText}>📤 Compartir Error</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                💡 Si el problema persiste, comparte este error con el equipo de desarrollo.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2A3E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  errorSection: {
    marginBottom: 20,
    backgroundColor: '#2A3F5F',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD93D',
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  errorMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'SpaceMono-Regular',
  },
  stackTrace: {
    fontSize: 12,
    color: '#B8C5D6',
    fontFamily: 'SpaceMono-Regular',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#45B7D1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  infoSection: {
    backgroundColor: '#2A3F5F',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

export default ErrorBoundary; 