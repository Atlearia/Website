// ============================================
// Site Data - Edit this file to customize your portfolio
// ============================================

export interface NavLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  image?: string;
  featured?: boolean;
}

export interface Skill {
  name: string;
  level?: number; // 1-5
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
  type: 'work' | 'education' | 'award';
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string; // SVG path or icon name
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
}

// ============================================
// SITE CONFIGURATION
// ============================================

export const siteConfig: SiteConfig = {
  name: 'Ning Ye',
  title: 'Software Engineering Student & UI/UX Enthusiast',
  description: 'Crafting award-winning mobile experiences and full-stack applications. Passionate about clean design, intuitive interfaces, and building products that make an impact.',
  email: 'ning.ye@mail.concordia.ca',
  location: 'Montreal, QC',
};

// ============================================
// NAVIGATION
// ============================================

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

// ============================================
// PROJECTS
// ============================================

export const projects: Project[] = [
  {
    id: 'ets-mobile-challenge',
    title: 'ETS Mobile App Challenge 2025',
    description: '1st Place & Best UI Design winner ($1,750). Built a mobile app in under 24 hours with real-time tracking.',
    longDescription: 'Award-winning mobile application built during the ETS Mobile App Challenge hackathon. Developed the entire app in under 24 hours, implementing localization features and real-time distance tracking powered by Firebase. Led the UI/UX design process and front-end development using Flutter, resulting in both First Place ($1,250) and Best UI Design ($500) awards.',
    tags: ['Flutter', 'Firebase', 'Dart', 'UI/UX Design', 'Real-time'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Atlearia',
    featured: true,
  },
  {
    id: 'codejam-2024',
    title: 'CodeJam 2024 — Event Discovery Platform',
    description: 'Full-stack cross-platform app with AI-assisted event discovery, built in 48 hours at McGill hackathon.',
    longDescription: 'Comprehensive event discovery platform developed during the CodeJam 2024 hackathon at McGill University. Implemented a full-stack cross-platform architecture using Flutter for the mobile application, NestJS for backend API handling, and PocketBase for real-time data storage and authentication. Integrated AI-assisted event discovery features and built an administrative dashboard using Next.js — all within 48 hours.',
    tags: ['Flutter', 'NestJS', 'PocketBase', 'Next.js', 'AI Integration'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Atlearia',
    featured: true,
  },
  {
    id: 'unity-bullet-hell',
    title: 'Bullet-Hell Game',
    description: 'Team-developed Unity game featuring complex enemy AI, projectile patterns, and dynamic difficulty systems.',
    longDescription: 'An action-packed bullet-hell style game developed in Unity with C#. Implemented core gameplay systems including sophisticated enemy behavior AI, intricate projectile patterns, collision detection systems, and dynamic health management. Collaborated with team members using version control to integrate features, balance game difficulty, and continuously iterate on game design based on playtesting feedback.',
    tags: ['Unity', 'C#', 'Game Dev', 'AI Systems', 'Team Project'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Atlearia',
    featured: true,
  },
  {
    id: 'portfolio-website',
    title: 'Personal Portfolio Website',
    description: 'Modern, animated portfolio built with Next.js, TypeScript, and Framer Motion.',
    longDescription: 'This very website you are viewing! A modern, responsive portfolio featuring smooth scroll-triggered animations, a premium dark theme with carefully crafted color theory, and full accessibility support. Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Framer Motion.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Atlearia',
  },
  {
    id: 'gaming-brand',
    title: 'Gaming Content Platform',
    description: 'Built and managed a gaming brand reaching 100K+ Instagram followers with Discord community.',
    longDescription: 'Grew and managed a gaming content brand from the ground up, achieving over 100,000 followers on Instagram. Operated the platform as a paid advertising channel, coordinating sponsored promotions for external businesses. Additionally moderated an associated 2,000+ member Discord community, managing moderation workflows, community announcements, and member engagement strategies.',
    tags: ['Community Management', 'Digital Marketing', 'Discord', 'Content Strategy'],
    liveUrl: '#',
    githubUrl: '#',
  },
  {
    id: 'future-project',
    title: 'More Coming Soon...',
    description: 'Currently exploring game development, AI integration, and innovative mobile experiences.',
    longDescription: 'Always working on something new! Currently diving deeper into game development with Unity, exploring AI/ML integrations for mobile apps, and building innovative solutions. Check back soon or follow me on GitHub to see what I am working on next.',
    tags: ['Unity', 'AI/ML', 'Mobile', 'Innovation'],
    liveUrl: '#',
    githubUrl: 'https://github.com/Atlearia',
  },
];

// ============================================
// SKILLS
// ============================================

export const skillCategories: SkillCategory[] = [
  {
    category: 'Programming',
    skills: [
      { name: 'C#', level: 4 },
      { name: 'Java', level: 4 },
      { name: 'Dart', level: 5 },
      { name: 'Python', level: 4 },
      { name: 'TypeScript', level: 4 },
    ],
  },
  {
    category: 'Frameworks',
    skills: [
      { name: 'Flutter', level: 5 },
      { name: 'Next.js', level: 4 },
      { name: 'NestJS', level: 4 },
      { name: 'Spring Boot', level: 3 },
      { name: 'Fabric', level: 3 },
    ],
  },
  {
    category: 'Tools & Platforms',
    skills: [
      { name: 'Unity', level: 4 },
      { name: 'Firebase', level: 4 },
      { name: 'PocketBase', level: 4 },
      { name: 'Git', level: 5 },
      { name: 'Figma', level: 4 },
    ],
  },
  {
    category: 'Spoken Languages',
    skills: [
      { name: 'French (Fluent)', level: 5 },
      { name: 'English (Fluent)', level: 5 },
      { name: 'Mandarin (Intermediate)', level: 3 },
    ],
  },
];

// ============================================
// EXPERIENCE
// ============================================

export const experiences: Experience[] = [
  {
    id: 'exp-education',
    title: 'B.Eng Software Engineering (Co-op)',
    company: 'Concordia University',
    location: 'Montreal, QC',
    startDate: '2025',
    endDate: '2029 (Expected)',
    description: [
      'GPA: 4.17 / 4.30',
      'Co-operative Education Program',
      'Focus on software architecture and mobile development',
    ],
    type: 'education',
  },
  {
    id: 'exp-award-1',
    title: '1st Place & Best UI Design',
    company: 'ETS Mobile App Challenge Hackathon',
    location: 'École de Technologie Supérieure, Montreal',
    startDate: 'Dec 2025',
    endDate: 'Dec 2025',
    description: [
      'Awarded $1,750 in total prizes ($1,250 First Place + $500 Best UI Design)',
      'Built a complete mobile application in under 24 hours',
      'Led UI/UX design and front-end development using Flutter',
    ],
    type: 'award',
  },
  {
    id: 'exp-award-2',
    title: 'CodeJam 2024 Participant',
    company: 'McGill University Hackathon',
    location: 'Montreal, QC',
    startDate: 'Nov 2024',
    endDate: 'Nov 2024',
    description: [
      'Built full-stack cross-platform application in 48 hours',
      'Implemented AI-assisted event discovery features',
      'Integrated Flutter, NestJS, PocketBase, and Next.js',
    ],
    type: 'award',
  },
  {
    id: 'exp-work',
    title: 'Community Manager & Digital Marketing Operator',
    company: 'Online Gaming Content Brand',
    location: 'Montreal, QC (Remote)',
    startDate: '2020',
    endDate: '2022',
    description: [
      'Grew gaming content brand to 100K+ Instagram followers',
      'Operated platform as paid advertising channel for external businesses',
      'Moderated 2K+ member Discord community with engagement strategies',
    ],
    type: 'work',
  },
];

// ============================================
// SOCIAL LINKS
// ============================================

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/Atlearia',
    icon: 'github',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/ning-ye',
    icon: 'linkedin',
  },
];

// ============================================
// ABOUT SECTION CONTENT
// ============================================

export const aboutContent = {
  headline: "I'm a software engineering student who believes the best products live at the intersection of beautiful design and solid engineering.",
  paragraphs: [
    "Currently pursuing my Bachelor's in Software Engineering at Concordia University with a 4.17 GPA, I'm passionate about creating intuitive digital experiences that users love.",
    "My expertise spans mobile development with Flutter, full-stack applications with Next.js and NestJS, and game development with Unity. I've won hackathons for both technical implementation and UI/UX design — because I believe great software needs both.",
    "When I'm not coding, you'll find me exploring game development, contributing to team projects, or building the next award-winning app at a hackathon.",
  ],
  highlights: [
    { label: 'GPA', value: '4.17' },
    { label: 'Hackathon Wins', value: '1st 🏆' },
    { label: 'Prize Money', value: '$1,750' },
    { label: 'Community Built', value: '100K+' },
  ],
};
