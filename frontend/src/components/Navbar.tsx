import React from 'react';
import type { ActiveTab } from '../types';
import { 
  Flame, 
  LayoutDashboard, 
  PenTool, 
  GitFork, 
  Activity, 
  Box, 
  ShieldAlert, 
  FileText, 
  PlayCircle,
  PlusCircle,
  BarChart2,
  Sparkles,
  Cpu,
  Radio,
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onRunDemo: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunDemo,
  isSimulating
}) => {
  const navItems: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { tab: 'wizard', label: 'New Project', icon: <PlusCircle size={15} /> },
    { tab: 'editor', label: 'Floor CAD', icon: <PenTool size={15} /> },
    { tab: 'graph', label: 'Graph Topology', icon: <GitFork size={15} /> },
    { tab: 'simulation', label: 'Simulation Studio', icon: <Activity size={15} />, badge: 'LIVE' },
    { tab: '3d', label: '3D Digital Twin', icon: <Box size={15} />, badge: 'WEBGL' },
    { tab: 'firefighter', label: 'Firefighter HUD', icon: <ShieldAlert size={15} /> },
    { tab: 'comparison', label: 'Optimization', icon: <BarChart2 size={15} /> },
    { tab: 'report', label: 'Safety Report', icon: <FileText size={15} /> },
  ];

  return (
    <header style={{
      backgroundColor: 'rgba(5, 8, 17, 0.94)',
      color: '#FFFFFF',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }} className="no-print">
      
      {/* Top Command Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Brand & Mission Status */}
        <div 
          onClick={() => setActiveTab('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          title="Return to FIREXIS Launchpad"
        >
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #E76F51 50%, #D62828 100%)',
            borderRadius: '12px',
            padding: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            animation: 'pulseGlow 3s infinite'
          }}>
            <Flame size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}>
                FIREXIS
              </span>
              <span style={{
                fontSize: '9px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.18) 0%, rgba(56, 189, 248, 0.12) 100%)',
                color: '#38BDF8',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontFamily: 'var(--font-mono)'
              }}>
                CONTECH v1.0
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Autonomous Fire Exit Risk Evaluation</span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ color: '#34D399', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>NFPA 101 / IBC</span>
            </div>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Active Engine Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: '#E2E8F0',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 14px',
            borderRadius: '20px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isSimulating ? 'var(--color-danger-red)' : '#10B981',
              boxShadow: isSimulating ? '0 0 12px #EF4444' : '0 0 10px #10B981',
              animation: isSimulating ? 'pulseGlow 1.2s infinite' : 'pulseGreen 2s infinite'
            }} />
            <span style={{ letterSpacing: '0.04em' }}>
              {isSimulating ? 'SIMULATION IN PROGRESS' : 'CORE ENGINES: ACTIVE'}
            </span>
          </div>

          {/* Instant 1-Click Demo Launcher */}
          <button
            onClick={onRunDemo}
            id="btn-run-demo-nav"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E76F51 50%, #D62828 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '12px',
              padding: '8px 18px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(255, 107, 53, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
            title="Execute Complete 14-Step Automated Emergency Scenario"
          >
            <Zap size={15} fill="#FFFFFF" />
            1-Click Incident Demo
          </button>
        </div>
      </div>

      {/* Segmented Mission Control Navigation Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px 20px',
        overflowX: 'auto',
        gap: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)'
      }}>
        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              id={`nav-tab-${item.tab}`}
              onClick={() => setActiveTab(item.tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 15px',
                fontSize: '12.5px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? 'rgba(255, 107, 53, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 107, 53, 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                margin: '2px 0',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ 
                color: isActive ? 'var(--color-primary-orange)' : '#64748B',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'var(--color-primary-orange)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
