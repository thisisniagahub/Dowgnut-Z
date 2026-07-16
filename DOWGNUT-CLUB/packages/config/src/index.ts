export const brand = {
  colors: {
    blue: '#07579B',
    blueLight: '#2D7FC2',
    blueDark: '#07334F',
    pink: '#F05A9B',
    pinkSoft: '#FF9AC7',
    pinkDark: '#C93373',
    lime: '#E8F866',
    limeBright: '#F7FFD6',
    limeDark: '#B9C96A',
    cream: '#FFF9E8',
    dough: '#D4B36A',
    grey: '#AEA294',
  },
  fonts: {
    display: 'var(--font-display)',
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  tagline: 'GOOD VIBES & GOOD DOWG',
  subTagline: 'BOLD • PLAYFUL • AUTHENTIC',
};

export const api = {
  baseUrl: process.env.API_URL || 'http://localhost:4000',
  version: 'v1',
  timeout: 30000,
};

export const pagination = {
  defaultLimit: 20,
  maxLimit: 100,
};

export const cache = {
  defaultTtl: 60 * 5, // 5 minutes
  shortTtl: 60, // 1 minute
  longTtl: 60 * 60 * 24, // 24 hours
};