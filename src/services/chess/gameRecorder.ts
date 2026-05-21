import {Chess} from 'chess.js';
import type {BoardState, GameResult, GameSession, MoveRecord} from '../../types/chess';
import type {InferredMove} from './moveInferrer';
import {generatePgn} from './pgnExporter';

export class GameRecorder {
  private chess: Chess;
  private session: GameSession;
  private recordingStartTime: number;

  constructor(session: GameSession) {
    this.chess = new Chess();
    this.session = {...session, moves: []};
    this.recordingStartTime = Date.now();
  }

  /**
   * Attempts to commit an inferred move. Returns the committed MoveRecord,
   * or null if the move is illegal (detection error — safe to discard).
   */
  commitMove(
    inferred: InferredMove,
    boardBefore: BoardState,
    boardAfter: BoardState,
    videoTimestampSeconds: number,
  ): MoveRecord | null {
    const now = Date.now();
    const timestamp = now - this.recordingStartTime;

    let moveResult;
    try {
      if (inferred.isCastling) {
        const notation = inferred.castlingSide === 'kingside' ? 'O-O' : 'O-O-O';
        moveResult = this.chess.move(notation);
      } else {
        moveResult = this.chess.move({
          from: inferred.from,
          to: inferred.to,
          promotion: inferred.promotion,
        });
      }
    } catch {
      return null;
    }

    if (!moveResult) {
      return null;
    }

    const fullMoveNumber = this.chess.moveNumber();
    const record: MoveRecord = {
      moveNumber: this.session.moves.length + 1,
      san: moveResult.san,
      uci: `${inferred.from}${inferred.to}${inferred.promotion ?? ''}`,
      timestamp,
      videoTimestamp: videoTimestampSeconds,
      boardStateBefore: boardBefore,
      boardStateAfter: boardAfter,
      detectionConfidence: inferred.confidence,
    };

    this.session = {
      ...this.session,
      moves: [...this.session.moves, record],
      pgn: generatePgn(this.session, this.chess),
    };

    return record;
  }

  get currentSession(): GameSession {
    return this.session;
  }

  get sideToMove(): 'w' | 'b' {
    return this.chess.turn();
  }

  get isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  finalizeGame(result: GameResult): GameSession {
    this.session = {
      ...this.session,
      result,
      pgn: generatePgn({...this.session, result}, this.chess),
    };
    return this.session;
  }

  getFen(): string {
    return this.chess.fen();
  }
}
