import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  value: number;
  durationMs?: number;
  formatter?: (val: number) => string;
  className?: string;
}

export function CountUp({
  value,
  durationMs = 850,
  formatter = (v) => Math.round(v).toLocaleString('en-IN'),
  className = '',
}: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const startVal = 0;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startVal + (value - startVal) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs, reducedMotion]);

  return <span className={`tabular-nums ${className}`}>{formatter(displayValue)}</span>;
}
