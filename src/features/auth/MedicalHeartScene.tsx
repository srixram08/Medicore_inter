import React, { Component, useEffect, useMemo, useRef, useState } from 'react';
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
const _rungMat4 = new THREE.Matrix4();
const _rungPos = new THREE.Vector3();
const _rungQuat = new THREE.Quaternion();
const _rungEuler = new THREE.Euler();
const _rungScale = new THREE.Vector3(1, 1, 1);

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

  const mountRef = useRef<HTMLDivElement>(null);
  const presetRef = useRef<CameraPreset>('overview');

  useEffect(() => {
    presetRef.current = preset;
  }, [preset]);

  useEffect(() => {
    if (reducedMotion || !caps.supported || caps.isLowPower || contextLost) return;
    const container = mountRef.current;
    if (!container) return;

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposableGeometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposableMaterials.push(m);
      return m;
    };

    const initialWidth = Math.max(container.clientWidth, window.innerWidth, 1);
    const initialHeight = Math.max(container.clientHeight, window.innerHeight, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#EEF5FF', 8.5, 18);

    const camera = new THREE.PerspectiveCamera(42, initialWidth / initialHeight, 0.1, 40);
    camera.position.set(0, 0.15, 5.75);

    const renderer = new THREE.WebGLRenderer({
      antialias: !caps.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(caps.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(initialWidth, initialHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Studio Reflection Environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#BFDBFE', 0.9);
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.7);
    keyLight.position.set(4, 6, 5);
    const fillLight = new THREE.DirectionalLight('#0070F3', 0.85);
    fillLight.position.set(-5, -2, 3);
    const rimPoint = new THREE.PointLight('#0EA5E9', 1.1, 10);
    rimPoint.position.set(0, 1.5, 3.2);
    scene.add(hemiLight, keyLight, fillLight, rimPoint);

    // 1. Robotic Heart Assembly
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, 0.1, 0);
    scene.add(heartGroup);

    const ventricleGeo = trackGeo(new THREE.SphereGeometry(0.92, 42, 36));
    const vPos = ventricleGeo.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      const x = vPos.getX(i);
      const y = vPos.getY(i);
      const z = vPos.getZ(i);
      const apexFactor = y < 0 ? 1 + y * 0.48 : 1 - y * 0.14;
      const nx = x * Math.max(0.32, apexFactor) + (y < 0 ? y * 0.16 : 0);
      const ny = y * 1.24;
      const nz = z * Math.max(0.38, apexFactor * 0.86);
      vPos.setXYZ(i, nx, ny, nz);
    }
    ventricleGeo.computeVertexNormals();

    const pulseMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: '#93C5FD',
        emissive: '#0070F3',
        emissiveIntensity: 0.34,
        roughness: 0.18,
        metalness: 0.28,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        ior: 1.48,
      })
    );
    const ventricleMesh = new THREE.Mesh(ventricleGeo, pulseMat);
    heartGroup.add(ventricleMesh);

    const atriumGeo = trackGeo(new THREE.SphereGeometry(1, 24, 24));
    const leftAtrium = new THREE.Mesh(
      atriumGeo,
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: '#0070F3',
          emissive: '#0EA5E9',
          emissiveIntensity: 0.18,
          roughness: 0.22,
          metalness: 0.55,
          clearcoat: 0.85,
        })
      )
    );
    leftAtrium.position.set(0.52, 0.56, -0.18);
    leftAtrium.scale.set(0.42, 0.38, 0.4);
    heartGroup.add(leftAtrium);

    const rightAtrium = new THREE.Mesh(
      atriumGeo,
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: '#0EA5E9',
          emissive: '#0070F3',
          emissiveIntensity: 0.14,
          roughness: 0.25,
          metalness: 0.5,
        })
      )
    );
    rightAtrium.position.set(-0.56, 0.42, 0.14);
    rightAtrium.scale.set(0.38, 0.36, 0.38);
    heartGroup.add(rightAtrium);

    const aortaGeo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.05, 0.55, 0.05),
          new THREE.Vector3(0.02, 1.18, 0.08),
          new THREE.Vector3(0.38, 1.48, -0.04),
          new THREE.Vector3(0.65, 1.22, -0.25),
          new THREE.Vector3(0.55, 0.42, -0.35),
        ]),
        36,
        0.17,
        16,
        false
      )
    );
    heartGroup.add(
      new THREE.Mesh(
        aortaGeo,
        trackMat(
          new THREE.MeshStandardMaterial({
            color: '#0070F3',
            emissive: '#0070F3',
            emissiveIntensity: 0.2,
            roughness: 0.22,
            metalness: 0.65,
          })
        )
      )
    );

    const actuatorMat = trackMat(
      new THREE.MeshStandardMaterial({ color: '#0EA5E9', roughness: 0.2, metalness: 0.75 })
    );
    const b1Geo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.14, 1.36, 0.02),
          new THREE.Vector3(0.1, 1.72, 0.04),
        ]),
        12,
        0.055,
        10,
        false
      )
    );
    const b2Geo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.32, 1.47, -0.03),
          new THREE.Vector3(0.34, 1.82, -0.02),
        ]),
        12,
        0.05,
        10,
        false
      )
    );
    heartGroup.add(new THREE.Mesh(b1Geo, actuatorMat), new THREE.Mesh(b2Geo, actuatorMat));

    const pulmGeo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.22, 0.48, 0.28),
          new THREE.Vector3(-0.18, 1.05, 0.22),
          new THREE.Vector3(-0.62, 1.18, 0.05),
        ]),
        24,
        0.13,
        14,
        false
      )
    );
    heartGroup.add(
      new THREE.Mesh(
        pulmGeo,
        trackMat(
          new THREE.MeshStandardMaterial({
            color: '#38BDF8',
            emissive: '#0284C7',
            emissiveIntensity: 0.15,
            roughness: 0.24,
            metalness: 0.65,
          })
        )
      )
    );

    const svcGeo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.56, 0.36, -0.14),
          new THREE.Vector3(-0.62, 1.02, -0.18),
          new THREE.Vector3(-0.58, 1.48, -0.16),
        ]),
        20,
        0.125,
        12,
        false
      )
    );
    heartGroup.add(
      new THREE.Mesh(
        svcGeo,
        trackMat(new THREE.MeshStandardMaterial({ color: '#94B8E4', roughness: 0.28, metalness: 0.75 }))
      )
    );

    const coronaryGeo = trackGeo(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.12, 0.72, 0.65),
          new THREE.Vector3(-0.08, 0.22, 0.78),
          new THREE.Vector3(-0.28, -0.42, 0.62),
          new THREE.Vector3(-0.14, -0.88, 0.34),
        ]),
        28,
        0.034,
        8,
        false
      )
    );
    heartGroup.add(
      new THREE.Mesh(
        coronaryGeo,
        trackMat(
          new THREE.MeshStandardMaterial({
            color: '#0D9F6E',
            emissive: '#10B981',
            emissiveIntensity: 0.55,
            roughness: 0.2,
            metalness: 0.2,
          })
        )
      )
    );

    const latticeGeo = trackGeo(new THREE.IcosahedronGeometry(1.42, 1));
    const latticeMesh = new THREE.Mesh(
      latticeGeo,
      trackMat(
        new THREE.MeshBasicMaterial({
          color: '#0070F3',
          wireframe: true,
          transparent: true,
          opacity: 0.44,
        })
      )
    );
    heartGroup.add(latticeMesh);

    // 2. Robotic Gimbal Rings
    const gimbalRoot = new THREE.Group();
    gimbalRoot.position.set(0, 0.05, 0);
    scene.add(gimbalRoot);

    const outerGimbalGroup = new THREE.Group();
    outerGimbalGroup.rotation.set(Math.PI / 2.4, 0.2, 0);
    gimbalRoot.add(outerGimbalGroup);

    const outerTorusGeo = trackGeo(new THREE.TorusGeometry(2.35, 0.044, 14, 96));
    outerGimbalGroup.add(
      new THREE.Mesh(
        outerTorusGeo,
        trackMat(
          new THREE.MeshStandardMaterial({
            color: '#0070F3',
            emissive: '#0070F3',
            emissiveIntensity: 0.45,
            roughness: 0.2,
            metalness: 0.8,
          })
        )
      )
    );

    const servoGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.12, 0.12));
    const servoMat = trackMat(
      new THREE.MeshStandardMaterial({ color: '#0052CC', roughness: 0.22, metalness: 0.75 })
    );
    [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((angle) => {
      const node = new THREE.Mesh(servoGeo, servoMat);
      node.position.set(Math.cos(angle) * 2.35, Math.sin(angle) * 2.35, 0);
      node.rotation.set(0, 0, angle);
      outerGimbalGroup.add(node);
    });

    const innerRingMesh = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(1.95, 0.032, 14, 84)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: '#0EA5E9',
          emissive: '#0EA5E9',
          emissiveIntensity: 0.4,
          roughness: 0.22,
          metalness: 0.8,
        })
      )
    );
    innerRingMesh.rotation.set(-Math.PI / 3, 0.4, 0);
    gimbalRoot.add(innerRingMesh);

    const pulseRingMat = trackMat(
      new THREE.MeshBasicMaterial({
        color: '#0070F3',
        transparent: true,
        opacity: 0.48,
        side: THREE.DoubleSide,
      })
    );
    const pulseRingMesh = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(1.5, 1.65, 64)),
      pulseRingMat
    );
    pulseRingMesh.rotation.set(Math.PI / 2, 0, 0);
    pulseRingMesh.position.set(0, -1.35, 0);
    gimbalRoot.add(pulseRingMesh);

    // 3. Floating Robotic Cross
    const crossShape = new THREE.Shape();
    const cw = 0.14;
    const cl = 0.42;
    crossShape.moveTo(-cw, cl);
    crossShape.lineTo(cw, cl);
    crossShape.lineTo(cw, cw);
    crossShape.lineTo(cl, cw);
    crossShape.lineTo(cl, -cw);
    crossShape.lineTo(cw, -cw);
    crossShape.lineTo(cw, -cl);
    crossShape.lineTo(-cw, -cl);
    crossShape.lineTo(-cw, -cw);
    crossShape.lineTo(-cl, -cw);
    crossShape.lineTo(-cl, cw);
    crossShape.lineTo(-cw, cw);
    crossShape.closePath();

    const crossGeo = trackGeo(
      new THREE.ExtrudeGeometry(crossShape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 2,
      })
    );
    crossGeo.center();
    const crossMesh = new THREE.Mesh(
      crossGeo,
      trackMat(
        new THREE.MeshPhysicalMaterial({
          color: '#0070F3',
          emissive: '#0EA5E9',
          emissiveIntensity: 0.22,
          roughness: 0.18,
          metalness: 0.65,
          clearcoat: 1,
        })
      )
    );
    crossMesh.position.set(-2.95, 1.35, -0.35);
    scene.add(crossMesh);

    // 4. Floating DNA Helix
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(3.05, 0.2, -0.35);
    dnaGroup.rotation.set(0.15, 0, -0.22);
    scene.add(dnaGroup);

    const turns = 2.4;
    const steps = 42;
    const helixHeight = 2.6;
    const helixRadius = 0.34;
    const ptsA: THREE.Vector3[] = [];
    const ptsB: THREE.Vector3[] = [];
    const rungMatrices: THREE.Matrix4[] = [];

    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const angle = u * Math.PI * 2 * turns;
      const y = (u - 0.5) * helixHeight;
      ptsA.push(new THREE.Vector3(Math.cos(angle) * helixRadius, y, Math.sin(angle) * helixRadius));
      ptsB.push(
        new THREE.Vector3(
          Math.cos(angle + Math.PI) * helixRadius,
          y,
          Math.sin(angle + Math.PI) * helixRadius
        )
      );
      if (i % 3 === 0) {
        _rungPos.set(0, y, 0);
        _rungEuler.set(0, -angle, Math.PI / 2);
        _rungQuat.setFromEuler(_rungEuler);
        _rungMat4.compose(_rungPos, _rungQuat, _rungScale);
        rungMatrices.push(_rungMat4.clone());
      }
    }

    const strandAGeo = trackGeo(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsA), 48, 0.034, 8, false)
    );
    const strandBGeo = trackGeo(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ptsB), 48, 0.034, 8, false)
    );
    const rungGeo = trackGeo(
      new THREE.CylinderGeometry(0.017, 0.017, helixRadius * 1.9, 8)
    );

    dnaGroup.add(
      new THREE.Mesh(
        strandAGeo,
        trackMat(new THREE.MeshStandardMaterial({ color: '#0070F3', roughness: 0.22, metalness: 0.7 }))
      ),
      new THREE.Mesh(
        strandBGeo,
        trackMat(new THREE.MeshStandardMaterial({ color: '#0EA5E9', roughness: 0.22, metalness: 0.7 }))
      )
    );

    const rungsInstanced = new THREE.InstancedMesh(
      rungGeo,
      trackMat(new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25, metalness: 0.6 })),
      rungMatrices.length
    );
    rungMatrices.forEach((m, idx) => rungsInstanced.setMatrixAt(idx, m));
    rungsInstanced.instanceMatrix.needsUpdate = true;
    rungsInstanced.computeBoundingSphere();
    dnaGroup.add(rungsInstanced);

    // 5. 120-Node 3D Heartbeat ECG Waveform
    const ecgSegments = 120;
    const ecgSphereGeo = trackGeo(new THREE.SphereGeometry(0.032, 8, 8));
    const ecgMat = trackMat(
      new THREE.MeshBasicMaterial({ color: '#0070F3', transparent: true, opacity: 0.9 })
    );
    const ecgNodes = new THREE.InstancedMesh(ecgSphereGeo, ecgMat, ecgSegments);
    ecgNodes.frustumCulled = false;
    scene.add(ecgNodes);

    // 6. Floating Ambient Telemetry Particles
    const particleCount = caps.isSoftwareGl ? 42 : 90;
    const particlesData = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 13.0,
      y: (Math.random() - 0.5) * 7.2,
      z: (Math.random() - 0.5) * 5.0 - 1.2,
      speed: 0.25 + Math.random() * 0.45,
      offset: Math.random() * Math.PI * 2,
      scale: 0.036 + Math.random() * 0.034,
    }));
    const particleGeo = trackGeo(new THREE.OctahedronGeometry(1, 0));
    const particleMat = trackMat(
      new THREE.MeshBasicMaterial({ color: '#0070F3', transparent: true, opacity: 0.68 })
    );
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    particleMesh.frustumCulled = false;
    scene.add(particleMesh);

    // Pointer Parallax Input
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.y = -((e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Responsive Resize Observer
    let viewportWidth = initialWidth;
    let viewportHeight = initialHeight;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(Math.round(entry.contentRect.width), 1);
      const h = Math.max(Math.round(entry.contentRect.height), 1);
      viewportWidth = w;
      viewportHeight = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    // THREE.Timer (replaces deprecated THREE.Clock)
    const timer = new THREE.Timer();
    timer.connect(document);

    let disposed = false;
    let rafId = 0;
    let timeoutId = 0;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            timeoutId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timeoutId = window.setTimeout(cb, 80);
          }
        };
        timeoutId = window.setTimeout(poll, 5);
      } else {
        timeoutId = window.setTimeout(cb, 80);
      }
    };

    const tick = (timestamp?: number) => {
      if (disposed) return;

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 0.1);
      const t = timer.getElapsed();
      const activePreset = presetRef.current;

      // Heartbeat & core rotation
      heartGroup.rotation.y += delta * 0.26;
      const cycle = (t * 1.2) % 1;
      const lub = Math.exp(-Math.pow((cycle - 0.16) * 14, 2)) * 0.052;
      const dub = Math.exp(-Math.pow((cycle - 0.34) * 16, 2)) * 0.034;
      const pulse = 1 + lub + dub;
      const targetScale = activePreset === 'cardiac' ? 1.12 * pulse : pulse;
      heartGroup.scale.setScalar(
        THREE.MathUtils.damp(heartGroup.scale.x, targetScale, 8, delta)
      );
      pulseMat.emissiveIntensity = 0.34 + (lub + dub) * 5.2;

      latticeMesh.rotation.y -= delta * 0.14;
      latticeMesh.rotation.z += delta * 0.06;

      // Gimbal rings
      outerGimbalGroup.rotation.z += delta * 0.22;
      outerGimbalGroup.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.4) * 0.12;
      innerRingMesh.rotation.z -= delta * 0.34;
      innerRingMesh.rotation.y = Math.cos(t * 0.35) * 0.28;

      const wave = (t * 0.55) % 1;
      const ringScale = 1 + wave * 0.45;
      pulseRingMesh.scale.set(ringScale, ringScale, 1);
      pulseRingMat.opacity = (1 - wave) * 0.35;

      // Floating cross
      crossMesh.rotation.y += delta * 0.65;
      crossMesh.position.y = 1.45 + Math.sin(t * 1.4) * 0.16;

      // DNA helix
      dnaGroup.rotation.y += delta * 0.55;
      dnaGroup.position.y = 0.25 + Math.cos(t * 1.1) * 0.14;
      const helixScale = activePreset === 'helix' ? 1.28 : 1;
      dnaGroup.scale.setScalar(THREE.MathUtils.damp(dnaGroup.scale.x, helixScale, 6, delta));

      // ECG waveform
      const ecgWidth = 10.6;
      for (let i = 0; i < ecgSegments; i++) {
        const u = i / (ecgSegments - 1);
        const x = (u - 0.5) * ecgWidth;
        const phase = (((u * 2.6 - t * 0.52) % 1) + 1) % 1;

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
        ecgNodes.setMatrixAt(i, _dummy.matrix);
      }
      ecgNodes.instanceMatrix.needsUpdate = true;

      // Floating particles
      for (let i = 0; i < particlesData.length; i++) {
        const p = particlesData[i];
        _dummy.position.set(
          p.x + Math.sin(t * p.speed + p.offset) * 0.26,
          p.y + Math.cos(t * p.speed * 0.9 + p.offset) * 0.28,
          p.z
        );
        _dummy.rotation.set(t * 0.4 + p.offset, t * 0.3, 0);
        _dummy.scale.setScalar(p.scale);
        _dummy.updateMatrix();
        particleMesh.setMatrixAt(i, _dummy.matrix);
      }
      particleMesh.instanceMatrix.needsUpdate = true;

      // Camera parallax & portrait scaling
      const aspect = viewportWidth / Math.max(viewportHeight, 1);
      const portraitBoost = aspect < 0.9 ? (0.9 - aspect) * 4.5 : 0;
      const baseX = activePreset === 'helix' ? 2.05 : activePreset === 'cardiac' ? 0.15 : 0;
      const baseY = activePreset === 'helix' ? 0.22 : activePreset === 'cardiac' ? 0.18 : 0.12;
      const baseZ =
        (activePreset === 'cardiac' ? 4.4 : activePreset === 'helix' ? 5.0 : 5.75) + portraitBoost;

      _targetPos.set(baseX + pointer.x * 0.65, baseY + pointer.y * 0.42, baseZ);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 4.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 4.2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 4.2, delta);

      const targetLookX = activePreset === 'helix' ? 1.95 : 0;
      _lookAtPos.x = THREE.MathUtils.damp(_lookAtPos.x, targetLookX, 4.2, delta);
      camera.lookAt(_lookAtPos);

      renderer.render(scene, camera);

      if (caps.isSoftwareGl) {
        afterDraw(() => {
          rafId = requestAnimationFrame(tick);
        });
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      timer.dispose();
      scene.environment = null;
      envTex.dispose();
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion, caps.supported, caps.isLowPower, caps.isSoftwareGl, contextLost]);

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

        {/* Isolated WebGL Mount Container */}
        <div ref={mountRef} className="relative z-10 h-full w-full" />

        {/* Bottom-Right Unobtrusive Camera Focus Dock */}
        <div className="pointer-events-auto absolute right-4 bottom-4 z-20 hidden items-center gap-1 rounded-xl border border-[#DCE8F7] bg-white/95 p-1 shadow-xl shadow-[#0070F3]/10 sm:right-6 sm:bottom-5 sm:flex">
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
                    ? 'bg-[#0070F3] font-semibold text-white'
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
