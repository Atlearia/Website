'use client';

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  id: string;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
}

export function Section({
  children,
  id,
  className = '',
  containerClassName = '',
  fullWidth = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-20', // scroll-mt accounts for fixed navbar
        className
      )}
    >
      {fullWidth ? (
        children
      ) : (
        <div
          className={cn(
            'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            containerClassName
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  alignment = 'center',
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        alignment === 'center' && 'text-center',
        className
      )}
    >
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Section;
