import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark';
  vertical?: boolean;
}

export default function Logo({ className, showText = true, variant = 'light', vertical = false }: LogoProps) {
  return (
    <div className={cn(
      "flex items-center gap-3", 
      vertical && "flex-col text-center",
      className
    )}>
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-[#0D9488] rounded-[24%] shadow-lg shadow-teal-900/20" />
        <svg viewBox="0 0 100 100" className="w-8 h-8 relative z-10">
          <path 
            d="M15 50 L35 50 L45 25 L55 75 L65 45 L75 50 L85 50" 
            fill="none" 
            stroke="white" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="45" cy="25" r="4" fill="white" />
        </svg>
      </div>
      {showText && (
          <div className={cn("flex flex-col leading-none", vertical && "items-center")}>
            <span className={cn(
              "text-2xl font-black tracking-tighter uppercase font-sans",
              variant === 'light' ? "text-[#1A1C1E]" : "text-white"
            )}>
              Healio
            </span>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-[0.3em] mt-1",
              variant === 'light' ? "text-[#64748B]" : "text-emerald-500"
            )}>
              Health Hub
            </span>
          </div>
      )}
    </div>
  );
}
