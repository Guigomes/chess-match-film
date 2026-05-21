import type {BoardState, PieceColor} from '../../types/chess';
import {BOARD_GRID_SIZE} from '../../constants/chess';

export interface InferredMove {
  from: string;
  to: string;
  promotion?: string;
  isPromotion: boolean;
  isCastling: boolean;
  castlingSide?: 'kingside' | 'queenside';
  confidence: number;
}

interface SquareChange {
  square: string;
  fileIdx: number;
  rankIdx: number;
  before: BoardState[0][0];
  after: BoardState[0][0];
}

/**
 * Diffs two consecutive board states to infer the move that was played.
 * Returns null if no clear single move can be determined.
 */
export function inferMove(
  before: BoardState,
  after: BoardState,
  sideToMove: PieceColor,
): InferredMove | null {
  const changes: SquareChange[] = [];

  for (let r = 0; r < BOARD_GRID_SIZE; r++) {
    for (let f = 0; f < BOARD_GRID_SIZE; f++) {
      const pb = before[r][f];
      const pa = after[r][f];
      const changed =
        (pb === null) !== (pa === null) ||
        (pb !== null && pa !== null && (pb.type !== pa.type || pb.color !== pa.color));
      if (changed) {
        const file = String.fromCharCode(97 + f);
        const rank = String(r + 1);
        changes.push({square: `${file}${rank}`, fileIdx: f, rankIdx: r, before: pb, after: pa});
      }
    }
  }

  if (changes.length === 0) {
    return null;
  }

  // --- Castling: king + rook both move (4 squares change) ---
  if (changes.length === 4) {
    const castling = detectCastling(changes, sideToMove);
    if (castling) {
      return castling;
    }
  }

  // --- En passant: pawn moves + capture pawn disappears on different square ---
  if (changes.length === 3) {
    const ep = detectEnPassant(changes, sideToMove);
    if (ep) {
      return ep;
    }
  }

  // --- Normal move or capture (2 squares change) ---
  if (changes.length === 2) {
    return detectNormalMove(changes, sideToMove);
  }

  return null;
}

function detectCastling(changes: SquareChange[], color: PieceColor): InferredMove | null {
  const backRank = color === 'w' ? 1 : 8;
  const rankStr = String(backRank);

  const kingFrom = changes.find(
    (c) => c.before?.type === 'k' && c.before.color === color && c.square.endsWith(rankStr),
  );
  if (!kingFrom) {
    return null;
  }

  // King moved from e-file
  if (!kingFrom.square.startsWith('e')) {
    return null;
  }

  const kingTo = changes.find(
    (c) => c.after?.type === 'k' && c.after.color === color && c.square.endsWith(rankStr),
  );
  if (!kingTo) {
    return null;
  }

  const side = kingTo.square.startsWith('g') ? 'kingside' : 'queenside';
  const confidence = Math.min(kingFrom.before?.confidence ?? 1, kingTo.after?.confidence ?? 1);

  return {
    from: kingFrom.square,
    to: kingTo.square,
    isPromotion: false,
    isCastling: true,
    castlingSide: side,
    confidence,
  };
}

function detectEnPassant(changes: SquareChange[], color: PieceColor): InferredMove | null {
  // En passant: moving pawn disappears from source, appears on destination,
  // captured pawn disappears from a square on the same file as destination but different rank.
  const pawnMoved = changes.find(
    (c) => c.before?.type === 'p' && c.before.color === color && c.after === null,
  );
  const pawnArrived = changes.find(
    (c) => c.after?.type === 'p' && c.after.color === color && c.before === null,
  );
  const capturedPawn = changes.find(
    (c) =>
      c.before?.type === 'p' &&
      c.before.color !== color &&
      c.after === null &&
      c !== pawnMoved,
  );

  if (!pawnMoved || !pawnArrived || !capturedPawn) {
    return null;
  }

  const confidence = Math.min(
    pawnMoved.before?.confidence ?? 1,
    pawnArrived.after?.confidence ?? 1,
  );

  return {
    from: pawnMoved.square,
    to: pawnArrived.square,
    isPromotion: false,
    isCastling: false,
    confidence,
  };
}

function detectNormalMove(changes: SquareChange[], color: PieceColor): InferredMove | null {
  // The square where a piece of sideToMove disappeared
  const from = changes.find((c) => c.before?.color === color && c.after?.color !== color);
  // The square where a piece of sideToMove appeared (or replaced opponent)
  const to = changes.find((c) => c.after?.color === color && c !== from);

  if (!from || !to) {
    return null;
  }

  const movingPiece = from.before;
  const arrivedPiece = to.after;

  if (!movingPiece || !arrivedPiece) {
    return null;
  }

  // Detect promotion: pawn leaves, non-pawn arrives on back rank
  const destRankIdx = to.rankIdx;
  const isPromotion =
    movingPiece.type === 'p' &&
    arrivedPiece.type !== 'p' &&
    ((color === 'w' && destRankIdx === 7) || (color === 'b' && destRankIdx === 0));

  const confidence = Math.min(movingPiece.confidence, arrivedPiece.confidence);

  return {
    from: from.square,
    to: to.square,
    promotion: isPromotion ? arrivedPiece.type : undefined,
    isPromotion,
    isCastling: false,
    confidence,
  };
}
