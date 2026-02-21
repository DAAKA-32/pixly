'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string | ReactNode;
  children?: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
}

export function Tooltip({ content, children, side = 'top', showIcon = false }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
    }

    setPosition({ top, left });
  }, [isOpen, side]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onTouchStart={() => setIsOpen(true)}
        onTouchEnd={() => setTimeout(() => setIsOpen(false), 2000)}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help"
        role="button"
        tabIndex={0}
      >
        {children || (
          showIcon ? (
            <HelpCircle className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 transition-colors" />
          ) : null
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: position.top,
              left: position.left,
              transform: (() => {
                switch (side) {
                  case 'top':
                    return 'translate(-50%, -100%)';
                  case 'bottom':
                    return 'translate(-50%, 0)';
                  case 'left':
                    return 'translate(-100%, -50%)';
                  case 'right':
                    return 'translate(0, -50%)';
                }
              })(),
            }}
          >
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-xl max-w-[min(240px,calc(100vw-2rem))]">
              <p className="text-[11px] leading-relaxed text-neutral-600">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
