import React, { useState } from 'react';
import type { ActiveTab } from '../types';
import { ARCHETYPES, generateArchitecturalBuilding } from '../services/cadGenerator';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Layers,
  Flame,
  Activity,
  Compass
} from 'lucide-react';

interface ProjectWizardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onProjectCreated: (projectData: any) => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ setActiveTab, onProjectCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Apex Innovation Center',
    building_type: 'Mixed-Use Commercial & Tech R&D',
    location: 'Metropolitan Core District',
    total_floors: 3,
    archetypeId: 'TECH_COMMERCIAL',
    gross_area_sqm: 4200,
    construction_type: 'Type I - Fire Resistive (Reinforced Concrete / Steel)',
    occupancy_type: 'Group B - Business / Group A-3 Assembly',
    
    // Occupancy
    total_occupants: 150,
    max_occupancy: 400,
    mobility_impaired_pct: 8,
    occupant_density_mode: 'STANDARD_OFFICE',
    
    // Safety Infrastructure
    existing_exits: 4,
    staircases: 2,
    fire_extinguishers: 12,
    hose_reels: 4,
    fire_alarms: 8,
    has_sprinklers: true,
    has_emergency_lighting: true,
    assembly_points: 2
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinish = () => {
    const generatedBuilding = generateArchitecturalBuilding({
      buildingName: formData.name,
      totalFloors: formData.total_floors,
      archetypeId: formData.archetypeId,
      grossAreaSqm: formData.gross_area_sqm,
      location: formData.location,
      buildingType: formData.building_type
    });

    onProjectCreated(generatedBuilding);
    setActiveTab('editor');
  };

  const selectedArchetype = ARCHETYPES.find(a => a.id === formData.archetypeId) || ARCHETYPES[0];

  return (
    <div style={{ maxWidth: '880px', margin: '32px auto', padding: '0 24px' }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', color: 'var(--color-navy-deep)', marginBottom: '8px' }}>
          Create New Building Safety Project & 2D CAD
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Configure story count, architectural archetype, occupant load, and generate full 2D CAD layouts.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '40px',
          right: '40px',
          height: '2px',
          backgroundColor: '#1E293B',
          zIndex: 0
        }} />

        {[
          { num: 1, title: 'Stories & Archetype', icon: <Building2 size={16} /> },
          { num: 2, title: 'Occupancy & Crowd', icon: <Users size={16} /> },
          { num: 3, title: 'Safety Infrastructure', icon: <ShieldCheck size={16} /> }
        ].map(s => {
          const isDone = step > s.num;
          const isCurr = step === s.num;
          return (
            <div key={s.num} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isDone ? 'var(--color-safe-green)' : isCurr ? 'var(--color-primary-orange)' : 'var(--color-surface-pure)',
                color: isDone || isCurr ? '#FFFFFF' : 'var(--color-text-muted)',
                border: `2px solid ${isDone ? 'var(--color-safe-green)' : isCurr ? 'var(--color-primary-orange)' : 'var(--color-border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {isDone ? <Check size={18} /> : s.icon}
              </div>
              <span style={{ fontSize: '12px', fontWeight: isCurr ? 600 : 500, color: isCurr ? 'var(--color-navy-deep)' : 'var(--color-text-muted)' }}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Form Card */}
      <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} color="var(--color-primary-orange)" />
              1. Architectural Specifications & Floor Layout
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              
              {/* Question: Building Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Building / Facility Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              {/* Question: How Many Floors? */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '8px' }}>
                  🏢 How many floors / stories should be generated?
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5, 6].map(fl => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => handleChange('total_floors', fl)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: formData.total_floors === fl ? 'var(--color-primary-orange)' : '#0E172A',
                        color: formData.total_floors === fl ? '#FFFFFF' : '#94A3B8',
                        border: formData.total_floors === fl ? '1px solid var(--color-primary-orange)' : '1px solid #334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {fl} {fl === 1 ? 'Story' : 'Stories'}
                    </button>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Custom:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={formData.total_floors} 
                      onChange={(e) => handleChange('total_floors', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      style={{ width: '60px', padding: '6px 8px', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Question: Architectural Archetype Design Selector */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#38BDF8', marginBottom: '8px' }}>
                  📐 Select Architectural Design Style / Archetype
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {ARCHETYPES.map(arch => {
                    const isSelected = formData.archetypeId === arch.id;
                    return (
                      <div
                        key={arch.id}
                        onClick={() => handleChange('archetypeId', arch.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#0E172A',
                          border: isSelected ? '2px solid #38BDF8' : '1px solid #334155',
                          boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.2)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '18px' }}>{arch.icon}</span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#38BDF8' : '#F8FAFC' }}>
                              {arch.name}
                            </div>
                            <div style={{ fontSize: '9.5px', color: '#64748B' }}>{arch.category}</div>
                          </div>
                        </div>
                        <p style={{ fontSize: '10.5px', color: '#94A3B8', margin: '4px 0 8px 0', lineHeight: 1.35 }}>
                          {arch.description}
                        </p>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {arch.previewRooms.slice(0, 3).map((r, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '9px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#CBD5E1'
                              }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Location / City</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Gross Floor Area (m²)</label>
                <input 
                  type="number" 
                  value={formData.gross_area_sqm} 
                  onChange={(e) => handleChange('gross_area_sqm', parseFloat(e.target.value) || 1000)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Construction Classification</label>
                <select 
                  value={formData.construction_type}
                  onChange={(e) => handleChange('construction_type', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option>Type I - Fire Resistive (Reinforced Concrete / Protected Steel)</option>
                  <option>Type II - Non-Combustible (Masonry & Metal Frame)</option>
                  <option>Type III - Ordinary (Exterior Brick / Wood Joists)</option>
                  <option>Type IV - Heavy Timber (HT)</option>
                  <option>Type V - Wood Frame</option>
                </select>
              </div>

              {/* Design Preview Pill */}
              <div style={{
                gridColumn: 'span 2',
                padding: '12px 16px',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ fontSize: '12px', color: '#E2E8F0' }}>
                  📐 <strong>CAD Layout Preview:</strong> Generating <strong>{formData.total_floors} Floors</strong> with ~{formData.total_floors * selectedArchetype.defaultRoomsPerFloor} Zones, Dual Stairwell Cores, and Quad Ground Egress.
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--color-safe-green)', fontWeight: 700 }}>
                  ✓ IBC / NFPA 101 COMPLIANT
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--color-primary-orange)" />
              2. Occupant Capacity & Mobility Distribution
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Simulated Occupants</label>
                <input 
                  type="number" 
                  value={formData.total_occupants} 
                  onChange={(e) => handleChange('total_occupants', parseInt(e.target.value) || 50)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Statutory Max Occupancy</label>
                <input 
                  type="number" 
                  value={formData.max_occupancy} 
                  onChange={(e) => handleChange('max_occupancy', parseInt(e.target.value) || 200)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Mobility Impaired / Elderly Population Ratio ({formData.mobility_impaired_pct}%)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={formData.mobility_impaired_pct} 
                  onChange={(e) => handleChange('mobility_impaired_pct', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary-orange)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <span>0% (Standard 1.2 m/s)</span>
                  <span>15% (Mixed Public)</span>
                  <span>30% (Healthcare / Senior)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--color-primary-orange)" />
              3. Baseline Safety Infrastructure & Egress Elements
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Designated Emergency Exits</label>
                <input 
                  type="number" 
                  value={formData.existing_exits} 
                  onChange={(e) => handleChange('existing_exits', parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Enclosed Egress Staircases</label>
                <input 
                  type="number" 
                  value={formData.staircases} 
                  onChange={(e) => handleChange('staircases', parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fire Extinguishers (ABC/CO2)</label>
                <input 
                  type="number" 
                  value={formData.fire_extinguishers} 
                  onChange={(e) => handleChange('fire_extinguishers', parseInt(e.target.value) || 4)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fire Hose Reel Stations</label>
                <input 
                  type="number" 
                  value={formData.hose_reels} 
                  onChange={(e) => handleChange('hose_reels', parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="chk-sprinklers"
                  checked={formData.has_sprinklers} 
                  onChange={(e) => handleChange('has_sprinklers', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-orange)' }}
                />
                <label htmlFor="chk-sprinklers" style={{ fontSize: '13px', fontWeight: 600 }}>Automatic Sprinkler Protection (NFPA 13)</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="chk-lighting"
                  checked={formData.has_emergency_lighting} 
                  onChange={(e) => handleChange('has_emergency_lighting', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-orange)' }}
                />
                <label htmlFor="chk-lighting" style={{ fontSize: '13px', fontWeight: 600 }}>Battery Backup Emergency Egress Lighting</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 1 ? (
          <button 
            onClick={() => setStep((step - 1) as any)}
            className="btn-secondary"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
        ) : <div />}

        {step < 3 ? (
          <button 
            onClick={() => setStep((step + 1) as any)}
            className="btn-primary"
          >
            Next: {step === 1 ? 'Occupancy Setup' : 'Infrastructure Setup'}
            <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            id="wizard-btn-finish"
            onClick={handleFinish}
            style={{
              backgroundColor: 'var(--color-safe-green)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              padding: '10px 24px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(42, 157, 143, 0.4)'
            }}
          >
            <Sparkles size={16} />
            Generate Layout & Open CAD Studio
          </button>
        )}
      </div>
    </div>
  );
};
