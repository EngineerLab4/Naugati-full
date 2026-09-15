import React from 'react';
import { Lightbulb, ArrowRight, Play, Pause, Eye } from 'lucide-react';

const CharteringAdvisor = () => {
  return (
    <div className="card h-full border-primary shadow-md">
      <div className="card-header">
        <h3 className="card-title text-primary flex items-center gap-sm">
          <Lightbulb size={20} /> Intelligent Chartering Advisor
        </h3>
      </div>
      
      <div className="flex flex-col gap-lg">
        
        {/* Action Options */}
        <div className="grid grid-cols-3 gap-sm text-center">
          <div className="p-3 border border-color rounded-lg opacity-60">
            <Play size={20} className="mx-auto mb-1 text-muted" />
            <div className="text-sm font-semibold">Charter Now</div>
          </div>
          <div className="p-3 border-2 border-primary bg-primary-light rounded-lg shadow-sm">
            <Pause size={20} className="mx-auto mb-1 text-primary" />
            <div className="text-sm font-bold text-primary">Wait</div>
          </div>
          <div className="p-3 border border-color rounded-lg opacity-60">
            <Eye size={20} className="mx-auto mb-1 text-muted" />
            <div className="text-sm font-semibold">Monitor</div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="text-center p-4 bg-main rounded-lg border border-color">
          <h4 className="text-sm text-muted mb-1">Recommended Action</h4>
          <div className="text-2xl font-bold text-success mb-3">WAIT 5–7 DAYS</div>
          
          <div className="grid grid-cols-3 gap-sm text-sm text-left">
            <div className="bg-white p-2 rounded shadow-sm border border-color">
              <div className="text-xs text-muted">Est. Rate Change</div>
              <div className="font-semibold text-success">-4.2%</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm border border-color">
              <div className="text-xs text-muted">Potential Saving</div>
              <div className="font-semibold text-success">₹42 Lakh</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm border border-color">
              <div className="text-xs text-muted">Risk</div>
              <div className="font-semibold text-warning">Medium</div>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div>
          <details className="group cursor-pointer">
            <summary className="text-sm font-semibold text-primary flex items-center gap-xs">
              Why this recommendation?
            </summary>
            <div className="text-sm text-muted mt-2 pl-4 border-l-2 border-primary bg-main p-3 rounded-r-lg">
              <ul className="list-disc pl-4 space-y-1">
                <li>Forecast models indicate a slight easing in Panamax rates early next week due to increased tonnage availability in the Pacific basin.</li>
                <li>Current port congestion at Dhamra is low, allowing flexibility in arrival windows.</li>
                <li>Waiting beyond 7 days increases execution risk as seasonal coal demand may tighten vessel supply.</li>
              </ul>
            </div>
          </details>
        </div>

      </div>
    </div>
  );
};

export default CharteringAdvisor;
