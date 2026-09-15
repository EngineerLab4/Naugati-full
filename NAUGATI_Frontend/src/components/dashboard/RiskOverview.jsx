import React from 'react';
import { ShieldAlert } from 'lucide-react';

const RiskOverview = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Risk Overview</h3>
      </div>
      
      <div className="flex flex-col gap-md">
        
        <div className="text-center p-4 border border-color rounded-lg bg-main mb-2">
          <div className="text-sm text-muted mb-1">Overall Risk Score</div>
          <div className="text-3xl font-bold flex items-center justify-center gap-sm">
            <ShieldAlert size={28} className="text-warning" /> 34 / 100
          </div>
          <div className="text-warning font-semibold text-sm mt-1">LOW TO MODERATE</div>
        </div>

        <div className="space-y-4 flex flex-col gap-md">
          {/* Risk Bars */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Freight Volatility</span>
              <span className="text-warning font-medium">Medium</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Port Congestion</span>
              <span className="text-success font-medium">Low</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Vessel Compatibility</span>
              <span className="text-success font-medium">Low</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Weather</span>
              <span className="text-warning font-medium">Medium</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Geopolitical Risk</span>
              <span className="text-warning font-medium">Medium</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Idle-Time Risk</span>
              <span className="text-success font-medium">Low</span>
            </div>
            <div className="w-full bg-main rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskOverview;
