import type {RawDetection} from '../../types/chess';
import {YOLO_INPUT_SIZE} from '../../constants/chess';

/**
 * Decodes YOLOv8 output tensor to raw detections.
 *
 * YOLOv8 output shape: [1, 84, 8400] where:
 *   - 84 = 4 (bbox: cx,cy,w,h) + 80 classes  →  for our model: 4 + 13 classes
 *   - 8400 = number of anchor predictions
 *
 * We use 17 channels (4 bbox + 13 classes) in the custom model.
 */
export function decodeYoloOutput(
  outputData: Float32Array,
  numClasses: number,
  confidenceThreshold: number,
): RawDetection[] {
  const numChannels = 4 + numClasses;
  const numAnchors = outputData.length / numChannels;
  const detections: RawDetection[] = [];

  for (let i = 0; i < numAnchors; i++) {
    let maxScore = 0;
    let maxClassIdx = 0;

    for (let c = 0; c < numClasses; c++) {
      const score = outputData[numAnchors * (4 + c) + i];
      if (score > maxScore) {
        maxScore = score;
        maxClassIdx = c;
      }
    }

    if (maxScore < confidenceThreshold) {
      continue;
    }

    // Bbox in normalized [0,1] coords (cx, cy, w, h)
    const cx = outputData[numAnchors * 0 + i];
    const cy = outputData[numAnchors * 1 + i];
    const w  = outputData[numAnchors * 2 + i];
    const h  = outputData[numAnchors * 3 + i];

    detections.push({
      classIndex: maxClassIdx,
      x: cx * YOLO_INPUT_SIZE,
      y: cy * YOLO_INPUT_SIZE,
      width: w * YOLO_INPUT_SIZE,
      height: h * YOLO_INPUT_SIZE,
      confidence: maxScore,
    });
  }

  return nonMaxSuppression(detections, 0.45);
}

function iou(a: RawDetection, b: RawDetection): number {
  const ax1 = a.x - a.width / 2;
  const ay1 = a.y - a.height / 2;
  const ax2 = a.x + a.width / 2;
  const ay2 = a.y + a.height / 2;

  const bx1 = b.x - b.width / 2;
  const by1 = b.y - b.height / 2;
  const bx2 = b.x + b.width / 2;
  const by2 = b.y + b.height / 2;

  const interX1 = Math.max(ax1, bx1);
  const interY1 = Math.max(ay1, by1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
  const aArea = (ax2 - ax1) * (ay2 - ay1);
  const bArea = (bx2 - bx1) * (by2 - by1);

  return interArea / (aArea + bArea - interArea + 1e-6);
}

function nonMaxSuppression(detections: RawDetection[], iouThreshold: number): RawDetection[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const kept: RawDetection[] = [];

  for (const det of sorted) {
    const overlaps = kept.some(
      (k) => k.classIndex === det.classIndex && iou(k, det) > iouThreshold,
    );
    if (!overlaps) {
      kept.push(det);
    }
  }

  return kept;
}
