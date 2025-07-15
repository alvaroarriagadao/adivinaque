import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SafeAreaWrapper from '../../components/SafeAreaWrapper';

const RulesScreen = ({ navigation }: { navigation: any }) => {
  return (
    <SafeAreaWrapper backgroundColor="rgba(0,0,0,0.5)" style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reglas del Juego</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="x-circle" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.ruleSection}>
            <Text style={styles.sectionTitle}>🎯 Objetivo</Text>
            <Text style={styles.sectionText}>
              Crea un lobby de al menos 2 jugadores y asigna nombres/avatares.
            </Text>
          </View>
          <View style={styles.ruleSection}>
            <Text style={styles.sectionTitle}>🔄 Cada Ronda</Text>
            <Text style={styles.sectionText}>
              Hay un Jugador en Turno (JET) que elige su imagen favorita en secreto. El teléfono se pasa al resto —los Votantes— que intentan adivinar la elección del JET.
            </Text>
          </View>
          <View style={styles.ruleSection}>
            <Text style={styles.sectionTitle}>🏆 Puntuación</Text>
            <Text style={styles.sectionText}>
              Si al menos un Votante acierta, el JET gana 1 punto; cada Votante acertante gana 3 puntos.
            </Text>
          </View>
          <View style={styles.ruleSection}>
            <Text style={styles.sectionTitle}>🎲 Duración</Text>
            <Text style={styles.sectionText}>
              Con 2-5 jugadores se juegan 3 rondas por persona. Con 6 o más jugadores, se juegan 2 rondas por persona.
            </Text>
          </View>
          <View style={styles.ruleSection}>
            <Text style={styles.sectionTitle}>🎉 ¡A Jugar!</Text>
            <Text style={styles.sectionText}>
              ¡Quien acumule más puntos conoce mejor a sus amigos!
            </Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>¡Entendido!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'LuckiestGuy-Regular',
    color: '#0A4B8F',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  ruleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'LuckiestGuy-Regular',
    marginBottom: 8,
    color: '#0A4B8F',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  closeButton: {
    backgroundColor: '#2A8BF2',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2A8BF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LuckiestGuy-Regular',
  },
});

export default RulesScreen; 