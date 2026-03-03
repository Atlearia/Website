'use client';

// ============================================================================
// CUBE FACE COMPONENT - SOLID VISIBLE CV CONTENT
// ============================================================================

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
};

interface CubeFaceProps {
  content: CubeFaceContent;
}

export function CubeFace({ content }: CubeFaceProps) {
  const [gradientFrom, gradientTo] = content.gradient;

  return (
    <div
      className="cube-face-content w-full h-full select-none overflow-hidden relative"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        background: '#0b1120',
        // Why this works: keep each face in its own stable 3D layer to avoid
        // flattening/backface artifacts while the parent cube rotates.
        transform: 'translateZ(0.1px)',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
        contain: 'layout style paint',
      }}
    >
      {/* Aesthetic background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(120px 120px at 18% 20%, ${gradientFrom}22, transparent 60%),
            radial-gradient(140px 140px at 85% 75%, ${gradientTo}22, transparent 60%),
            linear-gradient(135deg, ${gradientFrom}12 0%, transparent 45%),
            repeating-linear-gradient(45deg, #0f172a 0 6px, #0b1120 6px 12px)
          `,
          opacity: 0.9,
        }}
      />

      {/* Side accents */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: '4px',
          background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`,
          opacity: 1,
        }}
      />
      <div
        className="absolute right-0 top-10"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '999px',
          background: `radial-gradient(circle, ${gradientFrom}55 0%, transparent 65%)`,
          opacity: 0.8,
        }}
      />
      <div
        className="absolute left-8 bottom-6"
        style={{
          width: '70px',
          height: '2px',
          background: `linear-gradient(90deg, ${gradientTo}, transparent)`,
          opacity: 0.8,
        }}
      />

      {/* Center info panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full h-full"
          style={{
            width: '78%',
            height: '78%',
            background: '#0f172a',
            border: `1px solid ${gradientFrom}40`,
            boxShadow: `0 0 18px ${gradientFrom}22, inset 0 0 18px #0b1120`,
          }}
        >
          {/* Top accent line */}
          <div
            className="w-full"
            style={{
              height: '2px',
              background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo}50, transparent)`,
            }}
          />

          {/* Content */}
          <div className="relative h-full px-4 pt-3 pb-3 flex flex-col" style={{ height: 'calc(100% - 2px)' }}>
            {/* Header */}
            <div className="mb-2">
              <h2
                className="text-lg font-bold tracking-tight leading-tight"
                style={{ color: gradientFrom }}
              >
                {content.title}
              </h2>
              {content.subtitle && (
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{content.subtitle}</p>
              )}
            </div>

            {/* Thin separator */}
            <div
              className="mb-2"
              style={{
                height: '1px',
                background: `linear-gradient(90deg, ${gradientFrom}60, transparent)`,
              }}
            />

            {/* Description */}
            {content.description && (
              <p className="text-[10px] text-gray-400 leading-relaxed mb-2">
                {content.description}
              </p>
            )}

            {/* Items list */}
            {content.items && (
              <div className="flex-1 space-y-1 overflow-hidden">
                {content.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 px-2"
                    style={{
                      background: '#111827',
                      borderLeft: `2px solid ${gradientFrom}80`,
                    }}
                  >
                    <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                    <span
                      className="text-[10px] font-semibold text-gray-200 text-right"
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Contact links */}
            {content.links && (
              <div className="flex-1 space-y-1.5 overflow-hidden">
                {content.links.map((link, index) => {
                  const IconComponent = Icons[link.icon as keyof typeof Icons];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 py-1.5 px-2.5"
                      style={{
                        background: '#111827',
                        borderLeft: `2px solid ${gradientFrom}80`,
                      }}
                    >
                      {IconComponent && (
                        <span style={{ color: gradientFrom }}>
                          <IconComponent />
                        </span>
                      )}
                      <span className="text-[10px] text-gray-300 font-medium truncate">{link.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer highlight badge */}
            {content.highlight && (
              <div className="mt-auto pt-2">
                <div
                  className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    background: '#111827',
                    color: gradientFrom,
                    borderLeft: `3px solid ${gradientFrom}`,
                  }}
                >
                  {content.highlight}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
