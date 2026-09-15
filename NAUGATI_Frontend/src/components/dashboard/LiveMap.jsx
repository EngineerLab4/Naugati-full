import React from 'react';
import { Search, Filter, Layers, Navigation, AlertTriangle, CloudRain, Anchor } from 'lucide-react';

const LiveMap = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-height) - 4rem)' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Live Maritime Dashboard</h2>
          <p className="text-muted">Real-time vessel tracking, port congestion, and risk zones.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Search size={16} className="text-muted" style={{ marginRight: '0.5rem' }} />
            <input type="text" placeholder="Search Vessel/IMO..." style={{ border: 'none', outline: 'none', fontFamily: 'Poppins' }} />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={16} /> Filters</button>
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Abstract Map Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#e2e8f0', backgroundImage: 'radial-gradient(var(--bg-surface) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Map UI Elements */}
        
        {/* Map Layers Control */}
        <div className="card" style={{ position: 'absolute', top: '20px', right: '20px', width: '200px', padding: '1rem' }}>
          <div className="flex items-center gap-2" style={{ fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}><Layers size={16} /> Layers</div>
          <div className="flex-col gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Vessels (245)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Ports</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> My Routes</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Weather Zones</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Risk Areas</label>
          </div>
        </div>

        {/* Selected Vessel Drawer / Panel */}
        <div className="card" style={{ position: 'absolute', bottom: '20px', left: '20px', width: '350px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
          <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em' }}>SELECTED VESSEL</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>MV PACIFIC GRACE</h3>
            </div>
            <div style={{ backgroundColor: 'var(--semantic-green-light)', color: 'var(--semantic-green)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Underway</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Speed / Course</div>
              <div style={{ fontWeight: 600 }}>12.4 kn / 284°</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Destination</div>
              <div style={{ fontWeight: 600 }}>Dhamra, IN</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>ETA</div>
              <div style={{ fontWeight: 600 }}>25 Sept, 08:00</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Status</div>
              <div style={{ fontWeight: 600 }} className="text-green">On Time</div>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%' }}>View Full Intelligence</button>
        </div>

        {/* Visual Map Elements (Markers) */}
        
        {/* Vessel Marker */}
        <div style={{ position: 'absolute', left: '45%', top: '60%', transform: 'rotate(-45deg)' }}>
          <Navigation size={24} fill="var(--primary)" color="white" />
        </div>

        {/* Port Marker */}
        <div style={{ position: 'absolute', left: '30%', top: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', border: '2px solid var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Anchor size={16} />
          </div>
          <div style={{ fontWeight: 700, marginTop: '4px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Dhamra</div>
        </div>

        {/* Weather Zone */}
        <div style={{ position: 'absolute', left: '55%', top: '35%', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--semantic-yellow-light)', border: '2px dashed var(--semantic-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          <CloudRain size={32} className="text-yellow" />
        </div>

      </div>
    </div>
  );
};

export default LiveMap;
