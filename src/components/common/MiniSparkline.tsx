interface MiniSparklineProps {
  /** 時系列データ (左 → 右 で時系列順) */
  data: number[];
  /** 高さ (px) */
  height?: number;
  /** 値の最小値 (デフォルト 0) */
  min?: number;
  /** 値の最大値 (デフォルト 100) */
  max?: number;
  className?: string;
}

/**
 * Layout ティッカー用の極小スパークライン。recharts を使わず pure SVG で実装する。
 * - 線色: --ink/40
 * - 最新点 (末尾) に --vermilion のドット
 * - データが 2点未満なら描画しない (呼び出し側で null チェック想定)
 */
export function MiniSparkline({
  data,
  height = 16,
  min = 0,
  max = 100,
  className = '',
}: MiniSparklineProps) {
  if (data.length < 2) return null;
  const width = 60; // viewBox 内の論理幅。SVG 側で 100% にスケール
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  const lastValue = data[data.length - 1];
  if (lastValue === undefined) return null;
  const lastX = (data.length - 1) * stepX;
  const lastY = height - ((lastValue - min) / range) * height;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block ${className}`}
      style={{ height, width: '100%' }}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--ink) / 0.45)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r={1.4} fill="hsl(var(--vermilion))" />
    </svg>
  );
}
