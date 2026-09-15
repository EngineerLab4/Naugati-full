import React from 'react';
import { CheckCircle, TrendingDown, ShieldAlert } from 'lucide-react';

const SmartRecommendation = () => {
  return (
    <div className="card h-full flex flex-col" style={{ border: '2px solid var(--success)', backgroundColor: 'var(--success-bg)' }}>
      <div className="card-header">
        <h3 className="card-title text-success flex items-center gap-sm">
          <CheckCircle size={24} /> AI Market Recommendation
        </h3>
      </div>
      
      <div className="flex-1">
        <div className="text-2xl font-bold text-success mb-2">CONSIDER CHARTERING</div>
        <p className="text-main font-medium mb-6">
          "Freight rates are expected to remain favorable over the next 7 days before stabilizing."
        </p>

        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
            <span className="text-muted text-sm">Expected Rate</span>
            <span className="font-bold text-lg">$31.2/MT</span>
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
            <span className="text-muted text-sm">Potential Saving</span>
            <span className="font-bold text-lg text-success flex items-center gap-xs">
              <TrendingDown size={18} /> ₹42 Lakh
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
            <span className="text-muted text-sm">Execution Risk</span>
            <span className="font-bold text-lg text-warning flex items-center gap-xs">
              <ShieldAlert size={18} /> Medium
            </span>
          </div>
          
          <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
            <span className="text-muted text-sm">Model Confidence</span>
            <span className="font-bold text-lg">82%</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="btn btn-outline w-full" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
          View Decision Factors
        </button>
      </div>
    </div>
  );
};

export default SmartRecommendation;
