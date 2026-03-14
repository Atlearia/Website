import type { Metadata, Viewport } from 'next';
import {
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  IBM_Plex_Sans,
  Inter,
  Outfit,
} from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/content/siteData';

// Primary font - body text
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Display font - headings (fallback for non-fantasy pages)
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

// Fantasy heading font — medieval serif
const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Fantasy decorative heading font — ornate medieval serif
const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel-decorative',
  weight: ['400', '700', '900'],
});

// Cube-route fonts — kept for compatibility
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-sans',
  weight: ['400', '500', '600', '700'],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant-garamond',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.title}`,
  description: siteConfig.description,
  keywords: [
    'portfolio',
    'software engineer',
    'mobile development',
    'full-stack',
    'flutter',
    'next.js',
    'typescript',
    'game development',
    'hackathon winner',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: `${siteConfig.name} | ${siteConfig.title}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.title}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#08060e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${cinzel.variable} ${cinzelDecorative.variable} ${ibmPlexSans.variable} ${cormorantGaramond.variable}`}
    >
      <body className="min-h-screen bg-background font-sans">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        
        {children}
        
        {/* Noise texture overlay for premium feel */}
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
