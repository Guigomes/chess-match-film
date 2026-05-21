import type {PieceColor, PieceType} from '../types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const ALL_SQUARES: string[] = [];
for (const rank of RANKS) {
  for (const file of FILES) {
    ALL_SQUARES.push(`${file}${rank}`);
  }
}

// Maps ONNX class index → {color, type}
// Class 0 = empty (background), 1–12 = pieces
export const PIECE_CLASS_MAP: Record<number, {color: PieceColor; type: PieceType}> = {
  1:  {color: 'w', type: 'p'},
  2:  {color: 'w', type: 'n'},
  3:  {color: 'w', type: 'b'},
  4:  {color: 'w', type: 'r'},
  5:  {color: 'w', type: 'q'},
  6:  {color: 'w', type: 'k'},
  7:  {color: 'b', type: 'p'},
  8:  {color: 'b', type: 'n'},
  9:  {color: 'b', type: 'b'},
  10: {color: 'b', type: 'r'},
  11: {color: 'b', type: 'q'},
  12: {color: 'b', type: 'k'},
};

export const PIECE_CLASS_COUNT = 13; // 0 (empty) + 12 piece types
export const YOLO_INPUT_SIZE = 640;
export const BOARD_GRID_SIZE = 8;
