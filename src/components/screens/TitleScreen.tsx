import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function TitleScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const resetGame = useGameStore((s) => s.resetGame);

  const today = new Date();
  const dateLabel = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        {/* ─── EDITION BAR ──────────────────────────────────────── */}
        <div className="rise rule-thick rule-double-b border-b-0 pb-2 mb-1 flex items-baseline justify-between text-[10px] sm:text-xs smallcaps">
          <span className="font-mono tabular">VOL. Ⅰ · NO. 001</span>
          <span className="text-vermilion font-display tracking-widest">❖ 政 局 報 ❖</span>
          <span className="font-mono tabular">
            {dateLabel}（{weekday}）
          </span>
        </div>

        {/* ─── MASTHEAD ─────────────────────────────────────────── */}
        <div className="rise rise-d1 text-center relative pt-6 pb-4">
          <div className="eyebrow eyebrow-red mb-2">日本政治シミュレーション・第一面</div>
          <h1 className="headline text-[14vw] sm:text-[7.5rem] leading-[0.85] text-ink mb-3">
            政 局<span className="text-vermilion">·</span>録
          </h1>
          <div className="font-serif-jp italic text-ink-soft text-sm sm:text-base tracking-wider">
            <span className="dingbat" />
            十年・二十期、政（まつりごと）を握る者は誰か
            <span className="dingbat-after" />
          </div>

          {/* Hanko in masthead corner */}
          <div className="hidden sm:block absolute right-2 top-2 relative">
            <span className="hanko relative">
              仮<br />称
            </span>
          </div>
        </div>

        {/* ─── DOUBLE RULE DIVIDER ──────────────────────────────── */}
        <div className="rise rise-d2 rule-double mt-2 mb-8" />

        {/* ─── LEAD COPY / NEWSROOM PITCH ───────────────────────── */}
        <div className="rise rise-d2 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 mb-10">
          <div className="md:col-span-7 md:border-r md:border-ink/30 md:pr-8">
            <div className="eyebrow mb-3">編集前文</div>
            <p className="font-serif-jp text-[15px] sm:text-base leading-[1.95] text-ink">
              　あなたは新党を率いる党首である。少数政党から始まり、政策の選定、予算の編成、
              選挙の采配、連立交渉――ありとあらゆる政の
              <ruby>
                機微<rt>きび</rt>
              </ruby>
              を 束ねながら、十年（二十ターン）の航海に挑む。
              <br />
              <br />
              　支持率・経済・財政・外交安保・環境――五つの指標は
              <wbr />
              日々揺れ、 トレンドは静かに進行する。いかなる旗を掲げ、何を捨てて何を取るか。
              選択の積み重ねが、やがて<span className="text-vermilion font-bold">称号</span>
              として刻まれる。
            </p>
          </div>

          <aside className="md:col-span-5">
            <div className="eyebrow mb-3 eyebrow-red">本日の見出し</div>
            <ul className="space-y-3 font-serif-jp text-sm leading-relaxed">
              <li className="flex gap-3 border-b border-ink/15 pb-2">
                <span className="font-display font-bold text-vermilion text-xs mt-1 w-8 shrink-0 tabular">
                  壱.
                </span>
                <span>
                  少子高齢化・米中対立・気候変動――不可避の<strong>五大トレンド</strong>が静かに進行
                </span>
              </li>
              <li className="flex gap-3 border-b border-ink/15 pb-2">
                <span className="font-display font-bold text-vermilion text-xs mt-1 w-8 shrink-0 tabular">
                  弐.
                </span>
                <span>48本の政策法案・50超のイベントが政局を揺さぶる</span>
              </li>
              <li className="flex gap-3">
                <span className="font-display font-bold text-vermilion text-xs mt-1 w-8 shrink-0 tabular">
                  参.
                </span>
                <span>
                  最終的に与えられる称号は、あなたの<strong>政治理念</strong>を映す鏡となる
                </span>
              </li>
            </ul>
          </aside>
        </div>

        {/* ─── CALL TO ACTION ───────────────────────────────────── */}
        <div className="rise rise-d3 rule-double pt-8 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end">
            <div>
              <div className="eyebrow eyebrow-red mb-1">第一報</div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                登壇のとき、迫る。
              </h2>
              <p className="font-serif-jp text-sm text-ink-soft mt-2">
                新たな党を結成し、政治運営の指揮を執ってください。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Button
                size="lg"
                className="w-full sm:w-auto sm:min-w-[16rem]"
                onClick={() => {
                  resetGame();
                  setScreen('party_setup');
                }}
              >
                ▶ 新規ゲームを開く
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto sm:min-w-[16rem]"
                onClick={() => setScreen('help')}
              >
                ヘルプ・遊び方
              </Button>
            </div>
          </div>
        </div>

        {/* ─── COLOPHON ─────────────────────────────────────────── */}
        <div className="rise rise-d4 mt-10 pt-4 border-t border-ink/40 flex flex-wrap items-baseline justify-between gap-2 text-[11px] text-ink-faint smallcaps">
          <span className="font-mono tabular">EDITION 0.1.0 · 試作版</span>
          <span className="font-display tracking-widest">❖ ❖ ❖</span>
          <span className="font-serif-jp italic">編集部 ／ Yamada Lab.</span>
        </div>
      </div>
    </div>
  );
}
