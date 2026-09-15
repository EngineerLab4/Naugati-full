import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

const ContractStrategy = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Contract Strategy Optimizer</h3>
      </div>
      
      <div className="flex flex-col gap-md">
        
        <div className="space-y-3">
          {/* Spot */}
          <div className="p-3 border border-color rounded opacity-60">
            <div className="font-semibold text-sm mb-1">Single Voyage (Spot)</div>
            <div className="flex gap-lg text-xs text-muted">
              <span>Flexibility: High</span>
              <span>Cost Certainty: Low</span>
              <span>Risk: High</span>
            </div>
          </div>

          {/* Short Term */}
          <div className="p-3 border-2 border-primary bg-primary-light rounded relative">
            <div className="absolute top-2 right-2 text-primary">
              <CheckCircle2 size={18} />
            </div>
            <div className="font-bold text-sm text-primary mb-1">Short-Term Multiple Voyage</div>
            <div className="flex gap-lg text-xs text-main font-medium">
              <span>Flexibility: Medium</span>
              <span>Cost Certainty: High</span>
              <span>Risk: Low</span>
            </div>
          </div>

          {/* Medium Term */}
          <div className="p-3 border border-color rounded opacity-60">
            <div className="font-semibold text-sm mb-1">Medium-Term (COA)</div>
            <div className="flex gap-lg text-xs text-muted">
              <span>Flexibility: Low</span>
              <span>Cost Certainty: High</span>
              <span>Risk: Medium</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-color pt-4">
          <h4 className="text-sm font-semibold mb-2">Recommended Strategy</h4>
          <div className="font-bold text-lg text-primary mb-2">Short-Term Multiple Voyage Contract</div>
          <p className="text-sm text-muted">
            Locking in a short-term contract (2-3 voyages) capitalizes on the currently softening market while protecting against anticipated Q4 volatility. This provides better cost certainty than Spot without the rigidity of a long-term COA.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContractStrategy;
