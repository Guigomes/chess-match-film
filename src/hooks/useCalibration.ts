import {useState, useCallback} from 'react';
import {computeHomography, type Matrix3x3, type Point2D} from '../services/vision/homography';

export type CalibrationCorner = 'a8' | 'h8' | 'h1' | 'a1';
const CORNER_ORDER: CalibrationCorner[] = ['a8', 'h8', 'h1', 'a1'];

interface UseCalibrationResult {
  corners: Partial<Record<CalibrationCorner, Point2D>>;
  nextCorner: CalibrationCorner | null;
  homography: Matrix3x3 | null;
  isCalibrated: boolean;
  tapCorner: (pt: Point2D) => void;
  reset: () => void;
}

export function useCalibration(): UseCalibrationResult {
  const [corners, setCorners] = useState<Partial<Record<CalibrationCorner, Point2D>>>({});
  const [homography, setHomography] = useState<Matrix3x3 | null>(null);

  const tappedCount = Object.keys(corners).length;
  const nextCorner = tappedCount < 4 ? CORNER_ORDER[tappedCount] : null;
  const isCalibrated = homography !== null;

  const tapCorner = useCallback(
    (pt: Point2D) => {
      if (tappedCount >= 4) {
        return;
      }
      const corner = CORNER_ORDER[tappedCount];
      const updated = {...corners, [corner]: pt};
      setCorners(updated);

      if (tappedCount === 3) {
        // All 4 corners tapped — compute homography
        const pts = CORNER_ORDER.map((c) => updated[c]!);
        try {
          const H = computeHomography(pts);
          setHomography(H);
        } catch (e) {
          console.warn('Homography computation failed:', e);
        }
      }
    },
    [corners, tappedCount],
  );

  const reset = useCallback(() => {
    setCorners({});
    setHomography(null);
  }, []);

  return {corners, nextCorner, homography, isCalibrated, tapCorner, reset};
}
