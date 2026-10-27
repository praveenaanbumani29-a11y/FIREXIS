import React, { useState, useEffect, useRef } from 'react';
import type { FloorData, SimulationFrame } from '../types';
import { api } from '../services/api';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Users, 
  ShieldAlert, 
  Activity, 
  Wind, 
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationStudioProps {
  floorData: FloorData;
  onSimulationFinished?: (summary: any) => void;
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({
  floorData,
  onSimulationFinished
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [timeline, setTimeline] = useState<SimulationFrame[]>([]);
  const [totalOccupants, setTotalOccupants] = useState(114);
  const [blockedExitId, setBlockedExitId] = useState<string>('exit-east');
  const [showDensityHeatmap, setShowDensityHeatmap] = useState(true);

  const scale = 11;
  const canvasWidth = 860;
  const canvasHeight = 530;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    runFreshSimulation();
  }, [floorData, blockedExitId, totalOccupants]);

  const runFreshSimulation = async () => {
    setIsPlaying(false);
    setCurrentFrameIdx(0);
    try {
      const res = await api.runSimulation({
        floor_data: floorData,
        fire_origin: { x: 54.0, y: 26.0 },
        total_occupants: totalOccupants,
        blocked_exit_id: blockedExitId
      });
      setTimeline(res.timeline || []);
      if (res.summary && onSimulationFinished) {
        onSimulationFinished(res.summary);
      }
    } catch (err) {
      console.error('Simulation run failed:', err);
    }
  };

  useEffect(() => {
    if (isPlaying && timeline.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentFrameIdx(prev => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            return prev;
          }
          return prev + 1;
        });
      }, 500 / speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, timeline]);

  const currentFrame = timeline[currentFrameIdx] || {
    time_sec: 0,
    evacuated: 0,
    evacuating: totalOccupants,
    at_risk: 0,
    fire_cells: [],
    smoke_metrics: { percent_area_obscured: 0, max_smoke_density: 0 },
    agent_positions: []
  };

  const progressPct = Math.round((currentFrame.evacuated / Math.max(1, totalOccupants)) * 100);
  const threatLevel = currentFrame.time_sec > 40 ? 'CRITICAL (FLASH)' : currentFrame.time_sec > 15 ? 'HAZARD ELEVATED' : 'STABLE EVAC';

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
      
      {/* Simulation Header & Quick Telemetry HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', color: 'var(--color-navy-deep)' }}>
              Coupled Discrete-Event Evacuation & Hazard Studio
            </h1>
            <span className="badge badge-danger">REAL-TIME MULTI-AGENT</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Real-time simulation coupling cellular fire thermal conduction, optical smoke diffusion, and A* dynamic rerouting.
          </p>
        </div>

        {/* Playback Controls Bar (Section 20) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            id="sim-btn-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? 'linear-gradient(135deg, #E9C46A 0%, #D39E00 100%)' : 'linear-gradient(135deg, #E76F51 0%, #D62828 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              padding: '9px 20px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(231,111,81,0.4)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="#FFFFFF" />}
            {isPlaying ? 'PAUSE' : 'START SIMULATION'}
          </button>

          <button
            onClick={() => { setIsPlaying(false); setCurrentFrameIdx(0); }}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <RotateCcw size={15} /> Reset
          </button>

          {/* Speed Multiplier Pill */}
          <div style={{ display: 'flex', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            {[0.5, 1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: speed === s ? 'var(--color-primary-orange)' : 'rgba(255, 255, 255, 0.05)',
                  color: speed === s ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                ×{s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
            className="btn-secondary"
            style={{
              fontSize: '12px',
              padding: '8px 14px',
              backgroundColor: showDensityHeatmap ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: showDensityHeatmap ? 'var(--color-safe-green)' : 'rgba(255, 255, 255, 0.12)',
              color: showDensityHeatmap ? '#34D399' : '#94A3B8'
            }}
          >
            <Activity size={14} />
            {showDensityHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}
          </button>
        </div>
      </div>

      {/* Advanced Telemetry HUD Strip (Section 21) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Radial Gauge Card */}
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '50px', height: '50px' }}>
            <svg width="50" height="50">
              <circle cx="25" cy="25" r="21" fill="none" stroke="#E9ECEF" strokeWidth="5" />
              <circle
                cx="25"
                cy="25"
                r="21"
                fill="none"
                stroke="var(--color-safe-green)"
                strokeWidth="5"
                strokeDasharray="132"
                strokeDashoffset={132 - (132 * progressPct) / 100}
                strokeLinecap="round"
                transform="rotate(-90 25 25)"
                style={{ transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
              {progressPct}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Evacuation Rate</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-safe-green)' }}>{currentFrame.evacuated} / {totalOccupants}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Simulated Clock</div>
          <div className="mono-metric" style={{ fontSize: '26px', color: 'var(--color-navy-deep)' }}>
            {currentFrame.time_sec.toFixed(1)}s
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Target: &lt; 90.0s</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-primary-orange)', textTransform: 'uppercase', fontWeight: 700 }}>Occupants En Route</div>
          <div className="mono-metric" style={{ fontSize: '26px', color: 'var(--color-primary-orange)' }}>
            {currentFrame.evacuating}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Dynamic A* Routing Active</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-danger-red)', textTransform: 'uppercase', fontWeight: 700 }}>Trapped / At Risk</div>
          <div className="mono-metric" style={{ fontSize: '26px', color: 'var(--color-danger-red)' }}>
            {currentFrame.at_risk}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-safe-green)' }}>Zero Trapped with Reroute</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-safety-orange)', textTransform: 'uppercase', fontWeight: 700 }}>Active Fire Cells</div>
          <div className="mono-metric" style={{ fontSize: '26px', color: 'var(--color-safety-orange)' }}>
            {currentFrame.fire_cells.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Peak: 820°C Thermal Core</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#546E7A', textTransform: 'uppercase', fontWeight: 700 }}>Smoke Obscuration</div>
          <div className="mono-metric" style={{ fontSize: '26px', color: 'var(--color-navy-deep)' }}>
            {currentFrame.smoke_metrics?.percent_area_obscured || 0}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Min Visibility: 1.4m</div>
        </div>
      </div>

      {/* Main Simulation Viewport + Scenario Configuration Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        
        {/* Central Simulation Canvas */}
        <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Timeline Scrubbing Bar */}
          <div style={{ width: '100%', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              <span>Evacuation Progress ({progressPct}% Safe)</span>
              <span className="mono-metric">Frame {currentFrameIdx + 1} / {timeline.length || 1}</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-soft-gray)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-orange) 0%, var(--color-safe-green) 100%)', transition: 'width 0.2s ease' }} />
            </div>
          </div>

          {/* SVG Simulation Surface */}
          <div style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#0F172A', // Dark Slate for crisp thermal visibility
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            <svg width={canvasWidth} height={canvasHeight}>
              
              {/* Floor Layout Background */}
              {floorData.rooms.map(r => (
                <rect
                  key={r.id}
                  x={r.bounds.x * scale}
                  y={r.bounds.y * scale}
                  width={r.bounds.width * scale}
                  height={r.bounds.height * scale}
                  fill="#1E293B"
                  stroke="#334155"
                  strokeWidth="2"
                  rx="3"
                />
              ))}

              {/* Room Text */}
              {floorData.rooms.map(r => (
                <text
                  key={`lbl-${r.id}`}
                  x={(r.bounds.x + r.bounds.width / 2) * scale}
                  y={(r.bounds.y + r.bounds.height / 2) * scale}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#64748B"
                >
                  {r.name}
                </text>
              ))}

              {/* Exits */}
              {floorData.exits.map(ex => {
                const isBlocked = ex.is_blocked || ex.id === blockedExitId;
                return (
                  <g key={ex.id}>
                    <rect
                      x={(ex.position.x * scale) - 22}
                      y={(ex.position.y * scale) - 14}
                      width={44}
                      height={28}
                      fill={isBlocked ? 'var(--color-danger-red)' : 'var(--color-safe-green)'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      rx="4"
                    />
                    <text
                      x={ex.position.x * scale}
                      y={(ex.position.y * scale) + 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="800"
                      fill="#FFFFFF"
                      letterSpacing="0.05em"
                    >
                      {isBlocked ? 'BLOCKED' : 'SAFE EXIT'}
                    </text>
                  </g>
                );
              })}

              {/* Smoke Layer Obscuration Volume */}
              {currentFrame.smoke_metrics?.percent_area_obscured > 2 && (
                <ellipse
                  cx={54 * scale}
                  cy={26 * scale}
                  rx={(currentFrame.smoke_metrics.percent_area_obscured * 4.6)}
                  ry={(currentFrame.smoke_metrics.percent_area_obscured * 3.4)}
                  fill="rgba(100, 116, 139, 0.55)"
                  filter="blur(10px)"
                />
              )}

              {/* Active Fire Cells with Radial Heat Shimmer */}
              <defs>
                <radialGradient id="fireGradStudio" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF59D" />
                  <stop offset="40%" stopColor="#F4A261" />
                  <stop offset="80%" stopColor="#E76F51" />
                  <stop offset="100%" stopColor="#D62828" stopOpacity="0" />
                </radialGradient>
              </defs>

              {currentFrame.fire_cells.map((fc, idx) => (
                <circle
                  key={idx}
                  cx={fc.x_m * scale}
                  cy={fc.y_m * scale}
                  r={18}
                  fill="url(#fireGradStudio)"
                  opacity="0.9"
                />
              ))}

              {/* Occupant Agents Moving */}
              {currentFrame.agent_positions?.map(agent => {
                const isSafe = agent.state === 'SAFE';
                const isAtRisk = agent.state === 'AT_RISK';
                const isRerouting = agent.state === 'REROUTING';

                return (
                  <circle
                    key={agent.id}
                    cx={agent.x * scale}
                    cy={agent.y * scale}
                    r={isSafe ? 3.5 : 5.5}
                    fill={
                      isSafe ? '#2A9D8F' :
                      isAtRisk ? '#D62828' :
                      isRerouting ? '#F4A261' :
                      '#38BDF8'
                    }
                    stroke="#FFFFFF"
                    strokeWidth={isRerouting ? 2 : 1}
                    opacity={isSafe ? 0.35 : 1}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Incident Parameters Sidebar (Section 20) */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-navy-deep)', letterSpacing: '0.04em' }}>
            Incident Configuration
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Occupant Population ({totalOccupants} Persons)
            </label>
            <input 
              type="range" 
              min="40" 
              max="200" 
              value={totalOccupants}
              onChange={(e) => setTotalOccupants(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary-orange)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              <span>40 (Low Load)</span>
              <span>114 (Standard)</span>
              <span>200 (Max Capacity)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px', color: '#CBD5E1' }}>
              Blocked Exit Scenario
            </label>
            <select
              value={blockedExitId}
              onChange={(e) => setBlockedExitId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '6px', fontWeight: 600 }}
            >
              <option value="">None (All Exits Fully Operational)</option>
              {floorData.exits.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} (Simulate Compromise)</option>
              ))}
            </select>
          </div>

          {/* Active Incident Live Telemetry Box */}
          <div style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.3)', borderRadius: '8px', padding: '14px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary-orange)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Flame size={15} /> Incident Phase: {threatLevel}
            </div>
            <div style={{ color: '#E2E8F0', lineHeight: 1.6 }}>
              East Server Hub flashover compromises East Service Exit. Agents in East Gallery automatically detect thermal threshold and execute dynamic A* rerouting toward North Main Plaza Exit.
            </div>
          </div>

          <button
            onClick={runFreshSimulation}
            className="btn-secondary"
            style={{ marginTop: 'auto', justifyContent: 'center', padding: '12px' }}
          >
            Re-calculate Trajectories
          </button>
        </div>

      </div>
    </div>
  );
};
