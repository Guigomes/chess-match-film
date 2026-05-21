import {useFrameProcessor} from 'react-native-vision-camera';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import {resize} from 'vision-camera-resize-plugin';
import type {RawDetection} from '../../types/chess';
import {YOLO_INPUT_SIZE} from '../../constants/chess';
import {onnxSession} from '../onnx/OnnxSession';

type DetectionCallback = (detections: RawDetection[]) => void;

/**
 * VisionCamera frame processor hook.
 * Runs inside a Reanimated worklet — all called functions must be worklet-safe.
 * ONNX inference is synchronous (runSync) and safe in this context.
 */
export function useChessFrameProcessor(
  confidenceThreshold: number,
  onDetections: DetectionCallback,
  enabled: boolean,
) {
  const lastFrameTime = useSharedValue(0);
  const FRAME_INTERVAL_MS = 100; // ~10 fps

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const now = Date.now();
      if (now - lastFrameTime.value < FRAME_INTERVAL_MS) {
        return;
      }
      lastFrameTime.value = now;

      if (!enabled) {
        return;
      }

      // Resize frame to 640×640 RGB float32
      const resized = resize(frame, {
        scale: {width: YOLO_INPUT_SIZE, height: YOLO_INPUT_SIZE},
        pixelFormat: 'rgb',
        dataType: 'float32',
      });

      const detections = onnxSession.runInference(resized, confidenceThreshold);
      runOnJS(onDetections)(detections);
    },
    [confidenceThreshold, enabled],
  );

  return frameProcessor;
}
