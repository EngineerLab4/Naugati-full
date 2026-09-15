import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, Calendar, CheckCircle2, Clock, 
  AlertCircle, Save, ArrowLeft 
} from 'lucide-react';
import { FLEET_VESSELS } from '../../services/demoData';
import { vesselService } from '../../services/vesselService';

export default function VesselAvailabilityManager() {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState(FLEET_VESSELS);
  const [savedId, setSavedId] = useState(null);

  const handleUpdate = (vesselId, newStatus, newDate) => {
    vesselService.updateVesselAvailability(vesselId, {
      status: newStatus,
      availabilityDate: newDate
    });

    setVessels(prev => prev.map(v => {
      if (v.id === vesselId) {
        return { ...v, status: newStatus, availabilityDate: newDate };
      }
      return v;
    }));

    setSavedId(vesselId);
    setTimeout(() => setSavedId(null), 2500);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            FLEET SCHEDULING • OCEAN CARRIER PORTAL
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Vessel Availability Manager
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Declare availability status and open laycan windows. These parameters immediately influence NAUGATI's vessel recommendation engine for global charterers.
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
            gap: '0.4rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Fleet Overview</span>
        </button>
      </div>

      {/* Vessels List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {vessels.map(v => (
          <div key={v.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ship size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{v.name}</h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {v.type} • {v.dwt.toLocaleString()} DWT
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Current Position: <strong>{v.currentPosition.locationName}</strong> • Current Voyage: {v.currentVoyage}
                </div>
              </div>

              {savedId === v.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--semantic-green)', fontSize: '0.85rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} />
                  <span>Availability Saved!</span>
                </div>
              )}
            </div>

            {/* Edit Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              backgroundColor: '#f8fafc',
              padding: '1rem 1.25rem',
              borderRadius: '8px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                  OPERATIONAL STATUS
                </label>
                <select 
                  defaultValue={v.status}
                  id={`status-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                >
                  <option value="Available">Available (Open Position)</option>
                  <option value="Under Voyage">Under Voyage</option>
                  <option value="Loading">Loading</option>
                  <option value="Discharging">Discharging</option>
                  <option value="Maintenance">Maintenance / Drydock</option>
                  <option value="Unavailable">Unavailable / Committed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                  NEXT OPEN LAYCAN DATE
                </label>
                <input 
                  type="date"
                  defaultValue={v.availabilityDate.split(' ')[0]}
                  id={`date-${v.id}`}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    const statusEl = document.getElementById(`status-${v.id}`);
                    const dateEl = document.getElementById(`date-${v.id}`);
                    handleUpdate(v.id, statusEl.value, dateEl.value);
                  }}
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
                  <span>Update Availability</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
