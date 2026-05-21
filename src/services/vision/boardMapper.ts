import type {BoardState, DetectedPiece, RawDetection} from '../../types/chess';
import {BOARD_GRID_SIZE, PIECE_CLASS_MAP} from '../../constants/chess';
import {warpPoint, warpedPointToSquare, type Matrix3x3} from './homography';

/**
 * Transforms raw ONNX detections into an 8×8 BoardState using the
 * perspective homography matrix H.
 *
 * Index mapping: board[rankIdx][fileIdx]
 *   rankIdx 0 = rank '1' (White's back rank)
 *   fileIdx 0 = file 'a'
 */
export function mapDetectionsToBoard(
  detections: RawDetection[],
  H: Matrix3x3,
): BoardState {
  const board: BoardState = Array.from({length: BOARD_GRID_SIZE}, () =>
    new Array(BOARD_GRID_SIZE).fill(null),
  );

  for (const det of detections) {
    // Skip class 0 (background/empty)
    if (det.classIndex === 0) {
      continue;
    }

    const pieceInfo = PIECE_CLASS_MAP[det.classIndex];
    if (!pieceInfo) {
      continue;
    }

    // Warp the center of the bounding box through H
    const warped = warpPoint({x: det.x, y: det.y}, H);
    const square = warpedPointToSquare(warped);
    if (!square) {
      continue;
    }

    const fileIdx = square.charCodeAt(0) - 97; // 'a'=0 … 'h'=7
    const rankIdx = parseInt(square[1], 10) - 1; // '1'=0 … '8'=7

    const existing = board[rankIdx][fileIdx];
    // Keep highest-confidence detection per square
    if (!existing || det.confidence > existing.confidence) {
      const piece: DetectedPiece = {
        type: pieceInfo.type,
        color: pieceInfo.color,
        square,
        confidence: det.confidence,
      };
      board[rankIdx][fileIdx] = piece;
    }
  }

  return board;
}

/**
 * Returns the minimum confidence across all detected pieces,
 * useful for drift detection and move confidence scoring.
 */
export function boardMinConfidence(board: BoardState): number {
  let min = 1;
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.confidence < min) {
        min = cell.confidence;
      }
    }
  }
  return min;
}

export function boardsAreEqual(a: BoardState, b: BoardState): boolean {
  for (let r = 0; r < BOARD_GRID_SIZE; r++) {
    for (let f = 0; f < BOARD_GRID_SIZE; f++) {
      const pa = a[r][f];
      const pb = b[r][f];
      if (pa === null && pb === null) {
        continue;
      }
      if (pa === null || pb === null) {
        return false;
      }
      if (pa.type !== pb.type || pa.color !== pb.color) {
        return false;
      }
    }
  }
  return true;
}
