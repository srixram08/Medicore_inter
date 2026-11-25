import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SceneFallback } from './SceneFallback';
import { probeWebGLCapabilities } from '../../lib/webgl';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CameraPreset = 'overview' | 'cardiac' | 'helix';

// Pre-allocated math helpers outside render loop (zero GC)
const _dummy = new THREE.Object3D();
const _targetPos = new THREE.Vector3();
const _lookAtPos = new THREE.Vector3(0, 0, 0);

function StudioEnvironmentRig() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    return () => {
      scene.environment = null;
      envTex.dispose();
    };
  }, [gl, scene]);

  return null;
}

function RoboticHeartAssembly({ preset }: { preset: CameraPreset }) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const latticeRef = useRef<THREE.Mesh>(null);
  const pulseMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const geometries = useMemo(() => {
    // 1. Ceramic White Biomechatronic Ventricle Shell
    const ventricleGeo = new THREE.SphereGeometry(0.92, 42, 36);
    const pos = ventricleGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const apexFactor = y < 0 ? 1 + y * 0.48 : 1 - y * 0.14;
      const nx = x * Math.max(0.32, apexFactor) + (y < 0 ? y * 0.16 : 0);
      const ny = y * 1.24;
      const nz = z * Math.max(0.38, apexFactor * 0.86);
      pos.setXYZ(i, nx, ny, nz);
    }
    ventricleGeo.computeVertexNormals();

    // 2. Ascending Aortic Conduit
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.55, 0.05),
      new THREE.Vector3(0.02, 1.18, 0.08),
      new THREE.Vector3(0.38, 1.48, -0.04),
      new THREE.Vector3(0.65, 1.22, -0.25),
      new THREE.Vector3(0.55, 0.42, -0.35),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.17, 16, false);

    // 3. Pulmonary Conduit
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.48, 0.28),
      new THREE.Vector3(-0.18, 1.05, 0.22),
      new THREE.Vector3(-0.62, 1.18, 0.05),
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmCurve, 24, 0.13, 14, false);

    // 4. Superior Vena Cava Conduit
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56, 0.36, -0.14),
      new THREE.Vector3(-0.62, 1.02, -0.18),
      new THREE.Vector3(-0.58, 1.48, -0.16),
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 20, 0.125, 12, false);

    // 5. Arterial Actuator Ports
    const b1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, 1.36, 0.02),
      new THREE.Vector3(0.1, 1.72, 0.04),
    ]);
    const b2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.32, 1.47, -0.03),
      new THREE.Vector3(0.34, 1.82, -0.02),
    ]);
    const b1Geo = new THREE.TubeGeometry(b1Curve, 12, 0.055, 10, false);
    const b2Geo = new THREE.TubeGeometry(b2Curve, 12, 0.05, 10, false);

    // 6. Coronary Biometric Fiber Trace
    const coronaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.72, 0.65),
      new THREE.Vector3(-0.08, 0.22, 0.78),
      new THREE.Vector3(-0.28, -0.42, 0.62),
      new THREE.Vector3(-0.14, -0.88, 0.34),
    ]);
    const coronaryGeo = new THREE.TubeGeometry(coronaryCurve, 28, 0.034, 8, false);

    // 7. Robotic Exo-Mesh Calibration Cage
    const latticeGeo = new THREE.IcosahedronGeometry(1.42, 1);

    return {
      ventricleGeo,
      aortaGeo,
      pulmGeo,
      svcGeo,
      b1Geo,
      b2Geo,
      coronaryGeo,
      latticeGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [geometries]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (heartGroupRef.current) {
      heartGroupRef.current.rotation.y += delta * 0.26;
      // Double-beat systolic/diastolic pulse (~72 BPM)
      const cycle = (t * 1.2) % 1;
      const lub = Math.exp(-Math.pow((cycle - 0.16) * 14, 2)) * 0.052;
      const dub = Math.exp(-Math.pow((cycle - 0.34) * 16, 2)) * 0.034;
      const pulse = 1 + lub + dub;
      const targetScale = preset === 'cardiac' ? 1.12 * pulse : pulse;
      heartGroupRef.current.scale.setScalar(
        THREE.MathUtils.damp(heartGroupRef.current.scale.x, targetScale, 8, delta)
      );

      if (pulseMatRef.current) {
        pulseMatRef.current.emissiveIntensity = 0.34 + (lub + dub) * 5.2;
      }
    }

    if (latticeRef.current) {
      latticeRef.current.rotation.y -= delta * 0.14;
      latticeRef.current.rotation.z += delta * 0.06;
    }
  });

  return (
    <group ref={heartGroupRef} position={[0, 0.1, 0]}>
      {/* Main Ice-Cobalt & Anodized Blue Biomechatronic Ventricle */}
      <mesh geometry={geometries.ventricleGeo} castShadow>
        <meshPhysicalMaterial
          ref={pulseMatRef}
          color="#93C5FD"
          emissive="#0070F3"
          emissiveIntensity={0.34}
          roughness={0.18}
          metalness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.08}
          ior={1.48}
        />
      </mesh>

      {/* Left & Right Anodized Blue Atrium Housings */}
      <mesh position={[0.52, 0.56, -0.18]} scale={[0.42, 0.38, 0.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial
          color="#0070F3"
          emissive="#0EA5E9"
          emissiveIntensity={0.18}
          roughness={0.22}
          metalness={0.55}
          clearcoat={0.85}
        />
      </mesh>

      <mesh position={[-0.56, 0.42, 0.14]} scale={[0.38, 0.36, 0.38]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial
          color="#0EA5E9"
          emissive="#0070F3"
          emissiveIntensity={0.14}
          roughness={0.25}
          metalness={0.5}
        />
      </mesh>

      {/* Bright Blue Anodized Aorta & Branches */}
      <mesh geometry={geometries.aortaGeo}>
        <meshStandardMaterial
          color="#0070F3"
          emissive="#0070F3"
          emissiveIntensity={0.2}
          roughness={0.22}
          metalness={0.65}
        />
      </mesh>
      <mesh geometry={geometries.b1Geo}>
        <meshStandardMaterial color="#0EA5E9" roughness={0.2} metalness={0.75} />
      </mesh>
      <mesh geometry={geometries.b2Geo}>
        <meshStandardMaterial color="#0EA5E9" roughness={0.2} metalness={0.75} />
      </mesh>

      {/* Brushed Steel & Cobalt Conduits */}
      <mesh geometry={geometries.pulmGeo}>
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={0.15}
          roughness={0.24}
          metalness={0.65}
        />
      </mesh>
      <mesh geometry={geometries.svcGeo}>
        <meshStandardMaterial color="#94B8E4" roughness={0.28} metalness={0.75} />
      </mesh>

      {/* Biometric Sensor Trace */}
      <mesh geometry={geometries.coronaryGeo}>
        <meshStandardMaterial
          color="#0D9F6E"
          emissive="#10B981"
          emissiveIntensity={0.55}
          roughness={0.2}
          metalness={0.2}
        />
      </mesh>

      {/* Precision Robotic Calibration Cage */}
      <mesh ref={latticeRef} geometry={geometries.latticeGeo}>
        <meshBasicMaterial color="#0070F3" wireframe transparent opacity={0.44} />
      </mesh>
    </group>
  );
}

function RoboticGimbalRings() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerGroupRef.current) {
      outerGroupRef.current.rotation.z += delta * 0.22;
      outerGroupRef.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.4) * 0.12;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z -= delta * 0.34;
      innerRef.current.rotation.y = Math.cos(t * 0.35) * 0.28;
    }
    if (pulseRingRef.current) {
      const wave = (t * 0.55) % 1;
      const s = 1 + wave * 0.45;
      pulseRingRef.current.scale.set(s, s, 1);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - wave) * 0.35;
    }
  });

  return (
    <group position={[0, 0.05, 0]}>
      {/* Articulated Outer Gimbal Ring with 4 Servo Actuator Nodes */}
      <group ref={outerGroupRef} rotation={[Math.PI / 2.4, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[2.35, 0.044, 14, 96]} />
          <meshStandardMaterial
            color="#0070F3"
            emissive="#0070F3"
            emissiveIntensity={0.45}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.35, Math.sin(angle) * 2.35, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial color="#0052CC" roughness={0.22} metalness={0.75} />
          </mesh>
        ))}
      </group>

      {/* Inner Precision Sky-Blue Ring */}
      <mesh ref={innerRef} rotation={[-Math.PI / 3, 0.4, 0]}>
        <torusGeometry args={[1.95, 0.032, 14, 84]} />
        <meshStandardMaterial
          color="#0EA5E9"
          emissive="#0EA5E9"
          emissiveIntensity={0.4}
          roughness={0.22}
          metalness={0.8}
        />
      </mesh>

      {/* Floor Pulse Calibration Ring */}
      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <ringGeometry args={[1.5, 1.65, 64]} />
        <meshBasicMaterial color="#0070F3" transparent opacity={0.48} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function FloatingRoboticCross() {
  const crossRef = useRef<THREE.Mesh>(null);

  const crossGeo = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.14;
    const l = 0.42;
    s.moveTo(-w, l);
    s.lineTo(w, l);
    s.lineTo(w, w);
    s.lineTo(l, w);
    s.lineTo(l, -w);
    s.lineTo(w, -w);
    s.lineTo(w, -l);
    s.lineTo(-w, -l);
    s.lineTo(-w, -w);
    s.lineTo(-l, -w);
    s.lineTo(-l, w);
    s.lineTo(-w, w);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
  }, []);

  useEffect(() => () => crossGeo.dispose(), [crossGeo]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (crossRef.current) {
      crossRef.current.rotation.y += delta * 0.65;
      crossRef.current.position.y = 1.45 + Math.sin(t * 1.4) * 0.16;
    }
  });

  return (
    <mesh ref={crossRef} geometry={crossGeo} position={[-2.95, 1.35, -0.35]}>
      <meshPhysicalMaterial
        color="#0070F3"
        emissive="#0EA5E9"
        emissiveIntensity={0.22}
        roughness={0.18}
        metalness={0.65}
        clearcoat={1}
      />
    </mesh>
  );
}

function FloatingDNAHelix({ preset }: { preset: CameraPreset }) {
  const groupRef = useRef<THREE.Group>(null);
  const rungsRef = useRef<THREE.InstancedMesh>(null);

  const { strandAGeo, strandBGeo, rungGeo, rungMatrices } = useMemo(() => {
    const turns = 2.4;
    const steps = 42;
    const height = 2.6;
    const radius = 0.34;
    const ptsA: THREE.Vector3[] = [];
    const ptsB: THREE.Vector3[] = [];
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const angle = u * Math.PI * 2 * turns;
      const y = (u - 0.5) * height;
      const ax = Math.cos(angle) * radius;
      const az = Math.sin(angle) * radius;
      const bx = Math.cos(angle + Math.PI) * radius;
      const bz = Math.sin(angle + Math.PI) * radius;
      ptsA.push(new THREE.Vector3(ax, y, az));
      ptsB.push(new THREE.Vector3(bx, y, bz));

      if (i % 3 === 0) {
        const m = new THREE.Matrix4();
        const pos = new THREE.Vector3(0, y, 0);
        const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -angle, Math.PI / 2));
        const scale = new THREE.Vector3(1, 1, 1);
        m.compose(pos, quat, scale);
        matrices.push(m);
      }
    }

    const sA = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsA), 48, 0.034, 8, false);
    const sB = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsB), 48, 0.034, 8, false);
    const rG = new THREE.CylinderGeometry(0.017, 0.017, radius * 1.9, 8);
    return { strandAGeo: sA, strandBGeo: sB, rungGeo: rG, rungMatrices: matrices };
  }, []);

  useEffect(() => {
    if (rungsRef.current) {
      rungMatrices.forEach((m, idx) => rungsRef.current!.setMatrixAt(idx, m));
      rungsRef.current.instanceMatrix.needsUpdate = true;
      rungsRef.current.computeBoundingSphere();
    }
    return () => {
      strandAGeo.dispose();
      strandBGeo.dispose();
      rungGeo.dispose();
    };
  }, [strandAGeo, strandBGeo, rungGeo, rungMatrices]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.55;
      groupRef.current.position.y = 0.25 + Math.cos(t * 1.1) * 0.14;
      const s = preset === 'helix' ? 1.28 : 1;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, s, 6, delta)
      );
    }
  });

  return (
    <group ref={groupRef} position={[3.05, 0.2, -0.35]} rotation={[0.15, 0, -0.22]}>
      <mesh geometry={strandAGeo}>
        <meshStandardMaterial color="#0070F3" roughness={0.22} metalness={0.7} />
      </mesh>
      <mesh geometry={strandBGeo}>
        <meshStandardMaterial color="#0EA5E9" roughness={0.22} metalness={0.7} />
      </mesh>
      <instancedMesh ref={rungsRef} args={[rungGeo, undefined, rungMatrices.length]}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.25} metalness={0.6} />
      </instancedMesh>
    </group>
  );
}

function HeartbeatWaveform3D() {
  const segments = 120;
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.032, 8, 8), []);

  useEffect(() => () => sphereGeo.dispose(), [sphereGeo]);

  useFrame((state) => {
    if (!nodesRef.current) return;
    const t = state.clock.getElapsedTime();
    const width = 10.6;

    for (let i = 0; i < segments; i++) {
      const u = i / (segments - 1);
      const x = (u - 0.5) * width;
      const phase = ((u * 2.6 - t * 0.52) % 1 + 1) % 1;

      let y = 0;
      if (phase > 0.12 && phase < 0.2) {
        y = Math.sin(((phase - 0.12) / 0.08) * Math.PI) * 0.14;
      } else if (phase >= 0.25 && phase < 0.29) {
        y = -Math.sin(((phase - 0.25) / 0.04) * Math.PI) * 0.16;
      } else if (phase >= 0.29 && phase < 0.35) {
        y = Math.sin(((phase - 0.29) / 0.06) * Math.PI) * 0.82;
      } else if (phase >= 0.35 && phase < 0.4) {
        y = -Math.sin(((phase - 0.35) / 0.05) * Math.PI) * 0.28;
      } else if (phase >= 0.5 && phase < 0.64) {
        y = Math.sin(((phase - 0.5) / 0.14) * Math.PI) * 0.22;
      }

      const pulseBoost = phase >= 0.27 && phase <= 0.37 ? 1.5 : 1.0;
      _dummy.position.set(x, y - 2.02, 0.45);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(pulseBoost);
      _dummy.updateMatrix();
      nodesRef.current.setMatrixAt(i, _dummy.matrix);
    }
    nodesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={nodesRef} args={[sphereGeo, undefined, segments]} frustumCulled={false}>
      <meshBasicMaterial color="#0070F3" transparent opacity={0.9} />
    </instancedMesh>
  );
}

function FloatingParticles({ count }: { count: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const list: { x: number; y: number; z: number; speed: number; offset: number; scale: number }[] =
      [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: (Math.random() - 0.5) * 13.0,
        y: (Math.random() - 0.5) * 7.2,
        z: (Math.random() - 0.5) * 5.0 - 1.2,
        speed: 0.25 + Math.random() * 0.45,
        offset: Math.random() * Math.PI * 2,
        scale: 0.036 + Math.random() * 0.034,
      });
    }
    return list;
  }, [count]);

  const geo = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      _dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.26,
        p.y + Math.cos(t * p.speed * 0.9 + p.offset) * 0.28,
        p.z
      );
      _dummy.rotation.set(t * 0.4 + p.offset, t * 0.3, 0);
      _dummy.scale.setScalar(p.scale);
      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial color="#0070F3" transparent opacity={0.68} />
    </instancedMesh>
  );
}

function CameraParallaxRig({ preset }: { preset: CameraPreset }) {
  const { camera, size } = useThree();
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = -((e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const aspect = size.width / Math.max(size.height, 1);
    const portraitBoost = aspect < 0.9 ? (0.9 - aspect) * 4.5 : 0;

    const baseX = preset === 'helix' ? 2.05 : preset === 'cardiac' ? 0.15 : 0;
    const baseY = preset === 'helix' ? 0.22 : preset === 'cardiac' ? 0.18 : 0.12;
    const baseZ = (preset === 'cardiac' ? 4.4 : preset === 'helix' ? 5.0 : 5.75) + portraitBoost;

    _targetPos.set(
      baseX + pointerRef.current.x * 0.65,
      baseY + pointerRef.current.y * 0.42,
      baseZ
    );
    camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 4.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 4.2, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 4.2, delta);

    const targetLookX = preset === 'helix' ? 1.95 : 0;
    _lookAtPos.x = THREE.MathUtils.damp(_lookAtPos.x, targetLookX, 4.2, delta);
    camera.lookAt(_lookAtPos);
  });

  return null;
}

class WebGLErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function MedicalHeartScene() {
  const reducedMotion = useReducedMotion();
  const caps = useMemo(() => probeWebGLCapabilities(), []);
  const [contextLost, setContextLost] = useState(false);
  const [preset, setPreset] = useState<CameraPreset>('overview');

  if (reducedMotion || !caps.supported || caps.isLowPower || contextLost) {
    const reason = reducedMotion
      ? 'Reduced motion preference active'
      : !caps.supported
      ? 'WebGL unavailable — 2D robotics schematic active'
      : caps.isLowPower
      ? 'Low-power mode active'
      : 'Graphics context suspended';
    return <SceneFallback reason={reason} />;
  }

  const particleCount = caps.isSoftwareGl ? 42 : 90;

  return (
    <WebGLErrorBoundary fallback={<SceneFallback reason="WebGL fallback active" />}>
      <div className="relative h-full w-full overflow-hidden bg-[#EEF5FF]">
        {/* Crisp Luminous White & Bright-Blue Studio Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 52% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(214, 232, 255, 0.65) 48%, rgba(235, 244, 255, 1) 82%)',
          }}
        />

        {/* Subtle Robotics Calibration Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0, 112, 243, 0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 112, 243, 0.09) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 35%, transparent 78%)',
          }}
        />

        <Canvas
          dpr={caps.isSoftwareGl ? 1 : [1, 1.75]}
          camera={{ position: [0, 0.15, 5.75], fov: 42, near: 0.1, far: 40 }}
          gl={{
            antialias: !caps.isSoftwareGl,
            powerPreference: 'high-performance',
            alpha: true,
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            const handleLost = (e: Event) => {
              e.preventDefault();
              setContextLost(true);
            };
            canvas.addEventListener('webglcontextlost', handleLost, false);
          }}
        >
          <fog attach="fog" args={['#EEF5FF', 8.5, 18]} />
          <StudioEnvironmentRig />

          <hemisphereLight args={['#FFFFFF', '#BFDBFE', 0.9]} />
          <directionalLight position={[4, 6, 5]} intensity={1.7} color="#FFFFFF" />
          <directionalLight position={[-5, -2, 3]} intensity={0.85} color="#0070F3" />
          <pointLight position={[0, 1.5, 3.2]} intensity={1.1} distance={10} color="#0EA5E9" />

          <CameraParallaxRig preset={preset} />
          <RoboticHeartAssembly preset={preset} />
          <RoboticGimbalRings />
          <FloatingRoboticCross />
          <FloatingDNAHelix preset={preset} />
          <HeartbeatWaveform3D />
          <FloatingParticles count={particleCount} />
        </Canvas>

        {/* Bottom-Right Unobtrusive Camera Focus Dock */}
        <div className="pointer-events-auto absolute right-4 bottom-4 z-20 hidden items-center gap-1 rounded-xl border border-[#DCE8F7] bg-white/90 p-1 shadow-xl shadow-[#0070F3]/10 backdrop-blur-md sm:right-6 sm:bottom-5 sm:flex">
          {(['overview', 'cardiac', 'helix'] as CameraPreset[]).map((key) => {
            const labels: Record<CameraPreset, string> = {
              overview: 'Full Telemetry',
              cardiac: 'Robotic Core',
              helix: 'DNA Helix',
            };
            const active = preset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#0070F3] text-white font-semibold'
                    : 'text-[#334155] hover:text-[#0070F3]'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}
