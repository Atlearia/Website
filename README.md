# Personal Portfolio Website

A modern, animated personal portfolio built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## ✨ Features

- **Modern Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Smooth Animations**: Framer Motion with scroll-triggered reveals
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, focus states
- **Performance**: Optimized for Core Web Vitals, respects `prefers-reduced-motion`
- **Premium Aesthetic**: Deep neutral palette with violet/amber accents, glass effects, gradient backgrounds

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd c:\Users\ronan\Desktop\Website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
Website/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main page component
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       # Sticky navigation
│   ├── sections/
│   │   ├── Hero.tsx         # Hero section
│   │   ├── About.tsx        # About section
│   │   ├── Projects.tsx     # Projects grid
│   │   ├── Skills.tsx       # Skills section
│   │   ├── Experience.tsx   # Timeline experience
│   │   ├── Contact.tsx      # Contact form
│   │   └── Footer.tsx       # Footer
│   └── ui/
│       ├── Reveal.tsx       # Scroll animation wrapper
│       ├── BackToTop.tsx    # Back to top button
│       ├── ProjectModal.tsx # Project detail modal
│       ├── Section.tsx      # Section wrapper
│       └── SocialIcons.tsx  # Social media icons
├── content/
│   └── siteData.ts          # ⭐ All editable content
├── hooks/
│   └── useScrollAnimations.ts # Custom hooks
├── lib/
│   ├── motion.ts            # Animation variants
│   └── utils.ts             # Utility functions
└── [config files]
```

## 🎨 Customization Guide

### Step 1: Update Your Personal Information

Edit `content/siteData.ts`:

```typescript
// Update these values with your info
export const siteConfig: SiteConfig = {
  name: 'Your Name',
  title: 'Your Title',
  description: 'Your description...',
  email: 'your@email.com',
  location: 'Your City, Country',
};
```

### Step 2: Update Your Projects

In the same file, edit the `projects` array:

```typescript
export const projects: Project[] = [
  {
    id: 'unique-id',
    title: 'Project Title',
    description: 'Short description',
    longDescription: 'Detailed description for modal',
    tags: ['React', 'TypeScript', 'etc'],
    liveUrl: 'https://your-live-demo.com',
    githubUrl: 'https://github.com/you/repo',
    featured: true, // Optional: marks as featured
  },
  // ... more projects
];
```

### Step 3: Update Your Skills

```typescript
export const skillCategories: SkillCategory[] = [
  {
    category: 'Languages',
    skills: [
      { name: 'TypeScript', level: 5 }, // 1-5 scale
      // ... more skills
    ],
  },
  // ... more categories
];
```

### Step 4: Update Your Experience

```typescript
export const experiences: Experience[] = [
  {
    id: 'exp-1',
    title: 'Job Title',
    company: 'Company Name',
    location: 'City, Country',
    startDate: 'Jan 2024',
    endDate: 'Present',
    description: [
      'Achievement 1',
      'Achievement 2',
    ],
    type: 'work', // 'work' | 'education' | 'award'
  },
  // ... more experiences
];
```

### Step 5: Update Social Links

```typescript
export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: 'github',
  },
  // Available icons: github, linkedin, twitter, dribbble
];
```

### Step 6: Update the Logo

In `components/layout/Navbar.tsx` and `components/sections/Footer.tsx`, find:
```tsx
AC<span className="text-primary">.</span>
```
Replace "AC" with your initials.

## 🎨 Theming

### Colors

Edit `tailwind.config.ts` to change the color palette:

```typescript
colors: {
  background: {
    DEFAULT: '#0a0a0f',    // Main background
    secondary: '#12121a',  // Card backgrounds
  },
  primary: {
    DEFAULT: '#6366f1',    // Primary accent (violet)
    light: '#818cf8',
    dark: '#4f46e5',
  },
  accent: {
    DEFAULT: '#f59e0b',    // Secondary accent (amber)
  },
  // ...
}
```

### Fonts

The site uses Inter (body) and Outfit (headings). To change fonts, edit `app/layout.tsx`:

```typescript
import { Inter, Outfit } from 'next/font/google';
// Change to your preferred fonts
```

## 🔧 Technical Details

### Animation System

- **Reveal Component**: Wraps content for scroll-triggered animations
- **Motion Variants**: Centralized in `lib/motion.ts`
- **Reduced Motion**: Automatically respects `prefers-reduced-motion`

### Smooth Scroll

- CSS `scroll-behavior: smooth` with `scroll-padding-top` for navbar offset
- JavaScript fallback via `useSmoothScroll` hook
- Anchor links handled with proper offset calculation

### Performance

- Intersection Observer triggers animations only once
- No heavy animation loops
- SVG icons instead of images where possible
- Next.js Image component ready for any images you add

## 📝 Final Checklist

Before deploying, make sure you've:

- [ ] Updated `siteConfig` with your name, title, email, location
- [ ] Replaced all 6 placeholder projects with your real projects
- [ ] Updated skills to match your actual expertise
- [ ] Updated experience with your real work history
- [ ] Updated social links with your actual profiles
- [ ] Changed the logo initials (AC → yours)
- [ ] Updated meta tags in `app/layout.tsx`
- [ ] Tested on mobile, tablet, and desktop
- [ ] Tested keyboard navigation
- [ ] Checked with a screen reader (optional but recommended)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Deploy!

### Other Platforms

```bash
npm run build
# Deploy the .next folder to your hosting provider
```

## 📄 License

MIT License - feel free to use this for your own portfolio!

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Framer Motion
