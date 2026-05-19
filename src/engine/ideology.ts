import type { Ideology } from '@/types';

/**
 * イデオロギー乖離 (政策と党のあいだ)。
 * 設計書 §2.2: min(2, (|経済差| + |社会差| + |外交差|) / 3)
 */
export function ideologyDeviation(a: Ideology, b: Ideology): number {
  const sum = Math.abs(a.economic - b.economic) + Math.abs(a.social - b.social) + Math.abs(a.diplomatic - b.diplomatic);
  return Math.min(2, sum / 3);
}

/**
 * イデオロギー距離 (党と党の連立交渉などで使うユークリッド距離)。
 * 設計書 §2.2: √((経済差)² + (社会差)² + (外交差)²)。最大値 ≒ √48 ≒ 6.93
 */
export function ideologyDistance(a: Ideology, b: Ideology): number {
  const dx = a.economic - b.economic;
  const dy = a.social - b.social;
  const dz = a.diplomatic - b.diplomatic;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
