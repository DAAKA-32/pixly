'use client';

import { motion, useInView, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef, ReactNode, useState, useEffect } from 'react';

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Animated section wrapper with scroll trigger
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  /** If true, animate immediately without waiting for scroll (for above-the-fold content) */
  immediate?: boolean;
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  immediate = false,
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Handle hydration - ensure content is visible after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
    scale: scaleIn,
  };

  // For SSR: render content visible initially, then animate on mount
  // This prevents flash of invisible content
  const shouldAnimate = mounted && (immediate || isInView);

  return (
    <motion.div
      ref={ref}
      initial={mounted ? 'hidden' : false}
      animate={shouldAnimate ? 'visible' : mounted ? 'hidden' : false}
      variants={variants[direction]}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={!mounted ? { opacity: 1, transform: 'none' } : undefined}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerChildren({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerChildrenProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldAnimate = mounted && isInView;

  return (
    <motion.div
      ref={ref}
      initial={mounted ? 'hidden' : false}
      animate={shouldAnimate ? 'visible' : mounted ? 'hidden' : false}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      style={!mounted ? { opacity: 1 } : undefined}
    >
      {children}
    </motion.div>
  );
}

// Single staggered item
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax wrapper
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = '', speed = 0.5 }: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Floating animation
interface FloatingProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function Floating({
  children,
  className = '',
  duration = 6,
  delay = 0,
}: FloatingProps) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Counter animation
interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function Counter({
  value,
  suffix = '',
  prefix = '',
  className = '',
  duration = 2,
}: CounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isInView && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.span>
        )}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Magnetic button effect
interface MagneticProps {
  children: ReactNode;
  className?: string;
}

export function Magnetic({ children, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.1;
    const y = (clientY - top - height / 2) * 0.1;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Reveal text animation
interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function RevealText({ children, className = '', delay = 0 }: RevealTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Glow on hover
interface GlowHoverProps {
  children: ReactNode;
  className?: string;
}

export function GlowHover({ children, className = '' }: GlowHoverProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: '0 0 40px -8px rgba(16, 185, 129, 0.5)',
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
