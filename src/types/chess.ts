export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string; // 'a1' through 'h8'
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export interface DetectedPiece {
  type: PieceType;
  color: PieceColor;
  square: Square;
  confidence: number;
}

// null = empty square
export type BoardState = (DetectedPiece | null)[][];

export interface RawDetection {
  classIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface MoveRecord {
  moveNumber: number;
  san: string;
  uci: string;
  timestamp: number;
  videoTimestamp: number;
  boardStateBefore: BoardState;
  boardStateAfter: BoardState;
  detectionConfidence: number;
}

export interface GameSession {
  id: string;
  createdAt: string;
  whitePlayer: string;
  blackPlayer: string;
  event: string;
  site: string;
  moves: MoveRecord[];
  result: GameResult;
  videoPath: string | null;
  annotatedVideoPath: string | null;
  homography: number[][];
  pgn: string;
}

export interface AppSettings {
  detectionConfidenceThreshold: number;
  stableFrameCount: number;
  videoQuality: 'low' | 'medium' | 'high';
  showDetectionOverlay: boolean;
  autoSavePGN: boolean;
}
