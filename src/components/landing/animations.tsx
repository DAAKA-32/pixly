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

// Animated section wrapper with scroll trigger - SSR safe
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

  useEffect(() => {
    // Small delay to ensure smooth hydration
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const variants = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
    scale: scaleIn,
  };

  // Server render: show content immediately (no animation)
  if (!mounted) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // Client: animate based on scroll position
  const shouldAnimate = immediate || isInView;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation - SSR safe
interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  /** If true, animate immediately without waiting for scroll */
  immediate?: boolean;
}

export function StaggerChildren({
  children,
  className = '',
  staggerDelay = 0.1,
  immediate = false,
}: StaggerChildrenProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Server render: show content immediately
  if (!mounted) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const shouldAnimate = immediate || isInView;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
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

// Parallax wrapper - SSR safe
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = '', speed = 0.5 }: ParallaxProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render: static content
  if (!mounted) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Floating animation - SSR safe
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render static on server, animate only after hydration
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ y: 0 }}
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

// Counter animation - SSR safe
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
}: CounterProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render: show value immediately
  if (!mounted) {
    return (
      <span ref={ref} className={className}>
        {prefix}{value}{suffix}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
}

// Magnetic button effect - SSR safe
interface MagneticProps {
  children: ReactNode;
  className?: string;
}

export function Magnetic({ children, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !mounted) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.1;
    const y = (clientY - top - height / 2) * 0.1;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current || !mounted) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  // Server render: just the children without magnetic effect
  if (!mounted) {
    return (
      <div className={`transition-transform duration-300 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

// Reveal text animation - SSR safe
interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function RevealText({ children, className = '', delay = 0 }: RevealTextProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render: show text immediately
  if (!mounted) {
    return (
      <span ref={ref} className={`inline-block ${className}`}>
        {children}
      </span>
    );
  }

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

// Glow on hover - SSR safe
interface GlowHoverProps {
  children: ReactNode;
  className?: string;
}

export function GlowHover({ children, className = '' }: GlowHoverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render: static content
  if (!mounted) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }

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

// =============================================
// ScrollRevealSheet (Nappe) - Premium scroll animation
// Border radius reveals progressively on scroll
// =============================================
interface ScrollRevealSheetProps {
  children: ReactNode;
  className?: string;
  /** Background color class (e.g., 'bg-neutral-900', 'bg-white') */
  bgColor?: string;
  /** Maximum border radius in pixels */
  maxRadius?: number;
  /** Additional padding class */
  padding?: string;
}

export function ScrollRevealSheet({
  children,
  className = '',
  bgColor = 'bg-neutral-900',
  maxRadius = 32,
  padding = 'py-20 sm:py-28',
}: ScrollRevealSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start 0.3'],
  });

  // Transform scroll progress to border radius
  const borderRadius = useTransform(scrollYProgress, [0, 1], [0, maxRadius]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render: static content with full radius
  if (!mounted) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div
          className={`${bgColor} ${padding}`}
          style={{ borderRadius: `${maxRadius}px` }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.div
        className={`${bgColor} ${padding} overflow-hidden`}
        style={{ borderRadius }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// =============================================
// ScrollRevealCard - Card with progressive reveal
// Opacity + scale + radius animation on scroll
// =============================================
interface ScrollRevealCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum border radius in pixels */
  maxRadius?: number;
  /** Delay before animation starts (0-1 based on siblings) */
  index?: number;
}

export function ScrollRevealCard({
  children,
  className = '',
  maxRadius = 24,
  index = 0,
}: ScrollRevealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start 0.6'],
  });

  const borderRadius = useTransform(scrollYProgress, [0, 1], [4, maxRadius]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server render
  if (!mounted) {
    return (
      <div
        ref={cardRef}
        className={className}
        style={{ borderRadius: `${maxRadius}px` }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={`${className} overflow-hidden`}
      style={{ borderRadius, scale }}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
