import React, { useState } from 'react';
import type { BuildingData } from '../types';
import { 
  ShieldAlert, 
  Flame, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  Thermometer,
  Truck,
  Droplet,
  Compass,
  Activity
} from 'lucide-react';

interface FirefighterModeProps {
  buildingData: BuildingData;
}

export const FirefighterMode: React.FC<FirefighterModeProps> = ({ buildingData }) => {
  const [activeFloorIdx, setActiveFloorIdx] = useState(0);
  const [thermalMode, setThermalMode] = useState(false);
  const floor = buildingData.floors[activeFloorIdx] || buildingData.floors[0];
  const scale = 11;

  const squads = [
    { squad: 'ENGINE 4 (ATTACK)', assignment: 'Primary breach via North Plaza. Advance 1¾" attack line to Server Hub.', status: 'DEPLOYED' },
    { squad: 'LADDER 2 (RESCUE)', assignment: 'Primary search of Level 1 Labs via West Core A. Zero victims found so far.', status: 'SEARCHING' },
    { squad: 'SQUAD 1 (VENT)', assignment: 'Roof hatch positive-pressure ventilation established. Smoke clear on West side.', status: 'ACTIVE' }
  ];

  return (
    <div style={{
      backgroundColor: '#0A0F1D',
      color: '#FFFFFF',
      minHeight: 'calc(100vh - 110px)',
      padding: '28px'
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* Tactical Command Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#151F32',
          padding: '18px 28px',
          borderRadius: '10px',
          borderLeft: '8px solid var(--color-danger-red)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <ShieldAlert size={26} color="var(--color-danger-red)" />
              <h1 style={{ fontSize: '22px', color: '#FFFFFF', letterSpacing: '0.06em', fontWeight: 800 }}>
                TACTICAL EMERGENCY INCIDENT COMMAND HUD
              </h1>
              <span style={{
                backgroundColor: 'var(--color-danger-red)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                animation: 'pulseGlow 1.5s infinite'
              }}>
                ALARM 2 ACTIVE
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
              Structure: <strong>{buildingData.building.name}</strong> | Type I Concrete | <strong>Standpipe: 150 PSI Connected</strong>
            </div>
          </div>

          {/* Level Switcher & Thermal Camera Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setThermalMode(!thermalMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: thermalMode ? '#7C3AED' : '#334155',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: thermalMode ? '0 0 15px rgba(124, 58, 237, 0.6)' : 'none'
              }}
            >
              <Thermometer size={16} />
              {thermalMode ? 'FLIR THERMAL: ON' : 'FLIR THERMAL: OFF'}
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              {buildingData.floors.map((fl, idx) => (
                <button
                  key={fl.id}
                  onClick={() => setActiveFloorIdx(idx)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: activeFloorIdx === idx ? 'var(--color-safety-orange)' : '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #334155'
                  }}
                >
                  {fl.name.split('—')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Contrast Tactical Schematic + Incident Board */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          
          {/* Tactical Schematic Canvas */}
          <div style={{
            backgroundColor: '#0F172A',
            border: '2px solid #334155',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
              <span>TACTICAL GRID — {floor.name}</span>
              <span style={{ color: 'var(--color-safe-green)', fontWeight: 700 }}>● VIABLE BREACH ENTRY POINTS READY</span>
            </div>

            <div style={{
              position: 'relative',
              width: 840,
              height: 520,
              backgroundColor: thermalMode ? '#2E1065' : '#030712',
              border: `2px solid ${thermalMode ? '#7C3AED' : '#334155'}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <svg width={840} height={520}>
                {/* Rooms */}
                {floor.rooms.map(r => (
                  <g key={r.id}>
                    <rect
                      x={r.bounds.x * scale}
                      y={r.bounds.y * scale}
                      width={r.bounds.width * scale}
                      height={r.bounds.height * scale}
                      fill={thermalMode ? '#4C1D95' : '#111827'}
                      stroke={thermalMode ? '#A78BFA' : '#374151'}
                      strokeWidth="2.5"
                      rx="3"
                    />
                    <text
                      x={(r.bounds.x + r.bounds.width / 2) * scale}
                      y={(r.bounds.y + r.bounds.height / 2) * scale}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="800"
                      fill="#F3F4F6"
                    >
                      {r.name}
                    </text>
                  </g>
                ))}

                {/* Primary Tactical Breach Point (North) */}
                <g>
                  <circle cx={35 * scale} cy={2 * scale} r={20} fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="5 3" />
                  <rect x={(35 * scale) - 34} y={(2 * scale) - 12} width={68} height={24} fill="#059669" rx="4" />
                  <text x={35 * scale} y={(2 * scale) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">
                    PRI BREACH
                  </text>
                </g>

                {/* Secondary Tactical Breach Point (West) */}
                <g>
                  <circle cx={2 * scale} cy={24 * scale} r={20} fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="5 3" />
                  <rect x={(2 * scale) - 12} y={(24 * scale) - 12} width={68} height={24} fill="#059669" rx="4" />
                  <text x={(2 * scale) + 22} y={(24 * scale) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#FFFFFF">
                    SEC BREACH
                  </text>
                </g>

                {/* Active Fire Core with Thermal Flare */}
                {activeFloorIdx === 0 && (
                  <g>
                    <ellipse
                      cx={54 * scale}
                      cy={26 * scale}
                      rx={85}
                      ry={65}
                      fill={thermalMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(220, 38, 38, 0.45)'}
                      stroke="#EF4444"
                      strokeWidth="3"
                    />
                    <circle cx={54 * scale} cy={26 * scale} r={18} fill="#F97316" />
                    <text x={54 * scale} y={(26 * scale) - 24} textAnchor="middle" fontSize="12" fontWeight="900" fill="#FCA5A5">
                      SEAT OF FIRE: 820°C
                    </text>
                  </g>
                )}

                {/* Viable Stair Core A (West) */}
                <g>
                  <rect x={(6 * scale) - 18} y={(14 * scale) - 18} width={36} height={36} fill="#065F46" stroke="#34D399" strokeWidth="2.5" rx="4" />
                  <text x={6 * scale} y={(14 * scale) + 5} textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">
                    STAIR A (CLEAR)
                  </text>
                </g>

                {/* Compromised Stair Core B (East) */}
                <g>
                  <rect x={(64 * scale) - 18} y={(14 * scale) - 18} width={36} height={36} fill="#991B1B" stroke="#F87171" strokeWidth="2.5" rx="4" />
                  <text x={64 * scale} y={(14 * scale) + 5} textAnchor="middle" fontSize="9" fontWeight="900" fill="#FFFFFF">
                    STAIR B (SMOKE)
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right Incident Command Operational Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Squad Assignments */}
            <div style={{ backgroundColor: '#151F32', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-orange)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={17} />
                Squad Tactical Deployment
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {squads.map((sq, idx) => (
                  <div key={idx} style={{ backgroundColor: '#1E293B', padding: '12px', borderRadius: '6px', borderLeft: '3px solid var(--color-safe-green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>{sq.squad}</strong>
                      <span className="badge badge-safe">{sq.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
                      {sq.assignment}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Hydraulic & Life Safety Telemetry */}
            <div style={{ backgroundColor: '#151F32', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-safety-orange)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} />
                Hydraulics & Logistics
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div style={{ backgroundColor: '#1E293B', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase' }}>Hydrant Flow</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#38BDF8' }}>1,250 GPM</div>
                </div>
                <div style={{ backgroundColor: '#1E293B', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase' }}>Standpipe Core</div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-safe-green)' }}>150 PSI Flow</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #334155', paddingTop: '12px', fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--color-safe-green)" />
                Assembly Plaza Alpha: 100% headcount verified safe.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
