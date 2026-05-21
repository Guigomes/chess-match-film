import React from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions} from 'react-native';
import Svg, {Polygon, Circle, Text as SvgText} from 'react-native-svg';
import type {Point2D} from '../../services/vision/homography';
import type {CalibrationCorner} from '../../hooks/useCalibration';

interface CalibrationOverlayProps {
  corners: Partial<Record<CalibrationCorner, Point2D>>;
  nextCorner: CalibrationCorner | null;
  onTap: (pt: Point2D) => void;
  width: number;
  height: number;
}

const CORNER_LABELS: Record<CalibrationCorner, string> = {
  a8: 'a8\n↖',
  h8: 'h8\n↗',
  h1: 'h1\n↘',
  a1: 'a1\n↙',
};

const CORNER_ORDER: CalibrationCorner[] = ['a8', 'h8', 'h1', 'a1'];

export function CalibrationOverlay({corners, nextCorner, onTap, width, height}: CalibrationOverlayProps) {
  const tappedPoints = CORNER_ORDER.map((c) => corners[c]).filter(Boolean) as Point2D[];
  const polygonPoints = tappedPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const handleTap = (e: any) => {
    if (!nextCorner) {
      return;
    }
    const {locationX, locationY} = e.nativeEvent;
    onTap({x: locationX, y: locationY});
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.overlay, {width, height}]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {/* Board outline polygon */}
          {tappedPoints.length >= 3 && (
            <Polygon
              points={polygonPoints}
              fill="rgba(0, 200, 100, 0.15)"
              stroke="#00C864"
              strokeWidth={2}
            />
          )}
          {/* Corner markers */}
          {CORNER_ORDER.map((corner) => {
            const pt = corners[corner];
            if (!pt) {
              return null;
            }
            return (
              <React.Fragment key={corner}>
                <Circle cx={pt.x} cy={pt.y} r={14} fill="#00C864" opacity={0.85} />
                <SvgText x={pt.x + 18} y={pt.y + 5} fontSize={12} fill="#00C864" fontWeight="bold">
                  {corner}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {nextCorner && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>
              Toque no canto {CORNER_LABELS[nextCorner]}
            </Text>
          </View>
        )}

        {!nextCorner && (
          <View style={styles.instructionBanner}>
            <Text style={styles.instructionText}>Tabuleiro calibrado ✓</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, left: 0},
  instructionBanner: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {color: '#FFF', fontSize: 16, textAlign: 'center'},
});
