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
  level?: number;
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
  icon: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  availability: string;
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  cubeHref: string;
  githubUrl: string;
  linkedinUrl: string;
  currentFocus: string[];
}

export interface ProofStat {
  label: string;
  value: string;
  detail: string;
}

export interface FeaturedBuild {
  id: string;
  title: string;
  summary: string;
  impact: string;
  stack: string[];
  githubUrl: string;
  liveUrl?: string;
  liveLabel?: string;
  status: string;
}

export interface EngineeringPillar {
  title: string;
  summary: string;
  detail: string;
}

export interface PrimaryLink {
  label: string;
  href: string;
  description: string;
  icon: 'mail' | 'github' | 'linkedin' | 'cube';
  external?: boolean;
}

export const siteConfig: SiteConfig = {
  name: 'Ning Ye',
  title: 'Software Engineering Student Building Clean Systems and Distinct Interfaces',
  description:
    'Software engineering student at Concordia building polished mobile, full-stack, and interactive web experiences with clean architecture, strong delivery habits, and a deliberate eye for interface quality.',
  email: 'ning.ye@mail.concordia.ca',
  location: 'Montreal, QC',
  availability: 'Open to co-op, internship, and high-trust student build opportunities.',
  heroEyebrow: 'Concordia University - B.Eng Software Engineering (Co-op)',
  heroTitle:
    'Software engineering student building clean systems with a designer-level sense of finish.',
  heroIntro:
    'I like software that feels inevitable once it ships: strong architecture underneath, calm interfaces on top, and motion or interaction that sharpens the product instead of distracting from it.',
  cubeHref: '/cube',
  githubUrl: 'https://github.com/Atlearia',
  linkedinUrl: 'https://linkedin.com/in/ning-ye',
  currentFocus: [
    'Full-stack product engineering with Next.js and NestJS',
    'Mobile product work in Flutter with sharp interface polish',
    'Interactive web experiments that still respect performance',
  ],
};

export const navLinks: NavLink[] = [
  { label: 'Quests', href: '#quests' },
  { label: 'The Forge', href: '#forge' },
  { label: 'Grimoire', href: '#grimoire' },
];

export const proofStats: ProofStat[] = [
  {
    label: 'GPA',
    value: '4.17 / 4.30',
    detail: 'Strong academic footing while staying active in build-heavy work.',
  },
  {
    label: 'Sprint Win',
    value: '24 hours',
    detail: 'Built an award-winning mobile product under hackathon pressure.',
  },
  {
    label: 'Awards',
    value: '1st + Best UI',
    detail: 'Recognized for both technical execution and interface quality.',
  },
  {
    label: 'Scale',
    value: '100K+',
    detail: 'Previously grew and operated a community-facing digital brand.',
  },
];

export const featuredBuilds: FeaturedBuild[] = [
  {
    id: 'ets-mobile-challenge',
    title: 'ETS Mobile App Challenge',
    summary:
      'Shipped a localization-ready mobile application with realtime distance tracking in a single 24-hour build window.',
    impact:
      'Won 1st Place and Best UI Design by pairing fast implementation with disciplined frontend polish.',
    stack: ['Flutter', 'Firebase', 'Dart', 'Localization', 'Realtime'],
    githubUrl: siteConfig.githubUrl,
    status: 'Award-winning sprint build',
  },
  {
    id: 'codejam-platform',
    title: 'CodeJam Event Discovery Platform',
    summary:
      'Built a cross-platform event discovery product with AI-assisted recommendations and a full-stack admin flow during a 48-hour hackathon.',
    impact:
      'Connected a Flutter client, NestJS backend, PocketBase data layer, and Next.js admin tools into one coherent system.',
    stack: ['Flutter', 'NestJS', 'PocketBase', 'Next.js', 'AI tooling'],
    githubUrl: siteConfig.githubUrl,
    status: '48-hour full-stack system',
  },
  {
    id: 'portfolio-cube',
    title: 'Interactive Portfolio and CV Cube',
    summary:
      'Designed this portfolio as a crafted web surface, then paired it with a separate interactive cube route to make the experience feel authored instead of templated.',
    impact:
      'Uses Next.js, motion design, and a custom 3D layer to show both interface taste and willingness to build unusual interactions well.',
    stack: ['Next.js', 'TypeScript', 'Framer Motion', 'Three.js'],
    githubUrl: siteConfig.githubUrl,
    liveUrl: siteConfig.cubeHref,
    liveLabel: 'Enter the cube',
    status: 'Interactive web experiment',
  },
];

export const engineeringPillars: EngineeringPillar[] = [
  {
    title: 'Architecture before ornament',
    summary:
      'I like a small number of well-chosen tools, clear interfaces between layers, and code that is easy to revisit a month later.',
    detail:
      'That usually means typed boundaries, readable component structure, and implementation choices that scale past the demo.',
  },
  {
    title: 'Frontend craft with intent',
    summary:
      'Visual quality matters to me, but only when it strengthens hierarchy, clarity, and trust.',
    detail:
      'I pay attention to spacing, typography, motion timing, and responsiveness because they change how finished the product feels.',
  },
  {
    title: 'Fast iteration without chaos',
    summary:
      'Hackathons taught me how to move quickly while still protecting the shape of the system.',
    detail:
      'I am comfortable shipping under time pressure, then refining the work so it still looks thoughtful in hindsight.',
  },
];

export const primaryLinks: PrimaryLink[] = [
  {
    label: 'Email',
    href: `mailto:${siteConfig.email}`,
    description: 'The cleanest path for internship, co-op, or project conversations.',
    icon: 'mail',
  },
  {
    label: 'GitHub',
    href: siteConfig.githubUrl,
    description: 'Code, experiments, and the public side of how I like to build.',
    icon: 'github',
    external: true,
  },
  {
    label: 'LinkedIn',
    href: siteConfig.linkedinUrl,
    description: 'A quick professional snapshot and the easiest social touchpoint.',
    icon: 'linkedin',
    external: true,
  },
  {
    label: 'Enter the Cube',
    href: siteConfig.cubeHref,
    description: 'A separate interactive route that explores the portfolio in 3D.',
    icon: 'cube',
  },
];

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: siteConfig.githubUrl,
    icon: 'github',
  },
  {
    name: 'LinkedIn',
    url: siteConfig.linkedinUrl,
    icon: 'linkedin',
  },
];

// Legacy compatibility exports retained so older, unused portfolio modules
// continue to type-check while the homepage uses the new data model above.
export const projects: Project[] = featuredBuilds.map((build) => ({
  id: build.id,
  title: build.title,
  description: build.summary,
  longDescription: `${build.summary} ${build.impact}`,
  tags: build.stack,
  liveUrl: build.liveUrl ?? '#',
  githubUrl: build.githubUrl,
  featured: true,
}));

export const skillCategories: SkillCategory[] = [
  {
    category: 'Languages',
    skills: [
      { name: 'TypeScript', level: 4 },
      { name: 'Dart', level: 5 },
      { name: 'Java', level: 4 },
      { name: 'C#', level: 4 },
      { name: 'Python', level: 4 },
    ],
  },
  {
    category: 'Frameworks',
    skills: [
      { name: 'Next.js', level: 4 },
      { name: 'Flutter', level: 5 },
      { name: 'NestJS', level: 4 },
      { name: 'Spring Boot', level: 3 },
      { name: 'Framer Motion', level: 4 },
    ],
  },
  {
    category: 'Systems and Tools',
    skills: [
      { name: 'Firebase', level: 4 },
      { name: 'PocketBase', level: 4 },
      { name: 'Git', level: 5 },
      { name: 'Unity', level: 4 },
      { name: 'Figma', level: 4 },
    ],
  },
  {
    category: 'Collaboration',
    skills: [
      { name: 'UI implementation', level: 5 },
      { name: 'Rapid prototyping', level: 5 },
      { name: 'System thinking', level: 4 },
      { name: 'Team delivery', level: 4 },
    ],
  },
];

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
      'Focused on software architecture, mobile systems, and polished interfaces',
    ],
    type: 'education',
  },
  {
    id: 'exp-award-1',
    title: '1st Place and Best UI Design',
    company: 'ETS Mobile App Challenge',
    location: 'Montreal, QC',
    startDate: 'Dec 2025',
    endDate: 'Dec 2025',
    description: [
      'Built a complete mobile application in under 24 hours',
      'Led UI and frontend implementation in Flutter',
      'Won both the top prize and design recognition',
    ],
    type: 'award',
  },
  {
    id: 'exp-award-2',
    title: 'Hackathon Builder',
    company: 'CodeJam at McGill University',
    location: 'Montreal, QC',
    startDate: 'Nov 2024',
    endDate: 'Nov 2024',
    description: [
      'Built a cross-platform product in a 48-hour team sprint',
      'Integrated Flutter, NestJS, PocketBase, and Next.js',
      'Focused on turning a fast prototype into a coherent experience',
    ],
    type: 'award',
  },
  {
    id: 'exp-work',
    title: 'Community Manager and Digital Marketing Operator',
    company: 'Online Gaming Content Brand',
    location: 'Remote',
    startDate: '2020',
    endDate: '2022',
    description: [
      'Scaled the brand to 100K+ Instagram followers',
      'Managed paid promotions for outside businesses',
      'Moderated and grew a 2K+ Discord community',
    ],
    type: 'work',
  },
];

export const aboutContent = {
  headline:
    'I am most interested in the space where software engineering discipline and interface quality reinforce each other.',
  paragraphs: [
    'At Concordia, I am building a strong technical base while spending real time on the parts of product work that people actually notice: clarity, responsiveness, and finish.',
    'My projects usually sit at the boundary between implementation and experience design. I enjoy building the systems underneath, but I also care about how the final surface communicates confidence.',
    'That combination is what keeps me interested in mobile products, full-stack systems, and interactive web work.',
  ],
  highlights: [
    { label: 'GPA', value: '4.17' },
    { label: 'Award Wins', value: '1st + UI' },
    { label: 'Fastest Sprint', value: '24h' },
    { label: 'Community Scale', value: '100K+' },
  ],
};
