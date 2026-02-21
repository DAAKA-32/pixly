'use client';

import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef, type ReactNode, useState, useEffect } from 'react';

// ===========================================
// PIXLY — Premium Landing Page Animations
// GPU-accelerated: opacity + transform + filter
// Premium easing: [0.22, 1, 0.36, 1]
// Blur-to-focus depth reveal
//
// Uses whileInView (not useInView + animate) to
// correctly observe the rendered DOM element.
// SSR: plain <div> for visible server HTML (SEO).
// Client: <motion.div> with whileInView triggers.
// ===========================================

const EASE = [0.22, 1, 0.36, 1] as const;

// Base variants — used internally
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 16, filter: 'blur(4px)' },
  visible: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
};

// ===========================================
// AnimatedSection
// Scroll-triggered reveal with direction support
// Blur-to-focus + transform for premium depth
// ===========================================

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  immediate?: boolean;
}

const directionVariants = {
  up: fadeInUp,
  down: fadeInDown,
  left: fadeInLeft,
  right: fadeInRight,
  scale: scaleIn,
};

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // SSR: render visible static content (SEO-friendly)
  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={directionVariants[direction]}
      transition={{ duration: 0.75, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===========================================
// StaggerChildren
// Container that orchestrates staggered reveals
// ===========================================

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  immediate?: boolean;
}

export function StaggerChildren({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerChildrenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
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

// ===========================================
// StaggerItem
// Individual child with blur-to-focus reveal
// ===========================================

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.65, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===========================================
// ScrollRevealCard
// Index-based stagger with blur-to-focus
// ===========================================

interface ScrollRevealCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function ScrollRevealCard({
  children,
  className = '',
  index = 0,
}: ScrollRevealCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.65,
        ease: EASE,
        delay: index * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}

// ===========================================
// Parallax — Scroll-driven vertical offset
// ===========================================

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

// ===========================================
// HeroScrollFade — Scroll-driven fade out
// Fades and lifts the Hero text block as user
// scrolls down. GPU-only: opacity + transform.
// ===========================================

interface HeroScrollFadeProps {
  children: ReactNode;
  className?: string;
}

export function HeroScrollFade({ children, className }: HeroScrollFadeProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, [0, 350], [1, 0]);
  const y = useTransform(scrollY, [0, 350], [0, -24]);
  const scale = useTransform(scrollY, [0, 350], [1, 0.98]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} style={{ opacity, y, scale }}>
      {children}
    </motion.div>
  );
}

// ===========================================
// RevealText — Clip-path text reveal
// ===========================================

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function RevealText({ children, className = '', delay = 0 }: RevealTextProps) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className={`inline-block ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}
