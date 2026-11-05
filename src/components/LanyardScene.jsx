import React, { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import {
  createCardShellTextures,
  createCleanPortraitTexture,
  createStrapTexture,
} from '../utils/cardTextureGenerator';
import { soundFX } from '../utils/sound';

extend({ MeshLineGeometry, MeshLineMaterial });

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const isMobile = size.width < 640;
    camera.position.z = isMobile ? 12.4 : 11.0;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

function Band({ isFlipped, onFlipToggle, impulseKey }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const cardVisualGroup = useRef();

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const gl = useThree((state) => state.gl);
  const { width, height } = useThree((state) => state.size);
  const maxAniso = gl.capabilities.getMaxAnisotropy() || 16;

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const flipAngleRef = useRef(0);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    if (impulseKey > 0 && card.current) {
      card.current.wakeUp();
      card.current.applyImpulse({ x: (Math.random() - 0.5) * 1.6, y: 0.5, z: 0.85 }, true);
      card.current.applyTorqueImpulse({ x: 0, y: 0.4, z: 0.12 }, true);
      soundFX.playFlip();
    }
  }, [impulseKey]);

  const [shellTextures, setShellTextures] = useState(() => createCardShellTextures(maxAniso));
  const [strapTex, setStrapTex] = useState(() => createStrapTexture(maxAniso));
  const [portraitTex, setPortraitTex] = useState(null);

  // Re-generate 4K textures once Google Web Fonts finish loading so typography is 100% razor-sharp
  useEffect(() => {
    let active = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!active) return;
        setShellTextures(createCardShellTextures(maxAniso));
        setStrapTex(createStrapTexture(maxAniso));
      });
    }
    createCleanPortraitTexture('/bayu-profile.jpg', maxAniso, (tex) => {
      if (active) setPortraitTex(tex);
    });
    return () => {
      active = false;
    };
  }, [maxAniso]);

  useFrame((state, delta) => {
    const targetFlip = isFlipped ? Math.PI : 0;
    flipAngleRef.current = THREE.MathUtils.lerp(
      flipAngleRef.current,
      targetFlip,
      Math.min(1, delta * 8)
    );
    if (cardVisualGroup.current) {
      cardVisualGroup.current.rotation.y = flipAngleRef.current;
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.translation());
      curve.points[2].copy(j1.current.translation());
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(64));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 3.1,
    linearDamping: 3.1,
  };

  // Exact 1:1 Portrait Plane Dimension matching the 740x740 square frame on the 1024x1536 card
  // Card face is 1.82 x 2.66 -> 740 / 1024 * 1.82 = 1.315 wide, 740 / 1536 * 2.66 = 1.281 tall -> use exact square 1.30 x 1.30
  // Frame center Y = 186 + 370 = 556 from top -> (768 - 556) / 1536 * 2.66 = +0.367
  const portraitCenterY = 0.367;

  return (
    <>
      <group position={[0, 4.15, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.4, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.8, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.2, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1.35, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.95, 1.38, 0.05]} />

          <group
            ref={cardVisualGroup}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              soundFX.playFlip();
              onFlipToggle?.();
            }}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
              soundFX.playRelease();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.target.setPointerCapture(e.pointerId);
              soundFX.playGrab();
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            {/* Precision Brushed Metallic Clip */}
            <group position={[0, 1.39, 0]}>
              <RoundedBox args={[0.42, 0.15, 0.08]} radius={0.025} smoothness={6}>
                <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.22} />
              </RoundedBox>
              <mesh position={[0, 0.13, 0]}>
                <torusGeometry args={[0.085, 0.018, 24, 48]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.92} roughness={0.16} />
              </mesh>
              <mesh position={[0, 0.21, 0]}>
                <cylinderGeometry args={[0.032, 0.04, 0.11, 24]} />
                <meshStandardMaterial color="#F1F5F9" metalness={0.92} roughness={0.16} />
              </mesh>
            </group>

            {/* Sleek Acrylic Card Body */}
            <RoundedBox args={[1.88, 2.72, 0.052]} radius={0.065} smoothness={6}>
              <meshStandardMaterial color="#0D1017" metalness={0.25} roughness={0.25} />
            </RoundedBox>

            {/* 4K Ultra-HD Front Card Print (No Milky Fog Overlay!) */}
            <mesh position={[0, 0, 0.027]}>
              <planeGeometry args={[1.82, 2.66]} />
              <meshStandardMaterial
                map={shellTextures.frontTex}
                roughness={0.32}
                metalness={0.04}
                toneMapped={false}
              />
            </mesh>

            {/* Bayu's 100% Original Photo — Exact 1:1 Square HD Plane, Crisp & Unfogged */}
            {portraitTex && (
              <mesh position={[0, portraitCenterY, 0.029]}>
                <planeGeometry args={[1.3, 1.3]} />
                <meshBasicMaterial map={portraitTex} toneMapped={false} />
              </mesh>
            )}

            {/* 4K Ultra-HD Back Card Print */}
            <mesh position={[0, 0, -0.027]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[1.82, 2.66]} />
              <meshStandardMaterial
                map={shellTextures.backTex}
                roughness={0.32}
                metalness={0.04}
                toneMapped={false}
              />
            </mesh>
          </group>
        </RigidBody>
      </group>

      {/* Ultra-HD Lanyard Strap with Proper Depth & Forward Text */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={true}
          resolution={[width * 2, height * 2]}
          useMap
          map={strapTex}
          repeat={[3, 1]}
          lineWidth={0.82}
        />
      </mesh>
    </>
  );
}

export default function LanyardScene({ isFlipped = false, onFlipToggle, impulseKey = 0 }) {
  return (
    <div className="relative w-full h-full select-none touch-pan-y">
      <Canvas
        camera={{ position: [0, 0, 11.0], fov: 25 }}
        dpr={[1.5, 2.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <ResponsiveCamera />
        <ambientLight intensity={1.15} color="#FFFFFF" />
        <directionalLight position={[4, 7, 6]} intensity={1.6} color="#FFFFFF" />
        <directionalLight position={[-4, 3, 4]} intensity={0.8} color="#BAE6FD" />

        <Physics interpolate gravity={[0, -38, 0]} timeStep={1 / 60}>
          <Band
            isFlipped={isFlipped}
            onFlipToggle={onFlipToggle}
            impulseKey={impulseKey}
          />
        </Physics>

        <Environment blur={0.8}>
          <Lightformer
            intensity={1.6}
            color="#FFFFFF"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={1.4}
            color="#BAE6FD"
            position={[-2, 2, 2]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[50, 0.2, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
