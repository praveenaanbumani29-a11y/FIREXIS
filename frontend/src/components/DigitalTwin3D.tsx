import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BuildingData } from '../types';
import { 
  Box, 
  Layers, 
  Eye, 
  RotateCw, 
  Flame, 
  Sliders, 
  Maximize2,
  Compass,
  Zap,
  Info
} from 'lucide-react';

interface DigitalTwin3DProps {
  buildingData: BuildingData;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({ buildingData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'TOP_DOWN' | 'FIRST_PERSON'>('ISOMETRIC');
  const [selectedFloor, setSelectedFloor] = useState<'ALL' | number>('ALL');
  const [floorSeparation, setFloorSeparation] = useState<number>(8); // 8m default vertical separation between floors
  const [showFire, setShowFire] = useState(true);
  const [showAgents, setShowAgents] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const floorGroupsRef = useRef<THREE.Group[]>([]);
  const fireMeshRef = useRef<THREE.Mesh | null>(null);

  // Mouse orbit interaction state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 155, theta: Math.PI / 4, phi: Math.PI / 3 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 580;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A1120'); // Deep Space Architectural Slate
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1E293B, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(60, 120, 80);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0xF4A261, 1.2, 80);
    accentLight.position.set(54, 15, 26);
    scene.add(accentLight);

    // 5. Ground Plane & Grid
    const grid = new THREE.GridHelper(120, 24, 0x38BDF8, 0x1E293B);
    grid.position.set(35, -0.2, 22);
    scene.add(grid);

    // 6. Build Multi-Story Building Geometry
    const floorGroups: THREE.Group[] = [];
    const baseSpacing = 9.0;

    buildingData.floors.forEach((fl, idx) => {
      const floorGroup = new THREE.Group();
      floorGroup.position.y = idx * (baseSpacing + floorSeparation);

      // Floor Slab
      const slabGeo = new THREE.BoxGeometry(fl.width_m, 0.6, fl.length_m);
      const slabMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x1E293B : idx === 1 ? 0x24354D : 0x1A2B42,
        roughness: 0.7,
        metalness: 0.2
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(fl.width_m / 2, 0, fl.length_m / 2);
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // Rooms / Transparent Glass Facades & Walls
      fl.rooms.forEach(r => {
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0x38BDF8,
          transparent: true,
          opacity: 0.35,
          roughness: 0.3,
          metalness: 0.8
        });
        const rGeo = new THREE.BoxGeometry(r.bounds.width, 4.5, r.bounds.height);
        const rMesh = new THREE.Mesh(rGeo, wallMat);
        rMesh.position.set(
          r.bounds.x + r.bounds.width / 2,
          2.5,
          r.bounds.y + r.bounds.height / 2
        );
        rMesh.castShadow = true;
        rMesh.receiveShadow = true;
        floorGroup.add(rMesh);

        // Room Roof Edges
        const edges = new THREE.EdgesGeometry(rGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x60A5FA, linewidth: 1.5 }));
        line.position.copy(rMesh.position);
        floorGroup.add(line);
      });

      // Exits (Glowing Green Portals)
      fl.exits.forEach(ex => {
        const exitGeo = new THREE.BoxGeometry(3.2, 4.8, 1);
        const exitMat = new THREE.MeshStandardMaterial({
          color: ex.is_blocked ? 0xD62828 : 0x2A9D8F,
          emissive: ex.is_blocked ? 0x991B1B : 0x10B981,
          emissiveIntensity: 0.6
        });
        const exMesh = new THREE.Mesh(exitGeo, exitMat);
        exMesh.position.set(ex.position.x, 2.5, ex.position.y);
        floorGroup.add(exMesh);
      });

      // Occupants (Instanced Spheres)
      if (showAgents) {
        const agentGeo = new THREE.SphereGeometry(0.65, 8, 8);
        const agentMat = new THREE.MeshStandardMaterial({
          color: 0xF4A261,
          emissive: 0xE76F51,
          emissiveIntensity: 0.4
        });
        for (let i = 0; i < 24; i++) {
          const agent = new THREE.Mesh(agentGeo, agentMat);
          agent.position.set(
            15 + Math.random() * 40,
            0.8,
            12 + Math.random() * 24
          );
          floorGroup.add(agent);
        }
      }

      floorGroups.push(floorGroup);
      scene.add(floorGroup);
    });

    floorGroupsRef.current = floorGroups;

    // 7. Volumetric Flame Mesh at Fire Seat
    if (showFire) {
      const fireGeo = new THREE.ConeGeometry(3.5, 9, 16);
      const fireMat = new THREE.MeshBasicMaterial({
        color: 0xE76F51,
        transparent: true,
        opacity: 0.9
      });
      const fireMesh = new THREE.Mesh(fireGeo, fireMat);
      fireMesh.position.set(54, 4.5, 26);
      scene.add(fireMesh);
      fireMeshRef.current = fireMesh;
    }

    // 8. Animation & Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Flame flicker animation
      if (fireMeshRef.current) {
        const scaleOsc = 1 + Math.sin(elapsedTime * 6) * 0.15;
        fireMeshRef.current.scale.set(scaleOsc, scaleOsc * 1.1, scaleOsc);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Pointer Event Handlers for Orbiting
    const domElem = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.008;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - dy * 0.008));
      updateCameraPosition();
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(40, Math.min(260, sphericalRef.current.radius + e.deltaY * 0.1));
      updateCameraPosition();
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [buildingData, showFire, showAgents]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const centerX = 35;
    const centerY = selectedFloor === 'ALL' ? (buildingData.floors.length * 4.5) : 3;
    const centerZ = 22;

    cameraRef.current.position.x = centerX + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = centerY + radius * Math.cos(phi);
    cameraRef.current.position.z = centerZ + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(centerX, centerY, centerZ);
  };

  // Update exploded view floor separation and floor isolation
  useEffect(() => {
    const baseSpacing = 9.0;
    floorGroupsRef.current.forEach((grp, idx) => {
      if (selectedFloor === 'ALL') {
        grp.visible = true;
        grp.position.y = idx * (baseSpacing + floorSeparation);
      } else {
        grp.visible = idx === selectedFloor;
        grp.position.y = 0;
      }
    });

    if (fireMeshRef.current) {
      fireMeshRef.current.visible = showFire && (selectedFloor === 'ALL' || selectedFloor === 0);
    }
    updateCameraPosition();
  }, [selectedFloor, floorSeparation, showFire]);

  const handleCameraPreset = (mode: 'ISOMETRIC' | 'TOP_DOWN' | 'FIRST_PERSON') => {
    setCameraMode(mode);
    if (mode === 'TOP_DOWN') {
      sphericalRef.current = { radius: 130, theta: 0, phi: 0.02 };
    } else if (mode === 'FIRST_PERSON') {
      sphericalRef.current = { radius: 45, theta: Math.PI / 6, phi: Math.PI / 2.2 };
    } else {
      sphericalRef.current = { radius: 155, theta: Math.PI / 4, phi: Math.PI / 3 };
    }
    updateCameraPosition();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      
      {/* 3D Digital Twin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', color: 'var(--color-navy-deep)' }}>
              Hardware-Accelerated 3D Digital Twin (Three.js)
            </h1>
            <span className="badge badge-navy">SECTION 19 COMPLIANT</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Interactive WebGL 3D architectural twin of {buildingData.building.name}. Total {buildingData.floors.length} stories loaded. Click & drag to rotate; scroll to zoom.
          </p>
        </div>

        {/* View Preset Controls & Floor Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Floor Isolator */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0E172A',
            border: '1px solid #334155',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setSelectedFloor('ALL')}
              style={{
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: selectedFloor === 'ALL' ? 'var(--color-primary-orange)' : 'transparent',
                color: selectedFloor === 'ALL' ? '#FFFFFF' : '#94A3B8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All {buildingData.floors.length} Stories
            </button>
            {buildingData.floors.map((fl, idx) => (
              <button
                key={fl.id || idx}
                onClick={() => setSelectedFloor(idx)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: selectedFloor === idx ? 'var(--color-primary-orange)' : 'transparent',
                  color: selectedFloor === idx ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  borderLeft: '1px solid #1E293B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Lvl {fl.floor_number ?? idx}
              </button>
            ))}
          </div>

          {/* Camera Presets */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0E172A',
            border: '1px solid #334155',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {(['ISOMETRIC', 'TOP_DOWN', 'FIRST_PERSON'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleCameraPreset(mode)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: cameraMode === mode ? '#2563EB' : 'transparent',
                  color: cameraMode === mode ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {mode === 'ISOMETRIC' ? 'Isometric 3D' : mode === 'TOP_DOWN' ? 'Top-Down Ortho' : 'Egress Perspective'}
              </button>
            ))}
          </div>

          {/* Flame Volume Toggle */}
          <button
            onClick={() => setShowFire(!showFire)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: showFire ? 'var(--color-safety-orange)' : '#0E172A',
              color: showFire ? '#FFFFFF' : '#94A3B8',
              border: showFire ? '1px solid var(--color-safety-orange)' : '1px solid #334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Flame size={14} color={showFire ? '#FFFFFF' : '#FF6B35'} />
            {showFire ? 'Hide Flame Volume' : 'Show Flame Volume'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with Vertical Separation Slider */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
        
        {/* Three.js Canvas Container */}
        <div ref={mountRef} style={{ width: '100%', height: '580px', cursor: 'grab' }} />

        {/* Top Exploded View Floor Slicing Floating Slider */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'rgba(14, 27, 45, 0.85)',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '8px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '240px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>{selectedFloor === 'ALL' ? 'Exploded Floor View' : `Level ${selectedFloor} Isolated`}</span>
            <span style={{ color: 'var(--color-primary-orange)' }}>
              {selectedFloor === 'ALL' ? `+${floorSeparation}m` : 'Active'}
            </span>
          </div>
          {selectedFloor === 'ALL' ? (
            <>
              <input
                type="range"
                min="0"
                max="25"
                value={floorSeparation}
                onChange={(e) => setFloorSeparation(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary-orange)' }}
              />
              <div style={{ fontSize: '10px', color: '#90A4AE', display: 'flex', justifyContent: 'space-between' }}>
                <span>Compact (0m)</span>
                <span>Exploded (25m)</span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Viewing single story in isolation. Select &quot;All Stories&quot; to expand multi-deck view.
            </div>
          )}
        </div>

        {/* Bottom Floating Telemetry Bar */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(14, 27, 45, 0.88)',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: '8px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          gap: '28px',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ color: '#90A4AE', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>3D WebGL Engine</div>
            <div style={{ fontWeight: 700, color: 'var(--color-safe-green)' }}>Three.js PCFSoft Shadows</div>
          </div>
          <div>
            <div style={{ color: '#90A4AE', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Stories Loaded</div>
            <div style={{ fontWeight: 700, color: '#38BDF8' }}>
              {selectedFloor === 'ALL' 
                ? `All ${buildingData.floors.length} Floors (3D Multi-Deck)` 
                : `Isolated: ${buildingData.floors[selectedFloor]?.name?.split('—')[0] || `Floor ${selectedFloor}`}`}
            </div>
          </div>
          <div>
            <div style={{ color: '#90A4AE', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Incident Zone</div>
            <div style={{ fontWeight: 700, color: 'var(--color-safety-orange)' }}>Server Hub (rm-g05)</div>
          </div>
          <div>
            <div style={{ color: '#90A4AE', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Interaction</div>
            <div style={{ fontWeight: 600 }}>Drag to Orbit | Scroll to Zoom</div>
          </div>
        </div>

      </div>
    </div>
  );
};
