import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {MainTabParamList, RecordStackParamList, GamesStackParamList} from '../types/navigation';
import {HomeScreen} from '../screens/HomeScreen';
import {BoardSetupScreen} from '../screens/BoardSetupScreen';
import {RecordingScreen} from '../screens/RecordingScreen';
import {GameListScreen} from '../screens/GameListScreen';
import {GameDetailScreen} from '../screens/GameDetailScreen';
import {Text} from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const RecordStack = createNativeStackNavigator<RecordStackParamList>();
const GamesStack = createNativeStackNavigator<GamesStackParamList>();

function RecordStackNavigator() {
  return (
    <RecordStack.Navigator screenOptions={{headerShown: false}}>
      <RecordStack.Screen name="BoardSetup" component={BoardSetupScreen} />
      <RecordStack.Screen name="Recording" component={RecordingScreen} />
    </RecordStack.Navigator>
  );
}

function GamesStackNavigator() {
  return (
    <GamesStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1A1A1A'},
        headerTintColor: '#FFF',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <GamesStack.Screen name="GameList" component={GameListScreen} options={{title: 'Partidas'}} />
      <GamesStack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={{title: 'Detalhes'}}
      />
    </GamesStack.Navigator>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {backgroundColor: '#1A1A1A', borderTopColor: '#333'},
        tabBarActiveTintColor: '#00C864',
        tabBarInactiveTintColor: '#666',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordStackNavigator}
        options={{
          tabBarLabel: 'Gravar',
          tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>🎥</Text>,
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesStackNavigator}
        options={{
          tabBarLabel: 'Partidas',
          tabBarIcon: ({color}) => <Text style={{fontSize: 20, color}}>♟️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
