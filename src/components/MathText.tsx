import katex from 'katex';
import { useMemo } from 'react';

interface FormulaProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export function Formula({ latex, display = false, className = '' }: FormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return latex;
    }
  }, [latex, display]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renders prose containing inline `$...$`, display `$$...$$`, and `**bold**` formatting.
 */
export function MathText({ text, className = '' }: MathTextProps) {
  const parts = useMemo(() => {
    const tokens: { type: 'text' | 'bold' | 'inline-math' | 'display-math'; content: string }[] = [];
    // Split display math $$...$$ first, then inline math $...$, then **bold**
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\*\*[^*]+?\*\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        tokens.push({ type: 'display-math', content: raw.slice(2, -2).trim() });
      } else if (raw.startsWith('$') && raw.endsWith('$')) {
        tokens.push({ type: 'inline-math', content: raw.slice(1, -1).trim() });
      } else if (raw.startsWith('**') && raw.endsWith('**')) {
        tokens.push({ type: 'bold', content: raw.slice(2, -2) });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }
    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.type === 'display-math') {
          return <Formula key={idx} latex={part.content} display className="block my-2" />;
        }
        if (part.type === 'inline-math') {
          return <Formula key={idx} latex={part.content} />;
        }
        if (part.type === 'bold') {
          return (
            <strong key={idx} className="font-semibold">
              {part.content}
            </strong>
          );
        }
        return <span key={idx}>{part.content}</span>;
      })}
    </span>
  );
}
