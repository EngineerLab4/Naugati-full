import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const PortCompatibility = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Port-Vessel Compatibility</h3>
        <div className="badge" style={{ backgroundColor: 'var(--bg-main)' }}>Dhamra</div>
      </div>
      
      <p className="text-sm text-muted mb-4">Comparing Panamax specifications against port constraints.</p>

      <div className="space-y-4 flex flex-col gap-md">
        
        {/* Draft */}
        <div className="p-3 border rounded border-color flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Maximum Draft</div>
            <div className="text-xs text-muted flex gap-md mt-1">
              <span>Port: 17.0 m</span>
              <span>Vessel: 14.5 m</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-success font-semibold text-sm">
            <CheckCircle2 size={18} /> Compatible
          </div>
        </div>

        {/* LOA */}
        <div className="p-3 border rounded border-color flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Maximum LOA</div>
            <div className="text-xs text-muted flex gap-md mt-1">
              <span>Port: 320 m</span>
              <span>Vessel: 225 m</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-success font-semibold text-sm">
            <CheckCircle2 size={18} /> Compatible
          </div>
        </div>

        {/* Handling Capacity */}
        <div className="p-3 border rounded border-color flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Handling Equipment</div>
            <div className="text-xs text-muted flex gap-md mt-1">
              <span>Port Rate: 70k MT/day</span>
            </div>
            <div className="text-xs text-muted mt-1">No geared vessels required for Iron Ore</div>
          </div>
          <div className="flex items-center gap-xs text-success font-semibold text-sm">
            <CheckCircle2 size={18} /> Compatible
          </div>
        </div>
        
        {/* Constraints */}
        <div className="p-3 border rounded border-color flex items-center justify-between bg-warning-bg border-warning">
          <div>
            <div className="font-medium text-sm text-warning">Tidal Restrictions</div>
            <div className="text-xs text-main mt-1">
              Vessel departure may require tidal window coordination during neap tides.
            </div>
          </div>
          <div className="flex items-center gap-xs text-warning font-semibold text-sm">
            <AlertTriangle size={18} /> Conditional
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortCompatibility;
