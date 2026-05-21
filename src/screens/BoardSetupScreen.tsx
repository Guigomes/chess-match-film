import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import {useCamera} from '../hooks/useCamera';
import {useCalibration} from '../hooks/useCalibration';
import {CalibrationOverlay} from '../components/camera/CalibrationOverlay';
import type {BoardSetupScreenProps} from '../types/navigation';
import {useAppStore} from '../store/useAppStore';
import {v4 as uuidv4} from 'uuid';
import type {GameSession} from '../types/chess';

export function BoardSetupScreen({navigation}: BoardSetupScreenProps) {
  const {device, hasPermission, requestPermission} = useCamera();
  const {corners, nextCorner, homography, isCalibrated, tapCorner, reset} = useCalibration();
  const setActiveSession = useAppStore((s) => s.setActiveSession);

  const handlePermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Permissão negada', 'Acesso à câmera é necessário para filmar a partida.');
    }
  }, [requestPermission]);

  const handleStart = useCallback(() => {
    if (!homography) {
      return;
    }

    const session: GameSession = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      whitePlayer: 'Brancas',
      blackPlayer: 'Pretas',
      event: '',
      site: 'Chess Match Film',
      moves: [],
      result: '*',
      videoPath: null,
      annotatedVideoPath: null,
      homography,
      pgn: '',
    };

    setActiveSession(session);
    navigation.navigate('Recording', {sessionId: session.id});
  }, [homography, navigation, setActiveSession]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Permissão de câmera necessária</Text>
        <TouchableOpacity style={styles.button} onPress={handlePermission}>
          <Text style={styles.buttonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Câmera não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={false}
        video={false}
      />
      <CalibrationOverlay
        corners={corners}
        nextCorner={nextCorner}
        onTap={tapCorner}
        width={styles.container.flex ? 0 : 0} // use onLayout
      />

      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Calibração do tabuleiro</Text>
        <TouchableOpacity onPress={reset} style={styles.resetBtn}>
          <Text style={styles.resetText}>Resetar</Text>
        </TouchableOpacity>
      </View>

      {isCalibrated && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>▶  Iniciar gravação</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111'},
  text: {color: '#FFF', fontSize: 16, marginBottom: 16},
  button: {backgroundColor: '#00C864', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8},
  buttonText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
  topBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarText: {color: '#FFF', fontSize: 18, fontWeight: '600'},
  resetBtn: {backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16},
  resetText: {color: '#FFF', fontSize: 14},
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#00C864',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 4,
  },
  startButtonText: {color: '#FFF', fontSize: 20, fontWeight: 'bold'},
});
