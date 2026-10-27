import React, { useState, useEffect } from 'react';
import { ActiveTab, BuildingData, FloorData } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ProjectWizard } from './components/ProjectWizard';
import { CADEditor } from './components/CADEditor';
import { GraphVisualizer } from './components/GraphVisualizer';
import { SimulationStudio } from './components/SimulationStudio';
import { DigitalTwin3D } from './components/DigitalTwin3D';
import { FirefighterMode } from './components/FirefighterMode';
import { BeforeAfterView } from './components/BeforeAfterView';
import { ReportView } from './components/ReportView';
import { 
  Layers, 
  ShieldCheck, 
  Zap, 
  X, 
  Home, 
  LayoutDashboard, 
  PlusCircle, 
  PenTool, 
  GitFork, 
  Activity, 
  Box, 
  ShieldAlert, 
  BarChart2, 
  FileText,
  Radio,
  Flame,
  Plus,
  Trash2
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
  const [activeFloorIdx, setActiveFloorIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      const data = await api.getDemoBuilding();
      setBuildingData(data);
    } catch (err) {
      console.error('Failed to load demo building:', err);
    }
  };

  // One-Click Complete Demo Execution (Section 34 & 40)
  const handleRunDemo = async () => {
    setDemoBanner('INITIALIZING COMPREHENSIVE FIREXIS SIMULATION SCENARIO...');
    setIsSimulating(true);

    try {
      const data = await api.getDemoBuilding();
      setBuildingData(data);
      
      // Switch to simulation studio
      setActiveTab('simulation');
      setDemoBanner('DEMO ACTIVE: East Server Room Flashover Active. Simulating 114 Occupants Evacuation with Dynamic Rerouting.');

      setTimeout(() => {
        setDemoBanner(null);
      }, 7000);
    } catch (err) {
      console.error('Error running demo:', err);
    }
  };

  const handleUpdateCurrentFloor = (updated: FloorData) => {
    if (!buildingData) return;
    const newFloors = [...buildingData.floors];
    newFloors[activeFloorIdx] = updated;
    setBuildingData({ ...buildingData, floors: newFloors });
  };

  const handleAddFloor = () => {
    if (!buildingData) return;
    const newFloorNum = buildingData.floors.length;
    const baseW = buildingData.floors[0]?.width_m || 70.0;
    const baseL = buildingData.floors[0]?.length_m || 45.0;

    const newFloor: FloorData = {
      id: `floor-${Date.now().toString().slice(-4)}`,
      floor_number: newFloorNum,
      name: `Level ${newFloorNum} — Architectural Floor Plan`,
      elevation_m: newFloorNum * 4.0,
      width_m: baseW,
      length_m: baseL,
      scale_ppm: 20.0,
      rooms: [
        {
          id: `rm-${newFloorNum}01`,
          name: `Zone ${newFloorNum}A Office`,
          bounds: { x: 12, y: 10, width: 22, height: 14 },
          occupant_load: 20
        },
        {
          id: `rm-${newFloorNum}02`,
          name: `Zone ${newFloorNum}B Workspace`,
          bounds: { x: 38, y: 10, width: 22, height: 14 },
          occupant_load: 20
        }
      ],
      corridors: [
        {
          id: `cor-${newFloorNum}a`,
          name: `Level ${newFloorNum} Central Corridor`,
          position: { x: 35, y: 24 },
          capacity: 80
        }
      ],
      doors: [
        {
          id: `dr-${newFloorNum}01`,
          name: `Office Door`,
          position: { x: 23, y: 24 },
          width_m: 1.4,
          connects: [`rm-${newFloorNum}01`, `cor-${newFloorNum}a`]
        }
      ],
      exits: [],
      staircases: [
        {
          id: `stair-west-f${newFloorNum}`,
          name: `Stairwell West Core`,
          position: { x: 6, y: 14 },
          capacity: 120,
          connects: [`cor-${newFloorNum}a`]
        }
      ],
      equipment: [
        {
          id: `eq-${newFloorNum}-ext-01`,
          name: `ABC Fire Extinguisher`,
          equipment_type: 'EXTINGUISHER_ABC',
          position: { x: 24, y: 23 },
          status: 'OPERATIONAL'
        }
      ]
    };

    const newFloors = [...buildingData.floors, newFloor];
    setBuildingData({
      ...buildingData,
      building: {
        ...buildingData.building,
        total_floors: newFloors.length
      },
      floors: newFloors
    });
    setActiveFloorIdx(newFloors.length - 1);
    setDemoBanner(`ADDED: Level ${newFloorNum} created and active in CAD & 3D Twin.`);
    setTimeout(() => setDemoBanner(null), 4000);
  };

  const handleDeleteFloor = (floorIdxToDelete: number) => {
    if (!buildingData || buildingData.floors.length <= 1) {
      alert("At least one floor must remain in the building.");
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete ${buildingData.floors[floorIdxToDelete]?.name}?`);
    if (!confirmed) return;

    const remaining = buildingData.floors.filter((_, idx) => idx !== floorIdxToDelete);
    const updatedFloors = remaining.map((fl, idx) => ({
      ...fl,
      floor_number: idx,
      elevation_m: idx * 4.0
    }));

    setBuildingData({
      ...buildingData,
      building: {
        ...buildingData.building,
        total_floors: updatedFloors.length
      },
      floors: updatedFloors
    });
    setActiveFloorIdx(Math.max(0, floorIdxToDelete - 1));
    setDemoBanner(`REMOVED: Floor level deleted successfully.`);
    setTimeout(() => setDemoBanner(null), 4000);
  };

  const handleProjectCreated = (newProjectData: any) => {
    if (!buildingData) return;
    const numFloors = Math.max(1, Math.min(10, parseInt(newProjectData.total_floors) || 3));
    const generatedFloors: FloorData[] = [];
    for (let i = 0; i < numFloors; i++) {
      generatedFloors.push({
        id: `floor-${i}`,
        floor_number: i,
        name: i === 0 ? `Level 0 — Ground Floor & Egress Concourse` : `Level ${i} — Floor Plan`,
        elevation_m: i * 4.0,
        width_m: 70.0,
        length_m: 45.0,
        scale_ppm: 20.0,
        rooms: [
          {
            id: `rm-${i}01`,
            name: i === 0 ? 'Main Reception & Atrium' : `Zone ${i}A Work Hub`,
            bounds: { x: 10, y: 10, width: 20, height: 14 },
            occupant_load: 25
          },
          {
            id: `rm-${i}02`,
            name: i === 0 ? 'Auditorium Hall' : `Zone ${i}B Lab`,
            bounds: { x: 38, y: 10, width: 22, height: 14 },
            occupant_load: 30
          }
        ],
        corridors: [
          {
            id: `cor-${i}a`,
            name: `Level ${i} Central Concourse`,
            position: { x: 35, y: 24 },
            capacity: 80
          }
        ],
        doors: [
          {
            id: `dr-${i}01`,
            name: `Egress Door`,
            position: { x: 20, y: 24 },
            width_m: 1.6,
            connects: [`rm-${i}01`, `cor-${i}a`]
          }
        ],
        exits: i === 0 ? [
          {
            id: 'exit-north',
            name: 'North Main Plaza Exit',
            position: { x: 35, y: 2 },
            discharge_type: 'OUTSIDE',
            capacity_persons_min: 150,
            is_blocked: false,
            connects: ['cor-0a']
          },
          {
            id: 'exit-south',
            name: 'South Boulevard Exit',
            position: { x: 35, y: 42 },
            discharge_type: 'OUTSIDE',
            capacity_persons_min: 120,
            is_blocked: false,
            connects: ['cor-0a']
          }
        ] : [],
        staircases: [
          {
            id: `stair-west-f${i}`,
            name: 'Stairwell Core West',
            position: { x: 6, y: 14 },
            capacity: 120,
            connects: [`cor-${i}a`]
          }
        ],
        equipment: [
          {
            id: `eq-ext-${i}01`,
            name: 'ABC Extinguisher Unit',
            equipment_type: 'EXTINGUISHER_ABC',
            position: { x: 22, y: 23 },
            status: 'OPERATIONAL'
          }
        ]
      });
    }

    const updated = {
      ...buildingData,
      building: {
        ...buildingData.building,
        name: newProjectData.name,
        building_type: newProjectData.building_type,
        gross_area_sqm: newProjectData.gross_area_sqm,
        max_occupancy: newProjectData.max_occupancy,
        total_floors: numFloors
      },
      floors: generatedFloors
    };
    setBuildingData(updated);
    setActiveFloorIdx(0);
  };

  const handleApplyOptimization = () => {
    if (!buildingData) return;
    const floor0 = buildingData.floors[0];
    const optimizedExit = {
      id: 'exit-west-opt',
      name: 'Optimized Secondary Egress (Added)',
      position: { x: 2, y: 12 },
      discharge_type: 'OUTSIDE',
      capacity_persons_min: 120,
      is_blocked: false,
      connects: ['cor-g3']
    };
    const updatedFloor = {
      ...floor0,
      exits: [...floor0.exits, optimizedExit]
    };
    handleUpdateCurrentFloor(updatedFloor);
    setDemoBanner('SUCCESS: Optimized Secondary Egress Added. Egress bottleneck alleviated!');
    setTimeout(() => setDemoBanner(null), 5000);
  };

  const currentFloor = buildingData?.floors[activeFloorIdx] || buildingData?.floors[0];
  const floors = buildingData?.floors || [];

  const tabMeta: Record<ActiveTab, { title: string; category: string; icon: React.ReactNode }> = {
    landing: { title: 'Mission Launchpad', category: 'OVERVIEW', icon: <Home size={15} color="var(--color-primary-orange)" /> },
    dashboard: { title: 'Safety Command Dashboard', category: 'COMMAND', icon: <LayoutDashboard size={15} color="var(--color-primary-orange)" /> },
    wizard: { title: 'New Facility Project Wizard', category: 'CONFIGURATION', icon: <PlusCircle size={15} color="var(--color-primary-orange)" /> },
    editor: { title: '2D Architectural Floor Plan CAD', category: 'MODELING', icon: <PenTool size={15} color="var(--color-primary-orange)" /> },
    graph: { title: 'Topological Graph Algorithm Engine', category: 'ANALYSIS', icon: <GitFork size={15} color="var(--color-primary-orange)" /> },
    simulation: { title: 'Coupled Hazard & Evacuation Studio', category: 'SIMULATION', icon: <Activity size={15} color="var(--color-primary-orange)" /> },
    '3d': { title: '3D WebGL Digital Twin', category: 'VISUALIZATION', icon: <Box size={15} color="var(--color-primary-orange)" /> },
    firefighter: { title: 'Tactical Incident Command HUD', category: 'RESPONSE', icon: <ShieldAlert size={15} color="var(--color-primary-orange)" /> },
    comparison: { title: 'Optimization & Mitigation Advisor', category: 'OPTIMIZATION', icon: <BarChart2 size={15} color="var(--color-primary-orange)" /> },
    report: { title: 'Safety Assessment & Audit Report', category: 'COMPLIANCE', icon: <FileText size={15} color="var(--color-primary-orange)" /> }
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.dashboard;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--color-bg-pale)',
      overflow: 'hidden'
    }}>
      {/* 1. Left Vertical Navigation Toolbar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={handleRunDemo}
        isSimulating={isSimulating}
        buildingData={buildingData}
      />

      {/* 2. Main Right Workspace Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minWidth: 0,
        overflow: 'hidden'
      }}>
        
        {/* Top Contextual Header Bar */}
        <header style={{
          height: '62px',
          minHeight: '62px',
          backgroundColor: 'rgba(5, 8, 17, 0.94)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          zIndex: 900,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }} className="no-print">
          
          {/* Breadcrumb / Current View Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '6px 8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 107, 53, 0.12)',
              border: '1px solid rgba(255, 107, 53, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentMeta.icon}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                  {currentMeta.category}
                </span>
                <span style={{ color: '#334155' }}>/</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                  {currentMeta.title}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Controls: Floor Level Selector & Telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Multi-Floor Selector Pills */}
            {floors.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                padding: '4px 6px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, paddingLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                  FLOOR:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {floors.map((f, idx) => {
                    const isActive = activeFloorIdx === idx;
                    return (
                      <button
                        key={f.id || idx}
                        onClick={() => setActiveFloorIdx(idx)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          backgroundColor: isActive ? 'var(--color-primary-orange)' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                          boxShadow: isActive ? '0 0 10px rgba(255, 107, 53, 0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Lvl {f.floor_number ?? idx}
                      </button>
                    );
                  })}
                </div>

                <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

                {/* Add Floor Button */}
                <button
                  onClick={handleAddFloor}
                  title="Add New Architectural Floor Level"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38BDF8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Plus size={12} />
                  <span>Add Floor</span>
                </button>

                {/* Delete Floor Button */}
                {floors.length > 1 && (
                  <button
                    onClick={() => handleDeleteFloor(activeFloorIdx)}
                    title={`Delete active floor (Level ${floors[activeFloorIdx]?.floor_number ?? activeFloorIdx})`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '3px 6px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#F87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Incident Alert Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#F87171',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '5px 12px',
              borderRadius: '20px'
            }}>
              <Flame size={12} color="#EF4444" />
              <span>EAST HUB FLASHOVER</span>
            </div>

            {/* NFPA Calibration Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#34D399',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '5px 12px',
              borderRadius: '20px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>IBC / NFPA 101</span>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport for Screen Components */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          <main style={{ flex: 1 }}>
            {activeTab === 'landing' && (
              <LandingPage
                setActiveTab={setActiveTab}
                onRunDemo={handleRunDemo}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                buildingData={buildingData}
                setActiveTab={setActiveTab}
                onRunDemo={handleRunDemo}
              />
            )}

            {activeTab === 'wizard' && (
              <ProjectWizard
                setActiveTab={setActiveTab}
                onProjectCreated={handleProjectCreated}
              />
            )}

            {activeTab === 'editor' && currentFloor && (
              <CADEditor
                floorData={currentFloor}
                onUpdateFloor={handleUpdateCurrentFloor}
                onOpenSimulation={() => setActiveTab('simulation')}
              />
            )}

            {activeTab === 'graph' && currentFloor && (
              <GraphVisualizer
                floorData={currentFloor}
              />
            )}

            {activeTab === 'simulation' && currentFloor && (
              <SimulationStudio
                floorData={currentFloor}
                onSimulationFinished={() => setIsSimulating(false)}
              />
            )}

            {activeTab === '3d' && buildingData && (
              <DigitalTwin3D
                buildingData={buildingData}
              />
            )}

            {activeTab === 'firefighter' && buildingData && (
              <FirefighterMode
                buildingData={buildingData}
              />
            )}

            {activeTab === 'comparison' && currentFloor && (
              <BeforeAfterView
                floorData={currentFloor}
                onApplyOptimization={handleApplyOptimization}
              />
            )}

            {activeTab === 'report' && buildingData && (
              <ReportView
                buildingData={buildingData}
              />
            )}
          </main>

          {/* Tactical Bottom Footer */}
          <footer style={{
            backgroundColor: 'rgba(5, 8, 17, 0.96)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '14px 28px',
            fontSize: '11.5px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#F8FAFC' }}>FIREXIS</strong>
              <span>— Fire Exit Risk Evaluation & Intelligent Safety Platform.</span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'var(--font-mono)' }}>
              Acoustic, Thermal, Topological & Multi-Agent Evacuation Digital Twin
            </div>
          </footer>

        </div>
      </div>

      {/* Floating Tactical Status Toast */}
      {demoBanner && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid var(--color-primary-orange)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 107, 53, 0.4)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '480px',
          backdropFilter: 'blur(16px)',
          animation: 'floatSlow 3s ease-in-out infinite'
        }}>
          <div style={{
            background: 'var(--color-primary-orange)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={13} color="#FFFFFF" fill="#FFFFFF" />
          </div>
          <div style={{ flex: 1, lineHeight: 1.4 }}>
            {demoBanner}
          </div>
          <button
            onClick={() => setDemoBanner(null)}
            style={{ background: 'transparent', color: '#94A3B8', padding: '2px', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
