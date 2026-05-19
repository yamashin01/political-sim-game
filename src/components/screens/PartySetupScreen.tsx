import { ExplanationBox } from '@/components/common/ExplanationBox';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NPC_PARTIES } from '@/data/parties';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { Ideology } from '@/types';
import { useState } from 'react';

const NPC_NAMES = NPC_PARTIES.map((p) => p.name);

const AXES = [
  {
    key: 'economic' as const,
    label: '経済軸',
    negative: '小さな政府',
    positive: '大きな政府',
    tooltip: '-2 (小さな政府) 〜 +2 (大きな政府)。財政・経済政策の親和性に影響します。',
  },
  {
    key: 'social' as const,
    label: '社会軸',
    negative: '保守',
    positive: 'リベラル',
    tooltip: '-2 (保守) 〜 +2 (リベラル)。社会保障や教育政策の親和性に影響します。',
  },
  {
    key: 'diplomatic' as const,
    label: '外交軸',
    negative: '同盟重視',
    positive: '自主路線',
    tooltip: '-2 (同盟重視) 〜 +2 (自主路線)。外交安保政策の親和性に影響します。',
  },
];

const AXIS_NUM = ['壱', '弐', '参'] as const;

export function PartySetupScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const enqueueEvents = useUiStore((s) => s.enqueueEvents);

  const [partyName, setPartyName] = useState('新政党');
  const [ideology, setIdeology] = useState<Ideology>({
    economic: 0,
    social: 0,
    diplomatic: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const positioning = describePosition(ideology);

  const handleStart = () => {
    if (!partyName.trim()) {
      setError('党名を入力してください');
      return;
    }
    if (NPC_NAMES.includes(partyName.trim())) {
      setError(`「${partyName}」は他の党と重複します。別の党名にしてください。`);
      return;
    }
    setError(null);
    const eventIds = startNewGame(partyName.trim(), ideology);
    enqueueEvents(eventIds);
    setScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* ─── DOCUMENT HEAD: certificate-style ───────────────────── */}
        <div className="rise rule-thick border-b-0 pb-2 flex items-baseline justify-between text-[10px] smallcaps font-mono tabular">
          <span>FORM No. 政-001</span>
          <span className="text-vermilion font-display tracking-widest">政 党 設 立 届</span>
          <span>受付：政局報・編集部</span>
        </div>
        <div className="rise rise-d1 rule-double-b mb-8 flex items-center justify-between gap-4 pt-3 pb-4">
          <div>
            <div className="eyebrow eyebrow-red">第一手続</div>
            <h1 className="headline text-3xl sm:text-5xl leading-none">党を、興す。</h1>
            <p className="font-serif-jp italic text-ink-soft text-sm mt-2">
              　党名と理念三軸を定めれば、登壇の手続きは完了する。
            </p>
          </div>
          <span className="hanko relative shrink-0">
            届<br />出
          </span>
        </div>

        {/* ─── EDITORIAL EXPLANATION ──────────────────────────────── */}
        <div className="rise rise-d2">
          <ExplanationBox title="党設立の手引き" kicker="第一手続">
            あなたが率いる党の党名とイデオロギーを設定します。 経済・社会・外交の三軸の立ち位置は、
            ゲーム中の<strong>連立交渉</strong>や<strong>政策通過</strong>の判定に影響します。
            設定はゲーム開始後は変更できません。
          </ExplanationBox>
        </div>

        {/* ─── FORM BODY ──────────────────────────────────────────── */}
        <div className="rise rise-d3 border border-ink bg-paper/70 shadow-[6px_6px_0_-2px_hsl(var(--rule))]">
          {/* Section 一: 党名 */}
          <section className="border-b border-ink/70">
            <header className="flex items-baseline gap-3 px-5 pt-4 pb-2 border-b border-dashed border-ink/40">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                第一条
              </span>
              <h2 className="font-display font-bold text-lg">党 名（とうめい）</h2>
              <span className="text-ink-faint text-xs font-serif-jp italic ml-auto">
                ※20文字以内・他党名と重複不可
              </span>
            </header>
            <div className="px-5 py-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-ink-soft text-sm shrink-0 mb-2">党名:</span>
                <Input
                  id="partyName"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  maxLength={20}
                  placeholder="例: 新政党"
                  className="rounded-none border-0 border-b-2 border-ink bg-transparent font-display text-2xl sm:text-3xl px-1 focus-visible:ring-0 focus-visible:border-vermilion h-12"
                />
              </div>
            </div>
          </section>

          {/* Section 二: イデオロギー */}
          <section className="border-b border-ink/70">
            <header className="flex items-baseline gap-3 px-5 pt-4 pb-2 border-b border-dashed border-ink/40">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                第二条
              </span>
              <h2 className="font-display font-bold text-lg">理 念 三 軸</h2>
              <span className="text-ink-faint text-xs font-serif-jp italic ml-auto">
                各軸 -2 〜 +2
              </span>
            </header>
            <div className="px-5 py-5 space-y-5">
              {AXES.map((axis, idx) => (
                <div key={axis.key} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-bold text-vermilion text-[10px] tabular tracking-widest">
                        {AXIS_NUM[idx]}.
                      </span>
                      <span className="font-display font-bold tracking-wide text-base inline-flex items-center">
                        {axis.label}
                        <InfoTooltip label={axis.label} content={axis.tooltip} />
                      </span>
                    </div>
                    <span className="font-mono tabular font-bold text-vermilion text-lg">
                      {ideology[axis.key] > 0 ? `+${ideology[axis.key]}` : ideology[axis.key]}
                    </span>
                  </div>
                  <div className="grid grid-cols-[6rem_1fr_6rem] items-center gap-3">
                    <span className="text-xs text-ink-soft text-right font-serif-jp">
                      {axis.negative}
                    </span>
                    <div className="flex gap-0 border border-ink">
                      {[-2, -1, 0, 1, 2].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setIdeology((s) => ({ ...s, [axis.key]: v }))}
                          className={`flex-1 h-10 font-mono tabular text-sm transition-colors border-r border-ink last:border-r-0 ${
                            ideology[axis.key] === v
                              ? 'bg-ink text-paper font-bold'
                              : 'bg-paper hover:bg-paper-deep text-ink'
                          }`}
                        >
                          {v > 0 ? `+${v}` : v}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-ink-soft font-serif-jp">{axis.positive}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 三: 推測ポジショニング */}
          <section>
            <header className="flex items-baseline gap-3 px-5 pt-4 pb-2 border-b border-dashed border-ink/40">
              <span className="font-display font-bold text-vermilion text-xs tabular tracking-widest">
                附 記
              </span>
              <h2 className="font-display font-bold text-lg">論 説 部・所 見</h2>
            </header>
            <div className="px-5 py-5 grid grid-cols-[1fr_auto] gap-4 items-center">
              <p className="font-serif-jp text-base italic">
                <span className="text-vermilion mr-1">"</span>
                {positioning}
                <span className="text-vermilion ml-1">"</span>
              </p>
              <span className="font-display text-xs tracking-widest text-ink-faint">
                — 編集部評
              </span>
            </div>
          </section>
        </div>

        {/* ─── ERROR / ACTION ─────────────────────────────────────── */}
        {error && (
          <div className="rise mt-4 border border-vermilion bg-vermilion/5 px-4 py-2 font-serif-jp text-sm text-vermilion-deep">
            <span className="font-display font-bold tracking-widest mr-2">⚠ 警告</span>
            {error}
          </div>
        )}

        <div className="rise rise-d4 mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setScreen('title')}>
            ← 一面へ戻る
          </Button>
          <div className="flex items-baseline gap-3 text-xs font-serif-jp italic text-ink-soft">
            <span>署名により本届を確定する</span>
          </div>
          <Button onClick={handleStart}>▶ 党を登録し、登壇する</Button>
        </div>
      </div>
    </div>
  );
}

function describePosition(i: Ideology): string {
  if (i.economic === 0 && i.social === 0 && i.diplomatic === 0) {
    return '中道 (全軸0)。特徴のない党との評価に注意。';
  }
  const parts: string[] = [];
  if (i.social <= -1) parts.push('保守');
  else if (i.social >= 1) parts.push('リベラル');
  else parts.push('中道');

  if (i.economic <= -1) parts.push('小さな政府');
  else if (i.economic >= 1) parts.push('大きな政府');

  if (i.diplomatic <= -1) parts.push('同盟重視');
  else if (i.diplomatic >= 1) parts.push('自主路線');

  return `${parts.join('・')}寄り`;
}
