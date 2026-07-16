"use client";

import { 
  ShaderMaterial, 
  UniformsUtils, 
  Color, 
  Vector3 
} from "three";

/**
 * Cultural Festival Shaders for Malaysian Celebrations
 * Each festival has a unique glaze material with cultural color palette
 */

// ─── Festival Color Palettes ─────────────────────────────────────────────
export const FESTIVAL_PALETTES = {
  harirRaya: {
    name: "Hari Raya Aidilfitri",
    base: "#1B5E20",        // Deep ketupat green
    glaze: "#FFD700",       // Gold
    accent: "#FFFFFF",      // White
    iridescence: 2.0,
    thickness: 520,         // Green-gold interference
    particles: ["#1B5E20", "#2E7D32", "#FFD700", "#FFF8E1", "#FFFFFF"],
    greeting: "Selamat Hari Raya Aidilfitri! 🌙",
  },
  merdeka: {
    name: "Hari Merdeka",
    base: "#B71C1C",        // Jalur Gemilang red
    glaze: "#FFFFFF",       // White
    accent: "#0D47A1",      // Blue canton
    iridescence: 1.8,
    thickness: 480,         // Red-white interference
    particles: ["#B71C1C", "#FFFFFF", "#0D47A1", "#FFD700"],
    greeting: "Merdeka! 🇲🇾",
  },
  cny: {
    name: "Chinese New Year",
    base: "#B71C1C",        // Prosperity red
    glaze: "#FFD700",       // Gold
    accent: "#FF8C00",      // Mandarin orange
    iridescence: 2.2,
    thickness: 580,         // Red-gold interference
    particles: ["#B71C1C", "#FFD700", "#FF8C00", "#FFFFFF", "#FF6B6B"],
    greeting: "Gong Xi Fa Cai! 🧧",
  },
  deepavali: {
    name: "Deepavali",
    base: "#4A148C",        // Deep purple
    glaze: "#FF9800",       // Marigold orange
    accent: "#E91E63",      // Pink
    iridescence: 2.0,
    thickness: 540,         // Purple-gold interference
    particles: ["#4A148C", "#FF9800", "#E91E63", "#FFD700", "#FFFFFF"],
    greeting: "Happy Deepavali! 🪔",
  },
} as const;

export type FestivalKey = keyof typeof FESTIVAL_PALETTES;

/**
 * Creates a festival-specific glaze shader material
 */
export function createFestivalGlazeMaterial(festival: FestivalKey) {
  const palette = FESTIVAL_PALETTES[festival];
  
  return new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      ShaderMaterial.prototype.uniforms,
      {
        uBaseColor: { value: new Color(palette.base) },
        uGlazeColor: { value: new Color(palette.glaze) },
        uAccentColor: { value: new Color(palette.accent) },
        uIridescenceStrength: { value: palette.iridescence },
        uThickness: { value: palette.thickness },
        uNoiseScale: { value: 1.8 },
        uTime: { value: 0 },
        uViewDir: { value: new Vector3() },
        uFestivalProgress: { value: 1.0 }, // 0-1 for transition animations
      },
    ]),
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDir;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vViewDir = normalize(cameraPosition - vWorldPosition);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDir;
      
      uniform vec3 uBaseColor;
      uniform vec3 uGlazeColor;
      uniform vec3 uAccentColor;
      uniform float uIridescenceStrength;
      uniform float uThickness;
      uniform float uNoiseScale;
      uniform float uTime;
      uniform float uFestivalProgress;
      
      // Thin-film interference (iridescence)
      vec3 thinFilm(float thickness, vec3 normal, vec3 viewDir) {
        float cosTheta = dot(normal, -viewDir);
        float sinTheta2 = 1.0 - cosTheta * cosTheta;
        float eta = 1.5; // IOR of glaze
        float cosThetaT = sqrt(1.0 - sinTheta2 / (eta * eta));
        
        float opticalThickness = thickness * cosThetaT;
        float phase = 2.0 * 3.14159 * opticalThickness / 550.0;
        
        // Wavelength-dependent interference
        vec3 lambda = vec3(650.0, 550.0, 450.0); // R, G, B in nm
        vec3 intensity = cos(phase * 550.0 / lambda + vec3(0.0, 2.094, 4.189));
        intensity = intensity * intensity;
        
        return intensity;
      }
      
      // 3D noise for surface imperfections
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = dot(i, vec3(1.0, 57.0, 113.0));
        float a = fract(sin(n) * 43758.5453);
        float b = fract(sin(n + 1.0) * 43758.5453);
        float c = fract(sin(n + 57.0) * 43758.5453);
        float d = fract(sin(n + 58.0) * 43758.5453);
        float e = fract(sin(n + 113.0) * 43758.5453);
        float f_ = fract(sin(n + 114.0) * 43758.5453);
        return mix(
          mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
          mix(mix(e, b, f.x), mix(f_, c, f.x), f.y),
          f.z
        );
      }
      
      // Festival pattern: ketupat diamonds for Hari Raya
      float ketupatPattern(vec2 uv) {
        vec2 p = mod(uv * 8.0, 2.0) - 1.0;
        float d = abs(p.x) + abs(p.y);
        return step(0.8, d) * step(d, 1.2);
      }
      
      // Festival pattern: stripes for Merdeka
      float merdekaStripes(vec2 uv) {
        return step(0.5, mod(uv.y * 14.0, 1.0));
      }
      
      // Festival pattern: lanterns for CNY
      float cnyLanterns(vec2 uv) {
        vec2 p = mod(uv * 6.0, 2.0) - 1.0;
        float r = length(p);
        return step(0.3, r) * step(r, 0.5);
      }
      
      // Festival pattern: diya flames for Deepavali
      float deepavaliDiyas(vec2 uv) {
        vec2 p = mod(uv * 5.0, 2.0) - 1.0;
        float r = length(p);
        return step(0.2, r) * step(r, 0.4) * (1.0 - abs(p.y) * 2.0);
      }
      
      void main() {
        // Normal perturbation from noise
        vec3 perturbedNormal = vNormal + noise(vWorldPosition * uNoiseScale + uTime * 0.1) * 0.05;
        perturbedNormal = normalize(perturbedNormal);
        
        // Thin-film iridescence
        vec3 iridescence = thinFilm(uThickness, perturbedNormal, vViewDir) * uIridescenceStrength;
        
        // Fresnel for edge glow
        float fresnel = pow(1.0 - abs(dot(perturbedNormal, vViewDir)), 3.0);
        
        // Base dough color shows through thin glaze areas
        float glazeThickness = 0.3 + noise(vWorldPosition * 0.5) * 0.4;
        
        // Festival-specific surface patterns
        vec2 uv = vWorldPosition.xz * 2.0;
        float pattern = 0.0;
        
        // Apply festival patterns based on progress
        pattern += ketupatPattern(uv) * uFestivalProgress * step(0.5, uFestivalProgress - 0.0); // Hari Raya
        pattern += merdekaStripes(uv) * uFestivalProgress * step(0.5, uFestivalProgress - 0.0); // Merdeka
        pattern += cnyLanterns(uv) * uFestivalProgress * step(0.5, uFestivalProgress - 0.0); // CNY
        pattern += deepavaliDiyas(uv) * uFestivalProgress * step(0.5, uFestivalProgress - 0.0); // Deepavali
        
        // Final color blend
        vec3 color = mix(uBaseColor, uGlazeColor, glazeThickness);
        color += iridescence * 0.5;
        color += vec3(fresnel * 0.3);
        
        // Apply festival pattern as subtle overlay
        color = mix(color, uAccentColor, pattern * 0.15 * uFestivalProgress);
        
        // Subtle animation: glaze "breathes"
        float breathe = sin(uTime * 0.5 + vWorldPosition.y * 2.0) * 0.02 + 1.0;
        color *= breathe;
        
        gl_FragColor = vec4(color, 1.0);
        
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    extensions: {
      derivatives: true,
    },
  });
}

/**
 * Creates a festival-specific dough material
 */
export function createFestivalDoughMaterial(festival: FestivalKey) {
  const palette = FESTIVAL_PALETTES[festival];
  
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(palette.base) },
      uTransmission: { value: 0.12 },
      uThickness: { value: 0.8 },
      uTime: { value: 0 },
      uFestivalProgress: { value: 1.0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uTransmission;
      uniform float uThickness;
      uniform float uTime;
      uniform float uFestivalProgress;
      
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = dot(i, vec3(1.0, 57.0, 113.0));
        return fract(sin(n) * 43758.5453);
      }
      
      void main() {
        float sss = pow(1.0 - abs(dot(vNormal, normalize(vec3(0.0, 1.0, 0.0)))), 2.0);
        sss *= uTransmission;
        
        float pores = noise(vWorldPosition * 10.0 + uTime * 0.2);
        pores = step(0.98, pores) * 0.15;
        
        vec3 color = uColor * (1.0 + sss - pores);
        
        // Festival accent on rim
        float rim = pow(1.0 - max(dot(vNormal, normalize(vec3(0.0, 0.0, 1.0))), 0.0), 3.0);
        color += vec3(rim * 0.2, rim * 0.15, rim * 0.1);
        
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Creates festival-specific sprinkle/particle material
 */
export function createFestivalParticleMaterial(festival: FestivalKey) {
  const palette = FESTIVAL_PALETTES[festival];
  const colorVecs = palette.particles.map(c => new Color(c));
  
  return new ShaderMaterial({
    uniforms: {
      uColors: { value: colorVecs },
      uColorCount: { value: colorVecs.length },
      uTime: { value: 0 },
      uSize: { value: 1.0 },
      uFestivalProgress: { value: 1.0 },
    },
    vertexShader: `
      attribute float aColorIndex;
      attribute float aPhase;
      attribute vec3 aOffset;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uSize;
      uniform vec3 uColors[8];
      uniform int uColorCount;
      uniform float uFestivalProgress;
      
      void main() {
        vec3 pos = position * uSize + aOffset;
        
        // Festival-specific animation
        float wobble = sin(uTime * 2.0 + aPhase + pos.y * 5.0) * 0.1 * uFestivalProgress;
        pos.xz += vec2(wobble, wobble * 0.5);
        
        // Rotation
        float angle = uTime * 0.5 + aPhase;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        pos.xz = rot * pos.xz;
        
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPos;
        gl_PointSize = uSize * (300.0 / -mvPos.z);
        
        int idx = int(aColorIndex) % uColorCount;
        vColor = uColors[idx];
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        
        float alpha = smoothstep(0.5, 0.45, dist);
        float highlight = 1.0 - dist * 2.0;
        vec3 color = vColor + vec3(highlight * 0.5);
        
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    vertexColors: false,
  });
}

/**
 * Hook to detect current festival based on date
 */
export function getCurrentFestival(): FestivalKey | null {
  if (typeof window === 'undefined') return null;
  
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  
  // Approximate festival dates (lunar calendar varies)
  // Hari Raya: ~April-May (Shawwal 1)
  // Merdeka: Aug 31
  // CNY: ~Jan-Feb (Lunar New Year)
  // Deepavali: ~Oct-Nov
  
  if (month === 7 && day === 31) return "merdeka"; // Aug 31
  if (month === 3 || month === 4) return "harir Raya"; // Apr-May
  if (month === 0 || month === 1) return "cny"; // Jan-Feb
  if (month === 9 || month === 10) return "deepavali"; // Oct-Nov
  
  return null;
}

/**
 * Auto-detect festival and create materials
 */
export function createAutoFestivalMaterials() {
  const festival = getCurrentFestival();
  
  if (!festival) {
    return {
      glaze: null,
      dough: null,
      particles: null,
      festival: null,
    };
  }
  
  return {
    glaze: createFestivalGlazeMaterial(festival),
    dough: createFestivalDoughMaterial(festival),
    particles: createFestivalParticleMaterial(festival),
    festival,
    greeting: FESTIVAL_PALETTES[festival].greeting,
  };
}