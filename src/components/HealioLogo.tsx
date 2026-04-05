import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface HealioLogoProps {
  size?: number;
  withText?: boolean;
  vertical?: boolean;
  isDarkMode?: boolean;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function HealioLogo({
  size = 24,
  withText = false,
  vertical = false,
  isDarkMode = false,
  titleClassName = '',
  subtitleClassName = '',
}: HealioLogoProps) {
  const iconSize = typeof size === 'number' ? Math.round(size * 0.6) : 14;

  return (
    <div
      className={cn(
        'flex items-center gap-3 transition-all duration-300',
        vertical && 'flex-col justify-center'
      )}
    >
      {/* Logo Icon */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110',
          `w-${size} h-${size}`,
          isDarkMode
            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
            : 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-md shadow-emerald-200/50'
        )}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
      >
        <Heart size={iconSize} strokeWidth={2.5} />
      </div>

      {/* Text Content */}
      {withText && (
        <div className={cn('transition-all duration-300', vertical && 'text-center')}>
          <h1
            className={cn(
              'font-black tracking-tight leading-tight transition-all duration-300',
              titleClassName || 'text-xl',
              isDarkMode
                ? 'text-white drop-shadow-sm'
                : 'text-slate-900 drop-shadow-sm'
            )}
          >
            Healio
          </h1>
          <p
            className={cn(
              'font-bold uppercase tracking-widest opacity-70 transition-all duration-300',
              subtitleClassName || 'text-xs',
              isDarkMode
                ? 'text-slate-400 drop-shadow-sm'
                : 'text-slate-600 drop-shadow-sm'
            )}
          >
            Healthcare AI
          </p>
        </div>
      )}
    </div>
  );
}
