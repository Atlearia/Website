'use client';

import { navLinks, siteConfig, socialLinks } from '@/content/siteData';
import { useSmoothScroll } from '@/hooks/useScrollAnimations';
import { SocialIcons } from '@/components/ui/SocialIcons';

export function Footer() {
  const scrollTo = useSmoothScroll(80);
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <footer className="relative bg-background-secondary border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, '#home')}
                className="inline-block font-display text-2xl font-bold text-text-primary hover:text-primary transition-colors mb-4"
              >
                NY<span className="text-primary">.</span>
              </a>
              <p className="text-text-secondary max-w-md mb-6">
                {siteConfig.title}. Building digital experiences that make a difference.
              </p>
              <SocialIcons />
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold text-text-primary mb-4">
                Quick Links
              </h4>
              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block text-text-secondary hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-semibold text-text-primary mb-4">
                Get in Touch
              </h4>
              <div className="space-y-3">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
                >
                  <svg
                    className="w-4 h-4"
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
                  {siteConfig.email}
                </a>
                <p className="flex items-center gap-2 text-text-secondary">
                  <svg
                    className="w-4 h-4"
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
                  {siteConfig.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-surface-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-sm">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-text-muted hover:text-text-secondary text-sm transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
