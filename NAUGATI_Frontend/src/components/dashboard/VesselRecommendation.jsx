import React from 'react';
import { Ship, Check, AlertCircle } from 'lucide-react';

const VesselRecommendation = () => {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">Recommended Vessel</h3>
      </div>
      
      <div className="flex flex-col gap-md">
        {/* Highlighted Recommendation */}
        <div className="p-6 rounded-lg text-center" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <Ship size={48} className="mx-auto mb-2" />
          <h2 className="text-3xl font-bold mb-1">PANAMAX</h2>
          <div className="inline-flex items-center gap-xs px-3 py-1 bg-white text-primary rounded-full font-bold text-sm">
            Suitability Score: 93/100
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 my-2 text-sm">
          <div className="flex justify-between p-2 bg-main rounded">
            <span className="text-muted">Capacity</span>
            <span className="font-semibold">~75,000 DWT</span>
          </div>
          <div className="flex justify-between p-2 bg-main rounded">
            <span className="text-muted">Draft</span>
            <span className="font-semibold">14.5 m</span>
          </div>
          <div className="flex justify-between p-2 bg-main rounded">
            <span className="text-muted">LOA</span>
            <span className="font-semibold">225 m</span>
          </div>
          <div className="flex justify-between p-2 bg-main rounded">
            <span className="text-muted">Beam</span>
            <span className="font-semibold">32.2 m</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-2">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-muted border-b border-color">
                <th className="pb-2 font-medium">Vessel Type</th>
                <th className="pb-2 font-medium">Cost/MT</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Fit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-color">
                <td className="py-3">Supramax</td>
                <td className="py-3">$34.5</td>
                <td className="py-3 text-warning">Medium</td>
                <td className="py-3">Under-sized</td>
              </tr>
              <tr className="bg-primary-light text-primary font-medium">
                <td className="py-3 pl-2 rounded-l">Panamax</td>
                <td className="py-3">$31.2</td>
                <td className="py-3 text-success">Low</td>
                <td className="py-3 rounded-r flex items-center gap-xs"><Check size={16}/> Optimal</td>
              </tr>
              <tr>
                <td className="py-3">Capesize</td>
                <td className="py-3 text-muted">N/A</td>
                <td className="py-3 text-danger flex items-center gap-xs"><AlertCircle size={16}/> High</td>
                <td className="py-3">Draft limit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VesselRecommendation;
