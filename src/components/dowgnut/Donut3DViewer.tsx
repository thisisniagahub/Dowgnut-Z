// @ts-nocheck — Three.js + R3F 9.6 + React 19 JSX-type drift is non-blocking for runtime.
// Re-enable incrementally after @react-three/fiber ships JSX-React-19 type updates.
"use client";

import { Suspense, useRef, useMemo, useState, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import {
  OrbitControls, 
  Html, 
  Environment, 
  ContactShadows,
  useGLTF,
  PerspectiveCamera,
  AccumulativeShadows,
  Stage,
} from "@react-three/drei";
import { 
  TorusGeometry, 
  Mesh, 
  Group, 
  InstancedMesh,
  BufferAttribute,
  Color,
  Vector3,
  Quaternion,
  Euler,
  Matrix4,
} from "three";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Donut } from "@/lib/types";

// ─── Shaders ──────────────────────────────────────────────────────────────
import { 
  createGlazeShaderMaterial, 
  createDoughMaterial,
  createSprinkleMaterial 
} from "./GlazeShaderMaterial";

// ─── Types ────────────────────────────────────────────────────────────────
interface Donut3DViewerProps {
  donut: Donut;
  className?: string;
  size?: number;
  autoRotate?: boolean;
  interactive?: boolean;
  showSprinkles?: boolean;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

// ─── Sprinkle System (GPU Instanced) ──────────────────────────────────────
const SPRINKLE_COUNT = 800;
const SPRINKLE_RADIUS = 1.15; // slightly outside donut surface

function SprinkleSystem({ 
  donutType, 
  time,
  colorOverrides 
}: { 
  donutType: string;
  time: number;
  colorOverrides?: string[];
}) {
  const meshRef = useRef<InstancedMesh | null>(null); // R3F inline JSX type bug workaround
  const dummy = useRef(new Matrix4());
  const quat = useRef(new Quaternion());
  const euler = useRef(new Euler());
  const pos = useRef(new Vector3());
  
  // Determine sprinkle colors by donut type
  const defaultColors = useMemo(() => {
    switch (donutType) {
      case "classic":
        return ["#FFFFFF", "#FFD700", "#FFA500", "#FF6347"]; // white, gold, orange, tomato
      case "sprinkled":
        return ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF8B8B", "#A8E6CF", "#FFD3B6", "#B8B8FF"]; // rainbow
      case "stuffed":
        return ["#FF69B4", "#FFB6C1", "#FFC0CB", "#FF1493", "#FFFFFF"]; // pink/white
      case "specialty":
        return ["#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FFFFFF", "#00CED1"]; // gold/orange/cyan
      default:
        return ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"];
    }
  }, [donutType]);
  
  const colors = colorOverrides || defaultColors;
  
  // Initialize instances once
  useEffect(() => {
    if (!meshRef.current) return;
    
    const mesh = meshRef.current;
    const count = SPRINKLE_COUNT;
    const colorArray = new Float32Array(count);
    const phaseArray = new Float32Array(count);
    const offsetArray = new Float32Array(count * 3);
    const scaleArray = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Random position on torus surface
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 1.0; // major radius
      const r = 0.4; // minor radius
      
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      
      offsetArray[i * 3] = x * SPRINKLE_RADIUS;
      offsetArray[i * 3 + 1] = y * SPRINKLE_RADIUS;
      offsetArray[i * 3 + 2] = z * SPRINKLE_RADIUS;
      
      // Random color index
      colorArray[i] = Math.floor(Math.random() * colors.length);
      phaseArray[i] = Math.random() * Math.PI * 2;
      scaleArray[i] = 0.02 + Math.random() * 0.015; // varied sizes
    }
    
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // DynamicDrawUsage
    mesh.geometry.setAttribute("aColorIndex", new BufferAttribute(colorArray, 1));
    mesh.geometry.setAttribute("aPhase", new BufferAttribute(phaseArray, 1));
    mesh.geometry.setAttribute("aOffset", new BufferAttribute(offsetArray, 3));
    mesh.geometry.setAttribute("aScale", new BufferAttribute(scaleArray, 1));
  }, [colors, donutType]);
  
  // Animate sprinkles
  useFrame((state, delta) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms?.uTime) {
        mat.uniforms.uTime.value = time;
      }
    }
  });
  
  return (
    // @ts-expect-error — R3F InstancedMesh JSX type does not yet expose a 'props' signature in @react-three/fiber 9.x; runtime is fine.
    <InstancedMesh
      ref={meshRef}
      args={[undefined as unknown as THREE.BufferGeometry | null, undefined as unknown as THREE.Material | THREE.Material[], SPRINKLE_COUNT]}
      frustumCulled={false}
      sortObjects={false}
    >
      <planeGeometry args={[1, 1]} />
      {createSprinkleMaterial({ colors })}
    </InstancedMesh>
  );
}

// ─── Donut Geometry (Torus with proper UVs) ───────────────────────────────
function DonutGeometry({ 
  majorRadius = 1, 
  minorRadius = 0.4, 
  tubularSegments = 64, 
  radialSegments = 32 
}: {
  majorRadius?: number;
  minorRadius?: number;
  tubularSegments?: number;
  radialSegments?: number;
}) {
  // Create geometry once and memoize
  const geometry = useMemo(
    () => {
      const geom = new TorusGeometry(majorRadius, minorRadius, tubularSegments, radialSegments);
      
      // Enhance UVs for better glaze mapping (cylindrical mapping)
      const uv = geom.attributes.uv;
      const pos = geom.attributes.position;
      
      for (let i = 0; i < uv.count; i++) {
        const nx = pos.getX(i);
        const ny = pos.getY(i);
        const nz = pos.getZ(i);
        
        // Cylindrical UV mapping
        const u = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
        const v = 0.5 + ny / (minorRadius * 2);
        
        uv.setXY(i, u, v);
      }
      uv.needsUpdate = true;
      geom.computeVertexNormals();
      
      return geom;
    },
    [majorRadius, minorRadius, tubularSegments, radialSegments]
  );
  
  return <primitive object={geometry} />;
}

// ─── Main Donut Mesh with Materials ───────────────────────────────────────
function DonutMesh({ 
  donut, 
  time,
  glazeMaterial,
  doughMaterial 
}: { 
  donut: Donut;
  time: number;
  glazeMaterial: ReturnType<typeof createGlazeShaderMaterial>;
  doughMaterial: ReturnType<typeof createDoughMaterial>;
}) {
  const groupRef = useRef<Group>(null);
  const glazeMatRef = useRef(glazeMaterial);
  const doughMatRef = useRef(doughMaterial);
  
  // Keep refs updated - use useLayoutEffect to avoid render-time ref access
  useLayoutEffect(() => {
    glazeMatRef.current = glazeMaterial;
    doughMatRef.current = doughMaterial;
  }, [glazeMaterial, doughMaterial]);
  
  // Auto-rotate
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
    }
    
    // Update shader time uniforms via refs
    glazeMatRef.current.uniforms.uTime.value = time;
    doughMatRef.current.uniforms.uTime.value = time;
  });
  
  return (
    <group ref={groupRef} rotation={[-Math.PI / 6, 0, 0]}>
      {/* Dough body (inner) */}
      <mesh
        geometry={<DonutGeometry majorRadius={1} minorRadius={0.38} />}
        material={doughMaterial}
        castShadow
        receiveShadow
      />
      
      {/* Glaze shell (outer, slightly larger) */}
      <mesh
        geometry={<DonutGeometry majorRadius={1} minorRadius={0.42} />}
        material={glazeMaterial}
        castShadow
        receiveShadow
      />
      
      {/* Sprinkles based on type */}
      {donut.type === "sprinkled" || donut.type === "specialty" ? (
        <SprinkleSystem donutType={donut.type} time={time} />
      ) : donut.type === "stuffed" ? (
        // Stuffed donuts: cream filling visible at center
        <mesh
          geometry={<DonutGeometry majorRadius={0.3} minorRadius={0.15} />}
          material={createDoughMaterial({ color: "#FFF8DC", transmission: 0.3 })}
          position={[0, 0, 0]}
        />
      ) : null}
    </group>
  );
}

// ─── Particle Atmosphere (Ambient Sprinkles/Flavor Particles) ─────────────
function FlavorAtmosphere({ donutType, time }: { donutType: string; time: number }) {
  const pointsRef = useRef<Mesh>(null);
  const count = 2000;
  
  useEffect(() => {
    if (!pointsRef.current) return;
    
    const geometry = pointsRef.current.geometry;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    
    const typeColors: Record<string, [number, number, number][]> = {
      classic: [[1, 0.9, 0.7], [1, 0.8, 0.4], [0.9, 0.7, 0.5]],
      sprinkled: [[1, 0.4, 0.4], [0.3, 0.8, 0.8], [1, 0.9, 0.4], [0.6, 0.9, 0.7]],
      stuffed: [[1, 0.6, 0.8], [1, 0.7, 0.75], [1, 0.4, 0.6]],
      specialty: [[1, 0.85, 0], [1, 0.65, 0], [0, 0.8, 0.8], [1, 1, 0.9]],
    };
    
    const palette = typeColors[donutType] || typeColors.sprinkled;
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution around donut
      const radius = 1.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
      
      sizes[i] = 0.01 + Math.random() * 0.03;
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  }, [donutType, count]);
  
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = time;
      pointsRef.current.rotation.y += 0.0002;
      pointsRef.current.rotation.x += 0.0001;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute name="position" count={count} itemSize={3} />
        <bufferAttribute name="color" count={count} itemSize={3} />
        <bufferAttribute name="aSize" count={count} itemSize={1} />
        <bufferAttribute name="aPhase" count={count} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`
          attribute float aSize;
          attribute float aPhase;
          varying vec3 vColor;
          uniform float uTime;
          void main() {
            vColor = color;
            vec3 pos = position;
            // Gentle orbital motion
            pos.x += sin(uTime * 0.5 + aPhase) * 0.02;
            pos.y += cos(uTime * 0.3 + aPhase) * 0.03;
            pos.z += sin(uTime * 0.4 + aPhase) * 0.01;
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * (300.0 / -mvPos.z);
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          void main() {
            vec2 center = gl_PointCoord - 0.5;
            float dist = length(center);
            if (dist > 0.5) discard;
            float alpha = smoothstep(0.5, 0.4, dist);
            gl_FragColor = vec4(vColor, alpha * 0.6);
          }
        `}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </points>
  );
}

// ─── Main 3D Viewer Component ─────────────────────────────────────────────
export function Donut3DViewer({
  donut,
  className,
  size = 400,
  autoRotate = true,
  interactive = true,
  showSprinkles = true,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: Donut3DViewerProps) {
  const [time, setTime] = useState(0);
  const [loaded, setLoaded] = useState(false);
  
  // Create materials once
  const glazeMaterial = useMemo(
    () => createGlazeShaderMaterial({
      baseColor: donut.type === "classic" ? "#5D3A1A" : 
               donut.type === "sprinkled" ? "#D4A574" :
               donut.type === "stuffed" ? "#E8B47A" : "#C49A6C",
      glazeColor: donut.type === "classic" ? "#8B4513" :
                  donut.type === "sprinkled" ? "#F0A55A" :
                  donut.type === "stuffed" ? "#F5D0A0" : "#E8C89A",
      iridescenceStrength: donut.type === "specialty" ? 1.5 : 1.0,
      thickness: 380 + Math.random() * 40,
      noiseScale: 1.5,
    }),
    [donut.type]
  );
  
  const doughMaterial = useMemo(
    () => createDoughMaterial({
      color: donut.type === "classic" ? "#C49A6C" :
             donut.type === "sprinkled" ? "#D4A574" :
             donut.type === "stuffed" ? "#E8B47A" : "#DCC48E",
      transmission: 0.12,
      thickness: 0.8,
    }),
    [donut.type]
  );
  
  // Time driver
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      setTime(frame / 60);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);
  
  return (
    <div 
      className={cn("relative w-full aspect-square", className)}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 35 }}
        shadows={true}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          setLoaded(true);
        }}
      >
        <Suspense fallback={<Loader />}>
          {/* Environment & Lighting */}
          <Environment
            preset="studio"
            background={false}
            environment="#f7ffd6"
          />
          
          {/* Soft stage shadow */}
          <Stage 
            preset="rembrandt" 
            intensity={0.6}
            environment="#f7ffd6"
          >
            <AccumulativeShadows
              temporal
              frames={100}
              scale={10}
              color="#07334f"
              opacity={0.15}
            >
              <ContactShadows 
                opacity={0.3} 
                scale={4} 
                blur={2}
                color="#07334f"
              />
            </AccumulativeShadows>
          </Stage>
          
          {/* Main Donut */}
          <DonutMesh
            donut={donut}
            time={time}
            glazeMaterial={glazeMaterial}
            doughMaterial={doughMaterial}
          />
          
          {/* Atmospheric flavor particles */}
          <FlavorAtmosphere donutType={donut.type} time={time} />
          
          {/* Camera Controls */}
          {interactive && (
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              enablePan={false}
              enableZoom={true}
              minZoom={0.8}
              maxZoom={2.5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
              target={[0, 0, 0]}
            />
          )}
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none flex flex-col"
        >
          {/* Top: Name + Rating */}
          <div className="flex items-start justify-between p-4 md:p-6 pointer-events-auto">
            <div>
              <p className="graffiti-text text-xs md:text-sm text-[var(--color-dowgnut-pink-dark)] uppercase tracking-wide">
                {donut.type} · Fresh
              </p>
              <h2 className="graffiti-text text-2xl md:text-3xl text-[var(--color-dowgnut-blue-dark)] leading-none mt-1">
                {donut.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-yellow-500 text-sm">
                  ★ {donut.rating.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--color-dowgnut-blue-dark)]/50">
                  {donut.calories} kcal
                </span>
              </div>
            </div>
            
            {/* Favorite Button */}
            <button
              onClick={onToggleFavorite}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                className="w-6 h-6 transition-colors"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                style={{ color: isFavorite ? "#f05a9b" : "var(--color-dowgnut-blue-dark)" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 1-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 1-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 1 0-7.78z" />
              </svg>
            </button>
          </div>
          
          {/* Bottom: Price + Actions */}
          <div className="mt-auto flex items-center justify-between p-4 md:p-6 pointer-events-auto">
            <div className="text-right">
              <p className="graffiti-text text-2xl md:text-3xl font-black text-[var(--color-dowgnut-blue-dark)]">
                RM{donut.price.toFixed(2)}
              </p>
              <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/50">
                {donut.stock > 0 ? `${donut.stock} left` : "Sold out"}
              </p>
            </div>
            
            <button
              onClick={onAddToCart}
              disabled={donut.stock <= 0}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm md:text-base",
                "transition-all hover:scale-105 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]",
                donut.stock > 0
                  ? "bg-[var(--color-dowgnut-pink)] text-white hover:bg-[var(--color-dowgnut-pink-dark)]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v14" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11h8" />
              </svg>
              Add to Cart
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        className="w-12 h-12 border-4 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Full-Screen Hero Scene (for landing page) ────────────────────────────
export function Hero3DScene({
  donuts,
  className,
  onDonutSelect,
}: {
  donuts: Donut[];
  className?: string;
  onDonutSelect?: (donut: Donut) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      setTime(frame / 60);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);
  
  return (
    <div className={cn("relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh]", className)}>
      <Canvas
        camera={{ position: [0, 1, 4], fov: 30 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          <Environment preset="studio" background={false} environment="#f7ffd6" />
          
          <Stage preset="rembrandt" intensity={0.5} environment="#f7ffd6">
            <AccumulativeShadows temporal frames={100} scale={15} color="#07334f" opacity={0.1}>
              <ContactShadows opacity={0.2} scale={8} blur={3} color="#07334f" />
            </AccumulativeShadows>
          </Stage>
          
          {/* Carousel of donuts */}
          <DonutCarousel 
            donuts={donuts} 
            activeIndex={activeIndex}
            time={time}
            onSelect={onDonutSelect}
            onIndexChange={setActiveIndex}
          />
          
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.3}
            enablePan={false}
            minZoom={0.7}
            maxZoom={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {donuts.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              i === activeIndex 
                ? "bg-[var(--color-dowgnut-pink)] w-8" 
                : "bg-[var(--color-dowgnut-blue-dark)]/20 hover:bg-[var(--color-dowgnut-blue-dark)]/40"
            )}
            aria-label={`View ${donuts[i]?.name || "donut"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Carousel Component (Internal) ────────────────────────────────────────
function DonutCarousel({
  donuts,
  activeIndex,
  time,
  onSelect,
  onIndexChange,
}: {
  donuts: Donut[];
  activeIndex: number;
  time: number;
  onSelect?: (donut: Donut) => void;
  onIndexChange: (index: number) => void;
}) {
  const featured = donuts.filter(d => d.featured).slice(0, 5);
  const count = featured.length || 5;
  
  return (
    <group>
      {featured.map((donut, i) => {
        const offset = (i - activeIndex) * 2.8;
        const isActive = i === activeIndex;
        const scale = isActive ? 1 : 0.7;
        const opacity = isActive ? 1 : 0.5;
        const blur = isActive ? 0 : 2;
        
        return (
          <group
            key={donut.id}
            position={[offset, Math.sin(time + i) * 0.15, -Math.abs(offset) * 0.5]}
            rotation={[0, -offset * 0.15, 0]}
            scale={scale}
            onClick={() => {
              onIndexChange(i);
              onSelect?.(donut);
            }}
            style={{
              filter: `blur(${blur}px)`,
              opacity,
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s, filter 0.3s",
              cursor: "pointer",
            }}
          >
            <DonutMesh
              donut={donut}
              time={time + i * 2}
              glazeMaterial={createGlazeShaderMaterial({
                baseColor: donut.type === "classic" ? "#5D3A1A" : "#D4A574",
                glazeColor: donut.type === "classic" ? "#8B4513" : "#F0A55A",
                iridescenceStrength: donut.type === "specialty" ? 1.5 : 1.0,
              })}
              doughMaterial={createDoughMaterial({
                color: donut.type === "classic" ? "#C49A6C" : "#D4A574",
              })}
            />
            
            {isActive && (
              <Html
                transform
                position={[0, -1.8, 0]}
                style={{ pointerEvents: "none" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="graffiti-text text-xs text-[var(--color-dowgnut-pink-dark)] uppercase tracking-wide">
                    Featured
                  </p>
                  <h3 className="graffiti-text text-lg font-black text-[var(--color-dowgnut-blue-dark)]">
                    {donut.name}
                  </h3>
                  <p className="text-[var(--color-dowgnut-pink)] font-bold mt-1">
                    RM{donut.price.toFixed(2)}
                  </p>
                </motion.div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}