import React from 'react';
import {G, Path, Circle, Rect} from 'react-native-svg';
import type {PieceColor, PieceType} from '../../types/chess';

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  size: number;
  x?: number;
  y?: number;
}

// Simplified SVG paths for each piece — Unicode chess symbols rendered as paths
const FILL: Record<PieceColor, string> = {w: '#FFFFFF', b: '#2C2C2C'};
const STROKE: Record<PieceColor, string> = {w: '#333333', b: '#000000'};

export function PieceIcon({type, color, size, x = 0, y = 0}: PieceIconProps) {
  const s = size;
  const fill = FILL[color];
  const stroke = STROKE[color];
  const sw = s * 0.04;

  return (
    <G transform={`translate(${x}, ${y})`}>
      {renderPiece(type, s, fill, stroke, sw)}
    </G>
  );
}

function renderPiece(
  type: PieceType,
  s: number,
  fill: string,
  stroke: string,
  sw: number,
): React.ReactElement {
  const cx = s / 2;
  const cy = s / 2;

  switch (type) {
    case 'k':
      return (
        <G>
          <Circle cx={cx} cy={cy} r={s * 0.38} fill={fill} stroke={stroke} strokeWidth={sw} />
          {/* Crown top */}
          <Rect x={cx - s * 0.06} y={s * 0.1} width={s * 0.12} height={s * 0.2} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Rect x={cx - s * 0.22} y={s * 0.18} width={s * 0.44} height={s * 0.08} fill={fill} stroke={stroke} strokeWidth={sw} />
        </G>
      );
    case 'q':
      return (
        <G>
          <Circle cx={cx} cy={cy} r={s * 0.36} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Circle cx={cx} cy={s * 0.18} r={s * 0.1} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Circle cx={cx - s * 0.25} cy={s * 0.22} r={s * 0.09} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Circle cx={cx + s * 0.25} cy={s * 0.22} r={s * 0.09} fill={fill} stroke={stroke} strokeWidth={sw} />
        </G>
      );
    case 'r':
      return (
        <G>
          <Rect x={cx - s * 0.3} y={s * 0.2} width={s * 0.6} height={s * 0.6} fill={fill} stroke={stroke} strokeWidth={sw} rx={s * 0.04} />
          <Rect x={cx - s * 0.32} y={s * 0.12} width={s * 0.18} height={s * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Rect x={cx - s * 0.09} y={s * 0.12} width={s * 0.18} height={s * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Rect x={cx + s * 0.14} y={s * 0.12} width={s * 0.18} height={s * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
        </G>
      );
    case 'b':
      return (
        <G>
          <Path
            d={`M${cx},${s * 0.1} Q${cx + s * 0.28},${s * 0.5} ${cx + s * 0.25},${s * 0.8} L${cx - s * 0.25},${s * 0.8} Q${cx - s * 0.28},${s * 0.5} ${cx},${s * 0.1}Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <Circle cx={cx} cy={s * 0.15} r={s * 0.08} fill={fill} stroke={stroke} strokeWidth={sw} />
        </G>
      );
    case 'n':
      return (
        <G>
          <Path
            d={`M${cx - s * 0.15},${s * 0.8} L${cx - s * 0.2},${s * 0.4} Q${cx - s * 0.1},${s * 0.1} ${cx + s * 0.2},${s * 0.15} Q${cx + s * 0.35},${s * 0.3} ${cx + s * 0.2},${s * 0.5} L${cx + s * 0.25},${s * 0.8}Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        </G>
      );
    case 'p':
    default:
      return (
        <G>
          <Circle cx={cx} cy={s * 0.3} r={s * 0.18} fill={fill} stroke={stroke} strokeWidth={sw} />
          <Path
            d={`M${cx - s * 0.2},${s * 0.8} Q${cx},${s * 0.5} ${cx + s * 0.2},${s * 0.8}Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        </G>
      );
  }
}
