import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import type {HomeScreenProps} from '../types/navigation';
import {useGameStore} from '../store/useGameStore';
import {loadAllGames} from '../services/storage/gameStorage';

export function HomeScreen({navigation}: HomeScreenProps) {
  const {games, setGames} = useGameStore();

  useEffect(() => {
    loadAllGames().then(setGames).catch(console.warn);
  }, [setGames]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess Match Film</Text>

      <TouchableOpacity
        style={styles.newGameButton}
        onPress={() => navigation.navigate('Record' as any)}>
        <Text style={styles.newGameText}>▶  Nova partida</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Partidas recentes</Text>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma partida ainda. Inicie sua primeira!</Text>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('Games' as any, {sessionId: item.id} as any)}>
            <Text style={styles.gamePlayers}>
              {item.whitePlayer} vs {item.blackPlayer}
            </Text>
            <View style={styles.gameCardRow}>
              <Text style={styles.gameDate}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.gameResult}>{item.result}</Text>
              <Text style={styles.gameMoves}>{item.moves.length} lances</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111', padding: 16},
  title: {color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 24, marginTop: 8},
  newGameButton: {
    backgroundColor: '#00C864',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  newGameText: {color: '#FFF', fontSize: 20, fontWeight: 'bold'},
  sectionTitle: {color: '#AAA', fontSize: 14, fontWeight: '600', marginBottom: 12},
  emptyText: {color: '#555', textAlign: 'center', marginTop: 48, fontSize: 15},
  gameCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  gamePlayers: {color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 6},
  gameCardRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  gameDate: {color: '#888', fontSize: 12},
  gameResult: {color: '#00C864', fontSize: 13, fontWeight: 'bold'},
  gameMoves: {color: '#666', fontSize: 12},
});
