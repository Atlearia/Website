'use client';

// ============================================================================
// CUBE FACE COMPONENT - AESTHETIC CV CONTENT
// ============================================================================

import { motion } from 'framer-motion';
import type { CubeFaceContent } from '@/content/cubeContent';

// Icon components
const Icons = {
  github: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  ),
  linkedin: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  star: () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  code: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  trophy: () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-1.17a3 3 0 01-5.66 0H5a2 2 0 110-4h1.17A3 3 0 015 5zm5 10a1 1 0 011 1v2H9v-2a1 1 0 011-1zm-4 3a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
};

interface CubeFaceProps {
  content: CubeFaceContent;
  isActive: boolean;
}

export function CubeFace({ content, isActive }: CubeFaceProps) {
  const [gradientFrom, gradientTo] = content.gradient;

  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ 
        opacity: isActive ? 1 : 0.9,
        scale: isActive ? 1 : 0.98,
      }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full select-none overflow-hidden"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(145deg, ${gradientFrom}08 0%, ${gradientTo}15 50%, ${gradientFrom}08 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${gradientFrom}30`,
        }}
      />

      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${gradientFrom}40, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})` }}
            />
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: gradientFrom }}
            >
              {content.title}
            </h2>
          </div>
          {content.subtitle && (
            <p className="text-xs text-gray-400 ml-3 font-medium">{content.subtitle}</p>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {/* Description */}
          {content.description && (
            <p className="text-[10px] text-gray-400 leading-relaxed mb-3 italic">
              "{content.description}"
            </p>
          )}

          {/* Items list with icons */}
          {content.items && (
            <div className="space-y-2">
              {content.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                  style={{ background: `${gradientFrom}08` }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: `${gradientFrom}20` }}
                    >
                      <span style={{ color: gradientFrom }}>
                        <Icons.code />
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{item.label}</span>
                  </div>
                  <span 
                    className="text-[10px] font-semibold text-right max-w-[100px] truncate"
                    style={{ color: gradientTo }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Contact links */}
          {content.links && (
            <div className="space-y-2">
              {content.links.map((link, index) => {
                const IconComponent = Icons[link.icon as keyof typeof Icons];
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg transition-all hover:scale-[1.02]"
                    style={{ 
                      background: `${gradientFrom}10`,
                      border: `1px solid ${gradientFrom}20`,
                    }}
                  >
                    {IconComponent && (
                      <span style={{ color: gradientFrom }}>
                        <IconComponent />
                      </span>
                    )}
                    <span className="text-xs text-gray-300 font-medium">{link.label}</span>
                    <svg className="w-3 h-3 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer highlight badge */}
        {content.highlight && (
          <div className="mt-auto pt-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom}25, ${gradientTo}25)`,
                color: gradientTo,
                border: `1px solid ${gradientFrom}40`,
              }}
            >
              <Icons.star />
              {content.highlight}
            </div>
          </div>
        )}
      </div>

      {/* Active glow */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 30px ${gradientFrom}15, 0 0 40px ${gradientFrom}10`,
          }}
        />
      )}
    </motion.div>
  );
}
