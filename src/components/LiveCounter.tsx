'use client';

import { useEffect, useRef, useState } from 'react';
import { useRealtime } from './RealtimeProvider';

type Props = { readonly initialCount: number };

export default function LiveCounter({ initialCount }: Props) {
  const { totalCount } = useRealtime();
  const count = totalCount === 0 ? initialCount : totalCount;
  const [displayCount, setDisplayCount] = useState(initialCount);
  const frameRef = useRef<number>(0);
  // Track the animated-from value across renders without triggering re-renders itself.
  const animatedFrom = useRef(initialCount);

  useEffect(() => {
    const start = animatedFrom.current;
    const diff = count - start;
    if (diff === 0) return;

    const duration = Math.min(Math.abs(diff) * 30, 800);
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + diff * eased);
      setDisplayCount(next);
      animatedFrom.current = next;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [count]);

  return (
    <div className="live-counter">
      <span className="counter-number">{displayCount.toLocaleString()}</span>
      <span className="counter-label">positive moments shared</span>
    </div>
  );
}
