import { HelpCircle } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface InfoTooltipProps {
  /** ツールチップに表示する内容 */
  content: ReactNode;
  /** 対象用語の名前 (アクセシビリティ用) */
  label: string;
}

export function InfoTooltip({ content, label }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

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
        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md"
        >
          {content}
        </span>
      )}
    </span>
  );
}
