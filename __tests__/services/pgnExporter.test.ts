import {sessionToPgnString} from '../../src/services/chess/pgnExporter';
import type {GameSession} from '../../src/types/chess';

const baseSession: GameSession = {
  id: 'test-1',
  createdAt: '2026-01-15T10:00:00Z',
  whitePlayer: 'Alice',
  blackPlayer: 'Bob',
  event: 'Test Match',
  site: 'Chess Match Film',
  moves: [
    {
      moveNumber: 1, san: 'e4', uci: 'e2e4', timestamp: 0, videoTimestamp: 0,
      boardStateBefore: [], boardStateAfter: [], detectionConfidence: 0.9,
    },
    {
      moveNumber: 2, san: 'e5', uci: 'e7e5', timestamp: 3000, videoTimestamp: 3,
      boardStateBefore: [], boardStateAfter: [], detectionConfidence: 0.88,
    },
    {
      moveNumber: 3, san: 'Nf3', uci: 'g1f3', timestamp: 7000, videoTimestamp: 7,
      boardStateBefore: [], boardStateAfter: [], detectionConfidence: 0.92,
    },
  ],
  result: '1-0',
  videoPath: null,
  annotatedVideoPath: null,
  homography: [],
  pgn: '',
};

describe('sessionToPgnString', () => {
  it('generates valid PGN with headers', () => {
    const pgn = sessionToPgnString(baseSession);
    expect(pgn).toContain('[White "Alice"]');
    expect(pgn).toContain('[Black "Bob"]');
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toContain('[Event "Test Match"]');
  });

  it('includes all moves in order', () => {
    const pgn = sessionToPgnString(baseSession);
    expect(pgn).toContain('1. e4');
    expect(pgn).toContain('e5');
    expect(pgn).toContain('2. Nf3');
  });

  it('ends with the result token', () => {
    const pgn = sessionToPgnString(baseSession);
    expect(pgn.trim()).toMatch(/1-0\s*$/);
  });

  it('uses cached pgn when available', () => {
    const cached = '[Event "cached"]\n\n1. d4 *';
    const session = {...baseSession, pgn: cached};
    expect(sessionToPgnString(session)).toBe(cached);
  });
});
