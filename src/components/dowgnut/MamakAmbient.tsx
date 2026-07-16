"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { 
  Points, 
  BufferGeometry, 
  BufferAttribute, 
  PointsMaterial, 
  AdditiveBlending,
  ShaderMaterial,
  Group,
} from "three";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEAM_PARTICLE_COUNT = 500;

interface SteamParticlesProps {
  intensity?: number;
  color?: string;
  speed?: number;
  className?: string;
}

function SteamParticles({ intensity = 1, color = "#FFF9E8", speed = 1, className }: SteamParticlesProps) {
  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    const geometry = new BufferGeometry();
    const count = STEAM_PARTICLE_COUNT;
    
    const positions = new Float32Array(STEAM_PARTICLE_COUNT * 3);
    const velocities = new Float32Array(STEAM_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(STEAM_PARTICLE_COUNT);
    const lifetimes = new Float32Array(STEAM_PARTICLE_COUNT);
    const ages = new Float32Array(STEAM_PARTICLE_COUNT);
    const opacities = new Float32Array(STEAM_PARTICLE_COUNT);
    
    for (let i = 0; i < STEAM_PARTICLE_COUNT; i++) {
      resetParticle(i);
    }
    
    function resetParticle(i: number) {
      const spread = 0.5;
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = -1 + Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.01 + Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      
      sizes[i] = 0.05 + Math.random() * 0.1;
      lifetimes[i] = 2 + Math.random() * 3;
      ages[i] = Math.random() * lifetimes[i];
      opacities[i] = 0.3 + Math.random() * 0.4;
    }
    
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aVelocity', new BufferAttribute(velocities, 3));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aLifetime', new BufferAttribute(lifetimes, 1));
    geometry.setAttribute('aAge', new BufferAttribute(ages, 1));
    geometry.setAttribute('aOpacity', new BufferAttribute(opacities, 1));
    
    if (pointsRef.current) {
      pointsRef.current.geometry.dispose();
      pointsRef.current.geometry = geometry;
    }
    
    const colorObj = new (await import("three")).Color(color);
    const material = new ShaderMaterial({
      uniforms: {
        uColor: { value: new (await import("three")).Color(color) },
        uTime: { value: 0 },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        attribute vec3 aVelocity;
        attribute float aSize;
        attribute float aLifetime;
        attribute float aAge;
        attribute float aOpacity;
        
        varying float vOpacity;
        varying float vSize;
        varying float vAgeRatio;
        
        uniform float uTime;
        uniform float uIntensity;
        
        void main() {
          float age = mod(aAge + uTime * 0.5, aLifetime);
          float ageRatio = age / aLifetime;
          
          vec3 pos = position + aVelocity * uTime * 60.0 * 0.5;
          
          // Reset when lifetime exceeded
          if (ageRatio >= 1.0) {
            // This is handled in JS via aAge update, but we fade here too
          }
          
          vAgeRatio = ageRatio;
          vOpacity = aOpacity * (1.0 - ageRatio) * (1.0 - ageRatio);
          vSize = aSize * (1.0 + ageRatio * 2.0);
          
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = vSize * (300.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying float vSize;
        varying float vAgeRatio;
        
        uniform vec3 uColor;
        uniform float uIntensity;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.3, dist) * vOpacity * uIntensity;
          vec3 color = uColor * (1.0 + vAgeRatio * 0.5);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    
    if (pointsRef.current) {
      pointsRef.current.material.dispose();
      pointsRef.current.material = material;
    }
  }, [intensity, color]);
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Update particle ages in JS for reset logic
    if (pointsRef.current) {
      const ages = pointsRef.current.geometry.attributes.aAge.array as Float32Array;
      const lifetimes = pointsRef.current.geometry.attributes.aLifetime.array as Float32Array;
      
      for (let i = 0; i < ages.length; i++) {
        ages[i] += delta * 0.5;
        if (ages[i] >= lifetimes[i]) {
          ages[i] = 0;
          // Reset position will happen in shader, but we could also reset here
        }
      }
      pointsRef.current.geometry.attributes.aAge.needsUpdate = true;
    }
  });
  
  return (
    <group ref={groupRef} className={className}>
      <Points
        ref={pointsRef}
        frustumCulled={false}
        sortParticles={true}
      >
        <bufferGeometry>
          <bufferAttribute name="position" count={STEAM_PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute name="aVelocity" count={STEAM_PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute name="aSize" count={STEAM_PARTICLE_COUNT} itemSize={1} />
          <bufferAttribute name="aLifetime" count={STEAM_PARTICLE_COUNT} itemSize={1} />
          <bufferAttribute name="aAge" count={STEAM_PARTICLE_COUNT} itemSize={1} />
          <bufferAttribute name="aOpacity" count={STEAM_PARTICLE_COUNT} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={`
            attribute vec3 aVelocity;
            attribute float aSize;
            attribute float aLifetime;
            attribute float aAge;
            attribute float aOpacity;
            
            varying float vOpacity;
            varying float vSize;
            varying float vAgeRatio;
            
            uniform float uTime;
            uniform float uIntensity;
            
            void main() {
              float age = mod(aAge + uTime * 0.5, aLifetime);
              float ageRatio = age / aLifetime;
              
              vec3 pos = position + aVelocity * uTime * 60.0 * 0.5;
              
              vAgeRatio = ageRatio;
              vOpacity = aOpacity * (1.0 - ageRatio) * (1.0 - ageRatio);
              vSize = aSize * (1.0 + ageRatio * 2.0);
              
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = aSize * (300.0 / -mvPos.z);
              gl_Position = projectionMatrix * mvPos;
            }
          `}
          fragmentShader={`
            varying float vOpacity;
            varying float vSize;
            varying float vAgeRatio;
            
            uniform vec3 uColor;
            uniform float uIntensity;
            
            void main() {
              vec2 center = gl_PointCoord - 0.5;
              float dist = length(center);
              if (dist > 0.5) discard;
              
              float alpha = smoothstep(0.5, 0.3, dist) * vOpacity * uIntensity;
              vec3 color = uColor * (1.0 + vAgeRatio * 0.5);
              
              gl_FragColor = vec4(color, alpha);
            }
          `}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </Points>
    </group>
  );
}

interface MamakAmbientProps {
  isActive?: boolean;
  onPourStart?: () => void;
  onPourEnd?: () => void;
  className?: string;
}

export function MamakAmbient({ 
  isActive = false, 
  onPourStart, 
  onPourEnd,
  className 
}: MamakAmbientProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [steamIntensity, setSteamIntensity] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pourTimeoutRef = useRef<NodeJS.Timeout>(null);
  
  // Initialize teh tarik pour sound
  useEffect(() => {
    // Create a subtle pour sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createPourSound = () => {
      const bufferSize = audioContext.sampleRate * 2; // 2 seconds
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate filtered noise for pour sound
      for (let i = 0; i < bufferSize; i++) {
        const t = i / audioContext.sampleRate;
        const envelope = Math.exp(-t * 3) * (1 - Math.exp(-t * 10));
        data[i] = (Math.random() * 2 - 1) * envelope * 0.1;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Low-pass filter for water-like sound
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      
      const gain = audioContext.createGain();
      gain.gain.value = 0.3;
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      return { source, gain };
    };
    
    const playPourSound = () => {
      const { source, gain } = createPourSound();
      source.start();
      source.stop(audioContext.currentTime + 2);
      
      // Fade out
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    };
    
    const playPourStart = () => {
      // Quick "clink" sound for cup placement
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.2);
    };
    
    return () => {
      audioContext.close();
    };
  }, []);
  
  const handleMouseEnter = () => {
    setIsHovering(true);
    setSteamIntensity(0.8);
    onPourStart?.();
    
    // Play pour sound after a short delay
    pourTimeoutRef.current = setTimeout(() => {
      setIsPouring(true);
      // playPourSound();
    }, 300);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    setSteamIntensity(0.3);
    setIsPouring(false);
    onPourEnd?.();
    
    if (pourTimeoutRef.current) {
      clearTimeout(pourTimeoutRef.current);
    }
  };
  
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full animate-spin" /></div>}>
          <SteamParticles 
            intensity={steamIntensity}
            color="#FFF9E8"
            speed={1}
          />
          
          <ambientLight intensity={0.3} color="#FFF9E8" />
          <directionalLight 
            position={[2, 3, 2]} 
            intensity={0.8} 
            color="#FFF9E8"
          />
        </Suspense>
      </Canvas>
      
      {isPouring && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[var(--color-dowgnut-pink)]/90 text-white text-sm font-medium backdrop-blur-sm"
        >
          Teh Tarik being poured... ☕
        </motion.div>
      )}
    </div>
  );
}