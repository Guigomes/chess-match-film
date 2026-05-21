import React, {useEffect, useRef} from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import type {MoveRecord} from '../../types/chess';

interface MoveListProps {
  moves: MoveRecord[];
  highlightIndex?: number;
}

export function MoveList({moves, highlightIndex}: MoveListProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (moves.length > 0) {
      scrollRef.current?.scrollToEnd({animated: true});
    }
  }, [moves.length]);

  const movePairs: Array<{number: number; white?: MoveRecord; black?: MoveRecord}> = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {movePairs.map((pair) => (
        <View key={pair.number} style={styles.row}>
          <Text style={styles.moveNumber}>{pair.number}.</Text>
          <Text
            style={[
              styles.moveText,
              pair.white && moves.indexOf(pair.white) === highlightIndex && styles.highlighted,
            ]}>
            {pair.white?.san ?? ''}
          </Text>
          <Text
            style={[
              styles.moveText,
              pair.black && moves.indexOf(pair.black) === highlightIndex && styles.highlighted,
            ]}>
            {pair.black?.san ?? ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1A1A1A'},
  content: {padding: 8},
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: 2},
  moveNumber: {color: '#888', width: 28, fontSize: 13},
  moveText: {color: '#EEE', width: 52, fontSize: 14, fontFamily: 'monospace'},
  highlighted: {backgroundColor: '#3A5A3A', borderRadius: 4, color: '#7FFF7F'},
});
