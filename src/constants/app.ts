import type {AppSettings} from '../types/chess';

export const DEFAULT_SETTINGS: AppSettings = {
  detectionConfidenceThreshold: 0.55,
  stableFrameCount: 3,
  videoQuality: 'medium',
  showDetectionOverlay: false,
  autoSavePGN: true,
};

export const DETECTION_FPS_TARGET = 10;
export const DETECTION_INTERVAL_MS = 1000 / DETECTION_FPS_TARGET;

// Brightness stddev threshold — warn user about uneven lighting
export const LIGHTING_STDDEV_WARNING_THRESHOLD = 60;

// Confidence variance spike threshold for drift detection
export const CALIBRATION_DRIFT_VARIANCE_THRESHOLD = 0.15;

export const DB_NAME = 'chess_match_film.db';
export const DB_VERSION = 1;

export const ONBOARDING_DONE_KEY = '@chess_film/onboarding_done';
