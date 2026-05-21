import {useCallback, useRef, useState} from 'react';
import type {BoardState, MoveRecord} from '../types/chess';
import type {Matrix3x3} from '../services/vision/homography';
import {mapDetectionsToBoard, boardsAreEqual, boardMinConfidence} from '../services/vision/boardMapper';
import {inferMove} from '../services/chess/moveInferrer';
import {GameRecorder} from '../services/chess/gameRecorder';
import {useChessFrameProcessor} from '../services/vision/frameProcessor';
import type {RawDetection} from '../types/chess';
import type {GameSession} from '../types/chess';

interface UsePipelineOptions {
  homography: Matrix3x3;
  session: GameSession;
  confidenceThreshold: number;
  stableFrameCount: number;
  enabled: boolean;
  recordingStartTime: number;
  onMoveCommitted: (record: MoveRecord, updatedSession: GameSession) => void;
  onCalibrationDrift: () => void;
}

export function useDetectionPipeline({
  homography,
  session,
  confidenceThreshold,
  stableFrameCount,
  enabled,
  recordingStartTime,
  onMoveCommitted,
  onCalibrationDrift,
}: UsePipelineOptions) {
  const recorderRef = useRef<GameRecorder>(new GameRecorder(session));
  const candidateBoardRef = useRef<BoardState | null>(null);
  const stableCountRef = useRef(0);
  const lastBoardRef = useRef<BoardState | null>(null);
  const [latestBoard, setLatestBoard] = useState<BoardState | null>(null);

  const handleDetections = useCallback(
    (detections: RawDetection[]) => {
      const board = mapDetectionsToBoard(detections, homography);
      setLatestBoard(board);

      // --- Calibration drift check ---
      const minConf = boardMinConfidence(board);
      if (minConf < confidenceThreshold * 0.6) {
        onCalibrationDrift();
      }

      // --- State debouncer ---
      if (lastBoardRef.current === null) {
        lastBoardRef.current = board;
        return;
      }

      if (boardsAreEqual(board, candidateBoardRef.current ?? lastBoardRef.current)) {
        if (!boardsAreEqual(board, lastBoardRef.current)) {
          stableCountRef.current += 1;
        }
      } else {
        candidateBoardRef.current = board;
        stableCountRef.current = 1;
        return;
      }

      if (stableCountRef.current < stableFrameCount) {
        return;
      }

      // Board is stable — attempt to infer move
      const prev = lastBoardRef.current;
      const recorder = recorderRef.current;
      const inferred = inferMove(prev, board, recorder.sideToMove);

      if (!inferred) {
        lastBoardRef.current = board;
        stableCountRef.current = 0;
        candidateBoardRef.current = null;
        return;
      }

      const videoTimestamp = (Date.now() - recordingStartTime) / 1000;
      const record = recorder.commitMove(inferred, prev, board, videoTimestamp);

      if (record) {
        lastBoardRef.current = board;
        stableCountRef.current = 0;
        candidateBoardRef.current = null;
        onMoveCommitted(record, recorder.currentSession);
      }
    },
    [homography, confidenceThreshold, stableFrameCount, recordingStartTime, onMoveCommitted, onCalibrationDrift],
  );

  const frameProcessor = useChessFrameProcessor(
    confidenceThreshold,
    handleDetections,
    enabled,
  );

  const getRecorder = () => recorderRef.current;

  return {frameProcessor, latestBoard, getRecorder};
}
