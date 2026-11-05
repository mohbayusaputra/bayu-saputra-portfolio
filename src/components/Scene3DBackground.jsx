import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createSoftGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.75)');
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function InteractiveStarfield({ mouseRef }) {
  const groupRef = useRef();
  const count = 320;

  const glowMap = useMemo(() => createSoftGlowTexture(), []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sky = new THREE.Color('#7DD3FC');
    const indigo = new THREE.Color('#A5B4FC');
    const white = new THREE.Color('#F8FAFC');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;

      const pick = Math.random();
      const c = pick < 0.5 ? sky : pick < 0.8 ? indigo : white;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.018;

    const targetX = mouseRef.current.x * 0.55;
    const targetY = -mouseRef.current.y * 0.35 + mouseRef.current.scroll * 0.0012;

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.04);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.04);
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        map={glowMap}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function PerspectiveWaveGrid({ mouseRef }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(38, 22, 44, 26);
    geo.rotateX(-Math.PI * 0.44);
    return geo;
  }, []);

  const basePositions = useMemo(() => {
    return Float32Array.from(geometry.attributes.position.array);
  }, [geometry]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 0.55;
    const posAttr = meshRef.current.geometry.attributes.position;
    const arr = posAttr.array;

    for (let i = 0; i < posAttr.count; i++) {
      const bx = basePositions[i * 3];
      const bz = basePositions[i * 3 + 2];
      const wave =
        Math.sin(bx * 0.28 + t) * 0.28 + Math.cos(bz * 0.32 + t * 0.8) * 0.22;
      arr[i * 3 + 1] = basePositions[i * 3 + 1] + wave;
    }
    posAttr.needsUpdate = true;

    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouseRef.current.x * 0.03,
      0.04
    );
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -4.6, -6]}>
      <meshBasicMaterial
        color="#38BDF8"
        wireframe
        transparent
        opacity={0.065}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Scene3DBackground() {
  const mouseRef = useRef({ x: 0, y: 0, scroll: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handleScroll = () => {
      mouseRef.current.scroll = window.scrollY || 0;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05070B]">
      {/* Architectural Subtle Grid Pattern with Radial Vignette Mask */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 65% at 50% 25%, black 20%, transparent 100%)',
        }}
      />

      {/* Top Studio Volumetric Spotlight & Ambient Depth Glows */}
      <div
        className="absolute -top-56 left-1/2 -translate-x-1/2 w-[920px] h-[520px] rounded-full opacity-90 blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.14) 0%, rgba(99,102,241,0.08) 45%, transparent 75%)',
        }}
      />
      <div className="absolute top-[42%] -right-40 w-[520px] h-[520px] rounded-full bg-indigo-500/[0.06] blur-[150px]" />
      <div className="absolute -bottom-48 left-12 w-[520px] h-[420px] rounded-full bg-sky-500/[0.06] blur-[150px]" />

      {/* Live Three.js 3D Wave Horizon & Glowing Starfield */}
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <InteractiveStarfield mouseRef={mouseRef} />
        <PerspectiveWaveGrid mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
