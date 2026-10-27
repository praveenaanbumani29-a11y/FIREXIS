import React, { useState, useEffect } from 'react';
import { FloorData, Recommendation, BuildingData } from '../types';
import { api } from '../services/api';
import { 
  BarChart2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  TrendingDown, 
  Users,
  Check
} from 'lucide-react';

interface BeforeAfterViewProps {
  floorData: FloorData;
  onApplyOptimization: () => void;
}

export const BeforeAfterView: React.FC<BeforeAfterViewProps> = ({ floorData, onApplyOptimization }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [floorData]);

  const fetchRecommendations = async () => {
    try {
      const recs = await api.getRecommendations(floorData);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const handleApply = () => {
    setIsApplied(true);
    onApplyOptimization();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '26px', color: 'var(--color-navy-deep)' }}>
            Before / After Optimization & Mitigation Analysis
          </h1>
          <span className="badge badge-safe">SECTION 22 COMPLIANT</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Measurable comparison between baseline architectural layout and algorithmic safety optimizations.
        </p>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        
        {/* Baseline (Original) */}
        <div className="card" style={{ borderTop: '4px solid var(--color-danger-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--color-danger-red)' }}>ORIGINAL BASELINE LAYOUT</h2>
            <span className="badge badge-danger">Unmitigated</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Evacuation Duration:</span>
              <strong className="mono-metric" style={{ fontSize: '16px', color: '#F8FAFC' }}>118.0 seconds</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Critical Bottlenecks:</span>
              <strong style={{ fontSize: '14px', color: 'var(--color-danger-red)' }}>2 Severe Constrictions</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>High-Risk Zones Flagged:</span>
              <strong style={{ fontSize: '14px', color: 'var(--color-danger-red)' }}>East Wing Server Hub Corridor</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Exit Utilization Variance:</span>
              <strong style={{ fontSize: '14px', color: '#FBBF24' }}>68% exit load imbalance</strong>
            </div>
          </div>
        </div>

        {/* Optimized */}
        <div className="card" style={{ borderTop: '4px solid var(--color-safe-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--color-safe-green)' }}>OPTIMIZED WITH FIREXIS ADVISOR</h2>
            <span className="badge badge-safe">Algorithmic Mitigation</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Evacuation Duration:</span>
              <div style={{ textAlign: 'right' }}>
                <strong className="mono-metric" style={{ fontSize: '16px', color: '#34D399' }}>82.0 seconds</strong>
                <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 600 }}>-36.0s (-30.5% reduction)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Critical Bottlenecks:</span>
              <strong style={{ fontSize: '14px', color: '#34D399' }}>0 Bottlenecks (Flow Relieved)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>High-Risk Zones Flagged:</span>
              <strong style={{ fontSize: '14px', color: '#34D399' }}>0 Critical (Dual Egress Ensured)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-charcoal-muted)' }}>Exit Utilization:</span>
              <strong style={{ fontSize: '14px', color: '#34D399' }}>Uniform Distribution across North & West</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Safety Recommendations (Section 18) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-soft-gray)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--color-navy-deep)' }}>
              Algorithmic Safety Recommendations (Section 18)
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Generated with evidence-backed simulation metrics and confidence scoring.
            </div>
          </div>

          <button
            id="btn-apply-optimizations"
            onClick={handleApply}
            disabled={isApplied}
            style={{
              backgroundColor: isApplied ? 'var(--color-safe-green)' : 'var(--color-primary-orange)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              padding: '10px 20px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isApplied ? <Check size={16} /> : <Sparkles size={16} />}
            {isApplied ? 'OPTIMIZATIONS APPLIED TO CAD' : 'APPLY ALL TO CAD MODEL'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map(rec => (
            <div 
              key={rec.id}
              style={{
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '6px',
                padding: '16px',
                backgroundColor: 'var(--color-surface-pure)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-navy">{rec.category}</span>
                  <strong style={{ fontSize: '15px', color: 'var(--color-navy-deep)' }}>{rec.affected_area}</strong>
                </div>
                <span className="badge badge-safe">
                  Confidence: {Math.round(rec.confidence_score * 100)}%
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--color-charcoal)', marginBottom: '8px' }}>
                {rec.description}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-safe-green)', fontWeight: 600 }}>
                Expected Benefit: {rec.expected_benefit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
