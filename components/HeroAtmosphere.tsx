'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * A soft, slowly drifting warm light on the paper — Rowan's amber fog,
 * kept in the site's own tones so the type stays the hero.
 * Leans gently toward the pointer. Only renders while the hero is on screen.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uPointer;   // 0..1, eased
  uniform float uAspect;
  uniform float uReveal;    // 0 → 1 fade in
  uniform vec3  uPaper;
  uniform vec3  uWarm;
  uniform vec3  uDeep;

  // value noise + fbm
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + 17.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
    float t = uTime * 0.035;

    // domain-warped fog
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 4.0));
    float fog = fbm(p * 1.1 + q * 1.6 + vec2(t * 0.6, -t * 0.4));

    // a broad light pool that drifts and leans toward the pointer
    vec2 drift = vec2(sin(t * 2.1) * 0.18, cos(t * 1.7) * 0.10);
    vec2 lean  = (uPointer - 0.5) * vec2(uAspect, 1.0) * 0.22;
    float pool = smoothstep(0.95, 0.0, length(p - drift - lean));

    float warm = clamp(pool * 0.75 + (fog - 0.45) * 0.9, 0.0, 1.0);
    vec3 col = mix(uPaper, uWarm, warm * 0.85);
    col = mix(col, uDeep, smoothstep(0.62, 1.0, fog) * pool * 0.35);

    // keep the edges quiet so the header/footer labels sit on plain paper
    float vignette = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
    col = mix(uPaper, col, vignette * uReveal);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function Fog({ still }: { still: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const target = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(() => ({
    uTime: { value: still ? 40 : 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uReveal: { value: still ? 1 : 0 },
    uPaper: { value: new THREE.Color('#EEEAE3').convertLinearToSRGB() },
    uWarm: { value: new THREE.Color('#E4CFB3').convertLinearToSRGB() },
    uDeep: { value: new THREE.Color('#D6B892').convertLinearToSRGB() },
  }), [still]);

  useEffect(() => {
    const move = (e: PointerEvent) => target.current.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(({ size }, delta) => {
    const u = mat.current!.uniforms;
    u.uAspect.value = size.width / size.height;
    if (still) return;
    u.uTime.value += delta;
    u.uReveal.value = Math.min(1, u.uReveal.value + delta * 0.4);
    u.uPointer.value.lerp(target.current, 1 - Math.exp(-delta * 1.5));
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export default function HeroAtmosphere() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [still] = useState(prefersReducedMotion);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(wrap.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero__atmosphere">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        frameloop={still ? 'demand' : visible ? 'always' : 'never'}
        flat
        linear
      >
        <Fog still={still} />
      </Canvas>
    </div>
  );
}
