import {InferenceSession, Tensor} from 'onnxruntime-react-native';
import {PIECE_CLASS_COUNT, YOLO_INPUT_SIZE} from '../../constants/chess';
import {decodeYoloOutput} from './postprocess';
import type {RawDetection} from '../../types/chess';

const MODEL_ASSET = require('../../../assets/models/chess_pieces_yolov8n.onnx');

type ExecutionProvider = 'nnapi' | 'cpu';

class OnnxSessionManager {
  private session: InferenceSession | null = null;
  private activeEP: ExecutionProvider = 'cpu';

  async initialize(): Promise<void> {
    const nnapiSession = await this.tryCreateSession('nnapi');
    const cpuSession = await this.tryCreateSession('cpu');

    if (nnapiSession && cpuSession) {
      const [nnapiMs, cpuMs] = await Promise.all([
        this.benchmarkSession(nnapiSession),
        this.benchmarkSession(cpuSession),
      ]);
      if (nnapiMs <= cpuMs) {
        this.session = nnapiSession;
        this.activeEP = 'nnapi';
        await cpuSession.release();
      } else {
        this.session = cpuSession;
        this.activeEP = 'cpu';
        await nnapiSession.release();
      }
    } else {
      this.session = cpuSession ?? nnapiSession;
      this.activeEP = cpuSession ? 'cpu' : 'nnapi';
    }

    if (!this.session) {
      throw new Error('Failed to create ONNX inference session');
    }
  }

  private async tryCreateSession(ep: ExecutionProvider): Promise<InferenceSession | null> {
    try {
      return await InferenceSession.create(MODEL_ASSET, {
        executionProviders: [ep],
      });
    } catch {
      return null;
    }
  }

  private async benchmarkSession(session: InferenceSession): Promise<number> {
    const dummy = new Float32Array(1 * 3 * YOLO_INPUT_SIZE * YOLO_INPUT_SIZE);
    const tensor = new Tensor('float32', dummy, [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE]);
    const start = Date.now();
    await session.run({images: tensor});
    return Date.now() - start;
  }

  runInference(rgbData: Float32Array, confidenceThreshold: number): RawDetection[] {
    if (!this.session) {
      throw new Error('OnnxSession not initialized — call initialize() first');
    }

    const tensor = new Tensor('float32', rgbData, [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE]);
    // Synchronous run — safe inside VisionCamera worklet context
    const results = this.session.runSync({images: tensor});
    const output = results['output0'].data as Float32Array;

    return decodeYoloOutput(output, PIECE_CLASS_COUNT, confidenceThreshold);
  }

  get executionProvider(): ExecutionProvider {
    return this.activeEP;
  }

  async release(): Promise<void> {
    await this.session?.release();
    this.session = null;
  }
}

export const onnxSession = new OnnxSessionManager();
