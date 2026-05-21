import React, {useCallback, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions} from 'react-native';
import {Camera, useCameraFormat} from 'react-native-vision-camera';
import type {RecordingScreenProps} from '../types/navigation';
import {useAppStore} from '../store/useAppStore';
import {useDetectionPipeline} from '../hooks/useDetectionPipeline';
import {useCamera} from '../hooks/useCamera';
import {MoveList} from '../components/game/MoveList';
import type {MoveRecord, GameSession} from '../types/chess';
import {saveGame} from '../services/storage/gameStorage';
import {useGameStore} from '../store/useGameStore';

const {width: SCREEN_W} = Dimensions.get('window');
const CAMERA_W = Math.floor(SCREEN_W * 0.7);

export function RecordingScreen({navigation}: RecordingScreenProps) {
  const {device} = useCamera();
  const settings = useAppStore((s) => s.settings);
  const activeSession = useAppStore((s) => s.activeSession);
  const updateActiveSession = useAppStore((s) => s.updateActiveSession);
  const upsertGame = useGameStore((s) => s.upsertGame);

  const cameraRef = useRef<Camera>(null);
  const recordingStartRef = useRef(Date.now());
  const [isDetecting, setIsDetecting] = useState(true);
  const [driftWarning, setDriftWarning] = useState(false);
  const [moves, setMoves] = useState<MoveRecord[]>([]);

  const handleMoveCommitted = useCallback(
    (record: MoveRecord, updatedSession: GameSession) => {
      setMoves([...updatedSession.moves]);
      updateActiveSession(updatedSession);
    },
    [updateActiveSession],
  );

  const handleCalibrationDrift = useCallback(() => {
    setDriftWarning(true);
  }, []);

  const {frameProcessor, getRecorder} = useDetectionPipeline({
    homography: activeSession?.homography ?? [],
    session: activeSession!,
    confidenceThreshold: settings.detectionConfidenceThreshold,
    stableFrameCount: settings.stableFrameCount,
    enabled: isDetecting,
    recordingStartTime: recordingStartRef.current,
    onMoveCommitted: handleMoveCommitted,
    onCalibrationDrift: handleCalibrationDrift,
  });

  const handleEndGame = useCallback(async () => {
    Alert.alert('Encerrar partida', 'Escolha o resultado:', [
      {
        text: 'Brancas vencem (1-0)',
        onPress: () => finalize('1-0'),
      },
      {
        text: 'Pretas vencem (0-1)',
        onPress: () => finalize('0-1'),
      },
      {
        text: 'Empate (½-½)',
        onPress: () => finalize('1/2-1/2'),
      },
      {
        text: 'Resultado desconhecido (*)',
        onPress: () => finalize('*'),
      },
      {text: 'Cancelar', style: 'cancel'},
    ]);
  }, []);

  const finalize = useCallback(
    async (result: '1-0' | '0-1' | '1/2-1/2' | '*') => {
      setIsDetecting(false);
      const recorder = getRecorder();
      const finalSession = recorder.finalizeGame(result);
      upsertGame(finalSession);
      await saveGame(finalSession);
      navigation.reset({
        index: 0,
        routes: [{name: 'BoardSetup'}],
      });
    },
    [getRecorder, upsertGame, navigation],
  );

  if (!device || !activeSession) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Erro ao iniciar gravação</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <View style={[styles.cameraContainer, {width: CAMERA_W}]}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          video={true}
          audio={false}
        />
        {driftWarning && (
          <TouchableOpacity
            style={styles.driftBanner}
            onPress={() => {
              setDriftWarning(false);
              navigation.navigate('BoardSetup');
            }}>
            <Text style={styles.driftText}>⚠ Alinhamento desviou — toque para re-calibrar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Move list panel */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Lances</Text>
          <Text style={styles.moveCount}>{moves.length}</Text>
        </View>
        <MoveList moves={moves} />
        <TouchableOpacity style={styles.endButton} onPress={handleEndGame}>
          <Text style={styles.endButtonText}>Encerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'row', backgroundColor: '#111'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111'},
  text: {color: '#FFF'},
  cameraContainer: {flex: 0, height: '100%'},
  sidebar: {flex: 1, backgroundColor: '#1A1A1A'},
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sidebarTitle: {color: '#FFF', fontSize: 16, fontWeight: '600'},
  moveCount: {color: '#888', fontSize: 14},
  endButton: {
    backgroundColor: '#C0392B',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endButtonText: {color: '#FFF', fontWeight: 'bold', fontSize: 15},
  driftBanner: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(200, 100, 0, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  driftText: {color: '#FFF', fontSize: 12, textAlign: 'center'},
});
