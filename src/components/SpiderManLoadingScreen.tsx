/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CINEFREE_LOGO_URL, OXA_LOGO_URL } from './Navbar';

interface SpiderManLoadingScreenProps {
  onComplete: () => void;
}

export const SpiderManLoadingScreen: React.FC<SpiderManLoadingScreenProps> = ({ onComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Spider-Man 3D Sequence...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.08);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.8);
    camera.lookAt(0, 0.8, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Red & Blue Spider-Man Accent Rim Lights
    const redLight = new THREE.PointLight(0xe50914, 4, 15);
    redLight.position.set(-4, 2, 2);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x2563eb, 4, 15);
    blueLight.position.set(4, 2, 2);
    scene.add(blueLight);

    // 5. Stylized Ground Grid / Web Matrix
    const gridHelper = new THREE.GridHelper(20, 20, 0x2563eb, 0x1e293b);
    gridHelper.position.y = -0.65;
    scene.add(gridHelper);

    // 6. GLTF Model Loader
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Group | null = null;
    let animationAction: THREE.AnimationAction | null = null;
    let animDuration = 2.43;

    const startX = -5.8;
    const endX = 5.8;

    setStatusText('Summoning Spider-Man...');

    // Load from local public folder with fallback to raw GitHub
    const glbUrl = '/spiderman.glb';

    loader.load(
      glbUrl,
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(startX, -0.6, 0);
        // Face towards positive X direction (running left to right)
        model.rotation.y = Math.PI / 2;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Setup Mixamo running to rolling animation
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const clip = gltf.animations[0];
          animDuration = clip.duration || 2.43;

          animationAction = mixer.clipAction(clip);
          animationAction.setLoop(THREE.LoopOnce, 1);
          animationAction.clampWhenFinished = true;
          animationAction.play();
        }

        setStatusText('Spider-Man is Rolling In...');
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 60);
          setProgress((prev) => Math.max(prev, pct));
        }
      },
      (err) => {
        console.warn('Failed loading local GLB, falling back:', err);
        // Fallback gracefully if GLB load encounters issue
        triggerCompletion();
      }
    );

    // Finish handler with smooth fade
    const triggerCompletion = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(100);
      setStatusText('Welcome to CineFree!');
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 600);
    };

    // 7. Render & Animation Loop
    const clock = new THREE.Clock();
    let elapsedRunTime = 0;
    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
        elapsedRunTime += delta;

        // Calculate progress ratio (0 to 1) based on animation duration
        const ratio = Math.min(1, elapsedRunTime / animDuration);
        setProgress(Math.round(60 + ratio * 40));

        // Move Spider-Man smoothly from Left to Right
        if (model) {
          model.position.x = startX + (endX - startX) * ratio;
        }

        // When Spider-Man finishes rolling and crosses the screen, complete
        if (ratio >= 1 && !completedRef.current) {
          triggerCompletion();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Fallback safety timeout (maximum 5 seconds in case animation fails)
    const safetyTimer = setTimeout(() => {
      if (!completedRef.current) {
        triggerCompletion();
      }
    }, 5000);

    return () => {
      clearTimeout(safetyTimer);
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#050811] text-white select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />

      {/* Top Header Branding Overlay */}
      <header className="relative z-10 w-full max-w-6xl mx-auto p-6 sm:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/20 shadow-2xl">
            <img src={CINEFREE_LOGO_URL} alt="CineFree Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white uppercase">
              CINE<span className="text-blue-500">FREE</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              POWERED BY OXA STUDIOS
            </span>
          </div>
        </div>

        {/* Skip Intro Button */}
        <button
          onClick={() => {
            if (!completedRef.current) {
              completedRef.current = true;
              setIsFadingOut(true);
              setTimeout(onComplete, 400);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Bottom Cinematic Loader Overlay */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 pb-12 flex flex-col items-center text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{statusText}</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 rounded-full bg-white/10 border border-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-blue-600 to-indigo-500 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(37,99,235,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
            <span>Rolling 3D Experience</span>
            <span className="text-blue-400">{progress}%</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 max-w-xs">
          Loading 10,000+ movies & TV shows with high-speed streaming architecture.
        </p>
      </div>
    </div>
  );
};
