'use client';

import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';

export function ThinkingAnimation() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full py-4 px-6">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white animate-pulse">
          <Bot className="h-4 w-4" />
        </div>
        <div className="space-y-2 overflow-hidden rounded-2xl px-4 py-3 bg-muted/50">
          <div className="flex gap-1 items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-muted-foreground">
            Analisando{dots}
          </p>
        </div>
      </div>
    </div>
  );
}
