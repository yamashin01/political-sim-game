import type { Region } from '@/types';

/**
 * 設計書 §5.6 + ゲームバランス §7.2: 6地方ブロック (合計議席465)。
 * seatShare の合計が 1.0 になるよう調整。
 */
export const REGIONS: Region[] = [
  { id: 'hokkaido_tohoku', name: '北海道・東北', seatShare: 0.13, totalSeats: 60, urbanization: 0.45 },
  { id: 'kanto', name: '関東', seatShare: 0.32, totalSeats: 149, urbanization: 0.9 },
  { id: 'chubu', name: '中部', seatShare: 0.16, totalSeats: 74, urbanization: 0.65 },
  { id: 'kansai', name: '関西', seatShare: 0.15, totalSeats: 70, urbanization: 0.8 },
  { id: 'chugoku_shikoku', name: '中国・四国', seatShare: 0.11, totalSeats: 51, urbanization: 0.4 },
  { id: 'kyushu_okinawa', name: '九州・沖縄', seatShare: 0.13, totalSeats: 61, urbanization: 0.5 },
];

export const REGIONS_BY_ID: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
);
