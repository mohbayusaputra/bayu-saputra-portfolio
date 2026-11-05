import React, { useEffect, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  Shape,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  createBackCardTexture,
  createFrontCardTexture,
  createStrapTexture,
  loadCleanPortraitTexture,
} from '../utils/cardTextureGenerator';
import { soundFX } from '../utils/sound';

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function createRoundedBoxGeometry(width, height, depth, radius) {
  const shape = new Shape();
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw, hh);

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const bevel = Math.min(0.006, depth * 0.15);
  const geo = new ExtrudeGeometry(shape, {
    depth: Math.max(0.005, depth - bevel * 2),
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 6,
  });
  geo.center();
  return geo;
}

export default function LanyardScene({
  isFlipped = false,
  onFlipToggle,
  impulseKey = 0,
  onReady,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const stateRef = useRef({
    targetFlip: 0,
    wakeUp: null,
    applyImpulse: null,
    onFlipToggle: null,
  });

  stateRef.current.targetFlip = isFlipped ? Math.PI : 0;
  stateRef.current.onFlipToggle = onFlipToggle;

  useEffect(() => {
    stateRef.current.wakeUp?.();
  }, [isFlipped]);

  useEffect(() => {
    if (impulseKey > 0) {
      stateRef.current.applyImpulse?.();
    }
  }, [impulseKey]);

  useEffect(() => {
    let disposed = false;
    let rafId = 0;
    let renderer = null;
    let cleanupEvents = null;

    (async () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // Wait briefly for web fonts (capped at 350ms so never stalls slow connections)
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 350)),
        ]);
      }
      if (disposed) return;

      // Chunk 1: Init lightweight WebGLRenderer (< 25ms)
      const isMobile = window.innerWidth < 640;
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      const maxDpr = isMobile ? 1.75 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));

      const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy() || 4, 8);
      await nextFrame();
      if (disposed) return;

      // Chunk 2: Generate Front HD Card Texture (< 20ms)
      const frontTex = createFrontCardTexture(maxAniso);
      await nextFrame();
      if (disposed) {
        frontTex.dispose();
        return;
      }

      // Chunk 3: Generate Back & Strap HD Textures (< 20ms)
      const backTex = createBackCardTexture(maxAniso);
      const strapTex = createStrapTexture(maxAniso);
      strapTex.repeat.set(2.4, 1);
      await nextFrame();
      if (disposed) {
        frontTex.dispose();
        backTex.dispose();
        strapTex.dispose();
        return;
      }

      // Chunk 4: Assemble Scene, Studio Lights, Card & Curved 3D Woven Strap
      const scene = new Scene();
      const camera = new PerspectiveCamera(25, 1, 0.1, 50);

      const updateSize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 360;
        const h = container.clientHeight || 420;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.set(0, 0, w < 640 ? 12.4 : 11.0);
        camera.updateProjectionMatrix();
      };
      updateSize();

      // Studio 3-Point + Hemisphere Lighting (Zero cubemap shader stall!)
      scene.add(new HemisphereLight('#F0F9FF', '#0F172A', 1.35));
      const keyLight = new DirectionalLight('#FFFFFF', 1.75);
      keyLight.position.set(4, 7, 6);
      scene.add(keyLight);

      const fillLight = new DirectionalLight('#BAE6FD', 1.05);
      fillLight.position.set(-4, 3, 5);
      scene.add(fillLight);

      const rimLight = new DirectionalLight('#818CF8', 0.55);
      rimLight.position.set(0, -3, 4);
      scene.add(rimLight);

      // Card Pivot Group (Positioned at card center, rotated by pendulum & flip)
      const cardPivot = new Group();
      const cardVisual = new Group();
      cardPivot.add(cardVisual);
      scene.add(cardPivot);

      const geometries = [];
      const materials = [];
      const trackGeo = (g) => (geometries.push(g), g);
      const trackMat = (m) => (materials.push(m), m);

      // Metallic Clip Group at top of card (Fast Lambert Shading — Zero PBR Shader Stall!)
      const clipGroup = new Group();
      clipGroup.position.set(0, 1.39, 0);

      const clipBodyMat = trackMat(new MeshLambertMaterial({ color: '#475569' }));
      const clipSilverMat = trackMat(new MeshLambertMaterial({ color: '#E2E8F0' }));

      clipGroup.add(
        new Mesh(trackGeo(createRoundedBoxGeometry(0.42, 0.15, 0.08, 0.025)), clipBodyMat)
      );
      const ringMesh = new Mesh(trackGeo(new TorusGeometry(0.085, 0.018, 14, 28)), clipSilverMat);
      ringMesh.position.set(0, 0.13, 0);
      clipGroup.add(ringMesh);

      const swivelMesh = new Mesh(
        trackGeo(new CylinderGeometry(0.032, 0.04, 0.11, 16)),
        clipSilverMat
      );
      swivelMesh.position.set(0, 0.21, 0);
      clipGroup.add(swivelMesh);
      cardVisual.add(clipGroup);

      // Sleek Dark Acrylic Card Body
      const bodyMesh = new Mesh(
        trackGeo(createRoundedBoxGeometry(1.88, 2.72, 0.052, 0.065)),
        trackMat(new MeshLambertMaterial({ color: '#111622' }))
      );
      cardVisual.add(bodyMesh);

      // Front Card Face (Unwashed Crisp HD Texture)
      const faceGeo = trackGeo(new PlaneGeometry(1.82, 2.66));
      const frontMesh = new Mesh(
        faceGeo,
        trackMat(
          new MeshBasicMaterial({
            map: frontTex,
            toneMapped: false,
          })
        )
      );
      frontMesh.position.set(0, 0, 0.028);
      cardVisual.add(frontMesh);

      // Bayu's Crisp 1:1 Portrait Plane (Loads pre-processed 17.7KB WebP cleanly)
      const portraitMat = trackMat(
        new MeshBasicMaterial({ transparent: false, toneMapped: false })
      );
      const portraitMesh = new Mesh(trackGeo(new PlaneGeometry(1.3, 1.3)), portraitMat);
      portraitMesh.position.set(0, 0.367, 0.03);
      portraitMesh.visible = false;
      cardVisual.add(portraitMesh);

      loadCleanPortraitTexture('/bayu-card-portrait.webp', maxAniso, (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        portraitMat.map = tex;
        portraitMat.needsUpdate = true;
        portraitMesh.visible = true;
        wakeUp();
      });

      // Back Card Face
      const backMesh = new Mesh(
        faceGeo,
        trackMat(
          new MeshBasicMaterial({
            map: backTex,
            toneMapped: false,
          })
        )
      );
      backMesh.position.set(0, 0, -0.028);
      backMesh.rotation.y = Math.PI;
      cardVisual.add(backMesh);

      // Invisible generous hit-target plane for effortless pointer grabbing
      const hitMesh = new Mesh(
        trackGeo(new PlaneGeometry(2.05, 3.0)),
        trackMat(new MeshBasicMaterial({ visible: false, side: DoubleSide }))
      );
      cardPivot.add(hitMesh);

      // 3D Curved Woven Lanyard Ribbon Geometry (48 smooth segments)
      const STRAP_SEGS = 48;
      const STRAP_HALF_W = 0.135;
      const strapPositions = new Float32Array((STRAP_SEGS + 1) * 2 * 3);
      const strapUvs = new Float32Array((STRAP_SEGS + 1) * 2 * 2);
      const strapIndices = [];

      for (let i = 0; i <= STRAP_SEGS; i++) {
        const u = 1 - i / STRAP_SEGS;
        const uvIdx = i * 4;
        strapUvs[uvIdx] = u;
        strapUvs[uvIdx + 1] = 0;
        strapUvs[uvIdx + 2] = u;
        strapUvs[uvIdx + 3] = 1;

        if (i < STRAP_SEGS) {
          const a = i * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          strapIndices.push(a, b, c, b, d, c);
        }
      }

      const strapGeo = trackGeo(new BufferGeometry());
      strapGeo.setAttribute('position', new BufferAttribute(strapPositions, 3));
      strapGeo.setAttribute('uv', new BufferAttribute(strapUvs, 2));
      strapGeo.setIndex(strapIndices);

      const strapMesh = new Mesh(
        strapGeo,
        trackMat(
          new MeshBasicMaterial({
            map: strapTex,
            side: DoubleSide,
            toneMapped: false,
          })
        )
      );
      scene.add(strapMesh);

      // --- 4-Node 3D Verlet Rope + Pendulum Physics ---
      const ANCHOR = new Vector3(0, 4.15, 0);
      const SEG_LEN = [0.96, 0.96, 0.96, 1.56]; // 3 strap links + clip-to-card-center link
      const INV_MASS = [0, 1.0, 1.0, 1.0, 0.28]; // Heavy card keeps strap taut & authoritative

      // Initial gentle offset for natural drop-in pendulum settle
      const pos = [
        ANCHOR.clone(),
        new Vector3(0.18, 3.22, 0.04),
        new Vector3(0.38, 2.3, 0.08),
        new Vector3(0.58, 1.38, 0.1),
        new Vector3(0.76, -0.14, 0.12),
      ];
      const prev = pos.map((p) => p.clone());

      const curvePoints = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
      const curve = new CatmullRomCurve3(curvePoints);
      curve.curveType = 'chordal';

      const tmpDiff = new Vector3();
      const tmpTangent = new Vector3();
      const tmpSide = new Vector3();
      const camForward = new Vector3(0, 0, 1);

      let flipAngle = stateRef.current.targetFlip;
      let spinY = 0;
      let spinVelY = 0.22;
      let isDragging = false;
      let isVisible = true;
      let isRunning = false;
      const dragOffset = new Vector3();
      const dragTarget = new Vector3();
      let pointerDownPos = { x: 0, y: 0, time: 0 };
      let lastTapTime = 0;

      const raycaster = new Raycaster();
      const pointerNdc = new Vector2();
      const dragPlane = new Plane(new Vector3(0, 0, 1), 0);
      const intersectPt = new Vector3();

      const updateStrapGeometry = () => {
        // Connect smooth curve from top of metallic clip (pos[3]) up to ceiling anchor (pos[0])
        curvePoints[0].copy(pos[3]);
        curvePoints[1].copy(pos[2]);
        curvePoints[2].copy(pos[1]);
        curvePoints[3].copy(pos[0]);

        const pts = curve.getPoints(STRAP_SEGS);
        for (let i = 0; i <= STRAP_SEGS; i++) {
          const curr = pts[i];
          const prevPt = pts[Math.max(0, i - 1)];
          const nextPt = pts[Math.min(STRAP_SEGS, i + 1)];
          tmpTangent.subVectors(nextPt, prevPt).normalize();
          tmpSide.crossVectors(tmpTangent, camForward).normalize().multiplyScalar(STRAP_HALF_W);

          const base = i * 6;
          strapPositions[base] = curr.x - tmpSide.x;
          strapPositions[base + 1] = curr.y - tmpSide.y;
          strapPositions[base + 2] = curr.z - tmpSide.z;

          strapPositions[base + 3] = curr.x + tmpSide.x;
          strapPositions[base + 4] = curr.y + tmpSide.y;
          strapPositions[base + 5] = curr.z + tmpSide.z;
        }
        strapGeo.attributes.position.needsUpdate = true;
        strapGeo.computeBoundingSphere();
      };

      let lastTick = performance.now();

      const stepFrame = (now) => {
        if (disposed) return;
        if (!isVisible) {
          isRunning = false;
          return;
        }

        const dt = Math.min(0.033, Math.max(0.004, (now - lastTick) / 1000));
        lastTick = now;

        const damping = 0.984;
        const gravityY = -32.0;

        // Verlet integration step
        for (let i = 1; i <= 4; i++) {
          if (isDragging && i === 4) {
            prev[4].copy(pos[4]);
            pos[4].lerp(dragTarget, 0.45);
            continue;
          }
          const vx = (pos[i].x - prev[i].x) * damping;
          const vy = (pos[i].y - prev[i].y) * damping;
          const vz = (pos[i].z - prev[i].z) * damping;

          prev[i].copy(pos[i]);
          pos[i].x += vx;
          pos[i].y += vy + gravityY * dt * dt;
          pos[i].z += vz * 0.94;
        }

        // Sub-stepped distance constraint relaxation (8 iterations for taut woven strap)
        for (let iter = 0; iter < 8; iter++) {
          pos[0].copy(ANCHOR);
          for (let i = 0; i < 4; i++) {
            const a = pos[i];
            const b = pos[i + 1];
            tmpDiff.subVectors(b, a);
            const dist = tmpDiff.length() || 0.0001;
            const targetLen = SEG_LEN[i];
            // Strap segments only pull when taut; clip-to-card link (i===3) is rigid
            if (i < 3 && dist < targetLen) continue;

            const wA = INV_MASS[i];
            const wB = isDragging && i + 1 === 4 ? 0 : INV_MASS[i + 1];
            const wSum = wA + wB;
            if (wSum === 0) continue;

            const corr = (dist - targetLen) / dist / wSum;
            if (wA > 0) {
              a.x += tmpDiff.x * corr * wA;
              a.y += tmpDiff.y * corr * wA;
              a.z += tmpDiff.z * corr * wA;
            }
            if (wB > 0) {
              b.x -= tmpDiff.x * corr * wB;
              b.y -= tmpDiff.y * corr * wB;
              b.z -= tmpDiff.z * corr * wB;
            }
          }
        }

        // Update Card Position & Natural Pendulum Tilt
        cardPivot.position.copy(pos[4]);
        tmpDiff.subVectors(pos[3], pos[4]).normalize();
        const targetRotZ = MathUtils.clamp(-Math.atan2(tmpDiff.x, tmpDiff.y) * 0.85, -0.65, 0.65);
        const targetRotX = MathUtils.clamp(Math.atan2(tmpDiff.z, tmpDiff.y) * 0.6, -0.35, 0.35);

        cardPivot.rotation.z = MathUtils.lerp(cardPivot.rotation.z, targetRotZ, Math.min(1, dt * 14));
        cardPivot.rotation.x = MathUtils.lerp(cardPivot.rotation.x, targetRotX, Math.min(1, dt * 14));

        // Torsional Y sway + Smooth 180-deg ID Flip
        spinVelY += -spinY * 9.5 * dt;
        spinVelY *= Math.pow(0.18, dt);
        spinY += spinVelY * dt;

        flipAngle = MathUtils.lerp(
          flipAngle,
          stateRef.current.targetFlip,
          Math.min(1, dt * 8.5)
        );
        cardVisual.rotation.y = flipAngle + spinY;

        updateStrapGeometry();
        renderer.render(scene, camera);

        // Sleep-When-Settled Check (0% idle CPU/GPU once resting!)
        let kinetic = Math.abs(stateRef.current.targetFlip - flipAngle) + Math.abs(spinVelY) + Math.abs(spinY);
        for (let i = 1; i <= 4; i++) {
          kinetic += pos[i].distanceToSquared(prev[i]) * 120;
        }

        if (!isDragging && kinetic < 0.00018) {
          isRunning = false;
        } else {
          rafId = requestAnimationFrame(stepFrame);
        }
      };

      const wakeUp = () => {
        if (disposed || isRunning || !isVisible) return;
        isRunning = true;
        lastTick = performance.now();
        rafId = requestAnimationFrame(stepFrame);
      };

      stateRef.current.wakeUp = wakeUp;
      stateRef.current.applyImpulse = () => {
        const dir = (Math.random() > 0.5 ? 1 : -1) * (0.16 + Math.random() * 0.08);
        prev[4].x = pos[4].x - dir;
        prev[4].y = pos[4].y - 0.06;
        prev[4].z = pos[4].z - 0.08;
        spinVelY += dir * 4.5;
        soundFX.playFlip();
        wakeUp();
      };

      // Pointer & Touch Event Handlers
      const setPointerFromEvent = (e) => {
        const rect = canvas.getBoundingClientRect();
        pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerDown = (e) => {
        setPointerFromEvent(e);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObject(hitMesh, false);
        if (hits.length === 0) return;

        e.preventDefault();
        canvas.setPointerCapture?.(e.pointerId);
        raycaster.ray.intersectPlane(dragPlane, intersectPt);
        dragOffset.subVectors(pos[4], intersectPt);
        dragTarget.copy(pos[4]);
        isDragging = true;
        pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
        canvas.style.cursor = 'grabbing';
        soundFX.playGrab();
        wakeUp();
      };

      const onPointerMove = (e) => {
        setPointerFromEvent(e);
        raycaster.setFromCamera(pointerNdc, camera);

        if (isDragging) {
          if (raycaster.ray.intersectPlane(dragPlane, intersectPt)) {
            dragTarget.addVectors(intersectPt, dragOffset);
            dragTarget.x = MathUtils.clamp(dragTarget.x, -2.4, 2.4);
            dragTarget.y = MathUtils.clamp(dragTarget.y, -2.6, 2.2);
            spinVelY = MathUtils.clamp((dragTarget.x - pos[4].x) * 2.2, -2.5, 2.5);
            wakeUp();
          }
          return;
        }

        if (e.pointerType === 'mouse') {
          const hits = raycaster.intersectObject(hitMesh, false);
          canvas.style.cursor = hits.length > 0 ? 'grab' : 'auto';
        }
      };

      const endDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        canvas.releasePointerCapture?.(e.pointerId);
        canvas.style.cursor = 'grab';
        soundFX.playRelease();

        // Support quick double-tap on touch devices to flip card
        const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        const now = performance.now();
        if (e.pointerType !== 'mouse' && moved < 10 && now - pointerDownPos.time < 260) {
          if (now - lastTapTime < 340) {
            soundFX.playFlip();
            stateRef.current.onFlipToggle?.();
            lastTapTime = 0;
          } else {
            lastTapTime = now;
          }
        }
        wakeUp();
      };

      const onDblClick = (e) => {
        setPointerFromEvent(e);
        raycaster.setFromCamera(pointerNdc, camera);
        if (raycaster.intersectObject(hitMesh, false).length > 0) {
          soundFX.playFlip();
          stateRef.current.onFlipToggle?.();
          wakeUp();
        }
      };

      const onResize = () => {
        updateSize();
        wakeUp();
      };

      // Pause WebGL completely when Hero scrolled out of viewport
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries[0]?.isIntersecting ?? true;
          isVisible = vis;
          if (vis) wakeUp();
        },
        { threshold: 0.05 }
      );
      io.observe(container);

      canvas.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', endDrag, { passive: true });
      window.addEventListener('pointercancel', endDrag, { passive: true });
      canvas.addEventListener('dblclick', onDblClick);
      window.addEventListener('resize', onResize, { passive: true });

      cleanupEvents = () => {
        io.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        canvas.removeEventListener('dblclick', onDblClick);
        window.removeEventListener('resize', onResize);
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
        frontTex.dispose();
        backTex.dispose();
        strapTex.dispose();
      };

      // Render first frame before fading in
      updateStrapGeometry();
      renderer.render(scene, camera);
      setReady(true);
      onReady?.();
      wakeUp();
    })();

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanupEvents?.();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none touch-pan-y">
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-500 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
