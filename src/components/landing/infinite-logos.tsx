'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ===========================================
// PIXLY - Infinite Logos Carousel
// Smooth horizontal auto-scroll animation
// ===========================================

interface Logo {
  name: string;
  src?: string;
}

interface InfiniteLogosProps {
  logos?: Logo[];
  speed?: number; // pixels per second
  direction?: 'left' | 'right';
  className?: string;
}

const defaultLogos: Logo[] = [
  { name: 'Meta Ads', src: '/logos/meta.svg' },
  { name: 'Google Ads', src: '/logos/google.svg' },
  { name: 'TikTok Ads', src: '/logos/tiktok.svg' },
  { name: 'Shopify', src: '/logos/shopify.svg' },
  { name: 'WooCommerce', src: '/logos/woocommerce.svg' },
  { name: 'Stripe', src: '/logos/stripe.svg' },
  { name: 'Klaviyo', src: '/logos/klaviyo.svg' },
  { name: 'Zapier', src: '/logos/zapier.svg' },
];

export function InfiniteLogos({
  logos = defaultLogos,
  speed = 30,
  direction = 'left',
  className = '',
}: InfiniteLogosProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      const firstSet = containerRef.current.querySelector('[data-logo-set="1"]');
      if (firstSet) {
        setContentWidth(firstSet.scrollWidth);
      }
    }
  }, [logos]);

  // Calculate animation duration based on content width and speed
  // Use a default duration for SSR/initial render, then calculate precise duration
  const defaultDuration = 25; // Fallback duration in seconds
  const duration = contentWidth > 0 ? contentWidth / speed : defaultDuration;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient masks for smooth edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-r from-neutral-50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-l from-neutral-50 to-transparent" />

      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="flex"
        style={{
          animation: mounted ? `scroll-${direction} ${duration}s linear infinite` : `scroll-${direction} ${defaultDuration}s linear infinite`,
        }}
      >
        {/* First set of logos */}
        <div data-logo-set="1" className="flex shrink-0 items-center gap-6 sm:gap-12 px-3 sm:px-6">
          {logos.map((logo, index) => (
            <LogoItem key={`1-${index}`} logo={logo} />
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div data-logo-set="2" className="flex shrink-0 items-center gap-6 sm:gap-12 px-3 sm:px-6">
          {logos.map((logo, index) => (
            <LogoItem key={`2-${index}`} logo={logo} />
          ))}
        </div>

        {/* Third set for extra smoothness */}
        <div data-logo-set="3" className="flex shrink-0 items-center gap-6 sm:gap-12 px-3 sm:px-6">
          {logos.map((logo, index) => (
            <LogoItem key={`3-${index}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
        @keyframes scroll-right {
          from {
            transform: translateX(-33.333%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

function LogoItem({ logo }: { logo: Logo }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex shrink-0 items-center gap-2.5 sm:gap-3 rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {logo.src && !imageError ? (
        <div className="relative h-6 w-6">
          <Image
            src={logo.src}
            alt={logo.name}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-xs font-bold text-neutral-400">
          {logo.name.charAt(0)}
        </div>
      )}
      <span className="whitespace-nowrap text-xs sm:text-sm font-medium text-neutral-700">
        {logo.name}
      </span>
    </motion.div>
  );
}

// Simpler text-only version for minimal design
export function InfiniteLogosMinimal({
  logos = defaultLogos,
  speed = 40,
  className = '',
}: InfiniteLogosProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient masks */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white to-transparent" />

      {/* Scrolling container */}
      <div
        className="flex animate-scroll-left"
        style={{
          animationDuration: `${logos.length * 3}s`,
        }}
      >
        {[1, 2, 3].map((set) => (
          <div key={set} className="flex shrink-0 items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <span
                key={`${set}-${index}`}
                className="whitespace-nowrap text-xl font-bold text-neutral-300 transition-colors hover:text-neutral-500"
              >
                {logo.name}
              </span>
            ))}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scroll-left-minimal {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left-minimal linear infinite;
        }
      `}</style>
    </div>
  );
}
