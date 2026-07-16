"use client";

import { extend } from "@react-three/fiber";
import { 
  ShaderMaterial, 
  UniformsUtils, 
  Color, 
  Vector3 
} from "three";

// Extend for R3F JSX usage
extend({ ShaderMaterial });

/**
 * Iridescent Glaze Shader — thin-film interference on donut glaze
 * Simulates the rainbow sheen you see on chocolate glaze / oil slicks
 * Inspired by: https://www.shadertoy.com/view/Ms2SD1
 */
export function createGlazeShaderMaterial(params: {
  baseColor?: string;
  glazeColor?: string;
  iridescenceStrength?: number;
  thickness?: number;
  noiseScale?: number;
} = {}) {
  const {
    baseColor = "#8B4513",      // chocolate brown
    glazeColor = "#D4A574",     // warm glaze
    iridescenceStrength = 1.0,
    thickness = 400,            // nm - thin film thickness
    noiseScale = 2.0,
  } = params;

  return new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      ShaderMaterial.prototype.uniforms,
      {
        uBaseColor: { value: new Color(baseColor) },
        uGlazeColor: { value: new Color(glazeColor) },
        uIridescenceStrength: { value: iridescenceStrength },
        uThickness: { value: thickness },
        uNoiseScale: { value: noiseScale },
        uTime: { value: 0 },
        uViewDir: { value: new Vector3() },
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
      uniform float uIridescenceStrength;
      uniform float uThickness;
      uniform float uNoiseScale;
      uniform float uTime;
      
      // Thin-film interference (iridescence)
      // Based on: https://www.shadertoy.com/view/Ms2SD1
      vec3 thinFilm(float thickness, vec3 normal, vec3 viewDir) {
        float cosTheta = dot(normal, -viewDir);
        float sinTheta2 = 1.0 - cosTheta * cosTheta;
        float eta = 1.5; // IOR of glaze
        float cosThetaT = sqrt(1.0 - sinTheta2 / (eta * eta));
        
        float opticalThickness = thickness * cosThetaT;
        float phase = 2.0 * 3.14159 * opticalThickness / 550.0; // 550nm = green center
        
        // Wavelength-dependent interference
        vec3 lambda = vec3(650.0, 550.0, 450.0); // R, G, B in nm
        vec3 intensity = cos(phase * 550.0 / lambda + vec3(0.0, 2.094, 4.189));
        intensity = intensity * intensity; // square for sharper peaks
        
        return intensity;
      }
      
      // Simple 3D noise for glaze imperfections
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
      
      void main() {
        // Normal perturbation from noise (glaze surface imperfections)
        vec3 perturbedNormal = vNormal + noise(vWorldPosition * uNoiseScale + uTime * 0.1) * 0.05;
        perturbedNormal = normalize(perturbedNormal);
        
        // Thin-film iridescence
        vec3 iridescence = thinFilm(uThickness, perturbedNormal, vViewDir) * uIridescenceStrength;
        
        // Fresnel for edge glow
        float fresnel = pow(1.0 - abs(dot(perturbedNormal, vViewDir)), 3.0);
        
        // Base dough color shows through thin glaze areas
        float glazeThickness = 0.3 + noise(vWorldPosition * 0.5) * 0.4;
        
        // Final color blend
        vec3 color = mix(uBaseColor, uGlazeColor, glazeThickness);
        color += iridescence * 0.5; // rainbow shimmer
        color += vec3(fresnel * 0.3); // edge highlight
        
        // Subtle animation: glaze "breathes"
        float breathe = sin(uTime * 0.5 + vWorldPosition.y * 2.0) * 0.02 + 1.0;
        color *= breathe;
        
        gl_FragColor = vec4(color, 1.0);
        
        // Include for post-processing
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
 * Dough Subsurface Scattering Material
 * Gives that fluffy, light-penetrating look to donut interior
 */
export function createDoughMaterial(params: {
  color?: string;
  transmission?: number;
  thickness?: number;
} = {}) {
  const { color = "#D4A574", transmission = 0.15, thickness = 0.8 } = params;
  
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uTransmission: { value: transmission },
      uThickness: { value: thickness },
      uTime: { value: 0 },
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
      
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = dot(i, vec3(1.0, 57.0, 113.0));
        return fract(sin(n) * 43758.5453);
      }
      
      void main() {
        // Subsurface approximation: light wraps around edges
        float sss = pow(1.0 - abs(dot(vNormal, normalize(vec3(0.0, 1.0, 0.0)))), 2.0);
        sss *= uTransmission;
        
        // Porous texture (air bubbles in dough)
        float pores = noise(vWorldPosition * 10.0 + uTime * 0.2);
        pores = step(0.98, pores) * 0.15;
        
        vec3 color = uColor * (1.0 + sss - pores);
        
        // Warm rim lighting
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
 * Sprinkle Instanced Material — GPU-driven millions of sprinkles
 */
export function createSprinkleMaterial(params: {
  colors?: string[];
} = {}) {
  const colors = params.colors || [
    "#FF6B6B", "#4ECDC4", "#FFE66D", "#FF8B8B", 
    "#A8E6CF", "#FFD3B6", "#B8B8FF", "#FFB8B8"
  ];
  
  const colorVecs = colors.map(c => new Color(c));
  
  return new ShaderMaterial({
    uniforms: {
      uColors: { value: colorVecs },
      uColorCount: { value: colorVecs.length },
      uTime: { value: 0 },
      uSize: { value: 1.0 },
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
      
      void main() {
        vec3 pos = position * uSize + aOffset;
        
        // Wobble animation
        float wobble = sin(uTime * 2.0 + aPhase + pos.y * 5.0) * 0.1;
        pos.xz += vec2(wobble, wobble * 0.5);
        
        // Rotation around Y
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
        // Circular point sprite
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;
        
        // Soft edge
        float alpha = smoothstep(0.5, 0.45, dist);
        
        // Spherical highlight
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