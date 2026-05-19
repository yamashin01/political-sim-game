import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

interface ExplanationBoxProps {
  title: string;
  children: ReactNode;
}

export function ExplanationBox({ title, children }: ExplanationBoxProps) {
  return (
    <section
      role="note"
      aria-label={`${title}の説明`}
      className="mb-4 rounded-md border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100"
    >
      <div className="flex gap-3 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="space-y-1 text-sm leading-relaxed">
          <div className="font-semibold">{title}</div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
