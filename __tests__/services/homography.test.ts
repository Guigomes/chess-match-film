import {computeHomography, warpPoint, warpedPointToSquare} from '../../src/services/vision/homography';

describe('computeHomography', () => {
  it('throws with fewer than 4 points', () => {
    expect(() => computeHomography([{x: 0, y: 0}])).toThrow();
  });

  it('maps identity transform (axis-aligned square)', () => {
    const src = [
      {x: 0, y: 0},
      {x: 512, y: 0},
      {x: 512, y: 512},
      {x: 0, y: 512},
    ];
    const H = computeHomography(src);
    const warped = warpPoint({x: 256, y: 256}, H);
    expect(warped.x).toBeCloseTo(256, 0);
    expect(warped.y).toBeCloseTo(256, 0);
  });

  it('maps skewed quadrilateral to 512×512 grid', () => {
    // Tilted board with slight perspective
    const src = [
      {x: 50, y: 30},   // a8
      {x: 430, y: 20},  // h8
      {x: 450, y: 400}, // h1
      {x: 30, y: 410},  // a1
    ];
    const H = computeHomography(src);

    // Top-left source point should map near (0, 0) in warped space
    const tl = warpPoint(src[0], H);
    expect(tl.x).toBeCloseTo(0, 0);
    expect(tl.y).toBeCloseTo(0, 0);

    // Bottom-right source point should map near (512, 512)
    const br = warpPoint(src[2], H);
    expect(br.x).toBeCloseTo(512, 0);
    expect(br.y).toBeCloseTo(512, 0);
  });
});

describe('warpedPointToSquare', () => {
  it('maps top-left warped point to a8', () => {
    expect(warpedPointToSquare({x: 10, y: 10})).toBe('a8');
  });

  it('maps bottom-right warped point to h1', () => {
    expect(warpedPointToSquare({x: 500, y: 500})).toBe('h1');
  });

  it('maps center-ish point to d4 area', () => {
    // Center of d4: file d = index 3, rank 4 = index 3 from bottom = rank index 3
    // In warped 512 space: x = 3.5 * 64 = 224, y = (7-3) * 64 + 32 = 288
    const sq = warpedPointToSquare({x: 224, y: 224});
    expect(sq).toBe('d5');
  });

  it('returns null for out-of-bounds', () => {
    expect(warpedPointToSquare({x: -1, y: 0})).toBeNull();
    expect(warpedPointToSquare({x: 0, y: 600})).toBeNull();
  });
});
