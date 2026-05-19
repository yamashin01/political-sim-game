import type { IndicatorChanges, NationalIndicators } from '@/types';

/** 設計書 §2.2: 全指標を 0〜100 にクランプする */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** 国家指標に変化量を適用 (各指標は0〜100にクランプ) */
export function applyChanges(
  indicators: NationalIndicators,
  changes: IndicatorChanges,
): NationalIndicators {
  return {
    approval: clamp(indicators.approval + (changes.approval ?? 0)),
    economy: clamp(indicators.economy + (changes.economy ?? 0)),
    finance: clamp(indicators.finance + (changes.finance ?? 0)),
    diplomacy: clamp(indicators.diplomacy + (changes.diplomacy ?? 0)),
    environment: clamp(indicators.environment + (changes.environment ?? 0)),
  };
}

/** 複数の変化量を合成 (各指標を加算) */
export function combineChanges(...changes: IndicatorChanges[]): IndicatorChanges {
  const result: IndicatorChanges = {};
  for (const ch of changes) {
    for (const key of Object.keys(ch) as (keyof IndicatorChanges)[]) {
      result[key] = (result[key] ?? 0) + (ch[key] ?? 0);
    }
  }
  return result;
}
