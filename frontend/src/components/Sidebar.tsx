import React from 'react';
import type { ActiveTab, BuildingData } from '../types';
import { 
  Flame, 
  LayoutDashboard, 
  PenTool, 
  GitFork, 
  Activity, 
  Box, 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  BarChart2, 
  Home, 
  Zap, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  ChevronRight,
  Layers
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onRunDemo: () => void;
  isSimulating: boolean;
  buildingData: BuildingData | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onRunDemo,
  isSimulating,
  buildingData
}) => {
  const navSections = [
    {
      group: 'COMMAND & CONTROL',
      items: [
        { tab: 'landing' as ActiveTab, label: 'Mission Launchpad', icon: <Home size={17} /> },
        { tab: 'dashboard' as ActiveTab, label: 'Safety Dashboard', icon: <LayoutDashboard size={17} /> },
        { tab: 'wizard' as ActiveTab, label: 'New Facility Project', icon: <PlusCircle size={17} /> }
      ]
    },
    {
      group: 'ENGINEERING & MODELING',
      items: [
        { tab: 'editor' as ActiveTab, label: '2D Floor Plan CAD', icon: <PenTool size={17} /> },
        { tab: 'graph' as ActiveTab, label: 'Topological Graph', icon: <GitFork size={17} /> },
        { tab: 'simulation' as ActiveTab, label: 'Simulation Studio', icon: <Activity size={17} />, badge: 'LIVE', badgeColor: '#EF4444' },
        { tab: '3d' as ActiveTab, label: '3D Digital Twin', icon: <Box size={17} />, badge: 'WEBGL', badgeColor: '#00F2FE' }
      ]
    },
    {
      group: 'RESPONSE & COMPLIANCE',
      items: [
        { tab: 'firefighter' as ActiveTab, label: 'Firefighter HUD', icon: <ShieldAlert size={17} /> },
        { tab: 'comparison' as ActiveTab, label: 'Optimization Advisor', icon: <BarChart2 size={17} /> },
        { tab: 'report' as ActiveTab, label: 'Safety Audit Report', icon: <FileText size={17} /> }
      ]
    }
  ];

  return (
    <aside style={{
      width: '270px',
      minWidth: '270px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(5, 8, 17, 0.98)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.45)',
      userSelect: 'none',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }} className="no-print">
      
      {/* Sidebar Header: Brand & Status */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div 
          onClick={() => setActiveTab('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
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
                color: '#FFFFFF'
              }}>
                FIREXIS
              </span>
              <span style={{
                fontSize: '9px',
                background: 'rgba(0, 242, 254, 0.15)',
                color: '#38BDF8',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                border: '1px solid rgba(56, 189, 248, 0.35)'
              }}>
                PRO
              </span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, letterSpacing: '0.02em' }}>
              Safety Planning & Digital Twin
            </div>
          </div>
        </div>

        {/* Live Engine Status Strip */}
        <div style={{
          marginTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          padding: '7px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isSimulating ? 'var(--color-danger-red)' : '#10B981',
              boxShadow: isSimulating ? '0 0 10px #EF4444' : '0 0 8px #10B981',
              animation: isSimulating ? 'pulseGlow 1.2s infinite' : 'pulseGreen 2s infinite'
            }} />
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
              {isSimulating ? 'SIM RUNNING' : 'ENGINES ACTIVE'}
            </span>
          </div>
          <span style={{ color: '#38BDF8', fontSize: '10px' }}>NFPA/IBC</span>
        </div>
      </div>

      {/* Middle Navigation Items (Grouped List) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {navSections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#475569',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              padding: '0 10px',
              marginBottom: '6px'
            }}>
              {sec.group}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map(item => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    id={`sidebar-tab-${item.tab}`}
                    onClick={() => setActiveTab(item.tab)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: isActive ? 'rgba(255, 107, 53, 0.14)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-primary-orange)' : '3px solid transparent',
                      borderTop: 'none',
                      borderRight: 'none',
                      borderBottom: 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      textAlign: 'left',
                      width: '100%',
                      boxShadow: isActive ? 'inset 0 0 16px rgba(255, 107, 53, 0.08)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#F8FAFC';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <span style={{
                        color: isActive ? 'var(--color-primary-orange)' : '#64748B',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? item.badgeColor || 'var(--color-primary-orange)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#060A14' : '#64748B',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight size={13} color="var(--color-primary-orange)" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Bottom Action Hub */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(3, 5, 12, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Instant 1-Click Demo Launcher */}
        <button
          onClick={onRunDemo}
          id="btn-run-demo-sidebar"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #E76F51 50%, #D62828 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '12.5px',
            padding: '11px 16px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 18px rgba(255, 107, 53, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            width: '100%'
          }}
          title="Execute Complete 14-Step Automated Emergency Scenario"
        >
          <Zap size={16} fill="#FFFFFF" />
          1-Click Incident Demo
        </button>

        {/* Facility Quick Stat Capsule */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          borderRadius: '8px',
          padding: '10px 12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={13} color="var(--color-primary-orange)" />
              {buildingData?.building.name.slice(0, 18) || 'Nexus Complex'}
            </span>
            <span style={{ color: '#34D399', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>3 FLOORS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            <span>OCCUPANTS: 114</span>
            <span>BURDEN: NORMAL</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
