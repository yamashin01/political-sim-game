interface IndicatorDeltaProps {
  delta: number | null | undefined;
  /** トレンドのように "上昇 = 悪い" 場合は true にする */
  inverted?: boolean;
  /** 0/null 時に表示する文字列 (デフォルト "─") */
  emptyLabel?: string;
  /** 数値を小数1位までに丸める (トレンド進行度等) */
  decimal?: boolean;
  className?: string;
}

/**
 * 指標やトレンド進行度の前ターン比デルタを「▲+3」「▼-2」「─」形式で描画する。
 * 改善方向は --ink、悪化方向は --vermilion で配色する。
 */
export function IndicatorDelta({
  delta,
  inverted,
  emptyLabel = '─',
  decimal,
  className = '',
}: IndicatorDeltaProps) {
  if (delta === null || delta === undefined || delta === 0) {
    return (
      <span className={`font-mono tabular text-xs text-ink-faint ${className}`}>{emptyLabel}</span>
    );
  }
  // 表示用に丸めた値を先に算出し、丸め結果が 0 のときは
  // 「▲ +0」のような不自然な表示を避けて emptyLabel を返す。
  const display = decimal ? Number(delta.toFixed(1)) : Math.round(delta);
  if (display === 0) {
    return (
      <span className={`font-mono tabular text-xs text-ink-faint ${className}`}>{emptyLabel}</span>
    );
  }
  const isPositive = display > 0;
  // 通常の指標: 上昇 = 良い、下降 = 悪い
  // トレンド: 上昇 = 悪化、下降 = 改善 (inverted)
  const isBad = inverted ? isPositive : !isPositive;
  const arrow = isPositive ? '▲' : '▼';
  const sign = isPositive ? '+' : '';
  return (
    <span
      className={`font-mono tabular text-xs font-bold ${isBad ? 'text-vermilion' : 'text-ink'} ${className}`}
    >
      {arrow} {sign}
      {display}
    </span>
  );
}
