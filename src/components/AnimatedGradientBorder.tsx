import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  borderRadius?: string;
}

export function AnimatedGradientBorder({ 
  children, 
  className, 
  innerClassName,
  borderRadius = "2rem"
}: AnimatedGradientBorderProps) {
  return (
    <div 
      className={cn("relative p-[1.5px] overflow-hidden transition-all duration-500", className)}
      style={{ borderRadius: borderRadius }}
    >
      <div 
        className="absolute inset-[-1000%] animate-gradient-rotate bg-[conic-gradient(from_90deg_at_50%_50%,#E9681D_0.1%,#6440A4_50%,#E9681D_99.9%)] opacity-100" 
      />
      <div 
        className={cn("relative h-full w-full bg-white dark:bg-slate-900 border-none", innerClassName)}
        style={{ borderRadius: `calc(${borderRadius} - 1.5px)` }}
      >
        {children}
      </div>
    </div>
  );
}
