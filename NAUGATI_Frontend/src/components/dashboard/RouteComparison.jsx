import React from 'react';
import { Trophy, Clock, DollarSign, Activity } from 'lucide-react';

const RouteComparison = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Route Comparison</h3>
      </div>
      
      <div className="flex flex-col gap-md">
        
        {/* Dhamra (Best) */}
        <div className="border-2 border-primary rounded-lg p-4 bg-primary-light relative">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-primary text-white p-1 rounded-full shadow-md">
            <Trophy size={16} />
          </div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-primary">Gladstone → Dhamra</h4>
            <span className="badge badge-primary">Recommended</span>
          </div>
          
          <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted flex items-center gap-xs text-xs"><DollarSign size={12}/> Freight</span>
              <span className="font-semibold">$31.2 / MT</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted flex items-center gap-xs text-xs"><Clock size={12}/> Est. Delay</span>
              <span className="font-semibold text-success">0.5 Days</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted flex items-center gap-xs text-xs"><Activity size={12}/> Congestion</span>
              <span className="font-semibold text-success">Low</span>
            </div>
          </div>
        </div>

        {/* Paradip */}
        <div className="border border-color rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Gladstone → Paradip</h4>
          </div>
          <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Freight</span>
              <span className="font-semibold">$30.8 / MT</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Est. Delay</span>
              <span className="font-semibold text-warning">2.5 Days</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Congestion</span>
              <span className="font-semibold text-warning">Moderate</span>
            </div>
          </div>
        </div>

        {/* Vizag */}
        <div className="border border-color rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Gladstone → Vizag</h4>
          </div>
          <div className="grid grid-cols-3 gap-sm text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Freight</span>
              <span className="font-semibold">$31.5 / MT</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Est. Delay</span>
              <span className="font-semibold text-success">0.5 Days</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-xs">Congestion</span>
              <span className="font-semibold text-success">Low</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted mt-2 border-t border-color pt-3">
          "Dhamra provides the best balance between freight cost, port compatibility, and congestion risk for Panamax vessels carrying Iron Ore."
        </p>
      </div>
    </div>
  );
};

export default RouteComparison;
