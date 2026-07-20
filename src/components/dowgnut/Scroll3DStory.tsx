// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.
"use client";

// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Group, 
  Mesh, 
  TorusGeometry, 
  MeshStandardMaterial, 
  SphereGeometry,
  BoxGeometry,
  Vector3,
  Color,
  InstancedMesh,
  InstancedBufferGeometry,
  BufferAttribute,
  InstancedBufferAttribute,
  BufferGeometry,
  Points,
  PointsMaterial,
  AdditiveBlending,
} from "three";
import { motion, useScroll, useTransform } from "framer-motion";
import { createGlazeShaderMaterial, createDoughMaterial } from "./GlazeShaderMaterial";
import { cn } from "@/lib/utils";

const SCENES = [
  { id: "mix", name: "Mixing", progress: [0, 0.16] },
  { id: "proof", name: "Proofing", progress: [0.16, 0.33] },
  { id: "fry", name: "Frying", progress: [0.33, 0.5] },
  { id: "glaze", name: "Glazing", progress: [0.5, 0.66] },
  { id: "sprinkle", name: "Sprinkling", progress: [0.66, 0.83] },
  { id: "box", name: "Boxing", progress: [0.83, 1] },
];

interface Scroll3DStoryProps {
  className?: string;
  height?: number;
}

function MixingScene({ progress }: { progress: number }) {
  const groupRef = useRef<Group>(null);
  const particlesRef = useRef<Points>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005 * (1 - progress);
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <Group ref={groupRef}>
      {/* Mixing bowl */}
      <Mesh
        position={[0, -0.5, 0]}
        scale={[1.5, 1.5, 1.5]}
        receiveShadow
        castShadow
      >
        <SphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <MeshStandardMaterial 
          color="#8B7355" 
          roughness={0.7} 
          metalness={0.1}
          side={2}
        />
      </Mesh>
      
      {/* Dough forming particles */}
      <Points ref={particlesRef}>
        <InstancedBufferGeometry>
          <bufferAttribute name="position" itemSize={3} array={new Float32Array(200 * 3)} />
          <instancedBufferAttribute name="aOffset" itemSize={3} array={new Float32Array(200 * 3)} />
          <instancedBufferAttribute name="aPhase" itemSize={1} array={new Float32Array(200)} />
        </InstancedBufferGeometry>
        <PointsMaterial 
          color="#D4A574" 
          size={0.05} 
          sizeAttenuation 
          transparent
          opacity={progress * 0.8}
          blending={AdditiveBlending}
        />
      </Points>
      
      {/* Early dough blob */}
      <Mesh
        position={[0, 0.3 + Math.sin(progress * Math.PI * 4) * 0.3, 0]}
        scale={progress * 0.8}
        castShadow
      >
        <TorusGeometry args={[0.4, 0.15, 16, 32]} />
        <MeshStandardMaterial color="#D4A574" roughness={0.6} />
      </Mesh>
    </Group>
  );
}

function ProofingScene({ progress }: { progress: number }) {
  const doughRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (doughRef.current) {
      // Breathing animation - dough rises
      const scale = 1 + Math.sin(performance.now() * 0.001) * 0.05 * progress;
      doughRef.current.scale.setScalar(scale);
      doughRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Group>
      {/* Proofing container */}
      <Mesh
        position={[0, -0.2, 0]}
        receiveShadow
        castShadow
      >
        <BoxGeometry args={[2.5, 2, 2.5]} />
        <MeshStandardMaterial 
          color="#FFF8E7" 
          roughness={0.9} 
          metalness={0}
          transparent
          opacity={0.3}
          side={2}
        />
      </Mesh>
      
      {/* Rising dough */}
      <Mesh
        ref={doughRef}
        position={[0, progress * 1.5, 0]}
        scale={0.5 + progress}
        castShadow
      >
        <TorusGeometry args={[0.6, 0.25, 24, 48]} />
        <MeshStandardMaterial 
          color="#D4A574" 
          roughness={0.5}
        />
      </Mesh>
      
      {/* Steam particles */}
      <SteamParticles intensity={progress} />
    </Group>
  );
}

function FryingScene({ progress }: { progress: number }) {
  const oilRef = useRef<Mesh>(null);
  const donutRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (oilRef.current) {
      // Oil shimmer
      oilRef.current.material.opacity = 0.4 + Math.sin(performance.now() * 0.01) * 0.1;
    }
    if (donutRef.current) {
      donutRef.current.rotation.x += 0.01;
      donutRef.current.rotation.y += 0.005;
      // Float in oil
      donutRef.current.position.y = -0.2 + Math.sin(performance.now() * 0.003) * 0.1;
    }
  });

  return (
    <Group>
      {/* Frying pan / oil vat */}
      <Mesh
        ref={oilRef}
        position={[0, -0.8, 0]}
        receiveShadow
        castShadow
      >
        <BoxGeometry args={[3, 0.5, 3]} />
        <MeshStandardMaterial 
          color="#C9A84C" 
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.4 + progress * 0.3}
        />
      </Mesh>
      
      {/* Donut frying */}
      <Mesh
        ref={donutRef}
        position={[0, -0.3, 0]}
        scale={progress}
        castShadow
      >
        <TorusGeometry args={[0.7, 0.28, 32, 64]} />
        <MeshStandardMaterial 
          color={progress > 0.5 ? "#CD853F" : "#D4A574"} 
          roughness={0.4}
        />
      </Mesh>
      
      {/* Oil bubbles */}
      <Bubbles count={30} intensity={progress} yOffset={-0.5} />
      
      {/* Color shift indicator */}
      <Mesh
        position={[0, 1.5, 0]}
        scale={0.3 * progress}
        material={new MeshStandardMaterial({ 
          color: "#FFD700", 
          emissive: "#FFD700",
          emissiveIntensity: progress,
          transparent: true,
          opacity: progress
        })}
      >
        <SphereGeometry args={[0.5, 16, 16]} />
      </Mesh>
    </Group>
  );
}

function GlazingScene({ progress }: { progress: number }) {
  const donutRef = useRef<Mesh>(null);
  const glazeRef = useRef<Mesh>(null);
  const dripsRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (donutRef.current) {
      donutRef.current.rotation.x += 0.005;
      donutRef.current.rotation.y += 0.003;
    }
    if (glazeRef.current) {
      glazeRef.current.rotation.x += 0.005;
      glazeRef.current.rotation.y += 0.003;
      // Glaze pours down
      if (progress > 0.3) {
        glazeRef.current.scale.y = Math.min(1, (progress - 0.3) / 0.4);
      }
    }
    if (dripsRef.current) {
      dripsRef.current.children.forEach((drip, i) => {
        if (drip instanceof Mesh) {
          drip.position.y = 1 - (state.clock.getElapsedTime() * 2 + i * 0.3) % 2.5;
          drip.scale.y = 0.5 + Math.sin(state.clock.getElapsedTime() * 5 + i) * 0.2;
        }
      });
    }
  });

  return (
    <Group>
      {/* Donut rotating */}
      <Mesh
        ref={donutRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <TorusGeometry args={[0.8, 0.3, 32, 64]} />
        <MeshStandardMaterial 
          color="#CD853F" 
          roughness={0.3}
        />
      </Mesh>
      
      {/* Glaze pouring */}
      <Mesh
        ref={glazeRef}
        position={[0, 0, 0]}
        scale={[1, 0, 1]}
        castShadow
      >
        <TorusGeometry args={[0.85, 0.35, 32, 64]} />
        {createGlazeShaderMaterial({
          baseColor: "#8B4513",
          glazeColor: "#D2691E",
          iridescenceStrength: 1.5,
          thickness: 420,
        })}
      </Mesh>
      
      {/* Glaze drips */}
      <Group ref={dripsRef} position={[0, 0.5, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Mesh
            key={i}
            position={[
              Math.sin(i * 0.78) * 0.9,
              1,
              Math.cos(i * 0.78) * 0.9
            ]}
            scale={[0.05, 0.5, 0.05]}
          >
            <BoxGeometry args={[1, 1, 1]} />
            {createGlazeShaderMaterial({ 
              baseColor: "#8B4513", 
              glazeColor: "#D2691E",
              iridescenceStrength: 2.0,
            })}
          </Mesh>
        ))}
      </Group>
      
      {/* Glaze pool forming */}
      <Mesh
        position={[0, -1.2, 0]}
        scale={[2 * progress, 0.1, 2 * progress]}
        receiveShadow
      >
        <BoxGeometry args={[1, 1, 1]} />
        {createGlazeShaderMaterial({ 
          baseColor: "#8B4513", 
          glazeColor: "#D2691E",
          iridescenceStrength: 1.8,
        })}
      </Mesh>
    </Group>
  );
}

function SprinklingScene({ progress }: { progress: number }) {
  const sprinklesRef = useRef<Points>(null);
  
  useFrame(() => {
    if (sprinklesRef.current) {
      sprinklesRef.current.rotation.y += 0.002;
      sprinklesRef.current.rotation.x += 0.001;
    }
  });

  return (
    <Group>
      {/* Base donut with glaze */}
      <Mesh
        position={[0, 0, 0]}
        castShadow
      >
        <TorusGeometry args={[0.8, 0.35, 32, 64]} />
        {createGlazeShaderMaterial({ 
          baseColor: "#8B4513", 
          glazeColor: "#D2691E",
          iridescenceStrength: 1.5,
          thickness: 420,
        })}
      </Mesh>
      
      {/* Sprinkles explosion */}
      <Points ref={sprinklesRef}>
        <InstancedBufferGeometry>
          <bufferAttribute name="position" itemSize={3} array={new Float32Array(300 * 3)} />
          <instancedBufferAttribute name="aOffset" itemSize={3} array={new Float32Array(300 * 3)} />
          <instancedBufferAttribute name="aColor" itemSize={3} array={new Float32Array(300 * 3)} />
          <instancedBufferAttribute name="aPhase" itemSize={1} array={new Float32Array(300)} />
          <instancedBufferAttribute name="aSize" itemSize={1} array={new Float32Array(300)} />
        </InstancedBufferGeometry>
        <PointsMaterial 
          size={0.04} 
          sizeAttenuation 
          vertexColors
          transparent
          opacity={progress}
          blending={AdditiveBlending}
        />
      </Points>
      
      {/* Rainbow burst particles */}
      <BurstParticles intensity={progress} colors={["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FFD3B6"]} />
    </Group>
  );
}

function BoxingScene({ progress }: { progress: number }) {
  const boxRef = useRef<Group>(null);
  const donutRef = useRef<Mesh>(null);
  
  useFrame(() => {
    if (boxRef.current && progress > 0.5) {
      // Box assembles
      const t = Math.min(1, (progress - 0.5) * 2);
      boxRef.current.children.forEach((child, i) => {
        if (child instanceof Mesh) {
          child.scale.setScalar(t);
          child.position.lerp(child.userData.targetPos || new Vector3(), 0.1);
        }
      });
    }
    if (donutRef.current && progress > 0.7) {
      // Donut goes into box
      donutRef.current.position.y = 0.5 - (progress - 0.7) * 5;
      donutRef.current.scale.setScalar(1 - (progress - 0.7) * 2);
    }
  });

  return (
    <Group>
      {/* Donut (before boxing) */}
      <Mesh
        ref={donutRef}
        position={[0, 0.5, 0]}
        scale={progress < 0.7 ? 1 : 0}
        castShadow
      >
        <TorusGeometry args={[0.7, 0.3, 32, 64]} />
        {createGlazeShaderMaterial({ 
          baseColor: "#8B4513", 
          glazeColor: "#D2691E",
          iridescenceStrength: 1.5,
        })}
      </Mesh>
      
      {/* Box assembling */}
      <Group ref={boxRef} position={[0, -0.2, 0]}>
        <Mesh
          position={[0, 0.6, 0]}
          userData={{ targetPos: new Vector3(0, 0.6, 0) }}
          scale={0}
          castShadow
          receiveShadow
        >
          <BoxGeometry args={[2.2, 1.2, 2.2]} />
          <MeshStandardMaterial color="#F5E6D3" roughness={0.9} />
        </Mesh>
        <Mesh
          position={[0, 1.2, 0]}
          userData={{ targetPos: new Vector3(0, 1.2, 0) }}
          scale={0}
          castShadow
        >
          <BoxGeometry args={[2.4, 0.4, 2.4]} />
          <MeshStandardMaterial color="#E8D4B8" roughness={0.8} />
        </Mesh>
      </Group>
      
      {/* Final sealed box with logo */}
      <Mesh
        position={[0, 0.4, 0]}
        scale={progress > 0.9 ? progress : 0}
        castShadow
      >
        <BoxGeometry args={[2.4, 1.6, 2.4]} />
        <MeshStandardMaterial color="#F5E6D3" roughness={0.9} />
      </Mesh>
      
      {/* DowgNut logo on box */}
      <Mesh
        position={[0, 1.3, 1.25]}
        scale={progress > 0.9 ? progress : 0}
      >
        <BoxGeometry args={[1.5, 0.8, 0.05]} />
        <MeshStandardMaterial 
          color="#07579B" 
          emissive="#07579B"
          emissiveIntensity={0.2}
        />
      </Mesh>
    </Group>
  );
}

// Helper components
function SteamParticles({ intensity }: { intensity: number }) {
  return (
    <Points>
      <InstancedBufferGeometry>
        <bufferAttribute name="position" itemSize={3} array={new Float32Array(50 * 3)} />
        <instancedBufferAttribute name="aOffset" itemSize={3} array={new Float32Array(50 * 3)} />
        <instancedBufferAttribute name="aPhase" itemSize={1} array={new Float32Array(50)} />
        <instancedBufferAttribute name="aSpeed" itemSize={1} array={new Float32Array(50)} />
      </InstancedBufferGeometry>
      <PointsMaterial 
        color="#FFF9E8" 
        size={0.08} 
        sizeAttenuation 
        transparent
        opacity={0.3 * intensity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}

function Bubbles({ count, intensity, yOffset }: { count: number; intensity: number; yOffset: number }) {
  return (
    <Points>
      <InstancedBufferGeometry>
        <bufferAttribute name="position" itemSize={3} array={new Float32Array(count * 3)} />
        <instancedBufferAttribute name="aOffset" itemSize={3} array={new Float32Array(count * 3)} />
        <instancedBufferAttribute name="aPhase" itemSize={1} array={new Float32Array(count)} />
        <instancedBufferAttribute name="aSize" itemSize={1} array={new Float32Array(count)} />
      </InstancedBufferGeometry>
      <PointsMaterial 
        color="#FFD700" 
        size={0.05} 
        sizeAttenuation 
        transparent
        opacity={0.6 * intensity}
        blending={AdditiveBlending}
      />
    </Points>
  );
}

function BurstParticles({ intensity, colors }: { intensity: number; colors: string[] }) {
  return (
    <Points>
      <InstancedBufferGeometry>
        <bufferAttribute name="position" itemSize={3} array={new Float32Array(200 * 3)} />
        <instancedBufferAttribute name="aOffset" itemSize={3} array={new Float32Array(200 * 3)} />
        <instancedBufferAttribute name="aColor" itemSize={3} array={new Float32Array(200 * 3)} />
        <instancedBufferAttribute name="aPhase" itemSize={1} array={new Float32Array(200)} />
        <instancedBufferAttribute name="aSize" itemSize={1} array={new Float32Array(200)} />
      </InstancedBufferGeometry>
      <PointsMaterial 
        size={0.06} 
        sizeAttenuation 
        vertexColors
        transparent
        opacity={intensity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </Points>
  );
}

function SceneIndicator({ scene, isActive, onClick }: { scene: typeof SCENES[0]; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-4 py-2 rounded-full text-sm font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)]",
        isActive
          ? "bg-[var(--color-dowgnut-pink)] text-white shadow-[0_0_20px_var(--color-dowgnut-pink)]"
          : "bg-white/50 text-[var(--color-dowgnut-blue-dark)]/60 hover:bg-white/70"
      )}
      style={{ 
        border: isActive ? "2px solid var(--color-dowgnut-pink)" : "1px solid transparent" 
      }}
    >
      <span className="flex items-center gap-1">
        {scene.name}
        {isActive && <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity }}>⟳</motion.span>}
      </span>
    </motion.button>
  );
}

function ProgressDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      {SCENES.map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            i === activeIndex 
              ? "bg-[var(--color-dowgnut-pink)] w-6" 
              : "bg-[var(--color-dowgnut-blue-dark)]/20"
          )}
          animate={{ 
            scale: i === activeIndex ? 1.2 : 1,
            backgroundColor: i === activeIndex ? "var(--color-dowgnut-pink)" : "var(--color-dowgnut-blue-dark)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
}

export function Scroll3DStory({ className, height = 600 }: Scroll3DStoryProps) {
  const { scrollY } = useScroll();
  const [activeScene, setActiveScene] = useState(0);
  
  // Track scroll progress per scene - use individual hooks at top level
  const progress0 = useTransform(scrollY, [SCENES[0].progress[0] * height, SCENES[0].progress[1] * height], [0, 1]);
  const progress1 = useTransform(scrollY, [SCENES[1].progress[0] * height, SCENES[1].progress[1] * height], [0, 1]);
  const progress2 = useTransform(scrollY, [SCENES[2].progress[0] * height, SCENES[2].progress[1] * height], [0, 1]);
  const progress3 = useTransform(scrollY, [SCENES[3].progress[0] * height, SCENES[3].progress[1] * height], [0, 1]);
  const progress4 = useTransform(scrollY, [SCENES[4].progress[0] * height, SCENES[4].progress[1] * height], [0, 1]);
  const progress5 = useTransform(scrollY, [SCENES[5].progress[0] * height, SCENES[5].progress[1] * height], [0, 1]);
  
  const sceneProgress = [progress0, progress1, progress2, progress3, progress4, progress5];

  // Determine active scene
  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const newScene = SCENES.findIndex(s => progress >= s.progress[0] && progress < s.progress[1]);
      if (newScene !== -1 && newScene !== activeScene) {
        setActiveScene(newScene);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeScene]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Sticky 3D Canvas */}
      <div className="sticky top-0 h-[600px] w-full relative">
        <Canvas
          camera={{ position: [0, 1, 4], fov: 35 }}
          shadows
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={<LoadingFallback />}>
            {/* Scene 1: Mixing */}
            <ScrollScene progress={sceneProgress[0]} progressRange={SCENES[0].progress}>
              <MixingScene progress={sceneProgress[0].get()} />
            </ScrollScene>
            
            {/* Scene 2: Proofing */}
            <ScrollScene progress={sceneProgress[1]} progressRange={SCENES[1].progress}>
              <ProofingScene progress={sceneProgress[1].get()} />
            </ScrollScene>
            
            {/* Scene 3: Frying */}
            <ScrollScene progress={sceneProgress[2]} progressRange={SCENES[2].progress}>
              <FryingScene progress={sceneProgress[2].get()} />
            </ScrollScene>
            
            {/* Scene 4: Glazing */}
            <ScrollScene progress={sceneProgress[3]} progressRange={SCENES[3].progress}>
              <GlazingScene progress={sceneProgress[3].get()} />
            </ScrollScene>
            
            {/* Scene 5: Sprinkling */}
            <ScrollScene progress={sceneProgress[4]} progressRange={SCENES[4].progress}>
              <SprinklingScene progress={sceneProgress[4].get()} />
            </ScrollScene>
            
            {/* Scene 6: Boxing */}
            <ScrollScene progress={sceneProgress[5]} progressRange={SCENES[5].progress}>
              <BoxingScene progress={sceneProgress[5].get()} />
            </ScrollScene>
            
            {/* Lighting */}
            <ambientLight intensity={0.5} color="#FFF9E8" />
            <directionalLight 
              position={[3, 5, 3]} 
              intensity={1.5} 
              color="#FFF9E8"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight position={[-2, 3, -2]} intensity={0.5} color="#F0A55A" />
            
            <OrbitControls 
              enablePan={false} 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={0.5}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scene Navigation & Progress */}
      <div className="sticky top-0 z-10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Scene name */}
          <motion.div
            key={activeScene}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-4"
          >
            <p className="graffiti-text text-lg md:text-xl text-[var(--color-dowgnut-pink-dark)] uppercase tracking-wide">
              {SCENES[activeScene].name}
            </p>
            <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/50 mt-1">
              Scroll to discover how your dowg is made
            </p>
          </motion.div>

          {/* Scene pills navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {SCENES.map((scene, i) => (
              <SceneIndicator 
                key={scene.id}
                scene={scene}
                isActive={i === activeScene}
                onClick={() => window.scrollTo({ 
                  top: scene.progress[0] * height, 
                  behavior: "smooth" 
                })}
              />
            ))}
          </div>

          {/* Progress dots */}
          <ProgressDots activeIndex={activeScene} />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none"
      >
        <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/40 uppercase tracking-wider">
          Scroll to continue
        </p>
        <svg className="w-6 h-6 mx-auto mt-1 text-[var(--color-dowgnut-pink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </div>
  );
}

function ScrollScene({ 
  children, 
  progress, 
  progressRange 
}: { 
  children: React.ReactNode; 
  progress: ReturnType<typeof useTransform>;
  progressRange: [number, number];
}) {
  const opacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);

  return (
    <group>
      <motion.group
        style={{ opacity, scale }}
        initial={false}
        animate={{}}
      >
        {children}
      </motion.group>
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-12 h-12 border-4 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Add OrbitControls import
import { OrbitControls } from "@react-three/drei";
