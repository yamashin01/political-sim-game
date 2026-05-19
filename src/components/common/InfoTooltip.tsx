import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

interface InfoTooltipProps {
  /** ツールチップに表示する内容 */
  content: ReactNode;
  /** 対象用語の名前 (アクセシビリティ用) */
  label: string;
}

/**
 * Editorial footnote marker. Renders a small superscript asterisk in vermilion
 * that opens an annotation popover on click/tap, in the style of a newspaper
 * footnote (脚注).
 */
export function InfoTooltip({ content, label }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${label}の説明を表示`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className="group inline-flex items-center justify-center h-4 w-4 ml-0.5 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-vermilion"
      >
        <span
          aria-hidden="true"
          className="font-display text-vermilion text-[15px] leading-none transition-transform group-hover:scale-125 group-hover:text-vermilion-deep"
        >
          ※
        </span>
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 border border-ink bg-paper text-ink shadow-[3px_3px_0_-1px_hsl(var(--ink))] before:absolute before:-top-[6px] before:left-1/2 before:-translate-x-1/2 before:h-2 before:w-2 before:border-l before:border-t before:border-ink before:bg-paper before:rotate-45"
        >
          <span className="block px-3 pt-1 pb-0 text-[10px] smallcaps font-mono tabular tracking-widest text-vermilion border-b border-ink/40">
            ※ 脚注 · {label}
          </span>
          <span className="block px-3 py-2 text-[12px] leading-relaxed font-serif-jp">
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
