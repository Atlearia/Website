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
      <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#5b6d57]">
        {eyebrow}
      </p>
      <h2 className="font-manuscript text-4xl font-semibold tracking-[0.02em] text-[#132319] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#314238] sm:text-lg">
        {copy}
      </p>
    </div>
  );
}

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

export function ElvenHomepage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="elven-page font-scribe">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="elven-mist absolute -left-24 top-16 h-[28rem] w-[14rem] rotate-[-12deg] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0))] blur-3xl"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [-8, 18, -8],
                  y: [0, 22, 0],
                  opacity: [0.34, 0.56, 0.34],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="elven-mist absolute right-[-6rem] top-20 h-[34rem] w-[18rem] rotate-[18deg] rounded-full bg-[linear-gradient(180deg,rgba(231,214,165,0.48),rgba(255,255,255,0))] blur-3xl"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [10, -16, 10],
                  y: [-6, 14, -6],
                  opacity: [0.26, 0.48, 0.26],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-x-0 top-0 h-[26rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0))]" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(91,109,87,0.12) 1px, transparent 1px), linear-gradient(rgba(91,109,87,0.08) 1px, transparent 1px)',
            backgroundSize: '144px 144px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.75), transparent 85%)',
          }}
        />
      </div>

      <div className="elven-shell">
        <motion.header
          className="sticky top-0 z-40 border-b border-[#7d8f7866] bg-[rgba(248,244,235,0.7)] backdrop-blur-xl"
          initial={prefersReducedMotion ? undefined : { y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <a
              href="#main-content"
              className="group inline-flex items-center gap-3 text-[#112118] transition-colors hover:text-[#3b5b42]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5d705b40] bg-[rgba(255,255,255,0.64)] font-manuscript text-xl font-semibold shadow-[0_8px_24px_rgba(82,76,55,0.12)]">
                NY
              </span>
              <span className="hidden sm:block">
                <span className="block text-xs uppercase tracking-[0.32em] text-[#5b6d57]">Workshop</span>
                <span className="block text-sm font-medium tracking-[0.02em]">Software engineering, not template work</span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-[0.04em] text-[#304136] transition-colors hover:text-[#16261c]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <Link
              href={siteConfig.cubeHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#51665233] bg-[rgba(255,255,255,0.72)] px-4 py-2.5 text-sm font-semibold text-[#183025] shadow-[0_14px_34px_rgba(89,80,60,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#51665266] hover:bg-white"
            >
              <span className="h-4 w-4 text-[#4a624c]">
                <CubeIcon />
              </span>
              Enter the cube
            </Link>
          </div>
        </motion.header>

        <main id="main-content">
          <section className="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_24rem] lg:items-center">
              <Reveal direction="left" className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-[#66786333] bg-[rgba(255,255,255,0.54)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#5c6c57]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6b8a67]" />
                  {siteConfig.heroEyebrow}
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-4xl font-manuscript text-5xl font-semibold leading-[0.94] tracking-[0.01em] text-[#0f2017] sm:text-6xl lg:text-7xl">
                    {siteConfig.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#2f4137] sm:text-xl">
                    {siteConfig.heroIntro}
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#builds"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#183025] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#f7f3e9] shadow-[0_16px_40px_rgba(34,53,42,0.28)] transition-transform hover:-translate-y-0.5"
                  >
                    View selected builds
                    <span className="h-4 w-4">
                      <ArrowIcon />
                    </span>
                  </a>
                  <Link
                    href={siteConfig.cubeHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#5b6d5752] bg-[rgba(255,255,255,0.7)] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#183025] shadow-[0_12px_28px_rgba(88,77,57,0.12)] transition-transform hover:-translate-y-0.5"
                  >
                    Explore the cube
                    <span className="h-4 w-4">
                      <CubeIcon />
                    </span>
                  </Link>
                </div>

                <RevealGroup className="grid gap-4 pt-2 sm:grid-cols-2 xl:grid-cols-4" staggerDelay={0.08}>
                  {proofStats.map((stat) => (
                    <RevealItem key={stat.label}>
                      <div className="elven-panel rounded-[1.7rem] p-5">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-[#6b7c67]">
                          {stat.label}
                        </p>
                        <p className="mt-3 font-manuscript text-3xl font-semibold text-[#112118]">
                          {stat.value}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#4b5f53]">{stat.detail}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </Reveal>

              <Reveal direction="right" delay={0.1}>
                <div className="space-y-5">
                  <div className="elven-panel-strong relative overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_72px_rgba(89,80,60,0.16)]">
                    <div className="elven-lustre pointer-events-none absolute inset-0 opacity-70" />
                    <div className="relative">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#5d6f58]">
                        Field notes
                      </p>
                      <div className="my-5 h-px w-full elven-divider" />
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-[#758471]">Availability</p>
                          <p className="mt-2 text-base leading-7 text-[#26362c]">{siteConfig.availability}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-[#758471]">Current focus</p>
                          <div className="mt-3 space-y-3">
                            {siteConfig.currentFocus.map((focus) => (
                              <div key={focus} className="flex items-start gap-3 text-sm leading-6 text-[#314238]">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#6f8c68]" />
                                <span>{focus}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="elven-panel rounded-[1.8rem] p-5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#5d6f58]">
                      Build temperament
                    </p>
                    <p className="mt-3 text-base leading-7 text-[#2e3f35]">
                      I usually live in the seam between implementation depth and interface finish. That is where I do my best work.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="builds" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <Reveal>
              <SectionHeading
                eyebrow="Selected builds"
                title="Projects that show how I think when the work has to feel finished."
                copy="A small set of projects is enough here. I care more about range and execution quality than stacking cards for the sake of it."
              />
            </Reveal>

            <RevealGroup className="mt-10 grid gap-6 lg:grid-cols-3" staggerDelay={0.1}>
              {featuredBuilds.map((build, index) => (
                <RevealItem key={build.id}>
                  <article className="elven-panel group relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6">
                    <div className="absolute inset-x-6 top-0 h-px elven-divider opacity-80" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#6b7c67]">
                          {build.status}
                        </p>
                        <h3 className="mt-3 font-manuscript text-3xl font-semibold leading-tight text-[#12231a]">
                          {build.title}
                        </h3>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#64776433] bg-[rgba(255,255,255,0.62)] text-sm font-semibold text-[#445845]">
                        0{index + 1}
                      </div>
                    </div>

                    <p className="mt-6 text-base leading-7 text-[#304237]">{build.summary}</p>
                    <p className="mt-4 text-sm leading-7 text-[#53675a]">{build.impact}</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {build.stack.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#6779652f] bg-[rgba(255,255,255,0.54)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#516451]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {build.liveUrl ? (
                        <SmartActionLink
                          href={build.liveUrl}
                          className="inline-flex items-center gap-2 rounded-full bg-[#183025] px-4 py-2.5 text-sm font-semibold text-[#f7f3e9] transition-transform hover:-translate-y-0.5"
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
                        className="inline-flex items-center gap-2 rounded-full border border-[#5b6d5747] bg-[rgba(255,255,255,0.66)] px-4 py-2.5 text-sm font-semibold text-[#1c3428] transition-transform hover:-translate-y-0.5"
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

          <section id="craft" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
              <Reveal direction="left">
                <div className="elven-panel-strong rounded-[2rem] p-7 sm:p-8">
                  <SectionHeading
                    eyebrow="Craft"
                    title="How I like to build when the goal is more than just getting to demo day."
                    copy="I am drawn to work that asks for both engineering discipline and interface judgment. Most of the time, that means I care as much about component boundaries, data flow, and maintainability as I do about motion, typography, and product feel."
                  />

                  <div className="mt-8 space-y-5 text-base leading-8 text-[#324339]">
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
                    <article className="elven-panel rounded-[1.8rem] p-6">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#6a7c67]">
                        Engineering pillar
                      </p>
                      <h3 className="mt-3 font-manuscript text-3xl font-semibold text-[#12231a]">
                        {pillar.title}
                      </h3>
                      <p className="mt-4 text-base leading-7 text-[#304237]">{pillar.summary}</p>
                      <p className="mt-3 text-sm leading-7 text-[#55685b]">{pillar.detail}</p>
                    </article>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </section>

          <section id="portal" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <Reveal>
              <div className="elven-panel-strong rounded-[2.2rem] p-7 sm:p-9">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                  <div>
                    <SectionHeading
                      eyebrow="Portal"
                      title="If the work resonates, reach out directly."
                      copy="No homepage contact form here. I would rather keep this clean and point to the channels that actually matter."
                    />
                    <div className="mt-7 rounded-[1.6rem] border border-[#66786333] bg-[rgba(255,255,255,0.52)] p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#70816b]">Based in</p>
                      <p className="mt-2 font-manuscript text-3xl font-semibold text-[#15251c]">
                        {siteConfig.location}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#495c50]">{siteConfig.availability}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {primaryLinks.map((link) => (
                      <SmartActionLink
                        key={link.label}
                        href={link.href}
                        external={link.external}
                        className="elven-panel group rounded-[1.7rem] p-5 transition-transform hover:-translate-y-1"
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5d705b33] bg-[rgba(255,255,255,0.72)] text-[#20362a]">
                              <span className="h-5 w-5">
                                <LinkIcon kind={link.icon} />
                              </span>
                            </div>
                            <span className="h-4 w-4 text-[#5f725c] transition-transform group-hover:translate-x-0.5">
                              {link.external ? <ExternalIcon /> : <ArrowIcon />}
                            </span>
                          </div>
                          <h3 className="mt-5 font-manuscript text-3xl font-semibold text-[#132319]">
                            {link.label}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-[#4e6356]">{link.description}</p>
                        </div>
                      </SmartActionLink>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 border-t border-[#687a662b] py-6 text-sm text-[#516451] md:flex-row md:items-center md:justify-between">
              <p>
                {new Date().getFullYear()} {siteConfig.name}. Built with Next.js, motion, and a little restraint.
              </p>
              <div className="flex items-center gap-4">
                <a href="#builds" className="transition-colors hover:text-[#183025]">
                  Builds
                </a>
                <a href="#craft" className="transition-colors hover:text-[#183025]">
                  Craft
                </a>
                <Link href={siteConfig.cubeHref} className="transition-colors hover:text-[#183025]">
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

export default ElvenHomepage;
