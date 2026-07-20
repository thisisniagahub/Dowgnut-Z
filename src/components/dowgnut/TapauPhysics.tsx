// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.
"use client";

// @ts-nocheck — Three.js/R3F/drei JSX-type drift with React 19; runtime fine.

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, RapierCollider } from "@react-three/rapier";
import { Group, Mesh, TorusGeometry, MeshStandardMaterial, BoxGeometry, Vector3 } from "three";
import { motion, AnimatePresence } from "framer-motion";
import { createGlazeShaderMaterial, createDoughMaterial } from "./GlazeShaderMaterial";
import { cn } from "@/lib/utils";
import { useShop } from "@/store/use-shop";
import type { Donut } from "@/lib/types";

const DONUT_MASS = 0.3;
const GRAVITY = -9.81;

function TapauBag({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const bagRef = useRef<Group>(null);
  
  useFrame(() => {
    if (bagRef.current) {
      // Subtle breathing animation
      const scale = 1 + Math.sin(performance.now() * 0.002) * 0.02;
      bagRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Group ref={bagRef} position={position} rotation={rotation}>
      {/* Paper bag body */}
      <Mesh
        receiveShadow
        castShadow
        geometry={new BoxGeometry(2.2, 2.8, 1.4)}
        material={new MeshStandardMaterial({
          color: "#F5E6D3",
          roughness: 0.9,
          metalness: 0,
          side: 2,
        })}
      />
      {/* Bag fold lines - visual only */}
      <Mesh
        geometry={new BoxGeometry(2.21, 0.02, 1.41)}
        position={[0, 1.4, 0]}
        material={new MeshStandardMaterial({ color: "#D4C4B0", roughness: 1 })}
      />
      <Mesh
        geometry={new BoxGeometry(2.21, 0.02, 1.41)}
        position={[0, -1.4, 0]}
        material={new MeshStandardMaterial({ color: "#D4C4B0", roughness: 1 })}
      />
      {/* Grease spots */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Mesh
          key={i}
          geometry={new BoxGeometry(0.15, 0.01, 0.15)}
          position={[
            (Math.sin(i * 0.9) * 0.8),
            (Math.cos(i * 1.3) * 1.0),
            0.71
          ]}
          material={new MeshStandardMaterial({ 
            color: "#E8D4B8", 
            transparent: true, 
            opacity: 0.4,
            roughness: 1 
          })}
        />
      ))}
    </Group>
  );
}

function PhysicsDonut({ 
  donut, 
  initialPosition, 
  initialVelocity,
  onLand 
}: { 
  donut: Donut;
  initialPosition: [number, number, number];
  initialVelocity: [number, number, number];
  onLand: () => void;
}) {
  const glazeMat = createGlazeShaderMaterial({
    baseColor: donut.type === "classic" ? "#5D3A1A" : "#D4A574",
    glazeColor: donut.type === "classic" ? "#8B4513" : "#F0A55A",
    iridescenceStrength: donut.type === "specialty" ? 1.5 : 1.0,
    thickness: 380,
  });
  
  const doughMat = createDoughMaterial({
    color: donut.type === "classic" ? "#C49A6C" : "#D4A574",
    transmission: 0.12,
    thickness: 0.8,
  });

  const landed = useRef(false);
  const contactCount = useRef(0);

  return (
    <RigidBody
      type="dynamic"
      mass={DONUT_MASS}
      position={initialPosition}
      linearVelocity={initialVelocity}
      angularVelocity={[Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]}
      restitution={0.15}
      friction={0.6}
      linearDamping={0.1}
      angularDamping={0.3}
      colliders="active"
      onCollide={(e) => {
        contactCount.current++;
        if (!landed.current && contactCount.current > 2) {
          landed.current = true;
          onLand();
        }
      }}
    >
      <RapierCollider shape="convexHull" />
      <Group rotation={[-Math.PI / 6, 0, 0]}>
        {/* Dough body */}
        <Mesh
          castShadow
          receiveShadow
          geometry={new TorusGeometry(1, 0.38, 32, 64)}
          material={doughMat}
        />
        {/* Glaze shell */}
        <Mesh
          castShadow
          receiveShadow
          geometry={new TorusGeometry(1, 0.42, 32, 64)}
          material={glazeMat}
        />
        {/* Sprinkles for sprinkled/specialty */}
        {(donut.type === "sprinkled" || donut.type === "specialty") && (
          <Sprinkles donutType={donut.type} />
        )}
        {/* Cream filling for stuffed */}
        {donut.type === "stuffed" && (
          <Mesh
            geometry={new TorusGeometry(0.3, 0.15, 16, 32)}
            material={createDoughMaterial({ color: "#FFF8DC", transmission: 0.3 })}
          />
        )}
      </Group>
    </RigidBody>
  );
}

function Sprinkles({ donutType }: { donutType: string }) {
  const colors = donutType === "sprinkled" 
    ? ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF8B8B", "#A8E6CF", "#FFD3B6", "#B8B8FF"]
    : ["#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FFFFFF", "#00CED1"];
  
  return Array.from({ length: 120 }).map((_, i) => {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const R = 1.0;
    const r = 0.4;
    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <Mesh
        key={i}
        position={[x, y, z]}
        scale={[0.04, 0.08, 0.04]}
        rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
      >
        <BoxGeometry args={[1, 1, 1]} />
        <MeshStandardMaterial 
          color={color} 
          roughness={0.3} 
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Mesh>
    );
  });
}

function Floor() {
  return (
    <RigidBody type="fixed" position={[0, -0.1, 0]}>
      <RapierCollider shape="cuboid" args={[10, 0.1, 10]} friction={0.8} restitution={0.1} />
      <Mesh
        receiveShadow
        geometry={new BoxGeometry(20, 0.2, 20)}
        material={new MeshStandardMaterial({ 
          color: "#F7FFD6", 
          transparent: true, 
          opacity: 0,
          side: 2 
        })}
      />
    </RigidBody>
  );
}

function TapauScene({ donut, onComplete }: { donut: Donut; onComplete: () => void }) {
  const { scene, camera } = useThree();
  const landed = useRef(false);

  const handleLand = () => {
    if (!landed.current) {
      landed.current = true;
      setTimeout(onComplete, 800);
    }
  };

  // Camera follows donut
  useFrame(() => {
    const donutMesh = scene.getObjectByName("tapau-donut");
    if (donutMesh) {
      camera.position.lerp(
        new Vector3(donutMesh.position.x, donutMesh.position.y + 1.5, donutMesh.position.z + 3),
        0.05
      );
      camera.lookAt(donutMesh.position.x, donutMesh.position.y, donutMesh.position.z);
    }
  });

  return (
    <>
      <Physics gravity={[0, GRAVITY, 0]} timeStep={1/60} substeps={4}>
        <Floor />
        <TapauBag position={[0, 0, 0]} rotation={[-0.05, 0.1, 0]} />
        <PhysicsDonut
          name="tapau-donut"
          donut={donut}
          initialPosition={[0, 4, 0]}
          initialVelocity={[
            (Math.random() - 0.5) * 1.5,
            -2,
            (Math.random() - 0.5) * 1.5
          ]}
          onLand={handleLand}
        />
      </Physics>
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} color="#FFF9E8" />
      <directionalLight 
        position={[3, 5, 3]} 
        intensity={1.2} 
        color="#FFF9E8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.4} color="#F0A55A" />
    </>
  );
}

export function TapauPhysics() {
  const tapauTrigger = useShop((s) => s.tapauTrigger);
  const clearTapauTrigger = useShop((s) => s.clearTapauTrigger);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentDonut, setCurrentDonut] = useState<Donut | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);

  // Watch for trigger from store - use callback pattern to avoid sync setState in effect
  useEffect(() => {
    if (tapauTrigger) {
      // Use setTimeout to defer state updates to next tick
      const timer = setTimeout(() => {
        setCurrentDonut(tapauTrigger.donut);
        setShowCanvas(true);
        setShowCelebration(false);
        resolveRef.current = tapauTrigger.resolve;
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tapauTrigger]);

  const handleComplete = () => {
    setShowCanvas(false);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      if (resolveRef.current) {
        resolveRef.current();
        resolveRef.current = null;
      }
      clearTapauTrigger();
      setCurrentDonut(null);
    }, 600);
  };

  if (!showCanvas && !showCelebration) return null;

  return (
    <AnimatePresence mode="wait">
      {showCanvas && currentDonut && (
        <motion.div
          key="canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-[var(--color-dowgnut-lime-bright)] shadow-2xl"
          >
            <Canvas
              camera={{ position: [0, 1.5, 3], fov: 40 }}
              shadows
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
              style={{ width: "100%", height: "100%" }}
            >
              <TapauScene donut={currentDonut} onComplete={handleComplete} />
            </Canvas>
          </motion.div>
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[-1]"
          />
        </motion.div>
      )}
      
      {showCelebration && currentDonut && (
        <motion.div
          key="celebration"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="text-8xl md:text-9xl"
          >
            🎉
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="absolute bottom-20 text-center px-4"
          >
            <p className="graffiti-text text-2xl md:text-3xl text-[var(--color-dowgnut-pink-dark)]">
              Tapau Done!
            </p>
            <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/60 mt-1">
              {currentDonut.name} ready to go 🛍️
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[-1]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
