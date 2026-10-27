import React, { useState, useEffect } from 'react';
import { BuildingData } from '../types';
import { api } from '../services/api';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  Users, 
  Flame, 
  Clock, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface ReportViewProps {
  buildingData: BuildingData;
}

export const ReportView: React.FC<ReportViewProps> = ({ buildingData }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [buildingData]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateReport({ building_data: buildingData });
      setReport(res);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !report) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
        Generating 12-Section Technical Safety Audit Report...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1040px', margin: '32px auto', padding: '0 24px' }}>
      {/* Report Header Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }} className="no-print">
        <div>
          <h1 style={{ fontSize: '24px', color: 'var(--color-navy-deep)' }}>
            Fire Safety Assessment & Evacuation Audit Report
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>
            Report Document #{report.report_id} | Generated {new Date(report.generated_at).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            id="btn-print-report"
            onClick={handlePrint}
            className="btn-primary"
            style={{ fontSize: '13px' }}
          >
            <Printer size={16} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="card" style={{ padding: '48px', backgroundColor: 'var(--color-surface-pure)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border-subtle)' }}>
        
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.12)', paddingBottom: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary-orange)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              FIREXIS ENGINEERING AUDIT SUITE
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', marginTop: '4px' }}>
              FACILITY EVACUATION & RISK ASSESSMENT
            </div>
            <div style={{ fontSize: '14px', color: '#94A3B8' }}>
              Project: {report.section_1_building_information.name}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-navy" style={{ marginBottom: '6px' }}>{report.classification}</span>
            <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>ID: {report.report_id}</div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '14px 18px',
          fontSize: '12.5px',
          color: '#FDE68A',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          <strong>REGULATORY NOTICE:</strong> {report.regulatory_disclaimer}
        </div>

        {/* 12 Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1 & 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', border: '1px solid var(--color-border-subtle)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#38BDF8' }}>1. Building Information</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Structure:</strong> {report.section_1_building_information.name}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Occupancy Type:</strong> {report.section_1_building_information.type}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Construction:</strong> {report.section_1_building_information.construction_type}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Total Levels:</strong> {report.section_1_building_information.total_floors} Floors ({report.section_1_building_information.gross_floor_area_sqm} m²)</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', border: '1px solid var(--color-border-subtle)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#38BDF8' }}>2. Occupancy Demographics</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Design Capacity:</strong> {report.section_2_occupancy_information.maximum_occupancy_capacity} Persons</div>
                <div><strong style={{ color: '#F8FAFC' }}>Simulated Load:</strong> {report.section_2_occupancy_information.simulated_occupant_load} Occupants</div>
                <div><strong style={{ color: '#F8FAFC' }}>Mobility Impaired Ratio:</strong> {report.section_2_occupancy_information.mobility_impaired_distribution}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Occupant Density:</strong> {report.section_2_occupancy_information.occupant_density_per_sqm} pers/m²</div>
              </div>
            </div>
          </div>

          {/* Section 3 & 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', border: '1px solid var(--color-border-subtle)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#38BDF8' }}>3. Safety Infrastructure</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Designated Exits:</strong> {report.section_3_safety_infrastructure.total_primary_exits} Exits</div>
                <div><strong style={{ color: '#F8FAFC' }}>Extinguisher Units:</strong> {report.section_3_safety_infrastructure.fire_extinguisher_units} Multi-Purpose ABC/CO2</div>
                <div><strong style={{ color: '#F8FAFC' }}>Hose Reel Stations:</strong> {report.section_3_safety_infrastructure.fire_hose_reel_stations} Units</div>
                <div><strong style={{ color: '#F8FAFC' }}>Stairwell Shafts:</strong> {report.section_3_safety_infrastructure.stairwells_count} (1 Pressurized)</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(8, 13, 26, 0.7)', border: '1px solid var(--color-border-subtle)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#38BDF8' }}>4. Topological Evacuation Analysis</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Network Graph Status:</strong> {report.section_4_evacuation_analysis.graph_connectivity_status}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Mean Travel Distance:</strong> {report.section_4_evacuation_analysis.mean_travel_distance_to_exit_meters} m</div>
                <div><strong style={{ color: '#F8FAFC' }}>Max Observed Distance:</strong> {report.section_4_evacuation_analysis.max_travel_distance_detected_meters} m (Code limit: 30m)</div>
                <div><strong style={{ color: '#F8FAFC' }}>Discharge Capacity:</strong> {report.section_4_evacuation_analysis.exit_discharge_capacity_status}</div>
              </div>
            </div>
          </div>

          {/* Section 5, 6, 7 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ border: '1px solid var(--color-border-subtle)', padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(8, 13, 26, 0.5)' }}>
              <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--color-primary-orange)' }}>5. Fire Spread Engine</h3>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Scenario: {report.section_5_fire_simulation.scenario_tested}. Peak thermal output {report.section_5_fire_simulation.thermal_peak_celsius}°C.
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(8, 13, 26, 0.5)' }}>
              <h3 style={{ fontSize: '13px', marginBottom: '8px', color: '#38BDF8' }}>6. Smoke Diffusion</h3>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Critical obscuration at t={report.section_6_smoke_simulation.time_to_optical_density_critical_seconds}s. Min visibility {report.section_6_smoke_simulation.visibility_minimum_observed_meters}m in East Wing.
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border-subtle)', padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(8, 13, 26, 0.5)' }}>
              <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--color-safe-green)' }}>7. Crowd Dynamics</h3>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Success rate {report.section_7_crowd_analysis.evacuation_success_rate}. Total evacuation completed in {report.section_7_crowd_analysis.evacuation_duration_seconds}s.
              </div>
            </div>
          </div>

          {/* Section 8 & 9: Risk & Bottlenecks */}
          <div style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.25)', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--color-primary-orange)' }}>
              8 & 9. Spatial Risk Assessment & Bottleneck Identification
            </h3>
            <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.section_9_bottlenecks.map((b: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span><strong style={{ color: '#F8FAFC' }}>{b.location}:</strong> Density {b.peak_crowd_density}</span>
                  <span style={{ color: 'var(--color-danger-red)', fontWeight: 600 }}>+{b.delay_incurred_seconds}s egress delay</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: Recommendations */}
          <div>
            <h3 style={{ fontSize: '15px', marginBottom: '12px', color: '#F8FAFC' }}>
              10. Prescriptive Safety Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {report.section_10_recommendations?.map((r: any, idx: number) => (
                <div key={idx} style={{ padding: '12px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', backgroundColor: 'rgba(8, 13, 26, 0.6)' }}>
                  <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{r.affected_area}: {r.description}</div>
                  <div style={{ color: 'var(--color-safe-green)', marginTop: '4px', fontSize: '12px', fontWeight: 600 }}>{r.expected_benefit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 11 & 12 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#34D399' }}>11. Quantitative Optimization Metrics</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div>Baseline Duration: <strong style={{ color: '#F8FAFC' }}>{report.section_11_simulation_metrics.baseline_evacuation_time_seconds}s</strong></div>
                <div>Optimized Duration: <strong style={{ color: '#34D399' }}>{report.section_11_simulation_metrics.optimized_evacuation_time_seconds}s</strong></div>
                <div style={{ fontWeight: 700, color: '#34D399', marginTop: '4px' }}>
                  Total Time Savings: {report.section_11_simulation_metrics.time_savings_seconds}s ({report.section_11_simulation_metrics.time_reduction_percentage})
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--color-primary-orange)' }}>12. Firefighter Tactical Response Profile</h3>
              <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#CBD5E1' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Primary Breach:</strong> {report.section_12_firefighter_profile.primary_tactical_access}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Attack Stair:</strong> {report.section_12_firefighter_profile.viable_evacuation_stairwell}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Hazardous Materials:</strong> {report.section_12_firefighter_profile.hazardous_materials_present}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
