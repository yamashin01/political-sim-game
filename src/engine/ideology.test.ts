import { describe, expect, it } from 'vitest';
import { ideologyDeviation, ideologyDistance } from './ideology';

describe('ideologyDeviation', () => {
  it('同一座標なら0', () => {
    expect(ideologyDeviation({ economic: 0, social: 0, diplomatic: 0 }, { economic: 0, social: 0, diplomatic: 0 })).toBe(0);
  });

  it('全軸で最大差4でも min(2, ...) で 2 に丸まる', () => {
    const a = { economic: 2, social: 2, diplomatic: 2 };
    const b = { economic: -2, social: -2, diplomatic: -2 };
    // (4+4+4)/3 = 4 → min(2, 4) = 2
    expect(ideologyDeviation(a, b)).toBe(2);
  });

  it('1軸だけ差1のとき乖離は約 0.33', () => {
    const a = { economic: 1, social: 0, diplomatic: 0 };
    const b = { economic: 0, social: 0, diplomatic: 0 };
    expect(ideologyDeviation(a, b)).toBeCloseTo(1 / 3);
  });
});

describe('ideologyDistance', () => {
  it('同一座標なら0', () => {
    expect(
      ideologyDistance(
        { economic: 0, social: 0, diplomatic: 0 },
        { economic: 0, social: 0, diplomatic: 0 },
      ),
    ).toBe(0);
  });

  it('最大値は √48 ≈ 6.93', () => {
    const a = { economic: 2, social: 2, diplomatic: 2 };
    const b = { economic: -2, social: -2, diplomatic: -2 };
    expect(ideologyDistance(a, b)).toBeCloseTo(Math.sqrt(48));
  });
});
