import React from 'react';
import { Clock, Info } from 'lucide-react';

const IdleTimeRisk = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Idle-Time Risk Analysis</h3>
      </div>
      
      <div className="flex flex-col gap-lg">
        
        <div className="flex items-center gap-md p-4 rounded-lg bg-success-bg border border-success border-opacity-20">
          <div className="bg-white p-3 rounded-full text-success shadow-sm">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-sm text-muted">Expected Waiting Time</div>
            <div className="text-xl font-bold">12 Hours</div>
            <div className="text-sm text-success font-semibold mt-1">Idle Risk: Low</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Major Contributors</h4>
          
          <div className="grid grid-cols-2 gap-md text-sm">
            <div className="p-3 border border-color rounded">
              <div className="text-muted text-xs mb-1">Port Waiting</div>
              <div className="font-semibold">6 hours</div>
            </div>
            <div className="p-3 border border-color rounded">
              <div className="text-muted text-xs mb-1">Berth Availability</div>
              <div className="font-semibold">Adequate</div>
            </div>
            <div className="p-3 border border-color rounded">
              <div className="text-muted text-xs mb-1">Loading/Discharge</div>
              <div className="font-semibold">Normal</div>
            </div>
            <div className="p-3 border border-color rounded">
              <div className="text-muted text-xs mb-1">Tidal Restrictions</div>
              <div className="font-semibold text-warning">+6 hours (Est.)</div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-3 bg-main rounded border border-color text-sm flex gap-sm items-start">
          <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <span className="text-muted">
            The port operates efficiently with low baseline congestion. Minor delays may arise from coordination with high tides for Panamax departure.
          </span>
        </div>
      </div>
    </div>
  );
};

export default IdleTimeRisk;
