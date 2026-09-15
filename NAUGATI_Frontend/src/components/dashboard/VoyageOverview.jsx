import React from 'react';
import { ArrowRight, Info } from 'lucide-react';

const VoyageOverview = () => {
  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <h3 className="card-title">Voyage Overview</h3>
        <div className="badge badge-primary">High Data Confidence</div>
      </div>

      <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex-1 text-center">
          <div className="text-xl font-bold">Gladstone</div>
          <div className="text-muted">Australia</div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          {/* Stylized route line */}
          <div style={{ width: '100%', height: 2, backgroundColor: 'var(--primary-light)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', color: 'var(--primary)' }}>
              <ArrowRight size={24} />
            </div>
            {/* Animated dot */}
            <div style={{ position: 'absolute', top: -3, left: '20%', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 2s infinite' }}></div>
          </div>
          <div className="text-sm font-medium mt-4 text-primary">5,420 NM</div>
        </div>

        <div className="flex-1 text-center">
          <div className="text-xl font-bold">Dhamra</div>
          <div className="text-muted">India</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md flex-1 items-center">
        <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
          <div className="text-muted text-sm mb-1">Cargo</div>
          <div className="font-semibold text-lg">70,000 MT</div>
          <div className="text-xs text-muted">Iron Ore</div>
        </div>
        
        <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
          <div className="text-muted text-sm mb-1">Vessel Req.</div>
          <div className="font-semibold text-lg">Panamax</div>
          <div className="text-xs text-muted">Or larger</div>
        </div>
        
        <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-main)' }}>
          <div className="text-muted text-sm mb-1">Transit Time</div>
          <div className="font-semibold text-lg">~18 Days</div>
          <div className="text-xs text-muted">@ 12.5 knots</div>
        </div>
        
        <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--primary-light)' }}>
          <div className="text-primary text-sm mb-1 font-medium">Est. Freight</div>
          <div className="font-bold text-xl text-primary">$31.2/MT</div>
          <div className="text-xs text-primary flex items-center justify-center gap-xs">
            <Info size={12} /> Live Rate
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageOverview;
