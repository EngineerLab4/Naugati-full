import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Ship, Anchor, Calendar, 
  CheckCircle, ArrowRight, ShieldAlert, Zap 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { PORTS, ORIGINS } from '../../services/demoData';

export default function CargoRequirement() {
  const navigate = useNavigate();
  const { shipment, updateShipment, runShipmentAnalysis } = useShipment();

  const handleOriginChange = (e) => {
    const orig = ORIGINS.find(o => o.name === e.target.value);
    if (orig) {
      updateShipment({
        origin: orig.name,
        originPort: orig.defaultPort
      });
    }
  };

  const handlePortChange = (e) => {
    const port = PORTS.find(p => p.id === e.target.value);
    if (port) {
      updateShipment({
        destination: port.name,
        destinationPortId: port.id
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runShipmentAnalysis();
    navigate('/dashboard/final-recommendation');
  };

  const priorities = ['Best Balance', 'Lowest Cost', 'Fastest Delivery', 'Lowest Risk'];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '0.25rem 0.75rem',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem'
        }}>
          CENTRALIZED SHIPMENT INTAKE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
          Find Best Shipping Option
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '620px', margin: '0 auto' }}>
          Enter cargo specifications once. NAUGATI automatically forecasts freight, filters compatible tonnage, optimizes geodesic routes, and generates a risk-adjusted charter contract strategy.
        </p>
      </div>

      {/* Progress Flow Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: '50%', height: '2px', backgroundColor: 'var(--primary)', zIndex: 2 }}></div>
        
        <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>
          1. Cargo Requirement
        </div>
        <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'white', border: '2px solid var(--primary)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>
          2. Multi-Criteria Engine
        </div>
        <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'white', border: '1px solid #e2e8f0', color: '#94a3b8', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem' }}>
          3. Final Recommendation
        </div>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.25rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Commodity Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Bulk Commodity Type
            </label>
            <select 
              value={shipment.cargoType} 
              onChange={e => updateShipment({ cargoType: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins', backgroundColor: '#ffffff' }}
            >
              <option>Thermal Coal</option>
              <option>Coking Coal</option>
              <option>Iron Ore Fines</option>
              <option>Bauxite</option>
              <option>Grain / Wheat</option>
              <option>Fertilizer / Rock Phosphate</option>
            </select>
          </div>

          {/* Cargo Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Cargo Quantity (Metric Tonnes)
            </label>
            <div style={{ display: 'flex' }}>
              <input 
                type="number" 
                value={shipment.cargoQuantity} 
                onChange={e => updateShipment({ cargoQuantity: parseInt(e.target.value) || 0 })}
                style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px 0 0 6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins' }} 
              />
              <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderLeft: 'none', borderRadius: '0 6px 6px 0', backgroundColor: '#f8fafc', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                MT
              </div>
            </div>
          </div>

          {/* Overseas Loading Origin */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Origin (Overseas Bulk Port)
            </label>
            <select 
              value={shipment.origin} 
              onChange={handleOriginChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins', backgroundColor: '#ffffff' }}
            >
              {ORIGINS.map(o => (
                <option key={o.id} value={o.name}>{o.name} ({o.defaultPort})</option>
              ))}
            </select>
          </div>

          {/* India East Coast Discharge Port */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Destination (India East Coast Port)
            </label>
            <select 
              value={shipment.destinationPortId} 
              onChange={handlePortChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins', backgroundColor: '#ffffff' }}
            >
              {PORTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Max Draft: {p.maxDraft}m • {p.currentCongestion} Congestion)
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Laycan Dates */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Preferred Loading Date
            </label>
            <input 
              type="date" 
              value={shipment.preferredLoadingDate} 
              onChange={e => updateShipment({ preferredLoadingDate: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
              Required Delivery Date
            </label>
            <input 
              type="date" 
              value={shipment.requiredDeliveryDate} 
              onChange={e => updateShipment({ requiredDeliveryDate: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins' }} 
            />
          </div>

        </div>

        {/* Cargo Priority Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.6rem', color: '#0f172a' }}>
            Optimization Priority
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {priorities.map(p => {
              const active = shipment.cargoPriority === p;
              return (
                <div
                  key={p}
                  onClick={() => updateShipment({ cargoPriority: p })}
                  style={{
                    padding: '0.85rem 0.5rem',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: active ? 'var(--primary-light)' : '#ffffff',
                    color: active ? 'var(--primary)' : '#0f172a',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Calculates <strong>Panamax / Capesize</strong> viability for {shipment.cargoQuantity.toLocaleString()} MT.
          </div>

          <button
            type="submit"
            style={{
              padding: '0.85rem 2rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 12px rgba(4, 173, 222, 0.25)'
            }}
          >
            <span>Run Shipment Intelligence</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </form>
    </div>
  );
}
