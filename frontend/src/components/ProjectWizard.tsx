import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ProjectWizardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onProjectCreated: (projectData: any) => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ setActiveTab, onProjectCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Apex Horizon Center',
    building_type: 'Commercial Office & High-Tech Lab',
    location: 'Metropolitan Commercial Core',
    total_floors: 3,
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
    onProjectCreated(formData);
    setActiveTab('editor');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '32px auto', padding: '0 24px' }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', color: 'var(--color-navy-deep)', marginBottom: '8px' }}>
          Create New Building Safety Project
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Define architectural properties, occupant distribution, and baseline safety infrastructure.
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
          backgroundColor: 'var(--color-soft-gray)',
          zIndex: 0
        }} />

        {[
          { num: 1, title: 'Building Info', icon: <Building2 size={16} /> },
          { num: 2, title: 'Occupancy', icon: <Users size={16} /> },
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
              1. Architectural & Structural Specification
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Building / Facility Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Building Function</label>
                <input 
                  type="text" 
                  value={formData.building_type} 
                  onChange={(e) => handleChange('building_type', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Location / City</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Total Stories / Levels</label>
                <input 
                  type="number" 
                  value={formData.total_floors} 
                  onChange={(e) => handleChange('total_floors', parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Gross Floor Area (m²)</label>
                <input 
                  type="number" 
                  value={formData.gross_area_sqm} 
                  onChange={(e) => handleChange('gross_area_sqm', parseFloat(e.target.value) || 1000)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Statutory Max Occupancy</label>
                <input 
                  type="number" 
                  value={formData.max_occupancy} 
                  onChange={(e) => handleChange('max_occupancy', parseInt(e.target.value) || 200)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Enclosed Egress Staircases</label>
                <input 
                  type="number" 
                  value={formData.staircases} 
                  onChange={(e) => handleChange('staircases', parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fire Extinguishers (ABC/CO2)</label>
                <input 
                  type="number" 
                  value={formData.fire_extinguishers} 
                  onChange={(e) => handleChange('fire_extinguishers', parseInt(e.target.value) || 4)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fire Hose Reel Stations</label>
                <input 
                  type="number" 
                  value={formData.hose_reels} 
                  onChange={(e) => handleChange('hose_reels', parseInt(e.target.value) || 2)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', fontSize: '14px' }}
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
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} />
            Generate Layout & Open CAD Editor
          </button>
        )}
      </div>
    </div>
  );
};
