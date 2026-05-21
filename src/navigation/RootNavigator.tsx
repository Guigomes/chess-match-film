import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {RootStackParamList} from '../types/navigation';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {MainTabNavigator} from './MainTabNavigator';
import {ONBOARDING_DONE_KEY} from '../constants/app';
import {useAppStore} from '../store/useAppStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_DONE_KEY).then((val) => {
      if (val === 'true') {
        setOnboardingDone(true);
        setInitialRoute('Main');
      } else {
        setInitialRoute('Onboarding');
      }
    });
  }, [setOnboardingDone]);

  if (!initialRoute) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{headerShown: false}}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
