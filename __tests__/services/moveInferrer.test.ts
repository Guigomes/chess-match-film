import {inferMove} from '../../src/services/chess/moveInferrer';
import type {BoardState} from '../../src/types/chess';
import {BOARD_GRID_SIZE} from '../../src/constants/chess';

function emptyBoard(): BoardState {
  return Array.from({length: BOARD_GRID_SIZE}, () => new Array(BOARD_GRID_SIZE).fill(null));
}

function setSquare(board: BoardState, square: string, piece: BoardState[0][0]): BoardState {
  const fileIdx = square.charCodeAt(0) - 97;
  const rankIdx = parseInt(square[1], 10) - 1;
  const next = board.map((row) => [...row]);
  next[rankIdx][fileIdx] = piece;
  return next;
}

const wp = (square: string) => ({type: 'p' as const, color: 'w' as const, square, confidence: 0.9});
const wk = (square: string) => ({type: 'k' as const, color: 'w' as const, square, confidence: 0.95});
const wr = (square: string) => ({type: 'r' as const, color: 'w' as const, square, confidence: 0.93});
const bp = (square: string) => ({type: 'p' as const, color: 'b' as const, square, confidence: 0.9});

describe('inferMove — normal moves', () => {
  it('detects a simple pawn push e2→e4', () => {
    let before = emptyBoard();
    before = setSquare(before, 'e2', wp('e2'));

    let after = emptyBoard();
    after = setSquare(after, 'e4', wp('e4'));

    const move = inferMove(before, after, 'w');
    expect(move).not.toBeNull();
    expect(move!.from).toBe('e2');
    expect(move!.to).toBe('e4');
    expect(move!.isPromotion).toBe(false);
    expect(move!.isCastling).toBe(false);
  });

  it('detects a capture (pawn takes pawn)', () => {
    let before = emptyBoard();
    before = setSquare(before, 'd5', wp('d5'));
    before = setSquare(before, 'e6', bp('e6')); // wait: black pawn on e6

    // Wait — black pawn should be on e5 for d5xe6 en passant, or e6 for normal capture
    // Let's do d4xe5 (white pawn d4 captures black pawn on e5)
    before = emptyBoard();
    before = setSquare(before, 'd4', wp('d4'));
    before = setSquare(before, 'e5', bp('e5'));

    let after = emptyBoard();
    after = setSquare(after, 'e5', wp('e5'));

    const move = inferMove(before, after, 'w');
    expect(move).not.toBeNull();
    expect(move!.from).toBe('d4');
    expect(move!.to).toBe('e5');
  });
});

describe('inferMove — castling', () => {
  it('detects kingside castling (white)', () => {
    let before = emptyBoard();
    before = setSquare(before, 'e1', wk('e1'));
    before = setSquare(before, 'h1', wr('h1'));

    let after = emptyBoard();
    after = setSquare(after, 'g1', wk('g1'));
    after = setSquare(after, 'f1', wr('f1'));

    const move = inferMove(before, after, 'w');
    expect(move).not.toBeNull();
    expect(move!.isCastling).toBe(true);
    expect(move!.castlingSide).toBe('kingside');
    expect(move!.from).toBe('e1');
    expect(move!.to).toBe('g1');
  });

  it('detects queenside castling (white)', () => {
    let before = emptyBoard();
    before = setSquare(before, 'e1', wk('e1'));
    before = setSquare(before, 'a1', wr('a1'));

    let after = emptyBoard();
    after = setSquare(after, 'c1', wk('c1'));
    after = setSquare(after, 'd1', wr('d1'));

    const move = inferMove(before, after, 'w');
    expect(move).not.toBeNull();
    expect(move!.isCastling).toBe(true);
    expect(move!.castlingSide).toBe('queenside');
  });
});

describe('inferMove — promotion', () => {
  it('detects pawn promotion to queen', () => {
    let before = emptyBoard();
    before = setSquare(before, 'e7', wp('e7'));

    let after = emptyBoard();
    after = setSquare(after, 'e8', {type: 'q', color: 'w', square: 'e8', confidence: 0.85});

    const move = inferMove(before, after, 'w');
    expect(move).not.toBeNull();
    expect(move!.isPromotion).toBe(true);
    expect(move!.promotion).toBe('q');
    expect(move!.from).toBe('e7');
    expect(move!.to).toBe('e8');
  });
});

describe('inferMove — no move', () => {
  it('returns null when boards are identical', () => {
    const board = emptyBoard();
    expect(inferMove(board, board, 'w')).toBeNull();
  });
});
