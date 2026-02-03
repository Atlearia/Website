'use client';

import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { aboutContent, siteConfig } from '@/content/siteData';

export function About() {
  return (
    <Section id="about" className="py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative">
        <Reveal>
          <SectionHeader
            title="About Me"
            subtitle="Get to know me a little better"
          />
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Reveal direction="left" delay={0.1}>
              <div className="bg-surface border border-surface-border rounded-3xl p-6 md:p-8">
                <h3 className="font-display text-xl font-semibold text-text-primary mb-4">
                  {aboutContent.headline}
                </h3>
                <div className="space-y-4">
                  {aboutContent.paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-text-secondary leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Personal Info Card */}
            <Reveal direction="left" delay={0.2}>
              <div className="bg-surface border border-surface-border rounded-3xl p-6 md:p-8">
                <h4 className="font-display text-lg font-semibold text-text-primary mb-4">
                  Quick Info
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Location</p>
                      <p className="text-text-primary font-medium">{siteConfig.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Email</p>
                      <p className="text-text-primary font-medium">{siteConfig.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <RevealGroup className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
              {aboutContent.highlights.map((highlight, index) => (
                <RevealItem key={index}>
                  <div className="bg-surface border border-surface-border rounded-2xl p-5 text-center hover:bg-surface-hover hover:border-primary/20 transition-all duration-300 group">
                    <div className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light mb-2">
                      {highlight.value}
                    </div>
                    <div className="text-sm text-text-muted group-hover:text-text-secondary transition-colors">
                      {highlight.label}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Download Resume Button */}
            <Reveal delay={0.4}>
              <div className="mt-6">
                <a
                  href="#"
                  className="flex items-center justify-center w-full px-6 py-4 bg-surface hover:bg-surface-hover border border-surface-border hover:border-primary/20 rounded-2xl text-text-primary font-medium transition-all duration-300 group"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Resume
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default About;
