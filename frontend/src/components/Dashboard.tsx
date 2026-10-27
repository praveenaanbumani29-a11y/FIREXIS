import React from 'react';
import type { ActiveTab, BuildingData } from '../types';
import { 
  Building2, 
  FolderKanban, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Upload, 
  Play, 
  FileText, 
  ArrowUpRight,
  Flame,
  CheckCircle2,
  ShieldAlert,
  TrendingDown,
  Layers,
  Cpu,
  Zap,
  Radio,
  Sliders
} from 'lucide-react';

interface DashboardProps {
  buildingData: BuildingData | null;
  setActiveTab: (tab: ActiveTab) => void;
  onRunDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  buildingData,
  setActiveTab,
  onRunDemo
}) => {
  const stats = [
    { label: 'Registered Facilities', value: '3', change: '+1 this quarter', icon: <Building2 size={18} color="#38BDF8" />, badge: 'Active' },
    { label: 'Safety Projects', value: '4', change: '2 under regulatory review', icon: <FolderKanban size={18} color="#FF6B35" />, badge: 'In Progress' },
    { label: 'Simulations Executed', value: '32', change: '100% convergence rate', icon: <Activity size={18} color="#10B981" />, badge: 'Verified' },
    { label: 'Bottlenecks Mitigated', value: '2', change: 'Secondary egress unlocked', icon: <AlertTriangle size={18} color="#EF4444" />, badge: 'Actioned' },
    { label: 'Evacuation Time', value: '82.0s', change: '-30.5% vs baseline', icon: <Clock size={18} color="#10B981" />, badge: 'Optimized' }
  ];

  const incidentTimeline = [
    { time: '00.0s', event: 'Simulated Electrical Flashover in rm-g05 Server Hub', severity: 'CRITICAL', note: 'Thermal spike reaching 450°C' },
    { time: '14.2s', event: 'East Service Exit Compromised by Toxic Smoke Density', severity: 'WARNING', note: 'Optical visibility drops below 2.5m' },
    { time: '18.5s', event: 'Dynamic A* Engine Recalculates Egress Vectors', severity: 'SUCCESS', note: '114 occupants redirected to North Plaza Exit' },
    { time: '82.0s', event: 'Complete Facility Evacuation Confirmed Safe', severity: 'SUCCESS', note: 'Zero casualties, assembly headcount verified' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '36px 24px' }}>
      
      {/* Top Header & Quick Action Hub */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-navy">FACILITY OVERVIEW</span>
            <span className="badge badge-safe">NFPA 101 / IBC VERIFIED</span>
          </div>
          <h1 style={{ fontSize: '28px', color: 'var(--color-navy-deep)' }}>
            Engineering Safety Command Dashboard
          </h1>
          <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '14px' }}>
            Real-time egress diagnostics, architectural compliance metrics, and simulation telemetry.
          </p>
        </div>

        {/* Quick Action Buttons Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            id="dash-btn-new-project"
            onClick={() => setActiveTab('wizard')}
            className="btn-secondary"
          >
            <Plus size={16} />
            New Project
          </button>
          <button 
            onClick={() => setActiveTab('editor')}
            className="btn-secondary"
          >
            <Upload size={16} />
            Floor CAD Editor
          </button>
          <button 
            onClick={() => setActiveTab('simulation')}
            className="btn-primary"
          >
            <Play size={16} fill="#FFFFFF" />
            Simulation Studio
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className="btn-secondary"
          >
            <FileText size={16} />
            Audit Reports
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {stats.map((s, idx) => (
          <div key={idx} className="card card-interactive" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                {s.label}
              </span>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F8FAFC', marginBottom: '4px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: s.label.includes('Evacuation') ? '#34D399' : 'var(--color-charcoal-muted)', fontWeight: 600 }}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Grid: Active Complex Details + Incident Event Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Active Facility Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '14px' }}>
            <div>
              <span className="badge badge-navy" style={{ marginBottom: '6px' }}>Active Facility</span>
              <h2 style={{ fontSize: '20px', color: 'var(--color-navy-deep)' }}>
                {buildingData?.building.name || 'Nexus Innovation Complex'}
              </h2>
            </div>
            <button 
              onClick={() => setActiveTab('3d')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-primary-orange)', fontWeight: 700, background: 'none' }}
            >
              Open 3D Twin <ArrowUpRight size={15} />
            </button>
          </div>

          {/* Quick Specifications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '22px' }}>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Classification</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>{buildingData?.building.building_type || 'Mixed-Use R&D'}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Gross Footprint</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>{buildingData?.building.gross_area_sqm || 3600} m²</div>
            </div>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Building Stories</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>{buildingData?.building.total_floors || 3} Levels (100% Modeled)</div>
            </div>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Design Occupancy</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>{buildingData?.building.max_occupancy || 350} Persons</div>
            </div>
          </div>

          {/* Active Scenario Card */}
          <div style={{
            backgroundColor: 'rgba(255, 107, 53, 0.08)',
            border: '1px solid rgba(255, 107, 53, 0.25)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-orange)', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
              <Flame size={16} />
              Active Incident: Flashover in East Wing
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-charcoal)', lineHeight: 1.6 }}>
              <strong>{buildingData?.scenario.name}</strong> — Origin in Server Hub (East Wing). 114 occupants requiring evacuation with dynamic A* rerouting.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onRunDemo}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '12px' }}
            >
              <Play size={16} fill="#FFFFFF" />
              RUN DEMO SIMULATION
            </button>
            <button 
              onClick={() => setActiveTab('firefighter')}
              className="btn-secondary"
            >
              <ShieldAlert size={16} />
              Tactical HUD
            </button>
          </div>
        </div>

        {/* Incident Command Event Sequence */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--color-navy-deep)' }}>Simulation Event Sequence</h2>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Chronological discrete hazard progression</div>
            </div>
            <span className="badge badge-safe">ONLINE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidentTimeline.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  backgroundColor: 'rgba(8, 13, 26, 0.7)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-subtle)',
                  borderLeft: `4px solid ${item.severity === 'CRITICAL' ? 'var(--color-danger-red)' : item.severity === 'WARNING' ? 'var(--color-warning-yellow)' : 'var(--color-safe-green)'}`
                }}
              >
                <span className="mono-metric" style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8', minWidth: '48px' }}>
                  {item.time}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                    {item.event}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-charcoal-muted)', marginTop: '2px' }}>
                    {item.note}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engine Latency Benchmarks */}
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>DFS LATENCY: 4ms</span>
            <span>A* REROUTE: 12ms</span>
            <span>THREE.JS: 60 FPS</span>
          </div>
        </div>

      </div>
    </div>
  );
};
