import { IndicatorDelta } from '@/components/common/IndicatorDelta';
import type { IndicatorChanges } from '@/types';
import { useEffect, useState } from 'react';

interface HeadlineToastProps {
  /** メインのヘッドライン文 */
  headline: string;
  /** 補助ラベル (デフォルト「号外」) */
  label?: string;
  /** 効果値の表示 (任意) */
  effects?: IndicatorChanges;
  /** 自動消失までのミリ秒 (デフォルト 1800ms) */
  durationMs?: number;
  /** 消失完了時に呼ばれる */
  onComplete?: () => void;
}

const EFFECT_LABEL_MAP: Record<string, string> = {
  approval: '支持',
  economy: '経済',
  finance: '財政',
  diplomacy: '外交',
  environment: '環境',
};

/**
 * 号外ヘッドライン風のオーバーレイトースト。
 * 画面上部からスライドイン → 一定時間表示 → フェードアウト → onComplete。
 *
 * 表示中はクリックを通さない overlay を被せて、誤操作を防ぐ。
 */
export function HeadlineToast({
  headline,
  label = '号外',
  effects,
  durationMs = 1800,
  onComplete,
}: HeadlineToastProps) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const fadeOutDelay = Math.max(0, durationMs - 350);
    const fadeTimer = setTimeout(() => setPhase('out'), fadeOutDelay);
    const completeTimer = setTimeout(() => onComplete?.(), durationMs);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  const effectEntries = effects
    ? Object.entries(effects).filter(([, v]) => v !== undefined && v !== 0)
    : [];

  return (
    <output
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-4 pointer-events-none"
    >
      {/* dim backdrop — pointer-events-auto でクリックを吸収し、トースト表示中の誤操作 (フッターボタン等への意図しない遷移) を防ぐ */}
      <div
        className={`absolute inset-0 bg-ink/10 pointer-events-auto ${
          phase === 'in' ? 'animate-in fade-in duration-200' : 'animate-out fade-out duration-300'
        }`}
      />

      {/* banner */}
      <div
        className={`relative w-full max-w-2xl bg-paper border-2 border-ink shadow-[6px_6px_0_hsl(var(--ink))] ${
          phase === 'in'
            ? 'animate-in slide-in-from-top-4 fade-in duration-300'
            : 'animate-out slide-out-to-top-4 fade-out duration-300'
        }`}
      >
        {/* top label strip */}
        <div className="bg-ink text-paper px-3 py-1 flex items-baseline justify-between text-[10px] smallcaps font-mono tabular">
          <span className="tracking-widest">【 {label} 】 速 報</span>
          <span className="hidden sm:inline">EXTRA · 政局報</span>
        </div>

        {/* body */}
        <div className="px-5 py-4 flex items-start gap-4">
          <span
            className="hanko relative shrink-0"
            style={{ width: '2.8rem', height: '2.8rem', fontSize: '0.9rem' }}
          >
            速報
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg sm:text-xl leading-tight">{headline}</h3>
            {effectEntries.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {effectEntries.map(([k, v]) => (
                  <span key={k} className="flex items-baseline gap-1">
                    <span className="font-display text-[11px] text-ink-soft">
                      {EFFECT_LABEL_MAP[k] ?? k}
                    </span>
                    <IndicatorDelta delta={v as number} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </output>
  );
}
