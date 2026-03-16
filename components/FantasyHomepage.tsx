'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { useReducedMotion } from '@/hooks/useScrollAnimations';
import {
  engineeringPillars,
  featuredBuilds,
  navLinks,
  primaryLinks,
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5.5-3.8 10.2-8 12-4.2-1.8-8-6.5-8-12V6l8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16h.01" />
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
      <p className="mb-4 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-accent-light">
        <span className="inline-block h-px w-10 bg-gradient-to-r from-transparent via-accent-light to-transparent opacity-70" />
        {eyebrow}
        <span className="inline-block h-px w-10 bg-gradient-to-r from-transparent via-accent-light to-transparent opacity-70" />
      </p>
      <h2 className="font-cinzel text-4xl font-bold tracking-wide text-text-primary fantasy-text-glow sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
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
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${6 + Math.random() * 12}s`,
    size: Math.random() > 0.7 ? 4 : Math.random() > 0.4 ? 3 : 2,
    color:
      Math.random() > 0.6
        ? 'rgba(244, 199, 107, 0.7)'
        : Math.random() > 0.3
          ? 'rgba(167, 139, 250, 0.5)'
          : 'rgba(45, 212, 191, 0.4)',
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
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ornate Rune Divider ─── */

function OrnateDivider() {
  return (
    <div className="flex items-center justify-center py-8" aria-hidden="true">
      <div className="flex items-center gap-4">
        {/* Left wing */}
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-accent/40 to-accent/60 sm:w-24" />
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-accent/50">
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
        </svg>
        <div className="h-px w-8 bg-gradient-to-r from-accent/60 to-primary/40 sm:w-12" />

        {/* Center ornament */}
        <div className="relative">
          <svg width="40" height="40" viewBox="0 0 40 40" className="text-accent">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
            <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="20" cy="8" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="32" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="20" cy="32" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="8" cy="20" r="1.5" fill="currentColor" opacity="0.3" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
        </div>

        {/* Right wing */}
        <div className="h-px w-8 bg-gradient-to-r from-primary/40 to-accent/60 sm:w-12" />
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-accent/50">
          <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
        </svg>
        <div className="h-px w-16 bg-gradient-to-r from-accent/60 via-accent/40 to-transparent sm:w-24" />
      </div>
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
      {/* Global ambient particles */}
      <AmbientParticles />

      <div className="fantasy-shell">
        {/* ════════════════════════════════════════
            HEADER / NAVIGATION
           ════════════════════════════════════════ */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(139,92,246,0.08)] bg-[rgba(6,4,12,0.6)] backdrop-blur-xl"
          initial={prefersReducedMotion ? undefined : { y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
            <a
              href="#main-content"
              className="group inline-flex items-center gap-3 text-text-primary transition-colors hover:text-accent-light"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,160,68,0.25)] bg-[rgba(212,160,68,0.08)] font-cinzel text-lg font-bold text-accent-light shadow-[0_0_20px_rgba(212,160,68,0.12)]">
                NY
              </span>
              <span className="hidden sm:block">
                <span className="block text-[0.6rem] uppercase tracking-[0.36em] text-accent/70 font-semibold">Arcanum</span>
                <span className="block text-sm font-medium tracking-wide text-text-secondary">Software Engineering</span>
              </span>
            </a>

            <nav className="hidden items-center gap-7 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-cinzel text-[0.8rem] font-medium tracking-[0.1em] text-text-muted transition-colors hover:text-accent-light"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Link
              href={siteConfig.cubeHref}
              className="group inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.1)] px-4 py-2 text-sm font-semibold text-primary-light transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.45)] hover:bg-[rgba(139,92,246,0.18)] hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            >
              <span className="h-4 w-4">
                <CubeIcon />
              </span>
              <span className="hidden sm:inline">Enter the Cube</span>
            </Link>
          </div>
        </motion.header>

        {/* ════════════════════════════════════════
            HERO SECTION — Full bleed fantasy artwork
           ════════════════════════════════════════ */}
        <main id="main-content">
          <section className="fantasy-hero-section">
            {/* Full-bleed background image */}
            <div className="fantasy-hero-bg">
              <Image
                src="/fantasy/hero-bg.png"
                alt=""
                fill
                priority
                quality={90}
                className="object-cover object-[center_30%]"
              />
              {/* Extra dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,4,12,0.4)] via-[rgba(6,4,12,0.15)] to-[rgba(6,4,12,1)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(6,4,12,0.7)] via-transparent to-[rgba(6,4,12,0.5)]" />
            </div>

            {/* Ambient glow orbs over the image */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
              <motion.div
                className="fantasy-glow-orb absolute -left-20 top-1/4 h-[25rem] w-[15rem] bg-[rgba(139,92,246,0.15)]"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { x: [-10, 20, -10], y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }
                }
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="fantasy-glow-orb absolute right-[-5rem] top-1/3 h-[30rem] w-[18rem] bg-[rgba(212,160,68,0.08)]"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { x: [10, -15, 10], y: [-5, 15, -5], opacity: [0.12, 0.25, 0.12] }
                }
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Hero content */}
            <div className="relative z-[2] mx-auto flex min-h-screen max-w-6xl items-center px-4 pt-20 sm:px-6 lg:px-8">
              <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.3fr)_22rem] lg:items-center">
                <Reveal direction="left" className="space-y-8">


                  {/* Title — huge, dramatic */}
                  <div className="space-y-6">
                    <h1 className="max-w-4xl font-cinzel-decorative text-5xl font-bold leading-[1] tracking-wide sm:text-6xl lg:text-[4.5rem]">
                      <span className="fantasy-text-gradient">{siteConfig.name}</span>
                    </h1>
                    <p className="max-w-xl font-cinzel text-xl font-medium leading-relaxed text-text-primary/90 sm:text-2xl fantasy-text-glow">
                      {siteConfig.heroTitle.split('building')[0]}
                      <span className="text-accent-light">building</span>
                      {siteConfig.heroTitle.split('building')[1]}
                    </p>
                    <p className="max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                      {siteConfig.heroIntro}
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <a
                      href="#quests"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-[rgba(212,160,68,0.3)] bg-gradient-to-r from-[rgba(212,160,68,0.15)] to-[rgba(139,92,246,0.15)] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-accent-light shadow-[0_0_30px_rgba(212,160,68,0.15)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(212,160,68,0.25)] hover:border-[rgba(212,160,68,0.5)]"
                    >
                      <span className="h-4 w-4">
                        <SwordIcon />
                      </span>
                      View my quests
                    </a>
                    <Link
                      href={siteConfig.cubeHref}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.1)] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.22em] text-primary-light shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.2)]"
                    >
                      <span className="h-4 w-4">
                        <CubeIcon />
                      </span>
                      Explore the cube
                    </Link>
                  </div>
                </Reveal>

                {/* Right sidebar — Academy card */}
                <Reveal direction="right" delay={0.15}>
                  <div className="space-y-4">
                    {/* Fantasy Concordia image */}
                    <div className="fantasy-panel-strong fantasy-border-glow relative overflow-hidden rounded-[2rem]">
                      <div className="fantasy-lustre pointer-events-none absolute inset-0 z-10 opacity-40" />
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[2rem]">
                        <Image
                          src="/fantasy/concordia-academy.png"
                          alt="Concordia University — reimagined as a magical academy"
                          fill
                          quality={85}
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,10,32,1)] via-[rgba(14,10,32,0.3)] to-transparent" />
                      </div>

                      {/* Academy info overlay at bottom of image */}
                      <div className="relative px-5 pb-5 -mt-8 z-[2]">
                        <p className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-accent-light/80">
                          <span className="h-3.5 w-3.5 opacity-70"><ShieldIcon /></span>
                          Academy
                        </p>
                        <h3 className="mt-1.5 font-cinzel text-lg font-bold text-text-primary leading-tight">
                          Concordia University
                        </h3>
                        <p className="mt-1 text-xs text-text-muted tracking-wide">
                          B.Eng Software Engineering (Co-op)
                        </p>

                        <div className="my-4 w-full fantasy-divider" />

                        {/* Arcane Standing GPA */}
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-text-muted">
                              Arcane Standing <span className="text-text-muted/50">(GPA)</span>
                            </p>
                          </div>
                          <p className="font-cinzel text-2xl font-bold fantasy-text-gold fantasy-stat-glow">
                            4.2<span className="text-lg text-accent/60">/4.3</span>
                          </p>
                        </div>

                        <div className="mt-4 space-y-2">
                          {siteConfig.currentFocus.slice(0, 2).map((focus) => (
                            <div key={focus} className="flex items-start gap-2.5 text-[0.78rem] leading-5 text-text-secondary">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_6px_rgba(212,160,68,0.5)]" />
                              <span>{focus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>


          </section>




          {/* ── Ornate divider ── */}
          <OrnateDivider />

          {/* ════════════════════════════════════════
              QUESTS SECTION (Projects) — quest map bg
             ════════════════════════════════════════ */}
          <section id="quests" className="fantasy-section-bg py-16 lg:py-24">
            <div className="fantasy-bg-image">
              <Image
                src="/fantasy/quests-bg.png"
                alt=""
                fill
                quality={80}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,4,12,1)] via-[rgba(6,4,12,0.5)] to-[rgba(6,4,12,1)]" />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <Reveal>
                <SectionHeading
                  eyebrow="Quests completed"
                  title="Projects that show how I think when the work has to feel finished."
                  copy="Range and execution quality matter more than stacking cards for the sake of it."
                />
              </Reveal>

              <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
                {featuredBuilds.map((build) => (
                  <RevealItem key={build.id}>
                    <article
                      className={`group relative flex aspect-square flex-col overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1 ${
                        build.awarded
                          ? 'fantasy-panel-strong fantasy-crystal-border'
                          : 'fantasy-panel fantasy-border-glow'
                      }`}
                    >
                      {/* Crystal crown for awarded projects */}
                      {build.awarded && (
                        <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
                          <div className="relative">
                            <svg width="36" height="28" viewBox="0 0 36 28" className="drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]">
                              {/* Crown base */}
                              <path d="M4 24h28v3H4z" fill="url(#crownGold)" />
                              {/* Crown body */}
                              <path d="M4 24 L1 8 L9 16 L18 2 L27 16 L35 8 L32 24Z" fill="url(#crownGold)" stroke="rgba(103,232,249,0.6)" strokeWidth="0.5" />
                              {/* Gems */}
                              <circle cx="18" cy="15" r="2.5" fill="rgba(103,232,249,0.9)" />
                              <circle cx="10" cy="18" r="1.5" fill="rgba(167,139,250,0.8)" />
                              <circle cx="26" cy="18" r="1.5" fill="rgba(167,139,250,0.8)" />
                              <defs>
                                <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="rgba(244,199,107,0.95)" />
                                  <stop offset="100%" stopColor="rgba(212,160,68,0.85)" />
                                </linearGradient>
                              </defs>
                            </svg>
                            {/* Glow behind crown */}
                            <div className="absolute inset-0 -top-1 blur-lg bg-[rgba(103,232,249,0.15)]" />
                          </div>
                        </div>
                      )}

                      {/* Card content */}
                      <div className="relative flex h-full flex-col">
                        <h3 className={`font-cinzel text-lg font-bold leading-tight text-text-primary ${build.awarded ? 'mt-3' : ''}`}>
                          {build.title}
                        </h3>

                        <p className="mt-3 flex-1 text-[0.82rem] leading-6 text-text-secondary line-clamp-4">
                          {build.summary}
                        </p>

                        {/* Tech stack */}
                        <div className="mt-auto pt-3">
                          <div className="flex flex-wrap gap-1.5">
                            {build.stack.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[rgba(212,160,68,0.15)] bg-[rgba(212,160,68,0.05)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-accent-light/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Action links */}
                          <div className="mt-3 flex gap-2">
                            {build.liveUrl && (
                              <SmartActionLink
                                href={build.liveUrl}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,160,68,0.25)] bg-[rgba(212,160,68,0.1)] px-3 py-1.5 text-[0.7rem] font-bold text-accent-light transition-all hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(212,160,68,0.2)]"
                              >
                                {build.liveLabel ?? 'Live'}
                                <span className="h-3 w-3"><ArrowIcon /></span>
                              </SmartActionLink>
                            )}
                            <SmartActionLink
                              href={build.githubUrl}
                              external
                              className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] px-3 py-1.5 text-[0.7rem] font-bold text-primary-light transition-all hover:-translate-y-0.5 hover:border-[rgba(139,92,246,0.35)]"
                            >
                              Code
                              <span className="h-3 w-3"><ExternalIcon /></span>
                            </SmartActionLink>
                          </div>
                        </div>
                      </div>
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </section>

          {/* ── Ornate divider ── */}
          <OrnateDivider />

          {/* ════════════════════════════════════════
              THE FORGE SECTION — forging bg
             ════════════════════════════════════════ */}
          <section id="forge" className="fantasy-section-bg py-16 lg:py-24">
            <div className="fantasy-bg-image">
              <Image
                src="/fantasy/forge-bg.png"
                alt=""
                fill
                quality={80}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,4,12,1)] via-[rgba(6,4,12,0.45)] to-[rgba(6,4,12,1)]" />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
                <Reveal direction="left">
                  <div className="fantasy-panel-strong fantasy-border-glow rounded-[2rem] p-7 sm:p-8">
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
                      <article className="fantasy-panel fantasy-border-glow rounded-[1.8rem] p-6">
                        <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.34em] text-accent-light">
                          <span className="h-3.5 w-3.5 opacity-60"><ShieldIcon /></span>
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
            </div>
          </section>

          {/* ── Ornate divider ── */}
          <OrnateDivider />

          {/* ════════════════════════════════════════
              GRIMOIRE SECTION — library bg
             ════════════════════════════════════════ */}
          <section id="grimoire" className="fantasy-section-bg py-16 lg:py-24">
            <div className="fantasy-bg-image">
              <Image
                src="/fantasy/grimoire-bg.png"
                alt=""
                fill
                quality={80}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,4,12,1)] via-[rgba(6,4,12,0.4)] to-[rgba(6,4,12,1)]" />
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <Reveal>
                <div className="fantasy-panel-strong fantasy-border-glow rounded-[2.2rem] p-7 sm:p-9">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div>
                      <SectionHeading
                        eyebrow="Grimoire"
                        title="If the work resonates, reach out directly."
                        copy="No homepage contact form here. I would rather keep this clean and point to the channels that actually matter."
                      />
                      <div className="mt-7 rounded-[1.6rem] border border-[rgba(212,160,68,0.15)] bg-[rgba(212,160,68,0.04)] p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-text-muted">Based in</p>
                        <p className="mt-2 font-cinzel text-3xl font-bold fantasy-text-gold">
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
                          className="fantasy-panel fantasy-border-glow group rounded-[1.7rem] p-5 transition-transform hover:-translate-y-1"
                        >
                          <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(212,160,68,0.2)] bg-[rgba(212,160,68,0.08)] text-accent-light">
                                <span className="h-5 w-5">
                                  <LinkIcon kind={link.icon} />
                                </span>
                              </div>
                              <span className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-light">
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
            </div>
          </section>

          {/* ════════════════════════════════════════
              FOOTER
             ════════════════════════════════════════ */}
          <footer className="relative mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            <div className="fantasy-divider mb-6" />
            <div className="flex flex-col gap-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
              <p className="font-cinzel text-[0.8rem] tracking-wide">
                {new Date().getFullYear()} &middot; {siteConfig.name} &middot; <span className="text-accent/60">Forged with purpose</span>
              </p>
              <div className="flex items-center gap-5">
                <a href="#quests" className="font-cinzel text-[0.75rem] tracking-[0.1em] transition-colors hover:text-accent-light">
                  Quests
                </a>
                <a href="#forge" className="font-cinzel text-[0.75rem] tracking-[0.1em] transition-colors hover:text-accent-light">
                  The Forge
                </a>
                <a href="#grimoire" className="font-cinzel text-[0.75rem] tracking-[0.1em] transition-colors hover:text-accent-light">
                  Grimoire
                </a>
                <Link href={siteConfig.cubeHref} className="font-cinzel text-[0.75rem] tracking-[0.1em] transition-colors hover:text-primary-light">
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
