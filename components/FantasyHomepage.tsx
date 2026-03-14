'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { useReducedMotion } from '@/hooks/useScrollAnimations';
import {
  engineeringPillars,
  featuredBuilds,
  navLinks,
  primaryLinks,
  proofStats,
  siteConfig,
} from '@/content/siteData';

/* ─── SVG Icons ─── */

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 12 13l9-5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 5.5h15A1.5 1.5 0 0 1 21 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.41-4.04-1.41-.54-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.66-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.61-2.81 5.63-5.49 5.93.43.38.82 1.11.82 2.24v3.31c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A1.48 1.48 0 1 1 4.97 6.46 1.48 1.48 0 0 1 4.98 3.5ZM3.7 8.24h2.57V20.5H3.7V8.24Zm6.15 0h2.46v1.67h.03c.34-.65 1.18-1.33 2.43-1.33 2.6 0 3.08 1.7 3.08 3.92v7.99h-2.57v-7.08c0-1.69-.03-3.86-2.35-3.86-2.36 0-2.72 1.84-2.72 3.74v7.2H9.85V8.24Z" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 5 7.5 12 11.25 19 7.5 12 3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5v8.25L12 20.25l7-4.5V7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14 19 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v4.25A1.75 1.75 0 0 1 17.25 19H6.75A1.75 1.75 0 0 1 5 17.25V6.75A1.75 1.75 0 0 1 6.75 5H11" />
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5 21 10l-2.5 2.5-3-3-6 6-2 5-3-3 5-2 6-6-3-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.5 16.5-2 2" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8a2 2 0 0 1 2 2v2H6V4a2 2 0 0 1 2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6v12a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 10h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4" />
    </svg>
  );
}

function LinkIcon({ kind }: { kind: 'mail' | 'github' | 'linkedin' | 'cube' }) {
  switch (kind) {
    case 'mail':
      return <MailIcon />;
    case 'github':
      return <GithubIcon />;
    case 'linkedin':
      return <LinkedinIcon />;
    case 'cube':
      return <CubeIcon />;
    default:
      return null;
  }
}

/* ─── Shared Section Heading ─── */

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary-light">
        <span className="inline-block h-px w-8 bg-gradient-to-r from-transparent to-primary-light opacity-60" />
        {eyebrow}
      </p>
      <h2 className="font-cinzel text-4xl font-bold tracking-wide text-text-primary sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
        {copy}
      </p>
    </div>
  );
}

/* ─── Smart Link ─── */

function SmartActionLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  external?: boolean;
}) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}

/* ─── Floating Ambient Particles ─── */

function AmbientParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 10}s`,
    size: Math.random() > 0.6 ? 3 : 2,
    color: Math.random() > 0.5 ? 'rgba(212, 160, 68, 0.5)' : 'rgba(139, 92, 246, 0.4)',
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="fantasy-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   FANTASY HOMEPAGE
   ============================================================ */

export function FantasyHomepage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fantasy-page font-sans">
      {/* ── Ambient background glow orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="fantasy-glow-orb absolute -left-32 top-16 h-[30rem] w-[18rem] bg-[rgba(139,92,246,0.12)]"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [-10, 20, -10],
                  y: [0, 30, 0],
                  opacity: [0.25, 0.45, 0.25],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fantasy-glow-orb absolute right-[-8rem] top-24 h-[36rem] w-[20rem] bg-[rgba(212,160,68,0.06)]"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [12, -18, 12],
                  y: [-8, 16, -8],
                  opacity: [0.15, 0.3, 0.15],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fantasy-glow-orb absolute left-1/3 top-[60%] h-[24rem] w-[24rem] bg-[rgba(139,92,246,0.06)]"
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AmbientParticles />

      <div className="fantasy-shell">
        {/* ════════════════════════════════════════
            HEADER / NAVIGATION
           ════════════════════════════════════════ */}
        <motion.header
          className="sticky top-0 z-40 border-b border-[rgba(139,92,246,0.1)] bg-[rgba(8,6,14,0.75)] backdrop-blur-xl"
          initial={prefersReducedMotion ? undefined : { y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <a
              href="#main-content"
              className="group inline-flex items-center gap-3 text-text-primary transition-colors hover:text-primary-light"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] font-cinzel text-lg font-bold text-primary-light shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                NY
              </span>
              <span className="hidden sm:block">
                <span className="block text-[0.65rem] uppercase tracking-[0.32em] text-text-muted">Arcanum</span>
                <span className="block text-sm font-medium tracking-wide text-text-secondary">Software Engineering</span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-[0.06em] text-text-secondary transition-colors hover:text-primary-light"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Link
              href={siteConfig.cubeHref}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)] px-4 py-2.5 text-sm font-semibold text-primary-light shadow-[0_0_24px_rgba(139,92,246,0.1)] transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.14)] hover:shadow-[0_0_32px_rgba(139,92,246,0.18)]"
            >
              <span className="h-4 w-4">
                <CubeIcon />
              </span>
              Enter the Cube
            </Link>
          </div>
        </motion.header>

        {/* ════════════════════════════════════════
            HERO SECTION
           ════════════════════════════════════════ */}
        <main id="main-content">
          <section className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            {/* Hero decorative corner runes */}
            <div aria-hidden="true" className="pointer-events-none absolute left-6 top-20 text-primary/10 sm:left-10">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 30 L30 0 L60 30 L30 60 Z" />
                <path d="M15 30 L30 15 L45 30 L30 45 Z" />
                <circle cx="30" cy="30" r="5" />
              </svg>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute right-6 bottom-20 text-accent/10 sm:right-10">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M0 30 L30 0 L60 30 L30 60 Z" />
                <path d="M15 30 L30 15 L45 30 L30 45 Z" />
                <circle cx="30" cy="30" r="5" />
              </svg>
            </div>

            <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_24rem] lg:items-center">
              <Reveal direction="left" className="space-y-8">
                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.06)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary-light">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  {siteConfig.heroEyebrow}
                </div>

                {/* Title */}
                <div className="space-y-5">
                  <h1 className="max-w-4xl font-cinzel-decorative text-5xl font-bold leading-[0.96] tracking-wide text-text-primary sm:text-6xl lg:text-7xl">
                    <span className="fantasy-text-glow">{siteConfig.heroTitle}</span>
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
                    {siteConfig.heroIntro}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#quests"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-[0_0_50px_rgba(139,92,246,0.4)]"
                  >
                    <span className="h-4 w-4">
                      <SwordIcon />
                    </span>
                    View my quests
                  </a>
                  <Link
                    href={siteConfig.cubeHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-primary-light shadow-[0_0_24px_rgba(139,92,246,0.08)] transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.12)]"
                  >
                    <span className="h-4 w-4">
                      <CubeIcon />
                    </span>
                    Explore the cube
                  </Link>
                </div>

                {/* Proof Stats */}
                <RevealGroup className="grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-4" staggerDelay={0.08}>
                  {proofStats.map((stat) => (
                    <RevealItem key={stat.label}>
                      <div className="fantasy-panel rounded-2xl p-5">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-text-muted">
                          {stat.label}
                        </p>
                        <p className="mt-3 font-cinzel text-3xl font-bold fantasy-text-gold">
                          {stat.value}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-text-secondary">{stat.detail}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Reveal>

              {/* Right sidebar — Field notes */}
              <Reveal direction="right" delay={0.1}>
                <div className="space-y-5">
                  <div className="fantasy-panel-strong relative overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.4)]">
                    <div className="fantasy-lustre pointer-events-none absolute inset-0 opacity-60" />
                    <div className="relative">
                      <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary-light">
                        <span className="h-4 w-4 opacity-60"><ScrollIcon /></span>
                        Field notes
                      </p>
                      <div className="my-5 w-full fantasy-divider" />
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Availability</p>
                          <p className="mt-2 text-base leading-7 text-text-secondary">{siteConfig.availability}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Current focus</p>
                          <div className="mt-3 space-y-3">
                            {siteConfig.currentFocus.map((focus) => (
                              <div key={focus} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{focus}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fantasy-panel rounded-[1.8rem] p-5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary-light">
                      Build temperament
                    </p>
                    <p className="mt-3 text-base leading-7 text-text-secondary">
                      I usually live in the seam between implementation depth and interface finish. That is where I do my best work.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ════════════════════════════════════════
              QUESTS SECTION (Projects)
             ════════════════════════════════════════ */}
          <section id="quests" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <Reveal>
              <SectionHeading
                eyebrow="Quests completed"
                title="Projects that show how I think when the work has to feel finished."
                copy="A small set of projects is enough here. I care more about range and execution quality than stacking cards for the sake of it."
              />
            </Reveal>

            <RevealGroup className="mt-10 grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              {featuredBuilds.map((build, index) => (
                <RevealItem key={build.id}>
                  <article className="fantasy-panel group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6">
                    <div className="absolute inset-x-6 top-0 fantasy-divider opacity-60" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-text-muted">
                          {build.status}
                        </p>
                        <h3 className="mt-3 font-cinzel text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
                          {build.title}
                        </h3>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.06)] font-cinzel text-sm font-bold text-primary-light">
                        0{index + 1}
                      </div>
                    </div>

                    <p className="mt-6 text-base leading-7 text-text-secondary">{build.summary}</p>
                    <p className="mt-4 text-sm leading-7 text-text-muted">{build.impact}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {build.stack.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[rgba(212,160,68,0.15)] bg-[rgba(212,160,68,0.06)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent-light"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-3 pt-8">
                      {build.liveUrl ? (
                        <SmartActionLink
                          href={build.liveUrl}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                        >
                          {build.liveLabel ?? 'View live'}
                          <span className="h-4 w-4">
                            <ArrowIcon />
                          </span>
                        </SmartActionLink>
                      ) : null}

                      <SmartActionLink
                        href={build.githubUrl}
                        external
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.06)] px-4 py-2.5 text-sm font-semibold text-primary-light transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.1)]"
                      >
                        View code
                        <span className="h-4 w-4">
                          <ExternalIcon />
                        </span>
                      </SmartActionLink>
                    </div>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>

          {/* ════════════════════════════════════════
              THE FORGE SECTION (Engineering Philosophy)
             ════════════════════════════════════════ */}
          <section id="forge" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
              <Reveal direction="left">
                <div className="fantasy-panel-strong rounded-[2rem] p-7 sm:p-8">
                  <SectionHeading
                    eyebrow="The forge"
                    title="How I like to build when the goal is more than just getting to demo day."
                    copy="I am drawn to work that asks for both engineering discipline and interface judgment. Most of the time, that means I care as much about component boundaries, data flow, and maintainability as I do about motion, typography, and product feel."
                  />

                  <div className="mt-8 space-y-5 text-base leading-8 text-text-secondary">
                    <p>
                      In team work, I tend to sit at the junction of system shape and product surface. I want the codebase to stay readable, but I also want the final UI to feel considered enough that people trust it immediately.
                    </p>
                    <p>
                      That is why my favorite projects combine rapid delivery with a strong sense of finish: mobile products, full-stack student builds, and interactive web work that can hold up under closer inspection.
                    </p>
                  </div>
                </div>
              </Reveal>

              <RevealGroup className="grid gap-5" staggerDelay={0.09}>
                {engineeringPillars.map((pillar) => (
                  <RevealItem key={pillar.title}>
                    <article className="fantasy-panel rounded-[1.8rem] p-6">
                      <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-primary-light">
                        <span className="h-3 w-3 opacity-50"><SwordIcon /></span>
                        Engineering pillar
                      </p>
                      <h3 className="mt-3 font-cinzel text-2xl font-bold text-text-primary sm:text-3xl">
                        {pillar.title}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-text-secondary">{pillar.summary}</p>
                      <p className="mt-3 text-sm leading-7 text-text-muted">{pillar.detail}</p>
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </section>

          {/* ════════════════════════════════════════
              GRIMOIRE SECTION (Contact / Links)
             ════════════════════════════════════════ */}
          <section id="grimoire" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <Reveal>
              <div className="fantasy-panel-strong rounded-[2.2rem] p-7 sm:p-9">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                  <div>
                    <SectionHeading
                      eyebrow="Grimoire"
                      title="If the work resonates, reach out directly."
                      copy="No homepage contact form here. I would rather keep this clean and point to the channels that actually matter."
                    />
                    <div className="mt-7 rounded-[1.6rem] border border-[rgba(139,92,246,0.12)] bg-[rgba(139,92,246,0.04)] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Based in</p>
                      <p className="mt-2 font-cinzel text-3xl font-bold text-text-primary">
                        {siteConfig.location}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-text-muted">{siteConfig.availability}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {primaryLinks.map((link) => (
                      <SmartActionLink
                        key={link.label}
                        href={link.href}
                        external={link.external}
                        className="fantasy-panel group rounded-[1.7rem] p-5 transition-transform hover:-translate-y-1"
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(139,92,246,0.15)] bg-[rgba(139,92,246,0.08)] text-primary-light">
                              <span className="h-5 w-5">
                                <LinkIcon kind={link.icon} />
                              </span>
                            </div>
                            <span className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5">
                              {link.external ? <ExternalIcon /> : <ArrowIcon />}
                            </span>
                          </div>
                          <h3 className="mt-5 font-cinzel text-2xl font-bold text-text-primary sm:text-3xl">
                            {link.label}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-text-muted">{link.description}</p>
                        </div>
                      </SmartActionLink>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ════════════════════════════════════════
              FOOTER
             ════════════════════════════════════════ */}
          <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
            <div className="fantasy-divider mb-6" />
            <div className="flex flex-col gap-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
              <p>
                {new Date().getFullYear()} {siteConfig.name}. Forged with Next.js, motion, and a sense of purpose.
              </p>
              <div className="flex items-center gap-4">
                <a href="#quests" className="transition-colors hover:text-primary-light">
                  Quests
                </a>
                <a href="#forge" className="transition-colors hover:text-primary-light">
                  The Forge
                </a>
                <Link href={siteConfig.cubeHref} className="transition-colors hover:text-primary-light">
                  Cube
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default FantasyHomepage;
