import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, Star, CheckCircle, Navigation, Anchor, 
  Ship, ShieldAlert, ArrowRight, Activity 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { vesselService } from '../../services/vesselService';
import LockedGate from './LockedGate';

export default function VesselAvailability() {
  const navigate = useNavigate();
  const { shipment, updateShipment, activePort, hasExecuted, analysisResult } = useShipment();

  // All hooks before any conditional return
  const [filterType, setFilterType] = useState('All');
  const [minScore, setMinScore] = useState(70);
  const [sortBy, setSortBy] = useState('Best Match');
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasExecuted || !analysisResult) return; // guard inside effect
    async function load() {
      setLoading(true);
      const res = await vesselService.matchVesselsForCargo({
        cargoQuantity: shipment.cargoQuantity,
        destinationPortId: shipment.destinationPortId,
        preferredLoadingDate: shipment.preferredLoadingDate,
        priority: shipment.cargoPriority
      });

      let list = res.matchedVessels;
      if (filterType !== 'All') {
        list = list.filter(v => v.type === filterType);
      }
      list = list.filter(v => v.matchScore >= minScore);

      if (sortBy === 'Lowest Freight') {
        list.sort((a, b) => a.estimatedFreightUSDPerMT - b.estimatedFreightUSDPerMT);
      } else if (sortBy === 'Deadheading') {
        list.sort((a, b) => a.deadheadingDistanceNM - b.deadheadingDistanceNM);
      } else {
        list.sort((a, b) => b.matchScore - a.matchScore);
      }

      setVessels(list);
      setLoading(false);
    }
    load();
  }, [shipment.cargoQuantity, shipment.destinationPortId, shipment.cargoPriority, filterType, minScore, sortBy, hasExecuted, analysisResult]);

  // Lock gate — after all hooks
  if (!hasExecuted || !analysisResult) {
    return <LockedGate pageName="Vessel Matching" />;
  }

  const handleSelectVessel = (vessel) => {
    updateShipment({ preferredVesselType: vessel.type });
    navigate(`/dashboard/vessel/${vessel.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            INTELLIGENT VESSEL CHARTER MATCHING
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Available Bulk Carrier Tonnage
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Matched for <strong>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</strong> discharging at <strong>{activePort.name}</strong> (Draft limit: {activePort.maxDraft}m).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sort by:</span>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '0.5rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', outline: 'none' }}
          >
            <option value="Best Match">NAUGATI Score (Best Match)</option>
            <option value="Lowest Freight">Lowest Estimated Freight ($/MT)</option>
            <option value="Deadheading">Lowest Repositioning Distance</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Filters (Left) + Matched Vessel Cards (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.75rem' }}>
        
        {/* Filter Panel */}
        <div className="card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <Filter size={16} color="var(--primary)" />
            <span>Refine Criteria</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Vessel Class Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Vessel Size Class
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {['All', 'Capesize', 'Panamax', 'Supramax', 'Handysize'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="vesselTypeFilter" 
                      checked={filterType === t} 
                      onChange={() => setFilterType(t)} 
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Min NAUGATI Score Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                <span>Min Match Score:</span>
                <span style={{ color: 'var(--primary)' }}>{minScore}/100</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={minScore} 
                onChange={e => setMinScore(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Port Draft Constraint Notice */}
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
              <strong>Port Constraint:</strong> {activePort.name} maximum draft is <strong>{activePort.maxDraft}m</strong>. Vessels exceeding this will trigger conditional lightering.
            </div>

          </div>
        </div>

        {/* Matched Vessels List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Activity size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
              <div>Ranking candidates by stowage, draft compatibility, and deadheading...</div>
            </div>
          ) : vessels.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <h3>No vessels matched the selected filter thresholds.</h3>
              <p style={{ fontSize: '0.85rem' }}>Lower the minimum score or select "All" vessel types.</p>
            </div>
          ) : (
            vessels.map((v, idx) => {
              const isRecommended = idx === 0 && filterType === 'All';

              return (
                <div 
                  key={v.id} 
                  className="card" 
                  style={{ 
                    padding: '1.75rem', 
                    border: isRecommended ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  {isRecommended && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '24px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      padding: '3px 12px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      <Star size={12} fill="white" /> TOP NAUGATI RECOMMENDATION
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Ship size={20} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{v.name}</h2>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          IMO {v.imo}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.3rem' }}>
                        {v.type} • <strong>{v.dwt.toLocaleString()} DWT</strong> • Draft: <strong>{v.draft}m</strong> • Built {v.built} • Owner: {v.owner}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                        {v.matchScore}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>COMPOSITE MATCH SCORE</div>
                    </div>
                  </div>

                  {/* Telematics Bar */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '0.75rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>CURRENT POSITION</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.currentPosition.locationName.split('(')[0]}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>NEXT OPEN DATE</div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.availabilityDate}</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>BALLAST DISTANCE</div>
                      <div style={{ fontWeight: 700 }}>{v.deadheadingDistanceNM} NM</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>EST. FREIGHT</div>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>${v.estimatedFreightUSDPerMT.toFixed(2)}/MT</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem' }}>PORT DRAFT FIT</div>
                      <div style={{ 
                        fontWeight: 700, 
                        color: v.portCompatibility.verdict === 'Compatible' ? 'var(--semantic-green)' : 'var(--semantic-amber)' 
                      }}>
                        {v.portCompatibility.verdict}
                      </div>
                    </div>
                  </div>

                  {/* Why this vessel explainability */}
                  <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.4, marginBottom: '1.25rem', backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                    <strong>Why this vessel:</strong> {v.recommendationReason}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      onClick={() => navigate(`/dashboard/vessel/${v.id}`)}
                      style={{
                        padding: '0.55rem 1.25rem',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      View Specs & Telematics
                    </button>
                    <button 
                      onClick={() => handleSelectVessel(v)}
                      style={{
                        padding: '0.55rem 1.4rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Select for Charter Recommendation
                    </button>
                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}
