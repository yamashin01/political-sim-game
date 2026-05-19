import type { Party } from '@/types';

/**
 * NPC政党の初期データ。
 * ゲームバランス §7.1 の議席比配分・イデオロギーから暫定値を採用。
 * 議席数の合計は約 355 (残り 110 がプレイヤー党)。
 *
 * 地方ブロックごとの支持率 (approvalByRegion) は実在政党のイメージに即した暫定値。
 */

const allRegions = ['hokkaido_tohoku', 'kanto', 'chubu', 'kansai', 'chugoku_shikoku', 'kyushu_okinawa'];

function approval(values: Partial<Record<string, number>>, fallback: number): Record<string, number> {
  return Object.fromEntries(allRegions.map((r) => [r, values[r] ?? fallback]));
}

export const NPC_PARTIES: Party[] = [
  {
    id: 'minji',
    name: '民自党',
    isPlayer: false,
    modelDescription: '自民党',
    ideology: { economic: -1, social: -2, diplomatic: -1 },
    seats: 195, // 42%
    funds: 200,
    approvalByRegion: approval(
      {
        hokkaido_tohoku: 45,
        kanto: 38,
        chubu: 48,
        kansai: 35,
        chugoku_shikoku: 50,
        kyushu_okinawa: 50,
      },
      40,
    ),
  },
  {
    id: 'komei',
    name: '公明会',
    isPlayer: false,
    modelDescription: '公明党',
    ideology: { economic: 1, social: 0, diplomatic: -1 },
    seats: 30, // 6.5%
    funds: 80,
    approvalByRegion: approval(
      { kanto: 14, kansai: 18, chubu: 12 },
      10,
    ),
  },
  {
    id: 'kaikaku',
    name: '改革維新党',
    isPlayer: false,
    modelDescription: '維新の会',
    ideology: { economic: -2, social: -1, diplomatic: 0 },
    seats: 45, // 9.7%
    funds: 70,
    approvalByRegion: approval(
      {
        hokkaido_tohoku: 8,
        kanto: 12,
        chubu: 14,
        kansai: 32,
        chugoku_shikoku: 12,
        kyushu_okinawa: 10,
      },
      10,
    ),
  },
  {
    id: 'rikken',
    name: '立憲党',
    isPlayer: false,
    modelDescription: '立憲民主党',
    ideology: { economic: 1, social: 1, diplomatic: 0 },
    seats: 60, // 12.9%
    funds: 80,
    approvalByRegion: approval(
      {
        hokkaido_tohoku: 18,
        kanto: 18,
        chubu: 12,
        kansai: 14,
        chugoku_shikoku: 12,
        kyushu_okinawa: 14,
      },
      15,
    ),
  },
  {
    id: 'jinmin',
    name: '人民党',
    isPlayer: false,
    modelDescription: '共産党+れいわ',
    ideology: { economic: 2, social: 2, diplomatic: 2 },
    seats: 25, // 5.4%
    funds: 40,
    approvalByRegion: approval(
      { kanto: 10, kansai: 12 },
      6,
    ),
  },
];

/** プレイヤー党の議席合計 = 衆議院定数 - NPC合計 */
export const NPC_SEATS_TOTAL = NPC_PARTIES.reduce((s, p) => s + p.seats, 0);

export const PLAYER_PARTY_ID = 'player';

/**
 * プレイヤー党の初期テンプレート (イデオロギー・名前は UI で設定)。
 */
export function createPlayerParty(name: string, ideology: Party['ideology']): Party {
  return {
    id: PLAYER_PARTY_ID,
    name,
    isPlayer: true,
    ideology,
    seats: 465 - NPC_SEATS_TOTAL, // 残りを全て割り当て (約110)
    funds: 60,
    unity: 65,
    approvalByRegion: approval(
      {
        hokkaido_tohoku: 22,
        kanto: 25,
        chubu: 22,
        kansai: 20,
        chugoku_shikoku: 22,
        kyushu_okinawa: 22,
      },
      22,
    ),
  };
}
