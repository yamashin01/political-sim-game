/**
 * ゲームバランス係数。
 * ゲームバランス設計書の想定範囲の中央値を暫定値として採用 (プレイテストで調整)。
 */
export const BALANCE = {
  /** 経済情勢補正係数 (選挙ウェイト) — game-balance §3.1 */
  alphaRuling: 0.012, // 暫定: 0.005〜0.02 の中央付近
  alphaCoalition: 0.006, // 暫定: alphaRuling の約半分
  alphaOpposition: 0.006, // 暫定: alphaRuling の約半分

  /** トレンド抑制係数 — game-balance §3.2 */
  tauSuppress: 0.5, // 暫定: 0.3〜0.7 の中央

  /** 1ターンあたりの基準指標変動 (UIの矢印判定用) */
  indicatorChangeBaseline: 3,
} as const;
