'use client';

import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { skillCategories } from '@/content/siteData';

// Skill level indicator colors
const levelColors = [
  'bg-text-muted/30',
  'bg-text-muted/50',
  'bg-primary/50',
  'bg-primary/70',
  'bg-primary',
];

export function Skills() {
  return (
    <Section id="skills" className="py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        <Reveal>
          <SectionHeader
            title="Skills & Expertise"
            subtitle="Technologies and tools I work with"
          />
        </Reveal>

        <RevealGroup
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          staggerDelay={0.1}
        >
          {skillCategories.map((category) => (
            <RevealItem key={category.category}>
              <div className="h-full bg-surface border border-surface-border rounded-3xl p-6 hover:border-primary/20 transition-colors duration-300">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <CategoryIcon category={category.category} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {category.category}
                  </h3>
                </div>

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="group relative"
                    >
                      <span className="inline-flex items-center px-3 py-2 bg-background border border-surface-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-primary/30 transition-all duration-200 cursor-default">
                        {skill.name}
                        {skill.level && (
                          <span className="ml-2 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <span
                                key={level}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  level <= skill.level!
                                    ? levelColors[skill.level! - 1]
                                    : 'bg-surface-border'
                                }`}
                              />
                            ))}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Additional Info */}
        <Reveal delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-text-muted text-sm">
              Always learning and exploring new technologies.{' '}
              <span className="text-primary">Currently diving into</span>: Rust, Web3, and AI/ML
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

// Category Icons
function CategoryIcon({ category }: { category: string }) {
  const iconClass = 'w-5 h-5 text-primary';

  switch (category.toLowerCase()) {
    case 'languages':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'frameworks':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'tools & platforms':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'design':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
  }
}

export default Skills;
