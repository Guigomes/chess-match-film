/**
 * Computes a 3×3 homography matrix H from 4 source points to a normalized
 * 512×512 top-down board view. Uses the Direct Linear Transform (DLT) method.
 *
 * Points must be in order: [topLeft, topRight, bottomRight, bottomLeft]
 * matching board corners: [a8, h8, h1, a1]
 */

export interface Point2D {
  x: number;
  y: number;
}

export type Matrix3x3 = number[][];

// Destination corners in the 512×512 warped output
const BOARD_SIZE = 512;
const DST_CORNERS: Point2D[] = [
  {x: 0, y: 0},           // a8 → top-left
  {x: BOARD_SIZE, y: 0},  // h8 → top-right
  {x: BOARD_SIZE, y: BOARD_SIZE}, // h1 → bottom-right
  {x: 0, y: BOARD_SIZE},  // a1 → bottom-left
];

export function computeHomography(srcPoints: Point2D[]): Matrix3x3 {
  if (srcPoints.length !== 4) {
    throw new Error('computeHomography requires exactly 4 source points');
  }

  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const {x: sx, y: sy} = srcPoints[i];
    const {x: dx, y: dy} = DST_CORNERS[i];
    A.push([-sx, -sy, -1, 0, 0, 0, dx * sx, dx * sy, dx]);
    A.push([0, 0, 0, -sx, -sy, -1, dy * sx, dy * sy, dy]);
  }

  const h = solveDLT(A);

  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], h[8]],
  ];
}

/**
 * Applies homography H to a single point.
 */
export function warpPoint(pt: Point2D, H: Matrix3x3): Point2D {
  const [r0, r1, r2] = H;
  const w = r2[0] * pt.x + r2[1] * pt.y + r2[2];
  const x = (r0[0] * pt.x + r0[1] * pt.y + r0[2]) / w;
  const y = (r1[0] * pt.x + r1[1] * pt.y + r1[2]) / w;
  return {x, y};
}

/**
 * Maps a warped point (in 512×512 space) to a board square like "e4".
 * Returns null if the point is outside the board.
 */
export function warpedPointToSquare(pt: Point2D): string | null {
  const CELL = BOARD_SIZE / 8;
  const fileIdx = Math.floor(pt.x / CELL);
  const rankIdx = 7 - Math.floor(pt.y / CELL); // y=0 is rank 8 (top)

  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) {
    return null;
  }

  const file = String.fromCharCode(97 + fileIdx); // 'a'–'h'
  const rank = String(rankIdx + 1);               // '1'–'8'
  return `${file}${rank}`;
}

// --- DLT solver (SVD-free, uses Gaussian elimination on 8×9 matrix) ---

function solveDLT(A: number[][]): number[] {
  // Augment A with a 9th column for the SVD-free trick:
  // We solve A·h = 0 by reducing to 8 equations and solving for h[8]=1.
  // Then normalize.
  const n = A.length; // 8
  const aug: number[][] = A.map((row) => [...row]);

  // Gaussian elimination
  for (let col = 0; col < 8; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-10) {
      continue;
    }

    for (let row = 0; row < n; row++) {
      if (row === col) {
        continue;
      }
      const factor = aug[row][col] / pivot;
      for (let k = col; k < 9; k++) {
        aug[row][k] -= factor * aug[col][k];
      }
    }
  }

  // Back-substitute: h[8] = 1 (normalization)
  const h: number[] = new Array(9).fill(0);
  h[8] = 1;
  for (let i = 0; i < 8; i++) {
    if (Math.abs(aug[i][i]) > 1e-10) {
      h[i] = -aug[i][8] / aug[i][i];
    }
  }

  return h;
}
