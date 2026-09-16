import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, Calendar, CheckCircle2, Clock, 
  AlertCircle, Save, ArrowLeft, Filter, MapPin, DollarSign, Radio
} from 'lucide-react';
import { FLEET_VESSELS, PORTS, ORIGINS } from '../../services/demoData';
import { vesselService } from '../../services/vesselService';
import { apiClient } from '../../services/apiClient';

const AVAILABLE_OPEN_PORTS = [
  "Dhamra Port, India",
  "Paradip Port, India",
  "Visakhapatnam Port, India",
  "Haldia Dock Complex, India",
  "Gangavaram Port, India",
  "Singapore Anchorage",
  "Hay Point, Australia",
  "Newcastle, Australia",
  "Samarinda, Indonesia",
  "Richards Bay, South Africa",
  "Maputo, Mozambique"
];

export default function VesselAvailabilityManager() {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState(FLEET_VESSELS);
  const [selectedVesselFilter, setSelectedVesselFilter] = useState('All');
  const [savedId, setSavedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered vessel list based on dropdown select option
  const displayedVessels = useMemo(() => {
    if (selectedVesselFilter === 'All') return vessels;
    return vessels.filter(v => v.id === selectedVesselFilter);
  }, [vessels, selectedVesselFilter]);

  const handleUpdate = async (vesselId, newStatus, newDate, newPort, newRate) => {
    setIsSaving(true);
    const payload = {
      status: newStatus,
      availabilityDate: newDate,
      openPort: newPort,
      timeCharterUSDPerDay: Number(newRate) || 16500,
      timestamp: new Date().toISOString()
    };

    // 1. Update in-memory service
    vesselService.updateVesselAvailability(vesselId, payload);

    // 2. Transmit to backend API
    try {
      await apiClient.declareAvailability(vesselId, {
        declared_status: newStatus,
        available_from: newDate,
        open_port: newPort,
        expected_hire_rate: Number(newRate) || 16500
      });
    } catch (err) {
      console.warn('[VesselAvailabilityManager] Backend declaration fallback:', err.message);
    }

    // 3. Update local UI state
    setVessels(prev => prev.map(v => {
      if (v.id === vesselId) {
        return { 
          ...v, 
          status: newStatus, 
          availabilityDate: newDate,
          timeCharterUSDPerDay: Number(newRate) || v.timeCharterUSDPerDay,
          currentPosition: {
            ...v.currentPosition,
            locationName: newPort
          }
        };
      }
      return v;
    }));

    setIsSaving(false);
    setSavedId(vesselId);
    setTimeout(() => setSavedId(null), 2800);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              FLEET SCHEDULING • OCEAN CARRIER PORTAL
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              <Radio size={12} color="#16a34a" />
              Live Transponder Active
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Vessel Availability Manager
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Declare availability status, open laycan windows, and target open ports. These parameters immediately feed into NAUGATI's vessel matching engine.
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard/fleet')}
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#334155'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Fleet Overview</span>
        </button>
      </div>

      {/* Select Option Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Select Target Vessel:</span>
          <select
            value={selectedVesselFilter}
            onChange={e => setSelectedVesselFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              fontFamily: 'Poppins',
              backgroundColor: 'white',
              minWidth: '240px'
            }}
          >
            <option value="All">All Fleet Vessels ({vessels.length})</option>
            {vessels.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.type} • {v.status})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong>{displayedVessels.length}</strong> vessel scheduling card{displayedVessels.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Vessels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {displayedVessels.map(v => (
          <div key={v.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Ship size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{v.name}</h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {v.type} • {v.dwt?.toLocaleString()} DWT
                  </span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#f0fdf4', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                    GPS: {v.currentPosition?.lat?.toFixed(2)}°N, {v.currentPosition?.lng?.toFixed(2)}°E
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Current Position: <strong>{v.currentPosition?.locationName}</strong> • Current Voyage: <strong>{v.currentVoyage}</strong> • Speed: <strong>{v.speed} kts</strong>
                </div>
              </div>

              {savedId === v.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--semantic-green)', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                  <CheckCircle2 size={16} />
                  <span>Availability Broadcasted!</span>
                </div>
              ) : (
                <span style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: v.status === 'Available' ? 'var(--semantic-green-light)' : (v.status === 'Under Voyage' ? 'var(--primary-light)' : '#fef3c7'),
                  color: v.status === 'Available' ? 'var(--semantic-green)' : (v.status === 'Under Voyage' ? 'var(--primary)' : '#b45309')
                }}>
                  Current: {v.status}
                </span>
              )}
            </div>

            {/* Editable Scheduling Form */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Select Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  OPERATIONAL STATUS
                </label>
                <select 
                  defaultValue={v.status}
                  id={`status-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                >
                  <option value="Available">Available (Open Position)</option>
                  <option value="Under Voyage">Under Voyage</option>
                  <option value="Loading">Loading</option>
                  <option value="Discharging">Discharging</option>
                  <option value="Maintenance">Maintenance / Drydock</option>
                  <option value="Unavailable">Unavailable / Committed</option>
                </select>
              </div>

              {/* Select Open Port */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  OPEN PORT / ANCHORAGE
                </label>
                <select
                  defaultValue={v.currentPosition?.locationName || AVAILABLE_OPEN_PORTS[0]}
                  id={`port-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                >
                  {AVAILABLE_OPEN_PORTS.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Next Open Laycan Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  NEXT OPEN LAYCAN DATE
                </label>
                <input 
                  type="date"
                  defaultValue={v.availabilityDate?.split(' ')[0] || '2026-09-24'}
                  id={`date-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                />
              </div>

              {/* Rate Idea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  RATE IDEA (USD/DAY)
                </label>
                <input 
                  type="number"
                  defaultValue={v.timeCharterUSDPerDay || 16800}
                  id={`rate-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                />
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    const statusEl = document.getElementById(`status-${v.id}`);
                    const dateEl = document.getElementById(`date-${v.id}`);
                    const portEl = document.getElementById(`port-${v.id}`);
                    const rateEl = document.getElementById(`rate-${v.id}`);
                    handleUpdate(v.id, statusEl.value, dateEl.value, portEl.value, rateEl.value);
                  }}
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Broadcasting...' : 'Update Availability'}</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
