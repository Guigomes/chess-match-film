import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {ONBOARDING_DONE_KEY} from '../constants/app';
import {useAppStore} from '../store/useAppStore';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}

const STEPS = [
  {icon: '📷', title: 'Posicione o celular', body: 'Coloque o celular acima do tabuleiro, com a câmera voltada para baixo. Um ângulo de 45–90° funciona melhor.'},
  {icon: '🎯', title: 'Calibre os 4 cantos', body: 'Toque nos 4 cantos do tabuleiro na tela para que o app saiba onde estão as casas a1, a8, h1 e h8.'},
  {icon: '♟️', title: 'Jogue normalmente', body: 'O app detecta as peças e registra os lances automaticamente em notação algébrica (PGN).'},
  {icon: '📤', title: 'Exporte o PGN', body: 'Ao final, compartilhe ou copie o PGN para usar em qualquer software de xadrez.'},
];

export function OnboardingScreen({navigation}: Props) {
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  const handleDone = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    setOnboardingDone(true);
    navigation.replace('Main');
  }, [navigation, setOnboardingDone]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Match Film</Text>
      <Text style={styles.subtitle}>Filme e anote suas partidas automaticamente</Text>

      {STEPS.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={styles.stepIcon}>{step.icon}</Text>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleDone}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111', padding: 24, justifyContent: 'center'},
  title: {color: '#FFF', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8},
  subtitle: {color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 40},
  step: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24},
  stepIcon: {fontSize: 32, marginRight: 16, marginTop: 2},
  stepText: {flex: 1},
  stepTitle: {color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 4},
  stepBody: {color: '#AAA', fontSize: 14, lineHeight: 20},
  button: {
    backgroundColor: '#00C864',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {color: '#FFF', fontSize: 20, fontWeight: 'bold'},
});
