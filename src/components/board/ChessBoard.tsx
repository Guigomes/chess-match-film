import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Rect, Text as SvgText} from 'react-native-svg';
import type {BoardState} from '../../types/chess';
import {PieceIcon} from './PieceIcon';

interface ChessBoardProps {
  boardState: BoardState;
  size: number;
  lastMove?: {from: string; to: string};
  flipped?: boolean;
}

const LIGHT = '#F0D9B5';
const DARK = '#B58863';
const LAST_MOVE_HIGHLIGHT = 'rgba(255, 255, 0, 0.4)';

export function ChessBoard({boardState, size, lastMove, flipped = false}: ChessBoardProps) {
  const cellSize = size / 8;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {Array.from({length: 8}, (_, rankIdx) =>
          Array.from({length: 8}, (_, fileIdx) => {
            const displayRank = flipped ? rankIdx : 7 - rankIdx;
            const displayFile = flipped ? 7 - fileIdx : fileIdx;
            const file = String.fromCharCode(97 + displayFile);
            const rank = String(displayRank + 1);
            const square = `${file}${rank}`;
            const isLight = (fileIdx + rankIdx) % 2 === 0;
            const isLastMove = lastMove && (square === lastMove.from || square === lastMove.to);
            const x = fileIdx * cellSize;
            const y = rankIdx * cellSize;
            const piece = boardState[displayRank][displayFile];

            return (
              <React.Fragment key={square}>
                <Rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={isLight ? LIGHT : DARK}
                />
                {isLastMove && (
                  <Rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={LAST_MOVE_HIGHLIGHT}
                  />
                )}
                {piece && (
                  <PieceIcon
                    type={piece.type}
                    color={piece.color}
                    size={cellSize}
                    x={x}
                    y={y}
                  />
                )}
                {/* Rank labels on left column */}
                {fileIdx === 0 && (
                  <SvgText
                    x={x + 2}
                    y={y + 12}
                    fontSize={10}
                    fill={isLight ? DARK : LIGHT}
                    fontWeight="bold">
                    {rank}
                  </SvgText>
                )}
                {/* File labels on bottom row */}
                {rankIdx === 7 && (
                  <SvgText
                    x={x + cellSize - 10}
                    y={y + cellSize - 2}
                    fontSize={10}
                    fill={isLight ? DARK : LIGHT}
                    fontWeight="bold">
                    {file}
                  </SvgText>
                )}
              </React.Fragment>
            );
          }),
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#7B5E3A',
  },
});
