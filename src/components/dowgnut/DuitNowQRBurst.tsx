"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  Group, 
  Points, 
  BufferGeometry, 
  BufferAttribute, 
  PointsMaterial, 
  AdditiveBlending,
  Vector3,
  Color,
  Sprite,
  SpriteMaterial,
  TextureLoader,
} from "three";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, QrCode, Loader2, Copy, Check } from "lucide-react";

// ─── Particle System for QR Code Assembly ──────────────────────────────────
interface Particle {
  position: Vector3;
  targetPosition: Vector3;
  velocity: Vector3;
  color: Color;
  size: number;
  delay: number;
  progress: number;
}

const PARTICLE_COUNT = 1500;
const QR_SIZE = 4;
const QR_VERSION = 25;

function generateQRPattern(data: string): boolean[][] {
  const size = QR_VERSION;
  const pattern: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          pattern[y][x] = dist === 3 || dist === 1;
        }
      }
    };
  
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);
  
  for (let i = 8; i < size - 8; i++) {
    pattern[6][i] = i % 2 === 0;
    pattern[i][6] = i % 2 === 0;
  }
  
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash |= 0;
  }
  
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (
        (y < 9 && x < 9) || 
        (y < 9 && x >= size - 8) || 
        (y >= size - 8 && x < 9) ||
        x === 6 || y === 6
      ) continue;
      
      const seed = hash + x * 31 + y * 17;
      pattern[y][x] = seededRandom(seed) > 0.5;
    }
  }
  
  return pattern;
}

function QRParticleSystem({ 
  orderId, 
  onComplete, 
  isPlaying 
}: { 
  orderId: string; 
  onComplete: () => void;
  isPlaying: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const pointsRef = useRef<Points>(null);
  const animationRef = useRef<number>(0);
  const [texture] = useState(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.needsUpdate = true;
    return texture;
  });
  
  const qrPatternRef = useRef<boolean[][]>([]);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!groupRef.current || initializedRef.current) return;
    
    qrPatternRef.current = generateQRPattern(`dowgnut:${orderId}:${Date.now()}`);
    
    const geometry = new BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const delays = new Float32Array(PARTICLE_COUNT);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    
    const pattern = qrPatternRef.current;
    const moduleSize = QR_SIZE / QR_VERSION;
    const qrModules: Vector3[] = [];
    
    for (let y = 0; y < QR_VERSION; y++) {
      for (let x = 0; x < QR_VERSION; x++) {
        if (pattern[y][x]) {
          qrModules.push(new Vector3(
            (x - QR_VERSION / 2 + 0.5) * moduleSize,
            (QR_VERSION / 2 - y - 0.5) * moduleSize,
            0
          ));
        }
      }
    }
    
    while (qrModules.length < PARTICLE_COUNT) {
      qrModules.push(new Vector3(
        (Math.random() - 0.5) * QR_SIZE * 1.5,
        (Math.random() - 0.5) * QR_SIZE * 1.5,
        (Math.random() - 0.5) * 2
      ));
    }
    
    for (let i = qrModules.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qrModules[i], qrModules[j]] = [qrModules[j], qrModules[i]];
    }
    qrModules.length = PARTICLE_COUNT;
    
    const festivalColors = [
      new Color("#FF6B6B"), new Color("#4ECDC4"), new Color("#FFE66D"),
      new Color("#A8E6CF"), new Color("#FFD3B6"), new Color("#B8B8FF"),
    ];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 2;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 3;
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const target = qrModules[i];
      targetPositions[i * 3] = target.x;
      targetPositions[i * 3 + 1] = target.y;
      targetPositions[i * 3 + 2] = target.z;
      
      const color = festivalColors[Math.floor(Math.random() * festivalColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = 0.04 + Math.random() * 0.04;
      delays[i] = Math.random() * 0.5;
    }
    
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aDelay', new BufferAttribute(delays, 1));
    geometry.setAttribute('aTargetPosition', new BufferAttribute(targetPositions, 3));
    
    if (pointsRef.current) {
      pointsRef.current.geometry.dispose();
      pointsRef.current.geometry = geometry;
    }
    
    initializedRef.current = true;
  }, [orderId]);
  
  useFrame((state, delta) => {
    if (!isPlaying || !pointsRef.current) return;
    
    animationRef.current += delta;
    const elapsed = animationRef.current;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const targetPositions = pointsRef.current.geometry.attributes.aTargetPosition.array as Float32Array;
    const delays = pointsRef.current.geometry.attributes.aDelay.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.aSize.array as Float32Array;
    
    const progress = Math.min(elapsed / 2.5, 1);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const delay = delays[i];
      const particleProgress = Math.max(0, (progress - delay) / (1 - delay));
      
      if (particleProgress <= 0) continue;
      
      const eased = 1 - Math.pow(1 - particleProgress, 3);
      
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];
      
      const tx = targetPositions[i * 3];
      const ty = targetPositions[i * 3 + 1];
      const tz = targetPositions[i * 3 + 2];
      
      positions[i * 3] = px + (tx - px) * eased * 0.15;
      positions[i * 3 + 1] = py + (ty - py) * eased * 0.15;
      positions[i * 3 + 2] = pz + (tz - pz) * eased * 0.15;
      
      const baseSize = sizes[i];
      sizes[i] = baseSize * (1 + Math.sin(elapsed * 10 + i) * 0.2 * particleProgress);
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.aSize.needsUpdate = true;
    
    if (progress >= 1 && elapsed > 3) {
      onComplete();
    }
  });
  
  return (
    <group ref={groupRef} rotation={[-Math.PI / 6, 0, 0]}>
      <Points
        ref={pointsRef}
        frustumCulled={false}
        sortParticles={true}
      >
        <bufferGeometry>
          <bufferAttribute name="position" count={PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute name="color" count={PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute name="aSize" count={PARTICLE_COUNT} itemSize={1} />
          <bufferAttribute name="aDelay" count={PARTICLE_COUNT} itemSize={1} />
          <bufferAttribute name="aTargetPosition" count={PARTICLE_COUNT} itemSize={3} />
        </bufferGeometry>
        <PointsMaterial
          size={1}
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          sizeAttenuation={true}
          blending={AdditiveBlending}
          depthWrite={false}
          map={texture}
          alphaTest={0.01}
        />
      </Points>
      
      <group position={[0, -QR_SIZE / 2 - 0.5, 0]} scale={[QR_SIZE, QR_SIZE, 1]}>
        <mesh receiveShadow material={{ color: 0x000000, transparent: true, opacity: 0.1, depthWrite: false }}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Simple QR Code Canvas ──────────────────────────────────────────────────
interface QRCodeCanvasProps {
  data: string;
  size: number;
  fgColor: string;
  bgColor: string;
}

function QRCodeCanvas({ data, size, fgColor, bgColor }: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    canvas.width = size;
    canvas.height = size;
    
    const moduleCount = 25;
    const moduleSize = size / moduleCount;
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fgColor;
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        const inFinderTL = x < 7 && y < 7;
        const inFinderTR = x >= 18 && y < 7;
        const inFinderBL = x < 7 && y >= 18;
        
        if (inFinderTL || inFinderTR || inFinderBL) {
          const fx = inFinderTL || inFinderBL ? x : x - 18;
          const fy = inFinderTL || inFinderTR ? y : y - 18;
          const dist = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
          if (dist === 3 || dist === 1) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            continue;
          }
        }
        
        if (x === 6 || y === 6) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
          }
          continue;
        }
        
        if ((y < 9 && x < 9) || (y < 9 && x >= 17) || (y >= 17 && x < 9)) {
          continue;
        }
        
        const seed = hash + x * 31 + y * 17;
        if (seededRandom(seed) > 0.5) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    const logoSize = size * 0.2;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.fillStyle = "white";
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(logoX - 4 + r, logoY - 4);
    ctx.lineTo(logoX - 4 + logoSize + 8 - r, logoY - 4);
    ctx.quadraticCurveTo(logoX - 4 + logoSize + 8, logoY - 4, logoX - 4 + logoSize + 8, logoY - 4 + r);
    ctx.lineTo(logoX - 4 + logoSize + 8, logoY - 4 + logoSize + 8 - r);
    ctx.quadraticCurveTo(logoX - 4 + logoSize + 8, logoY - 4 + logoSize + 8, logoX - 4 + logoSize + 8 - r, logoY - 4 + logoSize + 8);
    ctx.lineTo(logoX - 4 + r, logoY - 4 + logoSize + 8);
    ctx.quadraticCurveTo(logoX - 4, logoY - 4 + logoSize + 8, logoX - 4, logoY - 4 + logoSize + 8 - r);
    ctx.lineTo(logoX - 4, logoY - 4 + r);
    ctx.quadraticCurveTo(logoX - 4, logoY - 4, logoX - 4 + r, logoY - 4);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#07579B";
    const cx = size / 2;
    const cy = size / 2;
    const outerR = logoSize * 0.35;
    const innerR = outerR * 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fill("evenodd");
    
    ctx.fillStyle = "#F05A9B";
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = (outerR + innerR) / 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    }, [data, size, fgColor, bgColor]);
  
    return <canvas ref={canvasRef} width={size} height={size} className="block" />;
  }
}

// ─── Main DuitNow QR Burst Component ────────────────────────────────────────
interface DuitNowQRBurstProps {
  orderId: string;
  amount: number;
  onClose: () => void;
  merchantName?: string;
}

export function DuitNowQRBurst({ 
  orderId, 
  amount, 
  onClose,
  merchantName = "DowgNut" 
}: DuitNowQRBurstProps) {
  const [phase, setPhase] = useState<"idle" | "assembling" | "display" | "exiting">("idle");
  const [showQR, setShowQR] = useState(false);
  
  const duitNowPayload = `00020101021229370016A000000677010111021153036155802MY5204581253036155802MY5912${merchantName.padEnd(12, ' ').substring(0,12)}6008KualaLumpur62070404${amount.toFixed(2).replace('.', '').padStart(10, '0')}6304`;
  
  const handleAssemblyComplete = useCallback(() => {
    setPhase("display");
    setShowQR(true);
  }, []);
  
  const handleClose = useCallback(() => {
    setPhase("exiting");
    setTimeout(() => {
      setShowQR(false);
      onClose();
    }, 400);
  }, [onClose]);
 
    useEffect(() => {
      const timer = setTimeout(() => {
        setPhase("assembling");
      }, 0);
      return () => clearTimeout(timer);
    }, []);
 
    return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="relative px-6 py-4 bg-gradient-to-r from-[var(--color-dowgnut-pink)] to-[var(--color-dowgnut-blue)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">DuitNow QR Ready</p>
                  <p className="text-white/80 text-sm">Scan to pay RM{amount.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
            >
              {phase === "assembling" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[var(--color-dowgnut-lime)]"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span>Assembling QR from sprinkles...</span>
                </div>
              )}
              {phase === "display" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm font-medium">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span>QR Ready! Scan to pay</span>
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="p-6">
            {phase === "assembling" && (
              <div className="relative h-72 flex items-center justify-center">
                <Canvas
                  camera={{ position: [0, 1.5, 5], fov: 35 }}
                  gl={{ antialias: true, alpha: true }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Suspense fallback={<Loader />}>
                    <QRParticleSystem 
                      orderId={orderId} 
                      onComplete={handleAssemblyComplete}
                      isPlaying={phase === "assembling"}
                    />
                    <ambientLight intensity={0.6} color="#FFF9E8" />
                    <directionalLight 
                      position={[3, 5, 3]} 
                      intensity={1.2} 
                      color="#FFF9E8"
                      castShadow
                      shadow-mapSize-width={1024}
                      shadow-mapSize-height={1024}
                    />
                  </Suspense>
                </Canvas>
              </div>
            )}
            
            {phase === "display" && showQR && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="qr-display"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <div className="relative inline-block p-4 bg-white rounded-2xl shadow-lg">
                    <QRCodeCanvas 
                      data={duitNowPayload} 
                      size={220} 
                      fgColor="#07334F" 
                      bgColor="#FFFFFF"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                        <img 
                          src="/brand/dowgnut-logo-wordmark.png" 
                          alt="DowgNut" 
                          className="w-12 h-auto"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3 text-center">
                    <div className="bg-[var(--color-dowgnut-cream)] rounded-2xl p-4">
                      <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/60 uppercase tracking-wide">Amount to Pay</p>
                      <p className="graffiti-text text-3xl text-[var(--color-dowgnut-blue-dark)]">
                        RM{amount.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/60">
                      Order: <span className="font-mono text-[var(--color-dowgnut-blue-dark)]">{orderId.slice(-8).toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-[var(--color-dowgnut-blue-dark)]/40">
                      Opens banking app when scanned • Expires in 15 minutes
                    </p>
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 px-6 rounded-full bg-[var(--color-dowgnut-pink)] text-white font-bold hover:bg-[var(--color-dowgnut-pink-dark)] transition-colors"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(duitNowPayload)}
                      className="flex-1 py-3 px-6 rounded-full border-2 border-[var(--color-dowgnut-blue)] text-[var(--color-dowgnut-blue)] font-bold hover:bg-[var(--color-dowgnut-blue)] hover:text-white transition-colors"
                    >
                      Copy Payload
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <motion.div
        className="w-10 h-10 border-4 border-[var(--color-dowgnut-pink)] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}