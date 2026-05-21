import type {Chess} from 'chess.js';
import type {GameSession} from '../../types/chess';

export function generatePgn(session: GameSession, chess: Chess): string {
  const date = new Date(session.createdAt).toISOString().split('T')[0].replace(/-/g, '.');
  chess.header(
    'Event', session.event || '?',
    'Site', session.site || 'Chess Match Film',
    'Date', date,
    'White', session.whitePlayer || '?',
    'Black', session.blackPlayer || '?',
    'Result', session.result,
  );
  return chess.pgn();
}

export function sessionToPgnString(session: GameSession): string {
  // Return the cached PGN if available
  if (session.pgn) {
    return session.pgn;
  }

  // Reconstruct from moves using chess.js replay
  const chess = new (require('chess.js').Chess)();
  for (const move of session.moves) {
    try {
      chess.move(move.san);
    } catch {
      break;
    }
  }
  return generatePgn(session, chess);
}
