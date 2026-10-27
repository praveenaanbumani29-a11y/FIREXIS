import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import type { BuildingData } from '../types';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Flame, 
  Maximize2,
  RefreshCw,
  Check,
  PenTool,
  Sliders,
  Sparkles,
  ShieldCheck,
  Building2,
  Eye,
  Users
} from 'lucide-react';

interface DigitalTwin3DProps {
  buildingData: BuildingData;
  onOpenCAD?: () => void;
}

// Helper to generate floating billboard text badges for rooms and features
function makeTextSprite(title: string, subtitle?: string, bgColor = 'rgba(10, 25, 47, 0.90)', borderColor = '#38BDF8') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = subtitle ? 160 : 110;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  // Rounded background badge
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, subtitle ? 144 : 94, 16);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Title text
  ctx.font = 'bold 32px Inter, Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const displayTitle = title.length > 24 ? title.slice(0, 22) + '...' : title;
  ctx.fillText(displayTitle, 256, subtitle ? 48 : 55);

  // Subtitle text (area, capacity, status)
  if (subtitle) {
    ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(subtitle, 256, 104);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(subtitle ? 12 : 10, subtitle ? 3.75 : 2.5, 1);
  return sprite;
}

export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({ buildingData, onOpenCAD }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'TOP_DOWN' | 'FIRST_PERSON'>('ISOMETRIC');
  const [selectedFloor, setSelectedFloor] = useState<'ALL' | number>('ALL');
  const [floorSeparation, setFloorSeparation] = useState<number>(8); // 8m vertical spacing between floors
  const [showFire, setShowFire] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  
  // Sync state
  const [syncKey, setSyncKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const floorGroupsRef = useRef<THREE.Group[]>([]);
  const fireMeshRef = useRef<THREE.Mesh | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);

  // Mouse orbit & pan interaction state
  const isDraggingRef = useRef(false);
  const isRightDragRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 155, theta: Math.PI / 4, phi: Math.PI / 3 });
  const panOffsetRef = useRef({ x: 0, y: 0, z: 0 });

  // Dynamic building dimensions from CAD data
  const buildingWidth = buildingData.floors[0]?.width_m || 70.0;
  const buildingLength = buildingData.floors[0]?.length_m || 45.0;
  const totalFloors = buildingData.floors.length;
  const totalRooms = buildingData.floors.reduce((acc, f) => acc + f.rooms.length, 0);
  const totalExits = buildingData.floors.reduce((acc, f) => acc + f.exits.length, 0);
  const totalDoors = buildingData.floors.reduce((acc, f) => acc + (f.doors?.length || 0), 0);
  const totalStairs = buildingData.floors.reduce((acc, f) => acc + (f.staircases?.length || 0), 0);
  const fireOrigin = buildingData.scenario?.fire_origin || { x: 52, y: 26 };

  // Deep fingerprint of CAD design to trigger automatic 3D update on any 2D change
  const cadDesignHash = useMemo(() => {
    return JSON.stringify({
      bName: buildingData.building.name,
      floors: buildingData.floors.map(f => ({
        id: f.id,
        w: f.width_m,
        l: f.length_m,
        rooms: f.rooms.map(r => `${r.id}_${r.name}_${r.bounds.x}_${r.bounds.y}_${r.bounds.width}_${r.bounds.height}_${r.occupant_load}`),
        doors: f.doors?.map(d => `${d.id}_${d.position.x}_${d.position.y}`),
        exits: f.exits?.map(e => `${e.id}_${e.position.x}_${e.position.y}_${e.is_blocked}`),
        stairs: f.staircases?.map(s => `${s.id}_${s.position.x}_${s.position.y}`),
        eq: f.equipment?.map(eq => `${eq.id}_${eq.position.x}_${eq.position.y}`),
        cor: f.corridors?.map(c => `${c.id}_${c.position.x}_${c.position.y}`)
      }))
    });
  }, [buildingData]);

  // Update camera target dynamically based on building bounds and pan offset
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const centerX = (buildingWidth / 2) + panOffsetRef.current.x;
    const centerY = (selectedFloor === 'ALL' ? (totalFloors * 4.0) : 3.0) + panOffsetRef.current.y;
    const centerZ = (buildingLength / 2) + panOffsetRef.current.z;

    cameraRef.current.position.x = centerX + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = centerY + radius * Math.cos(phi);
    cameraRef.current.position.z = centerZ + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(centerX, centerY, centerZ);
  };

  // Explicit Update from 2D CAD Action
  const handleSyncFromCad = () => {
    setIsSyncing(true);
    setSyncKey(k => k + 1);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncTime(timeStr);
    setSyncMessage(`3D Digital Twin updated successfully from 2D CAD! Synchronized ${totalFloors} floors, ${totalRooms} rooms, ${totalDoors} doors, and ${totalExits} exits.`);
    setSyncToast(true);
    setTimeout(() => setIsSyncing(false), 600);
    setTimeout(() => setSyncToast(false), 4500);
  };

  // 3D Scene Initialization & Rebuilding
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = 620;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080D1A'); // Deep space dark blueprint
    scene.fog = new THREE.FogExp2('#080D1A', 0.0035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1200);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x94A3B8, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x0F172A, 0.6);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.1);
    sunLight.position.set(80, 160, 90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Dynamic Point Light for Fire Seat
    const fireOrigin = buildingData.scenario?.fire_origin || { x: 52, y: 26 };
    const fireLight = new THREE.PointLight(0xFF6B35, 1.8, 80);
    fireLight.position.set(fireOrigin.x, 6, fireOrigin.y);
    scene.add(fireLight);

    // 5. Infinite Tactical Grid Plane
    const grid = new THREE.GridHelper(160, 32, 0x38BDF8, 0x1E293B);
    grid.position.set(buildingWidth / 2, -0.3, buildingLength / 2);
    scene.add(grid);

    // 6. Build Multi-Story Building 1:1 from 2D CAD Layout
    const floorGroups: THREE.Group[] = [];
    const baseSpacing = 9.0;

    buildingData.floors.forEach((fl, floorIdx) => {
      const floorGroup = new THREE.Group();
      floorGroup.position.y = floorIdx * (baseSpacing + floorSeparation);

      const fWidth = fl.width_m || buildingWidth;
      const fLength = fl.length_m || buildingLength;

      // A. Building Floor Slab
      const slabGeo = new THREE.BoxGeometry(fWidth, 0.7, fLength);
      const slabMat = new THREE.MeshStandardMaterial({
        color: floorIdx === 0 ? 0x0F172A : floorIdx === 1 ? 0x16233B : 0x1E293B,
        roughness: 0.8,
        metalness: 0.2
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(fWidth / 2, 0, fLength / 2);
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // Floor Slab Glowing Architectural Perimeter Trim
      const slabEdges = new THREE.EdgesGeometry(slabGeo);
      const slabBorder = new THREE.LineSegments(
        slabEdges,
        new THREE.LineBasicMaterial({ color: 0x38BDF8, linewidth: 2 })
      );
      slabBorder.position.copy(slab.position);
      floorGroup.add(slabBorder);

      // Structural Columns at Perimeter & Grid Intervals
      const colHeight = 4.2;
      const colGeo = new THREE.BoxGeometry(0.8, colHeight, 0.8);
      const colMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.5 });
      const colPositions = [
        { x: 1, z: 1 },
        { x: fWidth - 1, z: 1 },
        { x: 1, z: fLength - 1 },
        { x: fWidth - 1, z: fLength - 1 },
        { x: fWidth / 2, z: 1 },
        { x: fWidth / 2, z: fLength - 1 },
        { x: 1, z: fLength / 2 },
        { x: fWidth - 1, z: fLength / 2 }
      ];
      colPositions.forEach(cp => {
        const colMesh = new THREE.Mesh(colGeo, colMat);
        colMesh.position.set(cp.x, colHeight / 2, cp.z);
        floorGroup.add(colMesh);
      });

      // B. Corridors / Walkway Spines (matching 2D CAD corridors)
      fl.corridors?.forEach(cor => {
        const corPadGeo = new THREE.BoxGeometry(fWidth * 0.75, 0.04, 4.0);
        const corPadMat = new THREE.MeshStandardMaterial({
          color: 0x0E2A47,
          roughness: 0.4,
          metalness: 0.3
        });
        const corPad = new THREE.Mesh(corPadGeo, corPadMat);
        corPad.position.set(cor.position.x || fWidth / 2, 0.38, cor.position.y || fLength / 2);
        floorGroup.add(corPad);

        // Dashed Centerline on Corridor Floor
        const lineGeo = new THREE.BoxGeometry(fWidth * 0.72, 0.05, 0.2);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xF4A261 });
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.position.set(cor.position.x || fWidth / 2, 0.40, cor.position.y || fLength / 2);
        floorGroup.add(lineMesh);
      });

      // C. Rooms - True 1:1 Open Architectural Model Matching 2D CAD
      fl.rooms.forEach(room => {
        const rx = room.bounds.x;
        const ry = room.bounds.y;
        const rw = room.bounds.width;
        const rh = room.bounds.height;
        const wallH = 3.4;
        const wallThick = 0.24;

        // 1. Room Floor Plate (Color-coded by room zone)
        let roomColor = 0x162A45;
        if (room.name.toLowerCase().includes('reception') || room.name.toLowerCase().includes('atrium') || room.name.toLowerCase().includes('lobby')) {
          roomColor = 0x1E3A5F;
        } else if (room.name.toLowerCase().includes('server') || room.name.toLowerCase().includes('data') || room.name.toLowerCase().includes('hub')) {
          roomColor = 0x0F4C5C;
        } else if (room.name.toLowerCase().includes('auditorium') || room.name.toLowerCase().includes('conference') || room.name.toLowerCase().includes('boardroom')) {
          roomColor = 0x3D2645;
        } else if (room.name.toLowerCase().includes('lab') || room.name.toLowerCase().includes('engineering')) {
          roomColor = 0x0E443A;
        } else if (room.name.toLowerCase().includes('cafeteria') || room.name.toLowerCase().includes('dining')) {
          roomColor = 0x3E2723;
        }

        const floorPlateGeo = new THREE.BoxGeometry(rw, 0.06, rh);
        const floorPlateMat = new THREE.MeshStandardMaterial({
          color: roomColor,
          roughness: 0.6,
          metalness: 0.2
        });
        const floorPlate = new THREE.Mesh(floorPlateGeo, floorPlateMat);
        floorPlate.position.set(rx + rw / 2, 0.38, ry + rh / 2);
        floorPlate.receiveShadow = true;
        floorGroup.add(floorPlate);

        // 2. Room Perimeter Walls (Open-top cutaway so inside is visible!)
        const wallMat = new THREE.MeshStandardMaterial({
          color: 0x38BDF8,
          transparent: true,
          opacity: showWireframe ? 0.2 : 0.48,
          roughness: 0.25,
          metalness: 0.5,
          wireframe: showWireframe
        });

        // North Wall
        const nWallGeo = new THREE.BoxGeometry(rw, wallH, wallThick);
        const nWall = new THREE.Mesh(nWallGeo, wallMat);
        nWall.position.set(rx + rw / 2, wallH / 2 + 0.35, ry + wallThick / 2);
        floorGroup.add(nWall);

        // South Wall
        const sWallGeo = new THREE.BoxGeometry(rw, wallH, wallThick);
        const sWall = new THREE.Mesh(sWallGeo, wallMat);
        sWall.position.set(rx + rw / 2, wallH / 2 + 0.35, ry + rh - wallThick / 2);
        floorGroup.add(sWall);

        // West Wall
        const wWallGeo = new THREE.BoxGeometry(wallThick, wallH, rh);
        const wWall = new THREE.Mesh(wWallGeo, wallMat);
        wWall.position.set(rx + wallThick / 2, wallH / 2 + 0.35, ry + rh / 2);
        floorGroup.add(wWall);

        // East Wall
        const eWallGeo = new THREE.BoxGeometry(wallThick, wallH, rh);
        const eWall = new THREE.Mesh(eWallGeo, wallMat);
        eWall.position.set(rx + rw - wallThick / 2, wallH / 2 + 0.35, ry + rh / 2);
        floorGroup.add(eWall);

        // Glowing Top Rails around Room Walls
        const topTrimMat = new THREE.LineBasicMaterial({ color: 0x60A5FA, linewidth: 2 });
        const topPoints = [
          new THREE.Vector3(rx, wallH + 0.35, ry),
          new THREE.Vector3(rx + rw, wallH + 0.35, ry),
          new THREE.Vector3(rx + rw, wallH + 0.35, ry + rh),
          new THREE.Vector3(rx, wallH + 0.35, ry + rh),
          new THREE.Vector3(rx, wallH + 0.35, ry)
        ];
        const topTrimGeo = new THREE.BufferGeometry().setFromPoints(topPoints);
        const topTrim = new THREE.Line(topTrimGeo, topTrimMat);
        floorGroup.add(topTrim);

        // 3. Floating 3D Room Name & Metadata Badge
        if (showLabels) {
          const areaSqm = rw * rh;
          const occCount = room.occupant_load || Math.round(areaSqm / 5);
          const badge = makeTextSprite(room.name, `${rw}m × ${rh}m (${areaSqm}m²) • ${occCount} Occ`);
          badge.position.set(rx + rw / 2, wallH + 2.2, ry + rh / 2);
          floorGroup.add(badge);
        }

        // 4. Occupants / Evacuation Agents inside the room
        if (showAgents) {
          const agentGeo = new THREE.SphereGeometry(0.55, 12, 12);
          const agentMat = new THREE.MeshStandardMaterial({
            color: 0xF4A261,
            emissive: 0xE76F51,
            emissiveIntensity: 0.45,
            roughness: 0.3
          });

          const count = Math.min(8, Math.max(1, Math.round((room.occupant_load || 15) / 5)));
          for (let i = 0; i < count; i++) {
            const agent = new THREE.Mesh(agentGeo, agentMat);
            const margin = 1.2;
            const xRange = Math.max(1, rw - margin * 2);
            const zRange = Math.max(1, rh - margin * 2);
            const px = rx + margin + (i + 0.5) * (xRange / count);
            const pz = ry + margin + ((i * 37) % 10) / 10 * zRange;
            agent.position.set(px, 0.9, pz);
            agent.castShadow = true;
            floorGroup.add(agent);
          }
        }
      });

      // D. Doors (3D Illuminated Portals matching 2D CAD Doors)
      fl.doors?.forEach(door => {
        const dx = door.position.x;
        const dy = door.position.y;
        const dw = door.width_m || 1.6;

        // Door Threshold Plate
        const threshGeo = new THREE.BoxGeometry(dw, 0.08, 0.8);
        const threshMat = new THREE.MeshStandardMaterial({
          color: 0x14B8A6,
          emissive: 0x0D9488,
          emissiveIntensity: 0.6
        });
        const threshMesh = new THREE.Mesh(threshGeo, threshMat);
        threshMesh.position.set(dx, 0.4, dy);
        floorGroup.add(threshMesh);

        // Door Posts
        const postGeo = new THREE.BoxGeometry(0.18, 3.2, 0.18);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x2A9D8F, roughness: 0.3 });
        
        const leftPost = new THREE.Mesh(postGeo, postMat);
        leftPost.position.set(dx - dw / 2, 1.8, dy);
        floorGroup.add(leftPost);

        const rightPost = new THREE.Mesh(postGeo, postMat);
        rightPost.position.set(dx + dw / 2, 1.8, dy);
        floorGroup.add(rightPost);

        // Door Header Beam
        const headGeo = new THREE.BoxGeometry(dw + 0.2, 0.22, 0.18);
        const headMesh = new THREE.Mesh(headGeo, postMat);
        headMesh.position.set(dx, 3.3, dy);
        floorGroup.add(headMesh);
      });

      // E. Stairwells - Multi-Story Structural Egress Cores
      fl.staircases?.forEach(stair => {
        const sx = stair.position.x;
        const sy = stair.position.y;
        const stairSize = 4.2;
        const stairH = 4.4;

        // Stairwell Transparent Casing
        const coreGeo = new THREE.BoxGeometry(stairSize, stairH, stairSize);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x1E3A8A,
          transparent: true,
          opacity: 0.6,
          roughness: 0.3
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(sx, stairH / 2 + 0.35, sy);
        floorGroup.add(coreMesh);

        // Core Edge Frame
        const coreEdges = new THREE.EdgesGeometry(coreGeo);
        const coreLine = new THREE.LineSegments(coreEdges, new THREE.LineBasicMaterial({ color: 0x38BDF8, linewidth: 2 }));
        coreLine.position.copy(coreMesh.position);
        floorGroup.add(coreLine);

        // Visible Interior Stair Steps
        const numSteps = 7;
        for (let s = 0; s < numSteps; s++) {
          const stepGeo = new THREE.BoxGeometry(stairSize * 0.8, 0.2, (stairSize * 0.8) / numSteps);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0x60A5FA });
          const stepMesh = new THREE.Mesh(stepGeo, stepMat);
          stepMesh.position.set(
            sx,
            0.5 + s * (stairH / (numSteps + 1)),
            sy - (stairSize * 0.4) + s * ((stairSize * 0.8) / numSteps)
          );
          floorGroup.add(stepMesh);
        }

        if (showLabels) {
          const stairLabel = makeTextSprite('STAIRWELL CORE', 'Vertical Egress', 'rgba(15, 23, 42, 0.95)', '#38BDF8');
          stairLabel.position.set(sx, stairH + 1.8, sy);
          floorGroup.add(stairLabel);
        }
      });

      // F. Emergency Exits - Illuminated Green Exterior Portals
      fl.exits.forEach(exit => {
        const ex = exit.position.x;
        const ey = exit.position.y;
        const exitColor = exit.is_blocked ? 0xEF4444 : 0x10B981;

        // Exit Threshold & Doorway
        const exitPortalGeo = new THREE.BoxGeometry(3.6, 4.0, 1.2);
        const exitPortalMat = new THREE.MeshStandardMaterial({
          color: exitColor,
          emissive: exitColor,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.85
        });
        const portal = new THREE.Mesh(exitPortalGeo, exitPortalMat);
        portal.position.set(ex, 2.2, ey);
        floorGroup.add(portal);

        // Exit Sign Badge
        if (showLabels) {
          const exitBadge = makeTextSprite(
            exit.is_blocked ? 'BLOCKED EXIT' : 'EMERGENCY EXIT', 
            exit.name || 'Egress Door',
            exit.is_blocked ? 'rgba(127, 29, 29, 0.95)' : 'rgba(6, 78, 59, 0.95)',
            exit.is_blocked ? '#F87171' : '#34D399'
          );
          exitBadge.position.set(ex, 5.0, ey);
          floorGroup.add(exitBadge);
        }
      });

      // G. Safety Equipment - Extinguishers
      fl.equipment?.forEach(eq => {
        if (eq.equipment_type.includes('EXTINGUISHER')) {
          const extGroup = new THREE.Group();
          extGroup.position.set(eq.position.x, 1.3, eq.position.y);

          // Red Cylinder Body
          const cylGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
          const cylMat = new THREE.MeshStandardMaterial({
            color: 0xEF4444,
            emissive: 0xDC2626,
            emissiveIntensity: 0.5,
            metalness: 0.4
          });
          const cyl = new THREE.Mesh(cylGeo, cylMat);
          extGroup.add(cyl);

          // Top Valve
          const valveGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8);
          const valveMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.8 });
          const valve = new THREE.Mesh(valveGeo, valveMat);
          valve.position.y = 0.7;
          extGroup.add(valve);

          floorGroup.add(extGroup);
        }
      });

      floorGroups.push(floorGroup);
      scene.add(floorGroup);
    });

    floorGroupsRef.current = floorGroups;

    // 7. Volumetric Flame Hazard at Origin
    if (showFire) {
      const fireOrigin = buildingData.scenario?.fire_origin || { x: 52, y: 26 };
      
      const fireGeo = new THREE.ConeGeometry(3.8, 9.5, 16);
      const fireMat = new THREE.MeshBasicMaterial({
        color: 0xFF6B35,
        transparent: true,
        opacity: 0.92
      });
      const fireMesh = new THREE.Mesh(fireGeo, fireMat);
      fireMesh.position.set(fireOrigin.x, 5.0, fireOrigin.y);
      scene.add(fireMesh);
      fireMeshRef.current = fireMesh;

      // Inner Core Flame
      const innerFlameGeo = new THREE.ConeGeometry(2.0, 7.0, 12);
      const innerFlameMat = new THREE.MeshBasicMaterial({
        color: 0xFDE047,
        transparent: true,
        opacity: 0.95
      });
      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
      innerFlame.position.set(fireOrigin.x, 4.0, fireOrigin.y);
      scene.add(innerFlame);

      // Smoke Particle Cloud
      const particleCount = 60;
      const smokeGeo = new THREE.BufferGeometry();
      const smokePositions = new Float32Array(particleCount * 3);
      for (let p = 0; p < particleCount; p++) {
        smokePositions[p * 3] = fireOrigin.x + (Math.random() - 0.5) * 6;
        smokePositions[p * 3 + 1] = 7 + Math.random() * 12;
        smokePositions[p * 3 + 2] = fireOrigin.y + (Math.random() - 0.5) * 6;
      }
      smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
      const smokeMat = new THREE.PointsMaterial({
        color: 0x64748B,
        size: 2.5,
        transparent: true,
        opacity: 0.6
      });
      const smokePoints = new THREE.Points(smokeGeo, smokeMat);
      scene.add(smokePoints);
      smokeParticlesRef.current = smokePoints;
    }

    // 8. Animation & Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Flame Flicker Motion
      if (fireMeshRef.current) {
        const scaleOsc = 1 + Math.sin(elapsedTime * 8) * 0.12;
        fireMeshRef.current.scale.set(scaleOsc, scaleOsc * 1.08, scaleOsc);
      }

      // Smoke Ascending Motion
      if (smokeParticlesRef.current) {
        const posAttr = smokeParticlesRef.current.geometry.attributes.position;
        const array = posAttr.array as Float32Array;
        for (let i = 1; i < array.length; i += 3) {
          array[i] += 0.08;
          if (array[i] > 20) array[i] = 7.0;
        }
        posAttr.needsUpdate = true;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Pointer Interaction Handlers
    const domElem = renderer.domElement;
    
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      isRightDragRef.current = e.button === 2; // Right click for panning
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (isRightDragRef.current || e.shiftKey) {
        // Pan
        panOffsetRef.current.x -= dx * 0.1;
        panOffsetRef.current.z -= dy * 0.1;
      } else {
        // Orbit
        sphericalRef.current.theta -= dx * 0.008;
        sphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - dy * 0.008));
      }
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      isRightDragRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(35, Math.min(300, sphericalRef.current.radius + e.deltaY * 0.12));
      updateCameraPosition();
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('contextmenu', onContextMenu);

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('contextmenu', onContextMenu);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [buildingData, cadDesignHash, showFire, showAgents, showLabels, showWireframe, syncKey]);

  // Handle Exploded View & Floor Isolation
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

  // Camera Presets Handler
  const handleCameraPreset = (mode: 'ISOMETRIC' | 'TOP_DOWN' | 'FIRST_PERSON') => {
    setCameraMode(mode);
    panOffsetRef.current = { x: 0, y: 0, z: 0 };
    if (mode === 'TOP_DOWN') {
      // Direct Top-Down CAD Perspective
      sphericalRef.current = { radius: 110, theta: 0, phi: 0.01 };
    } else if (mode === 'FIRST_PERSON') {
      // Eye-level view inside the facility
      sphericalRef.current = { radius: 38, theta: Math.PI / 6, phi: Math.PI / 2.1 };
    } else {
      // Cinematic 3D Isometric View
      sphericalRef.current = { radius: 155, theta: Math.PI / 4, phi: Math.PI / 3 };
    }
    updateCameraPosition();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      
      {/* Top Header & Contextual Status */}
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
            <span className="badge badge-navy">1:1 CAD SYNCHRONIZED</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Multi-story WebGL architectural simulation of {buildingData.building.name}. {totalFloors} stories, {totalRooms} zones, {totalDoors} doors, and {totalExits} exits synchronized with 2D CAD.
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* PRIMARY: Update 3D from 2D CAD Action Button */}
          <button
            id="btn-update-3d-from-cad"
            onClick={handleSyncFromCad}
            disabled={isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 800,
              backgroundColor: isSyncing ? 'rgba(56, 189, 248, 0.3)' : 'var(--color-primary-orange)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(255, 107, 53, 0.45)',
              transition: 'all 0.15s ease'
            }}
            title="Update and reload the 3D digital twin to reflect any changes made in 2D CAD"
          >
            <RefreshCw size={15} style={{ animation: isSyncing ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>{isSyncing ? 'Synchronizing 3D Model...' : 'Update 3D from 2D CAD'}</span>
          </button>

          {/* Jump to 2D CAD Editor */}
          {onOpenCAD && (
            <button
              onClick={onOpenCAD}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: '#0E172A',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Switch to 2D Architectural CAD to modify floor layouts, walls, and zones"
            >
              <PenTool size={14} />
              <span>Edit in 2D CAD</span>
            </button>
          )}

          {/* Story Isolator */}
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
              All {totalFloors} Stories
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
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: cameraMode === mode ? '#2563EB' : 'transparent',
                  color: '#FFFFFF',
                  border: 'none',
                  borderLeft: mode !== 'ISOMETRIC' ? '1px solid #1E293B' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {mode === 'ISOMETRIC' ? '3D Isometric' : mode === 'TOP_DOWN' ? 'Top-Down CAD' : 'First Person'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time 2D-to-3D Synchronization Banner */}
      <div style={{
        marginBottom: '14px',
        padding: '10px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
            color: '#34D399',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            padding: '3px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>LIVE CAD SYNC ACTIVE</span>
          </div>
          <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
            Source: <strong style={{ color: '#F8FAFC' }}>{buildingData.building.name}</strong> • Dimensions: <strong style={{ color: '#38BDF8' }}>{buildingWidth}m × {buildingLength}m</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
          <span>ZONES: <strong style={{ color: '#F8FAFC' }}>{totalRooms}</strong></span>
          <span>DOORS: <strong style={{ color: '#F8FAFC' }}>{totalDoors}</strong></span>
          <span>EXITS: <strong style={{ color: '#34D399' }}>{totalExits}</strong></span>
          <span>STAIRS: <strong style={{ color: '#38BDF8' }}>{totalStairs}</strong></span>
          <span style={{ color: '#64748B' }}>| Last Sync: {lastSyncTime}</span>
        </div>
      </div>

      {/* Main 3D Viewport Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative', border: '1px solid #334155' }}>
        
        {/* WebGL Canvas Mount */}
        <div 
          ref={mountRef} 
          style={{ 
            width: '100%', 
            height: '620px', 
            cursor: 'grab', 
            backgroundColor: '#080D1A' 
          }} 
        />

        {/* Floating In-Viewport Display Toggles */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '10px 14px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Layer Visibility
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#E2E8F0', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showLabels} 
              onChange={e => setShowLabels(e.target.checked)} 
              style={{ accentColor: 'var(--color-primary-orange)' }} 
            />
            Room Badges & Footprint
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#E2E8F0', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showFire} 
              onChange={e => setShowFire(e.target.checked)} 
              style={{ accentColor: 'var(--color-primary-orange)' }} 
            />
            Fire Seat & Smoke
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#E2E8F0', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showAgents} 
              onChange={e => setShowAgents(e.target.checked)} 
              style={{ accentColor: 'var(--color-primary-orange)' }} 
            />
            Occupant Agents
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#E2E8F0', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showWireframe} 
              onChange={e => setShowWireframe(e.target.checked)} 
              style={{ accentColor: 'var(--color-primary-orange)' }} 
            />
            Wireframe Walls
          </label>
        </div>

        {/* Exploded View Separation Slider */}
        {selectedFloor === 'ALL' && totalFloors > 1 && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(15, 23, 42, 0.90)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '10px 16px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            minWidth: '180px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
              <span>Exploded View</span>
              <span style={{ color: 'var(--color-primary-orange)', fontFamily: 'var(--font-mono)' }}>{floorSeparation}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={floorSeparation}
              onChange={e => setFloorSeparation(parseInt(e.target.value))}
              style={{ accentColor: 'var(--color-primary-orange)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748B' }}>
              <span>Stacked (0m)</span>
              <span>Exploded (16m)</span>
            </div>
          </div>
        )}

        {/* Tactical Controls Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          color: '#94A3B8',
          padding: '8px 14px',
          borderRadius: '6px',
          fontSize: '11px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          gap: '14px',
          pointerEvents: 'none'
        }}>
          <span>🖱️ Left Drag: Orbit</span>
          <span>🖱️ Right Drag / Shift+Drag: Pan</span>
          <span>📜 Wheel: Zoom In / Out</span>
        </div>

        {/* Sync Success Confirmation Toast */}
        {syncToast && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '8px',
            border: '1px solid #10B981',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(16, 185, 129, 0.4)',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <div style={{
              background: '#10B981',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Check size={12} color="#FFFFFF" />
            </div>
            <span>{syncMessage}</span>
          </div>
        )}
      </div>

      {/* Architectural Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Story Count</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
            {totalFloors} Stories
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            {buildingData.building.gross_area_sqm || totalFloors * 3150} m² Gross Area
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-primary-orange)' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Architectural Zones</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-orange)', marginTop: '4px' }}>
            {totalRooms} Rooms
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            1:1 Synced with 2D CAD Editor
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Emergency Egress</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            {totalExits} Exits
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            {totalStairs} Structural Stair Cores
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>Hazard Calibration</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>
            1 Fire Seat
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            Flashover Origin: ({fireOrigin.x}m, {fireOrigin.y}m)
          </div>
        </div>
      </div>
    </div>
  );
};
