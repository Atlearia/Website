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
    subtitle: 'Software Engineer • Creator',
    description: 'Crafting digital experiences with code and creativity. Passionate about building products that make a difference.',
    highlight: '📍 Montreal, QC',
    gradient: ['#14b8a6', '#0d9488'], // Teal
  },

  // FACE 2: Education (BACK)
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Concordia University',
    items: [
      { label: 'Program', value: 'Software Engineering' },
      { label: 'GPA', value: '4.17 / 4.30 ⭐' },
      { label: 'Expected', value: 'Class of 2028' },
      { label: 'Status', value: "Dean's List" },
    ],
    highlight: '🎓 Top of Class',
    gradient: ['#06b6d4', '#0891b2'], // Cyan
  },

  // FACE 3: Skills (RIGHT)
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Technical Stack',
    items: [
      { label: 'Languages', value: 'C# • Java • Dart • Python' },
      { label: 'Mobile', value: 'Flutter • React Native' },
      { label: 'Web', value: 'Next.js • NestJS • Spring' },
      { label: 'Tools', value: 'Unity • Firebase • Git' },
    ],
    highlight: '🌐 EN • FR • 中文',
    gradient: ['#8b5cf6', '#7c3aed'], // Violet
  },

  // FACE 4: Projects (LEFT)
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Featured Work',
    items: [
      { label: 'ETS Mobile', value: '🥇 1st Place' },
      { label: 'CodeJam 2024', value: 'Cross-Platform' },
      { label: 'Game Dev', value: 'Unity Bullet-Hell' },
      { label: 'This Site', value: 'Next.js + Three.js' },
    ],
    highlight: '💰 $1,750 Won',
    gradient: ['#ec4899', '#db2777'], // Pink
  },

  // FACE 5: Experience / Achievements (TOP)
  {
    id: 'experience',
    title: 'Experience',
    subtitle: 'Achievements & Work',
    items: [
      { label: 'Hackathons', value: '2 Awards 🏆' },
      { label: 'Best UI', value: 'ETS Challenge 2025' },
      { label: 'Community', value: '100K+ Followers' },
      { label: 'Content', value: 'Gaming Platform' },
    ],
    highlight: '🚀 Building the Future',
    gradient: ['#f97316', '#ea580c'], // Orange
  },

  // FACE 6: Contact / Links (BOTTOM)
  {
    id: 'contact',
    title: 'Connect',
    subtitle: "Let's Build Together",
    links: [
      { label: 'github.com/Atlearia', url: 'https://github.com/Atlearia', icon: 'github' },
      { label: 'linkedin.com/in/ning-ye', url: 'https://linkedin.com/in/ning-ye', icon: 'linkedin' },
      { label: 'ning.ye@mail.concordia.ca', url: 'mailto:ning.ye@mail.concordia.ca', icon: 'mail' },
    ],
    description: 'Open to opportunities and collaborations.',
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
