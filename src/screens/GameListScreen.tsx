import React, {useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import type {GameListScreenProps} from '../types/navigation';
import {useGameStore} from '../store/useGameStore';
import {loadAllGames} from '../services/storage/gameStorage';

export function GameListScreen({navigation}: GameListScreenProps) {
  const {games, setGames} = useGameStore();

  useEffect(() => {
    loadAllGames().then(setGames).catch(console.warn);
  }, [setGames]);

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma partida gravada ainda.</Text>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GameDetail', {sessionId: item.id})}>
            <Text style={styles.players}>
              {item.whitePlayer} vs {item.blackPlayer}
            </Text>
            <View style={styles.row}>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.result}>{item.result}</Text>
              <Text style={styles.moves}>{item.moves.length} lances</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#111', padding: 12},
  emptyText: {color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15},
  card: {backgroundColor: '#1E1E1E', borderRadius: 10, padding: 14, marginBottom: 10},
  players: {color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 6},
  row: {flexDirection: 'row', gap: 12},
  date: {color: '#888', fontSize: 12},
  result: {color: '#00C864', fontSize: 13, fontWeight: 'bold'},
  moves: {color: '#666', fontSize: 12},
});
