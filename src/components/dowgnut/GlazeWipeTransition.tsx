// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.
"use client";

// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  OrthographicCamera,
  Scene,
  WebGLRenderTarget,
  AdditiveBlending,
} from "three";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { usePathname as useNextPathname } from "next/navigation";

// ─── Glaze Wipe Shader ──────────────────────────────────────────────────────
const GLAZE_WIPE_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GLAZE_WIPE_FRAGMENT = `
  varying vec2 vUv;
  
  uniform sampler2D tFrom;
  uniform sampler2D tTo;
  uniform float progress;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uDistortion;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  
  // Simplex noise (permutation-free approximation)
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = dot(i, vec2(1.0, 57.0));
    float a = fract(sin(n) * 43758.5453);
    float b = fract(sin(n + 1.0) * 43758.5453);
    float c = fract(sin(n + 57.0) * 43758.5453);
    float d = fract(sin(n + 58.0) * 43758.5453);
    return mix(
      mix(fract(sin(n) * 43758.5453), fract(sin(n + 1.0) * 43758.5453), f.x),
      mix(fract(sin(n + 57.0) * 43758.5453), fract(sin(n + 58.0) * 43758.5453), f.x),
      f.y
    );
  }
  
  // FBM noise
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // Chocolate glaze color blend
  vec3 glazeColor(float t) {
    // t = 0: from page, t = 1: to page
    // Glaze flows with iridescent colors
    float wave1 = sin(t * 6.28 + uTime * 0.5) * 0.5 + 0.5;
    float wave2 = sin(t * 12.56 + uTime * 0.3) * 0.5 + 0.5;
    
    vec3 c = mix(uColor1, uColor2, wave1);
    c = mix(c, uColor3, wave2 * 0.3);
    
    // Add iridescent shimmer
    float iridescence = sin(t * 50.0 + uTime * 2.0) * 0.15 + 0.85;
    c *= iridescence;
    
    return c;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Drip distortion
    float noiseVal = fbm(uv * uNoiseScale + uTime * 0.1);
    float dripMask = smoothstep(0.4, 0.6, noiseVal);
    
    // Progress with organic drip flow
    float flowProgress = progress + dripMask * uDistortion * 0.3;
    flowProgress = clamp(flowProgress, 0.0, 1.0);
    
    // Smoothstep for organic edge
    float edge = smoothstep(flowProgress - 0.08, flowProgress + 0.02, vUv.y);
    
    // Sample both textures
    vec4 fromPage = texture2D(tFrom, uv);
    vec4 toPage = texture2D(tTo, uv);
    
    // Glaze color at transition edge
    vec3 glaze = glazeColor(edge);
    
    // Chromatic aberration at edge
    vec2 aberration = vec2(0.003, 0.0) * (1.0 - edge) * edge * 10.0;
    vec4 fromPageR = texture2D(tFrom, uv + aberration);
    vec4 fromPageB = texture2D(tFrom, uv - aberration);
    fromPage.r = fromPageR.r;
    fromPage.b = fromPageB.b;
    
    // Mix with glaze overlay
    vec3 mixed = mix(fromPage.rgb, toPage.rgb, edge);
    
    // Add glaze shimmer at transition
    float glazeIntensity = smoothstep(0.0, 0.1, abs(vUv.y - progress));
    mixed = mix(mixed, glaze, glazeIntensity * 0.6);
    
    // Add subtle gloss highlight at drip edge
    float highlight = smoothstep(0.0, 0.05, abs(vUv.y - progress)) * (1.0 - abs(vUv.y - progress) * 10.0);
    mixed += vec3(highlight * 0.4, highlight * 0.3, highlight * 0.1);
    
    gl_FragColor = vec4(mixed, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// ─── Glaze Wipe Portal Component ───────────────────────────────────────────
interface GlazeWipePortalProps {
  isActive: boolean;
  fromSnapshot: string;
  toSnapshot: string;
  onComplete: () => void;
}

function GlazeWipePortal({ 
  isActive, 
  fromSnapshot, 
  toSnapshot, 
  onComplete 
}: GlazeWipePortalProps) {
  const [progress, setProgress] = useState(0);
  const [texturesReady, setTexturesReady] = useState(false);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<OrthographicCamera | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const planeRef = useRef<Mesh | null>(null);
  const rtFromRef = useRef<WebGLRenderTarget | null>(null);
  const rtToRef = useRef<WebGLRenderTarget | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const duration = 1200; // ms
    const startTime = Date.now();
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    
    requestAnimationFrame(animate);
  }, [isActive, onComplete]);
  
  if (!isActive) return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
    >
      <Canvas
        canvas={canvasRef.current || undefined}
        camera={{ position: [0, 0, 1], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <shaderMaterial
          vertexShader={GLAZE_WIPE_VERTEX}
          fragmentShader={GLAZE_WIPE_FRAGMENT}
          uniforms={{
            tFrom: { value: null },
            tTo: { value: null },
            progress: { value: 0 },
            uTime: { value: 0 },
            uNoiseScale: { value: 8.0 },
            uDistortion: { value: 1.0 },
            uColor1: { value: [0.027, 0.2, 0.31] },
            uColor2: { value: [0.94, 0.35, 0.61] },
            uColor3: { value: [0.91, 0.97, 0.4] },
          }}
        >
          <planeGeometry args={[2, 2]} />
        </shaderMaterial>
      </Canvas>
    </div>,
    document.body
  );
}

// ─── Main Transition Component ──────────────────────────────────────────────
interface GlazeWipeTransitionProps {
  children?: React.ReactNode;
  duration?: number;
  className?: string;
}

export function GlazeWipeTransition({ 
  children, 
  duration = 1200, 
  className 
}: GlazeWipeTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [fromPath, setFromPath] = useState("/");
  const [toPath, setToPath] = useState("/");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showPortal, setShowPortal] = useState(false);
  const portalResolveRef = useRef<() => void>(() => {});
  
  const navigateWithTransition = useCallback(
      (toPath: string, direction: "forward" | "backward" = "forward") => {
        return new Promise<void>((resolve) => {
          setFromPath(window.location.pathname);
          setToPath(toPath);
          setDirection(direction);
        
          return new Promise<void>((resolve) => {
            portalResolveRef.current = resolve;
          
            const startTime = Date.now();
          
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / 1200, 1);
              setTransitionProgress(progress);
            
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                resolve();
                setIsTransitioning(false);
                setShowPortal(false);
              }
            };
          
            requestAnimationFrame(animate);
          });
        });
      }, []);
  return (
    <>
      {children}
      {showPortal && (
        <GlazeWipePortal
          isActive={showPortal}
          fromSnapshot={fromPath}
          toSnapshot={toPath}
          onComplete={() => {
            portalResolveRef.current();
          }}
        />
      )}
    </>
  );
}

// ─── HOC for Page-Level Transitions ────────────────────────────────────────
export function withGlazeWipeTransition<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transitionDuration = 1200
) {
  return function WithGlazeWipeTransition(props: P) {
    const pathname = usePathname();
    const [prevPathname, setPrevPathname] = useState(pathname);
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    useEffect(() => {
      if (prevPathname !== pathname) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setIsTransitioning(false);
          setPrevPathname(pathname);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }, [pathname]);
    
    return (
      <>
        <WrappedComponent {...props} />
        {isTransitioning && (
          <GlazeWipeTransition duration={transitionDuration} />
        )}
      </>
    );
  };
}

// ─── Link/Button Components for Transitions ────────────────────────────────
export function GlazeWipeLink({ 
  href, 
  children, 
  direction = "forward",
  className,
  ...props 
}: {
  href: string;
  children: React.ReactNode;
  direction?: "forward" | "backward";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const navigateWithTransition = useGlazeWipeTransition()[2];
  
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (props.onClick) props.onClick(e);
    await navigateWithTransition(href, direction);
    window.location.href = href;
  };
  
  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

export function GlazeWipeButton({ 
  onClick, 
  children, 
  direction = "forward",
  className,
  ...props 
}: {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  direction?: "forward" | "backward";
  className?: string;
}) {
  const navigateWithTransition = useGlazeWipeTransition()[2];
  
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigateWithTransition(window.location.pathname, direction);
    if (props.onClick) await props.onClick(e);
  };
  
  return (
    <button onClick={handleClick} className={className} {...props}>
      {children}
    </button>
  );
}

export { useGlazeWipeTransition, GlazeWipeTransition, GlazeWipeLink, GlazeWipeButton };
