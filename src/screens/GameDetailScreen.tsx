import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Share, Dimensions, ScrollView} from 'react-native';
import type {GameDetailScreenProps} from '../types/navigation';
import {ChessBoard} from '../components/board/ChessBoard';
import {MoveList} from '../components/game/MoveList';
import {useGameStore} from '../store/useGameStore';
import {sessionToPgnString} from '../services/chess/pgnExporter';
import type {BoardState} from '../types/chess';
import {BOARD_GRID_SIZE} from '../constants/chess';

const {width: SCREEN_W} = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 32, 360);

function emptyBoard(): BoardState {
  return Array.from({length: BOARD_GRID_SIZE}, () => new Array(BOARD_GRID_SIZE).fill(null));
}

export function GameDetailScreen({route}: GameDetailScreenProps) {
  const {sessionId} = route.params;
  const game = useGameStore((s) => s.games.find((g) => g.id === sessionId));
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number>(-1);

  if (!game) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Partida não encontrada</Text>
      </View>
    );
  }

  const currentBoard: BoardState =
    currentMoveIdx < 0
      ? emptyBoard()
      : game.moves[currentMoveIdx]?.boardStateAfter ?? emptyBoard();

  const lastMove =
    currentMoveIdx >= 0
      ? {
          from: game.moves[currentMoveIdx].uci.slice(0, 2),
          to: game.moves[currentMoveIdx].uci.slice(2, 4),
        }
      : undefined;

  const handleShare = useCallback(async () => {
    const pgn = sessionToPgnString(game);
    await Share.share({message: pgn, title: `${game.whitePlayer} vs ${game.blackPlayer}`});
  }, [game]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {game.whitePlayer} vs {game.blackPlayer}
      </Text>
      <Text style={styles.subtitle}>
        {new Date(game.createdAt).toLocaleDateString('pt-BR')} · Resultado: {game.result}
      </Text>

      <View style={styles.boardWrapper}>
        <ChessBoard boardState={currentBoard} size={BOARD_SIZE} lastMove={lastMove} />
      </View>

      {/* Step controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setCurrentMoveIdx(-1)}
          disabled={currentMoveIdx < 0}>
          <Text style={styles.controlText}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setCurrentMoveIdx((i) => Math.max(-1, i - 1))}
          disabled={currentMoveIdx < 0}>
          <Text style={styles.controlText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.moveCounter}>
          {currentMoveIdx + 1} / {game.moves.length}
        </Text>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setCurrentMoveIdx((i) => Math.min(game.moves.length - 1, i + 1))}
          disabled={currentMoveIdx >= game.moves.length - 1}>
          <Text style={styles.controlText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setCurrentMoveIdx(game.moves.length - 1)}
          disabled={currentMoveIdx >= game.moves.length - 1}>
          <Text style={styles.controlText}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.moveListContainer}>
        <MoveList moves={game.moves} highlightIndex={currentMoveIdx} />
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareText}>Exportar PGN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111'},
  content: {padding: 16, alignItems: 'center'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111'},
  text: {color: '#FFF'},
  title: {color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center'},
  subtitle: {color: '#888', fontSize: 13, marginTop: 4, marginBottom: 16},
  boardWrapper: {marginBottom: 16},
  controls: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16},
  controlBtn: {
    backgroundColor: '#2A2A2A',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {color: '#FFF', fontSize: 18},
  moveCounter: {color: '#AAA', fontSize: 14, minWidth: 60, textAlign: 'center'},
  moveListContainer: {width: '100%', height: 200, marginBottom: 16},
  shareButton: {
    backgroundColor: '#2A6FDB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 32,
  },
  shareText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
});
