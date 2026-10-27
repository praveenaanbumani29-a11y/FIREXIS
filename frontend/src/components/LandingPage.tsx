import React, { useState } from 'react';
import type { ActiveTab } from '../types';
import { 
  Play, 
  PlusCircle, 
  GitFork, 
  Flame, 
  Users, 
  Box, 
  ShieldAlert, 
  FileCheck,
  ChevronRight,
  Building2,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Activity,
  Zap,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onRunDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onRunDemo }) => {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState(0);

  const workflowSteps = [
    {
      title: '1. Floor Plan Vectorization',
      tag: 'SECTION 8 & 9',
      desc: 'Ingest architectural plans (CAD/PDF/PNG) or draw walls, corridors, doors, and equipment directly in the 2D CAD Editor with snap-to-grid accuracy.',
      targetTab: 'editor' as ActiveTab,
      highlight: 'Interactive 2m grid, element validation layer',
      icon: <Layers size={18} />
    },
    {
      title: '2. Topological Graph Extraction',
      tag: 'SECTION 10 & 11',
      desc: 'Automatically compile spatial entities into a mathematical network graph. Execute DFS (connectivity), BFS (hops), and Dijkstra (weighted path cost).',
      targetTab: 'graph' as ActiveTab,
      highlight: 'Isolated cul-de-sac & dead-end detection',
      icon: <GitFork size={18} />
    },
    {
      title: '3. Coupled Fire & Smoke Propagation',
      tag: 'SECTION 13 & 14',
      desc: 'Simulate thermal growth up to 900°C flashover. Track corridor smoke optical density and stairwell chimney effects to identify blocked exits.',
      targetTab: 'simulation' as ActiveTab,
      highlight: 'Cellular thermal diffusion + Jin visibility law',
      icon: <Flame size={18} />
    },
    {
      title: '4. Dynamic Crowd Evacuation',
      tag: 'SECTION 15 & 16',
      desc: 'Simulate 100+ heterogeneous occupant agents with walking velocity distributions, reaction delays, and real-time A* dynamic rerouting.',
      targetTab: 'simulation' as ActiveTab,
      highlight: 'Dynamic route recalculation around fire',
      icon: <Users size={18} />
    },
    {
      title: '5. 3D Digital Twin Visualization',
      tag: 'SECTION 19',
      desc: 'Inspect multi-story complex in hardware-accelerated Three.js 3D WebGL with floor-by-floor isolation slicing and first-person egress views.',
      targetTab: '3d' as ActiveTab,
      highlight: 'Volumetric flame mesh & smoke particle volumes',
      icon: <Box size={18} />
    },
    {
      title: '6. Tactical Incident & Audit Report',
      tag: 'SECTION 23 & 24',
      desc: 'Provide high-contrast incident HUD for arriving firefighters and compile comprehensive 12-section technical safety audit reports for authorities.',
      targetTab: 'report' as ActiveTab,
      highlight: 'Before/After metrics & PDF audit generation',
      icon: <FileCheck size={18} />
    }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '36px 24px' }}>
      
      {/* Premium Aerospace-Grade Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(14, 22, 38, 0.95) 0%, rgba(8, 13, 26, 0.98) 100%)',
        borderRadius: 'var(--radius-xl)',
        color: '#FFFFFF',
        padding: '56px 48px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg), 0 0 80px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '48px'
      }}>
        {/* Subtle Ambient Radial Lighting */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          right: '10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.18) 0%, rgba(0, 242, 254, 0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        {/* Blueprint Grid Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'linear-gradient(to right, #00F2FE 1px, transparent 1px), linear-gradient(to bottom, #00F2FE 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Left Hero Content */}
          <div>
            {/* Mission Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 107, 53, 0.12)',
              color: 'var(--color-primary-orange)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '20px',
              border: '1px solid rgba(255, 107, 53, 0.35)',
              boxShadow: '0 2px 12px rgba(255, 107, 53, 0.2)'
            }}>
              <Sparkles size={13} />
              CONTECH AI · EVACUATION DIGITAL TWIN & SAFETY PLATFORM
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '18px',
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)'
            }}>
              Autonomous Fire Egress & Multi-Agent Evacuation Simulation
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#94A3B8',
              lineHeight: 1.65,
              marginBottom: '32px',
              fontWeight: 400,
              maxWidth: '680px'
            }}>
              Bridge architectural CAD, topological network graphs, discrete cellular thermal propagation, and multi-agent crowd dynamics into real-time emergency preparedness.
            </p>

            {/* Hero CTA Button Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <button
                id="hero-btn-run-demo"
                onClick={onRunDemo}
                className="btn-primary"
                style={{
                  fontSize: '14px',
                  padding: '14px 28px',
                  borderRadius: '10px'
                }}
              >
                <Zap size={17} fill="#FFFFFF" />
                EXECUTE 1-CLICK INCIDENT WORKFLOW
              </button>

              <button
                id="hero-btn-new-project"
                onClick={() => setActiveTab('wizard')}
                className="btn-secondary"
                style={{
                  fontSize: '14px',
                  padding: '14px 24px',
                  borderRadius: '10px'
                }}
              >
                <PlusCircle size={17} />
                New Project
              </button>

              <button
                onClick={() => setActiveTab('3d')}
                style={{
                  background: 'transparent',
                  color: '#38BDF8',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  padding: '12px 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Box size={16} />
                Explore 3D Twin
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Hero: High-Tech Telemetry HUD Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-lg), 0 0 30px rgba(0, 242, 254, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#F8FAFC' }}>
                  FACILITY TELEMETRY STREAM
                </span>
              </div>
              <span className="badge badge-safe">ONLINE</span>
            </div>

            {/* Interactive SVG Floor Hologram */}
            <div style={{
              background: '#060A14',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              position: 'relative'
            }}>
              <svg width="100%" height="160" viewBox="0 0 320 160">
                {/* Blueprint grid */}
                <defs>
                  <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="320" height="160" fill="url(#heroGrid)" />

                {/* Building Outer Bounds */}
                <rect x="20" y="20" width="280" height="120" rx="4" fill="rgba(30, 41, 59, 0.4)" stroke="#38BDF8" strokeWidth="1.5" />
                
                {/* Interior Rooms */}
                <rect x="25" y="25" width="80" height="50" rx="2" fill="rgba(56, 189, 248, 0.08)" stroke="#38BDF8" strokeWidth="0.8" />
                <text x="35" y="55" fill="#94A3B8" fontSize="8" fontFamily="monospace">ZONE-01</text>
                
                <rect x="25" y="85" width="80" height="50" rx="2" fill="rgba(56, 189, 248, 0.08)" stroke="#38BDF8" strokeWidth="0.8" />
                <text x="35" y="115" fill="#94A3B8" fontSize="8" fontFamily="monospace">ZONE-02</text>

                {/* Server Room with Fire Hazard Origin */}
                <rect x="215" y="25" width="80" height="50" rx="2" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.2" />
                <circle cx="255" cy="50" r="14" fill="rgba(255, 107, 53, 0.3)" />
                <circle cx="255" cy="50" r="6" fill="#EF4444">
                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="230" y="53" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="monospace">FIRE SEAT</text>

                {/* Corridor & Dynamic Safe Evacuation Path */}
                <path d="M 105 110 L 160 110 L 160 50 L 160 20" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="5,3">
                  <animate attributeName="stroke-dashoffset" values="0;-16" dur="1s" repeatCount="indefinite" />
                </path>

                {/* Safe Exits */}
                <rect x="150" y="16" width="20" height="8" rx="2" fill="#10B981" />
                <text x="146" y="12" fill="#34D399" fontSize="7" fontWeight="bold">NORTH EXIT</text>

                {/* Blocked Exit */}
                <rect x="296" y="90" width="8" height="20" rx="2" fill="#EF4444" />
                <text x="255" y="138" fill="#F87171" fontSize="7" fontWeight="bold">EAST EXIT [BLOCKED]</text>
              </svg>
            </div>

            {/* Quick Metrics Stream */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>OCCUPANT AGENTS</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>114 Active</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>PEAK FLASHOVER</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-mono)' }}>850°C Thermal</div>
              </div>
            </div>
          </div>

        </div>

        {/* Hero Bottom Telemetry Ticker */}
        <div style={{
          marginTop: '44px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Graph Topology</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-orange)' }}>DFS / BFS / Dijkstra / A*</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Thermal Conduction</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>Cellular 2m Grid</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Crowd Dynamics</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-safe-green)' }}>Multi-Agent Social Force</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Time Optimization</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-safe-green)' }}>-30.5% Evacuation Time</div>
          </div>
        </div>
      </section>

      {/* Interactive Core Workflow Pipeline */}
      <section style={{ marginBottom: '56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-navy" style={{ marginBottom: '8px' }}>CORE PLATFORM PIPELINE</span>
          <h2 style={{ fontSize: '28px', color: 'var(--color-navy-deep)', marginBottom: '8px' }}>
            The 6-Stage End-to-End Safety Workflow
          </h2>
          <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '14.5px', maxWidth: '680px', margin: '0 auto' }}>
            Click through each phase of the FIREXIS pipeline to explore algorithmic and architectural capabilities.
          </p>
        </div>

        {/* Workflow Navigation Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {workflowSteps.map((step, idx) => {
            const isSelected = selectedWorkflowStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedWorkflowStep(idx)}
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.14)' : 'var(--color-surface-pure)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-charcoal)',
                  border: isSelected ? '1px solid rgba(255, 107, 53, 0.4)' : '1px solid var(--color-border-subtle)',
                  boxShadow: isSelected ? '0 4px 18px rgba(255, 107, 53, 0.2)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: isSelected ? 'var(--color-primary-orange)' : 'var(--color-text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    STAGE 0{idx + 1}
                  </span>
                  <span style={{ color: isSelected ? 'var(--color-primary-orange)' : '#64748B' }}>
                    {step.icon}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                  {step.title.split('. ')[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Workflow Detail Card */}
        <div className="card" style={{
          padding: '36px',
          borderLeft: '4px solid var(--color-primary-orange)',
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="badge badge-orange">{workflowSteps[selectedWorkflowStep].tag}</span>
              <h3 style={{ fontSize: '22px', color: 'var(--color-navy-deep)' }}>
                {workflowSteps[selectedWorkflowStep].title}
              </h3>
            </div>
            <p style={{ fontSize: '14.5px', color: 'var(--color-charcoal-muted)', lineHeight: 1.7, marginBottom: '22px' }}>
              {workflowSteps[selectedWorkflowStep].desc}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34D399',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={16} />
              {workflowSteps[selectedWorkflowStep].highlight}
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(8, 13, 26, 0.7)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px', letterSpacing: '0.04em' }}>
              DIRECT MODULE ACCESS
            </div>
            <button
              onClick={() => setActiveTab(workflowSteps[selectedWorkflowStep].targetTab)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '8px' }}
            >
              Open This Module
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Engineering Principle Notice */}
      <section style={{
        backgroundColor: 'var(--color-surface-pure)',
        border: '1px solid var(--color-border-subtle)',
        borderLeft: '4px solid var(--color-primary-orange)',
        borderRadius: 'var(--radius-md)',
        padding: '24px 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Building2 size={18} color="var(--color-primary-orange)" />
          <h4 style={{ fontSize: '15px', color: 'var(--color-navy-deep)' }}>
            Engineering Principles & Regulatory Positioning
          </h4>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)', lineHeight: 1.7 }}>
          FIREXIS strictly delineates between <strong>Deterministic Engineering Facts</strong> (graph connectivity, geometric distances, capacity calculations), <strong>Probabilistic Simulation Estimates</strong> (flame spread, smoke dispersion, agent reaction distributions), and <strong>Algorithmic Predictions</strong> (risk scoring, bottleneck mitigation). This software functions as an advanced decision-support and emergency simulation platform; it does not replace statutory certification from municipal fire authorities.
        </p>
      </section>

    </div>
  );
};
