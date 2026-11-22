import { useRef } from 'react';
import { MathText } from './MathText';

interface ScalarInputProps {
  value: string;
  onChange: (val: string) => void;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  onEnter?: () => void;
}

export function SmartScalarInput({
  value,
  onChange,
  unit,
  placeholder = 'z. B. 3, -1/2, sqrt(2), 3pi/4',
  disabled = false,
  onEnter,
}: ScalarInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const insertToken = (token: string) => {
    const el = inputRef.current;
    if (!el) {
      onChange(value + token);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = token.endsWith('()') ? start + token.length - 1 : start + token.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) onEnter();
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-page)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
        {unit && <span className="text-sm font-semibold text-[var(--text-muted)]">{unit}</span>}
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '√( )', token: 'sqrt()' },
            { label: 'π', token: 'pi' },
            { label: '°', token: '°' },
            { label: '/', token: '/' },
            { label: '−', token: '-' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => insertToken(btn.token)}
              className="px-2 py-0.5 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-subtle)] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
              title={`Einfügen: ${btn.token}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface VectorGridInputProps {
  dim: 2 | 3;
  values: string[];
  onChange: (vals: string[]) => void;
  disabled?: boolean;
  onEnter?: () => void;
}

export function VectorGridInput({
  dim,
  values,
  onChange,
  disabled = false,
  onEnter,
}: VectorGridInputProps) {
  const padded = Array.from({ length: dim }, (_, i) => values[i] ?? '');
  const labels = dim === 2 ? ['x', 'y'] : ['x', 'y', 'z'];

  const handleCell = (idx: number, val: string) => {
    const next = [...padded];
    next[idx] = val;
    onChange(next);
  };

  return (
    <div className="inline-flex items-stretch gap-2 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)]">
      {/* Left tall bracket */}
      <div className="w-2 border-l-2 border-t-2 border-b-2 border-[var(--text-main)] rounded-l-md opacity-70" />
      <div className="flex flex-col gap-1.5">
        {padded.map((cell, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] w-3">{labels[idx]}</span>
            <input
              type="text"
              value={cell}
              disabled={disabled}
              onChange={(e) => handleCell(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && idx === dim - 1 && onEnter) onEnter();
              }}
              placeholder="0"
              className="w-24 px-2.5 py-1.5 text-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>
        ))}
      </div>
      {/* Right tall bracket */}
      <div className="w-2 border-r-2 border-t-2 border-b-2 border-[var(--text-main)] rounded-r-md opacity-70" />
      <div className="self-center pl-2 text-[11px] text-[var(--text-muted)] max-w-[140px]">
        <MathText text="Mit `Tab` zur nächsten Zeile springen. Brüche wie `1/3` erlaubt." />
      </div>
    </div>
  );
}

interface MatrixGridInputProps {
  rows: number;
  cols: number;
  values: string[];
  onChange: (vals: string[]) => void;
  disabled?: boolean;
  onEnter?: () => void;
}

export function MatrixGridInput({
  rows,
  cols,
  values,
  onChange,
  disabled = false,
  onEnter,
}: MatrixGridInputProps) {
  const total = rows * cols;
  const padded = Array.from({ length: total }, (_, i) => values[i] ?? '');

  const handleCell = (idx: number, val: string) => {
    const next = [...padded];
    next[idx] = val;
    onChange(next);
  };

  return (
    <div className="inline-flex items-stretch gap-2 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-subtle)] max-w-full overflow-x-auto">
      <div className="w-2 border-l-2 border-t-2 border-b-2 border-[var(--text-main)] rounded-l-md opacity-70 shrink-0" />
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(56px, 72px))` }}
      >
        {padded.map((cell, idx) => {
          const r = Math.floor(idx / cols) + 1;
          const c = (idx % cols) + 1;
          return (
            <input
              key={idx}
              type="text"
              value={cell}
              disabled={disabled}
              aria-label={`Matrix-Eintrag Zeile ${r}, Spalte ${c}`}
              onChange={(e) => handleCell(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && idx === total - 1 && onEnter) onEnter();
              }}
              placeholder="0"
              className="w-full px-2 py-1.5 text-center rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          );
        })}
      </div>
      <div className="w-2 border-r-2 border-t-2 border-b-2 border-[var(--text-main)] rounded-r-md opacity-70 shrink-0" />
      <div className="self-center pl-2 text-[11px] text-[var(--text-muted)] max-w-[150px] shrink-0">
        <MathText text={`${rows}×${cols}-Matrix zeilenweise. Mit \`Tab\` springen, z. B. \`-1/2\` oder \`sqrt(2)/2\`.`} />
      </div>
    </div>
  );
}
