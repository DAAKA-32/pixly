'use client';

import { forwardRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ===========================================
// PIXLY - Avatar Component
// Simple and clean avatar with fallback initials
// ===========================================

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

const statusSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-neutral-400',
  away: 'bg-amber-500',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', showStatus, status = 'online', ...props }, ref) => {
    // Generate initials from fallback
    const initials = fallback
      ? fallback
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded-full',
          'transition-transform duration-200',
          sizeClasses[size],
          src ? 'bg-neutral-100' : 'bg-primary-100',
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
            {...props}
          />
        ) : (
          <span className="font-medium text-primary-700">{initials}</span>
        )}

        {/* Status indicator */}
        {showStatus && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
              statusSizeClasses[size],
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group for displaying multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    fallback: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          fallback={avatar.fallback}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-neutral-200 ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          <span className="text-neutral-600 font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}

// Avatar with edit button overlay
interface EditableAvatarProps extends AvatarProps {
  onEdit?: () => void;
  editIcon?: React.ReactNode;
}

const EditableAvatar = forwardRef<HTMLDivElement, EditableAvatarProps>(
  ({ onEdit, editIcon, className, ...props }, ref) => {
    return (
      <div className="relative group">
        <Avatar ref={ref} className={className} {...props} />
        {onEdit && (
          <button
            onClick={onEdit}
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full',
              'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
              'text-white cursor-pointer'
            )}
            type="button"
          >
            {editIcon || (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }
);

EditableAvatar.displayName = 'EditableAvatar';

export { Avatar, AvatarGroup, EditableAvatar };
