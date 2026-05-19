import type { ReactNode } from 'react';

interface ExplanationBoxProps {
  title: string;
  children: ReactNode;
  /** 任意の補助カテゴリ。例: "解説", "総論", "編集部より" */
  kicker?: string;
}

export function ExplanationBox({ title, children, kicker = '解説' }: ExplanationBoxProps) {
  return (
    <aside
      role="note"
      aria-label={`${title}の説明`}
      className="relative mb-6 border-y border-ink bg-paper/60"
    >
      {/* Top eyebrow strip */}
      <div className="absolute -top-[1px] left-0 right-0 flex justify-between text-[10px] smallcaps px-3 py-0.5 bg-ink text-paper font-mono tabular">
        <span className="tracking-widest">
          【 {kicker} 】 {title}
        </span>
        <span className="hidden sm:inline">EDITORIAL · 政局報</span>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 pt-7 pb-4 flex gap-4">
        {/* Vertical accent rail */}
        <div className="flex flex-col items-center pt-1">
          <span className="block w-1 h-1 bg-vermilion rounded-full" />
          <span className="block w-px flex-1 bg-ink/40 my-1" />
          <span className="block w-1 h-1 bg-vermilion rounded-full" />
        </div>

        <div className="font-serif-jp text-[14px] sm:text-[15px] leading-[1.9] text-ink">
          {children}
        </div>
      </div>
    </aside>
  );
}
