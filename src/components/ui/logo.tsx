'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Logo Component
// Reusable logo for all application parts
// ===========================================

// Size type for logo variants
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
  variant?: 'default' | 'white';
}

const sizeMap: Record<LogoSize, { container: string; image: number; text: string }> = {
  xs: { container: 'h-7 w-7', image: 28, text: 'text-base' },
  sm: { container: 'h-9 w-9', image: 36, text: 'text-lg' },
  md: { container: 'h-10 w-10', image: 40, text: 'text-xl' },
  lg: { container: 'h-12 w-12', image: 48, text: 'text-2xl' },
  xl: { container: 'h-14 w-14', image: 56, text: 'text-3xl' },
  '2xl': { container: 'h-16 w-16', image: 64, text: 'text-4xl' },
};

export function Logo({
  size = 'md',
  showText = true,
  href,
  className,
  textClassName,
  variant = 'default',
}: LogoProps) {
  const { container, image, text } = sizeMap[size];

  const content = (
    <div className={cn('flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          container,
          'relative flex-shrink-0 rounded-xl overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105'
        )}
      >
        <Image
          src="/logo.jpg"
          alt="Pixly"
          width={image}
          height={image}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            text,
            'font-bold transition-colors',
            variant === 'white' ? 'text-white' : 'text-neutral-900',
            textClassName
          )}
        >
          Pixly
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}

// Icon-only version for tight spaces
export function LogoIcon({
  size = 'md',
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const { container, image } = sizeMap[size];

  return (
    <div
      className={cn(
        container,
        'relative flex-shrink-0 rounded-xl overflow-hidden shadow-md',
        className
      )}
    >
      <Image
        src="/logo.jpg"
        alt="Pixly"
        width={image}
        height={image}
        className="object-cover w-full h-full"
        priority
      />
    </div>
  );
}
