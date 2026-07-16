# DowgNut-Z Three.js / Parallax / 3D "Wow Factor" Implementation Summary

## ✅ Completed Implementation

### 1. Core Three.js Shader System (`GlazeShaderMaterial.ts`)
| Shader | Purpose | Malaysian "Wow" Hook |
|--------|---------|---------------------|
| **Glaze Iridescence Shader** | Thin-film interference on glaze — rainbow sheen that shifts with view angle | "Coklat glaze yang kilau macam minyak" |
| **Dough SSS Material** | Subsurface scattering for fluffy interior | "Roti lembut macim baru keluar oven" |
| **Sprinkle Instanced Material** | GPU-driven 800+ sprinkles per donut | "Sprinkles yang terlebih banyak tak payah loading" |

### 2. Production 3D Components (`Donut3DViewer.tsx`)
| Component | Features |
|-----------|----------|
| **`Donut3DViewer`** | Interactive 3D product viewer with OrbitControls, auto-rotate, shadows, particle atmosphere |
| **`DonutMesh`** | Dual-layer (dough + glaze), sprinkle instancing, stuffed filling visualization |
| **`SprinkleSystem`** | 800 GPU-instanced sprinkles with wobble animation, type-specific color palettes |
| **`FlavorAtmosphere`** | 2000 ambient flavor particles orbiting the donut |
| **`Hero3DScene`** | Full-screen WebGL hero with 5-donut carousel, auto-rotate, click-to-select |

### 3. Integrated Pages
| Page | 3D Integration |
|------|----------------|
| **Home (`shop-home.tsx`)** | 4 flavor cards → 3D donut previews instead of 2D images |
| **Detail Modal (`detail-modal.tsx`)** | Full 3D viewer replaces rotating `<img>` — orbit, zoom, sprinkle interaction |
| **Hero Carousel** | Ready for `Hero3DScene` integration |

---

## 🎯 Phase 2: Malaysian Cultural "Wow" Moments (Next Sprint)

### A. Festival & Cultural Micro-Interactions
```typescript
// Add to GlazeShaderMaterial.ts or new CulturalShaders.ts

// Hari Raya Aidilfitri: Green/Gold ketupat glaze
export function createHariRayaGlaze() {
  return createGlazeShaderMaterial({
    baseColor: "#1B5E20",
    glazeColor: "#FFD700",
    iridescenceStrength: 2.0,
    thickness: 520, // gold-green interference
  });
}

// Deepavali: Purple/Orange gradient
export function createDeepavaliGlaze() {
  return createGlazeShaderMaterial({
    baseColor: "#4A148C",
    glazeColor: "#FF9800",
    iridescenceStrength: 1.8,
  });
}

// Chinese New Year: Red/Gold prosperity
export function createCNYGlaze() {
  return createGlazeShaderMaterial({
    baseColor: "#B71C1C",
    glazeColor: "#FFD700",
    iridescenceStrength: 2.2,
    thickness: 580,
  });
}

// Merdeka: Jalur Gemilang stripes shader
export function createMerdekaShader() {
  return new ShaderMaterial({
    // Fragment shader with 14 alternating red/white stripes
    // Blue canton with crescent + 14-point star
  });
}
```

### B. Malaysian Payment & UX Delights
```typescript
// components/dowgnut/MalaysianDelights.tsx

export function DuitNowQRBurst({ onComplete }: { onComplete: () => void }) {
  // On successful checkout: QR code assembles from flying sprinkles
  // Sound: "ching!" cash register + subtle gamelan hit
}

export function TapauBagPhysics({ donut }: { donut: Donut }) {
  // Add to cart → donut falls into paper bag
  // Bag crumples with soft-body physics (cannon-es / rapier)
  // Steam rises from bag (particle shader)
}

export function MamakStallAmbient() {
  // Hero section: subtle steam shader + distant teh tarik pour sound
  // Activated on hover, respects prefers-reduced-motion
}
```

### C. Scroll-Driven 3D Narrative (Framer Motion + R3F)
```typescript
// app/(shop)/page.tsx - ShopHome scroll story

<Scroll3DStory>
  <ScrollScene progress={[0, 0.2]}>
    {/* Dough mixing: particles swirl into torus shape */}
    <DoughFormation />
  </ScrollScene>
  
  <ScrollScene progress={[0.2, 0.4]}>
    {/* Proofing: donut expands with breathing animation */}
    <ProofingRise />
  </ScrollScene>
  
  <ScrollScene progress={[0.4, 0.6]}>
    {/* Frying: oil splash shader, golden brown color shift */}
    <FryingSplash />
  </ScrollScene>
  
  <ScrollScene progress={[0.6, 0.8]}>
    {/* Glazing: iridescent pour, drips physics */}
    <GlazePour />
  </ScrollScene>
  
  <ScrollScene progress={[0.8, 1.0]}>
    {/* Sprinkles: rainbow explosion from top */}
    <SprinkleExplosion />
    {/* Final: Box assembles around donut */}
    <BoxAssembly />
  </ScrollScene>
</Scroll3DStory>
```

### D. Page Transitions with WebGL Post-Processing
```typescript
// lib/webgl-transitions.ts

export const glazeWipeTransition = {
  // Full-screen shader: current page melts like chocolate glaze
  // Reveals next page underneath
  vertex: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragment: `
    uniform sampler2D tFrom; uniform sampler2D tTo; uniform float progress;
    uniform float uTime;
    // Chocolate drip noise + color burn blend
    float drip = noise(vUv * 10.0 + uTime) * 0.3;
    float mask = step(progress + drip, vUv.y);
    gl_FragColor = mix(texture2D(tFrom, vUv), texture2D(tTo, vUv), mask);
  `
};

export const sprinkleBurstTransition = {
  // Thousands of sprinkles explode from center
  // Each carries a pixel from next page
};
```

---

## 📦 Phase 3: Performance & Polish

| Optimization | Target |
|--------------|--------|
| **Shader compilation cache** | `bun add -D @vanilla-extract/next-plugin` or custom SWC plugin |
| **Model compression** | GLTF → Draco + Meshopt (`.gltf` → `.glb` 70% smaller) |
| **LOD system** | Near: full shader + sprinkles; Far: baked texture + billboard |
| **Instanced rendering** | All repeating elements (sprinkles, particles, carousel items) |
| **Web Workers** | Physics (cannon-es) + shader compilation off main thread |
| **Progressive enhancement** | Canvas 2D fallback for low-end devices |

---

## 🚀 Quick Wins This Week

| Task | Effort | Impact |
|------|--------|--------|
| Add Hari Raya / Merdeka theme toggle | 2h | 🇲🇾 Cultural resonance |
| DuitNow QR sprinkle burst on checkout | 3h | 💳 Payment delight |
| Tapau bag soft-body physics | 4h | 🛍️ Add-to-cart joy |
| Scroll-driven dough→glaze story | 1 day | 📖 Brand narrative |
| Glaze-wipe page transitions | 1 day | ✨ Premium feel |

---

## 🔧 Technical Debt to Address

1. **Shader hot-reload in dev** — `three` shaders don't HMR; need custom webpack loader
2. **Memory leaks on unmount** — `InstancedMesh` geometry attributes need cleanup
3. **SSR hydration mismatch** — Canvas size mismatch; use `useLayoutEffect` for sizing
4. **Accessibility** — `prefers-reduced-motion` disables all 3D animation
5. **Mobile GPU budget** — Target 30fps on Snapdragon 7xx; profile with `chrome://gpu`

---

## 📁 File Map

```
src/components/dowgnut/
├── GlazeShaderMaterial.ts      # Core shaders (glaze, dough, sprinkles)
├── Donut3DViewer.tsx           # Main 3D viewer + hero scene
├── detail-modal.tsx            # Updated: 3D viewer in modal
├── shop-home.tsx               # Updated: 3D flavor cards
├── DonutGeometry.ts            # (extracted) Reusable torus geo
├── MalaysianDelights.tsx       # (NEW) Cultural micro-interactions
├── Scroll3DStory.tsx           # (NEW) Scroll-driven narrative
├── WebGLTransitions.tsx        # (NEW) Page transition shaders
└── CulturalShaders.ts          # (NEW) Festival-specific materials
```

---

**Ready for Phase 2 implementation. Which Malaysian "wow" moment do you want first?**