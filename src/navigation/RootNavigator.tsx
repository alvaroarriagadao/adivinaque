import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import RulesScreen from '../screens/Rules';
import LobbyScreen from '../screens/Lobby';
import GameOrchestrator from '../screens/GameOrchestrator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Group>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Game" component={GameOrchestrator} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
        <Stack.Screen 
          name="Rules" 
          component={RulesScreen} 
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default RootNavigator; 