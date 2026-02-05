// ============================================================================
// CUBE CV CONTENT CONFIGURATION
// ============================================================================
// This file defines all content displayed on the interactive 3D cube faces.
// Each face represents a section of the CV/portfolio.
// Modify this file to update cube content without touching components.
// ============================================================================

export interface CubeFaceContent {
  id: string;
  title: string;
  subtitle?: string;
  items?: Array<{
    label: string;
    value?: string;
    icon?: string;
  }>;
  description?: string;
  links?: Array<{
    label: string;
    url: string;
    icon?: string;
  }>;
  highlight?: string;
  gradient: [string, string]; // Two colors for face gradient
}

export const cubeContent: CubeFaceContent[] = [
  // FACE 1: Introduction / Name (FRONT)
  {
    id: 'intro',
    title: 'Ning Ye',
    subtitle: 'Software Engineer',
    description: 'Building innovative mobile & web experiences. Hackathon winner. Trilingual creator passionate about impactful technology.',
    items: [
      { label: 'Phone', value: '514.965.3579' },
      { label: 'Location', value: 'Montreal, QC' },
    ],
    highlight: '🎯 Open to Co-op',
    gradient: ['#14b8a6', '#0d9488'], // Teal
  },

  // FACE 2: Education (BACK)
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Concordia University',
    items: [
      { label: 'Degree', value: 'B.Eng Software' },
      { label: 'Program', value: 'Co-op' },
      { label: 'GPA', value: '4.17 / 4.30' },
      { label: 'Graduation', value: '2029' },
    ],
    highlight: "🎓 Dean's List",
    gradient: ['#06b6d4', '#0891b2'], // Cyan
  },

  // FACE 3: Skills (RIGHT)
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Technical Expertise',
    items: [
      { label: 'Code', value: 'C# • Java • Dart • Python' },
      { label: 'Mobile', value: 'Flutter • Firebase' },
      { label: 'Backend', value: 'NestJS • Spring Boot' },
      { label: 'Frontend', value: 'Next.js • Fabric' },
    ],
    highlight: '🗣 EN • FR • 中文',
    gradient: ['#8b5cf6', '#7c3aed'], // Violet
  },

  // FACE 4: Projects (LEFT)
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Featured Work',
    items: [
      { label: 'ETS Mobile 2025', value: '🥇 $1,750' },
      { label: 'CodeJam 2024', value: 'Full-Stack App' },
      { label: 'Bullet-Hell', value: 'Unity C#' },
      { label: 'Portfolio', value: 'Next + Three.js' },
    ],
    description: 'Mobile apps built in 24-48hrs using Flutter, Firebase, NestJS, PocketBase',
    highlight: '⚡ 24hr Builds',
    gradient: ['#ec4899', '#db2777'], // Pink
  },

  // FACE 5: Experience / Achievements (TOP)
  {
    id: 'experience',
    title: 'Experience',
    subtitle: 'Work & Achievements',
    items: [
      { label: '2020-2022', value: 'Community Manager' },
      { label: 'Instagram', value: '100K+ Followers' },
      { label: 'Discord', value: '2K Members' },
      { label: 'Awards', value: '1st + Best UI 🏆' },
    ],
    description: 'Digital marketing & community growth for gaming content brand',
    highlight: '📈 100K+ Reach',
    gradient: ['#f97316', '#ea580c'], // Orange
  },

  // FACE 6: Contact / Links (BOTTOM)
  {
    id: 'contact',
    title: 'Connect',
    subtitle: "Let's Collaborate",
    links: [
      { label: 'github.com/Atlearia', url: 'https://github.com/Atlearia', icon: 'github' },
      { label: 'linkedin.com/in/ning-ye', url: 'https://linkedin.com/in/ning-ye', icon: 'linkedin' },
      { label: 'ning.ye@mail.concordia.ca', url: 'mailto:ning.ye@mail.concordia.ca', icon: 'mail' },
    ],
    description: 'Open for internships, co-ops & exciting projects',
    highlight: '💬 Say Hello!',
    gradient: ['#10b981', '#059669'], // Emerald
  },
];

// Face rotation mappings for the cube (in radians)
// Maps each face index to its rotation on the cube
export const faceRotations: Record<number, [number, number, number]> = {
  0: [0, 0, 0],                    // Front
  1: [0, Math.PI, 0],              // Back
  2: [0, Math.PI / 2, 0],          // Right
  3: [0, -Math.PI / 2, 0],         // Left
  4: [-Math.PI / 2, 0, 0],         // Top
  5: [Math.PI / 2, 0, 0],          // Bottom
};

// Physics configuration for the cube
export const cubePhysics = {
  mass: 1,
  friction: 0.3,
  restitution: 0.1,           // Bounciness
  linearDamping: 0.5,         // Slows down movement
  angularDamping: 0.4,        // Slows down rotation
  flickMultiplier: 8,         // Force multiplier for flicks
  dragSensitivity: 0.01,      // How sensitive drag rotation is
  snapDuration: 0.5,          // Seconds to snap to face
  minFlickVelocity: 2,        // Minimum velocity to count as flick
};

// Visual configuration
export const cubeVisuals = {
  size: 2.5,                  // Cube dimensions
  faceSize: 2.4,              // Slightly smaller than cube for depth
  cornerRadius: 0.1,          // Rounded corners
  shadowOpacity: 0.3,
  glowIntensity: 0.5,
  glowColor: '#14b8a6',       // Teal glow
};
