import { describe, expect, it } from 'vitest';
import { REGISTRY, validateRegistry } from './registry';

describe('GameDataRegistry の整合性', () => {
  it('政策IDの重複がない', () => {
    const ids = Object.keys(REGISTRY.policies);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('イベントIDの重複がない', () => {
    const ids = Object.keys(REGISTRY.events);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('全政策の importance が 1〜3', () => {
    for (const p of Object.values(REGISTRY.policies)) {
      expect([1, 2, 3]).toContain(p.importance);
    }
  });

  it('全政策の ideologyDirection が -2〜+2', () => {
    for (const p of Object.values(REGISTRY.policies)) {
      for (const k of ['economic', 'social', 'diplomatic'] as const) {
        const v = p.ideologyDirection[k];
        expect(v).toBeGreaterThanOrEqual(-2);
        expect(v).toBeLessThanOrEqual(2);
      }
    }
  });

  it('参照整合性 (counterPolicyIds, linkedPolicyId 等) が保たれている', () => {
    const errors = validateRegistry(REGISTRY);
    expect(errors).toEqual([]);
  });

  it('地方ブロックの seatShare 合計が 1.0 になる', () => {
    const total = Object.values(REGISTRY.regions).reduce((s, r) => s + r.seatShare, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it('地方ブロックの totalSeats 合計が houseTotalSeats と一致する想定 (MVP=465)', () => {
    const total = Object.values(REGISTRY.regions).reduce((s, r) => s + r.totalSeats, 0);
    expect(total).toBe(465);
  });
});
