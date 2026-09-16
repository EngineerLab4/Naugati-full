import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, AlertCircle, Cpu
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { PORTS, ORIGINS } from '../../services/demoData';

// ─── Field badge helper ───────────────────────────────────────────────────────
function Badge({ filled, error }) {
  if (error)  return <span style={badgeStyle('#fef2f2','#dc2626','1px solid #fca5a5')}>REQUIRED</span>;
  if (filled) return <span style={badgeStyle('rgba(16,185,129,0.15)','#10b981','1px solid rgba(16,185,129,0.3)')}>SELECTED ✓</span>;
  return       <span style={badgeStyle('#e0f2fe','#04ADDE','1px solid #bae6fd')}>SELECT</span>;
}
function badgeStyle(bg, color, border) {
  return { backgroundColor: bg, color, border, padding: '1px 7px', borderRadius: '10px',
           fontSize: '0.68rem', fontWeight: 800, marginLeft: '0.45rem', letterSpacing: '0.04em' };
}

// ─── Field border helper ──────────────────────────────────────────────────────
function fieldBorder(val, errors, key) {
  if (errors[key]) return '1.5px solid #ef4444';
  if (val)         return '1.5px solid #10b981';
  return '1px solid var(--border-color)';
}

const inputBase = {
  width: '100%', padding: '0.75rem', borderRadius: '6px',
  fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins',
  backgroundColor: '#ffffff', transition: 'border 0.15s ease'
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CargoRequirement() {
  const navigate = useNavigate();
  const { shipment, updateShipment, runShipmentAnalysis } = useShipment();

  const [errors,   setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  const priorities = ['Best Balance', 'Lowest Cost', 'Fastest Delivery', 'Lowest Risk'];

  const handleOriginChange = (e) => {
    const orig = ORIGINS.find(o => o.name === e.target.value);
    if (orig) updateShipment({ origin: orig.name, originPort: orig.defaultPort });
    else      updateShipment({ origin: '', originPort: '' });
    clearError('origin');
  };

  const handlePortChange = (e) => {
    const port = PORTS.find(p => p.id === e.target.value);
    if (port) updateShipment({ destination: port.name, destinationPortId: port.id,
                               portDraftLimit: port.maxDraft, routeDistanceNM: '' });
    else      updateShipment({ destination: '', destinationPortId: '' });
    clearError('destinationPortId');
  };

  const clearError = (key) => setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!shipment.cargoType)           e.cargoType           = 'Select a commodity type';
    if (!shipment.cargoQuantity || Number(shipment.cargoQuantity) < 5000)
                                       e.cargoQuantity       = 'Enter quantity ≥ 5,000 MT';
    if (!shipment.origin)              e.origin              = 'Select an origin port';
    if (!shipment.destinationPortId)   e.destinationPortId   = 'Select a destination port';
    if (!shipment.preferredLoadingDate) e.preferredLoadingDate = 'Select preferred loading date';
    if (!shipment.requiredDeliveryDate) e.requiredDeliveryDate = 'Select required delivery date';
    if (!shipment.cargoPriority)       e.cargoPriority       = 'Select an optimization priority';
    return e;
  };

  // ── Submit → validate → ML → navigate ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = document.querySelector('[data-error="true"]');
      if (firstField) firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await runShipmentAnalysis();
      navigate('/dashboard/final-recommendation');
    } catch (err) {
      console.error('ML pipeline error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const allFilled = shipment.cargoType && shipment.cargoQuantity &&
                    shipment.origin && shipment.destinationPortId &&
                    shipment.preferredLoadingDate && shipment.requiredDeliveryDate &&
                    shipment.cargoPriority;

  const totalFields = 7;
  const filledCount = [shipment.cargoType, shipment.cargoQuantity, shipment.origin,
                       shipment.destinationPortId, shipment.preferredLoadingDate,
                       shipment.requiredDeliveryDate, shipment.cargoPriority].filter(Boolean).length;

  return (
    <>

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                        padding: '0.25rem 0.75rem', borderRadius: '16px',
                        fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            CENTRALIZED SHIPMENT INTAKE
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
            Find Best Shipping Option
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '620px', margin: '0 auto' }}>
            All fields are required. Your cargo parameters are scanned by our trained ML models
            to generate a risk-adjusted freight strategy.
          </p>
        </div>

        {/* Progress Flow Ribbon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px',
                        backgroundColor: '#e2e8f0', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: '50%', height: '2px',
                        backgroundColor: 'var(--primary)', zIndex: 2 }} />
          <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'var(--primary)',
                        color: 'white', padding: '0.4rem 1rem', borderRadius: '20px',
                        fontWeight: 700, fontSize: '0.8rem' }}>
            1. Cargo Requirement
          </div>
          <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'white',
                        border: '2px solid var(--primary)', color: 'var(--primary)',
                        padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.8rem' }}>
            2. Multi-Criteria Engine
          </div>
          <div style={{ position: 'relative', zIndex: 3, backgroundColor: 'white',
                        border: '1px solid #e2e8f0', color: '#94a3b8',
                        padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem' }}>
            3. Final Recommendation
          </div>
        </div>

        {/* Completion progress bar */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px',
                      padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>
            Form Completion
          </span>
          <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              width: `${(filledCount / totalFields) * 100}%`,
              background: allFilled
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #04ADDE, #7c3aed)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800,
                          color: allFilled ? '#10b981' : 'var(--primary)', whiteSpace: 'nowrap' }}>
            {filledCount}/{totalFields} {allFilled ? '• Ready to Scan ✓' : ''}
          </span>
        </div>

        {/* Main Intake Form */}
        <form onSubmit={handleSubmit} noValidate className="card" style={{ padding: '2.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Commodity Type */}
            <div data-error={!!errors.cargoType}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Bulk Commodity Type <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.cargoType} error={!!errors.cargoType} />
              </label>
              <select
                value={shipment.cargoType || ''}
                onChange={e => { updateShipment({ cargoType: e.target.value }); clearError('cargoType'); }}
                style={{ ...inputBase, border: fieldBorder(shipment.cargoType, errors, 'cargoType'),
                         color: shipment.cargoType ? '#0f172a' : '#94a3b8' }}
              >
                <option value="">— Select commodity —</option>
                <option value="Thermal Coal">Thermal Coal</option>
                <option value="Coking Coal">Coking Coal</option>
                <option value="Iron Ore Fines">Iron Ore Fines</option>
                <option value="Bauxite">Bauxite</option>
                <option value="Grain / Wheat">Grain / Wheat</option>
                <option value="Fertilizer / Rock Phosphate">Fertilizer / Rock Phosphate</option>
              </select>
              {errors.cargoType && <ErrorHint msg={errors.cargoType} />}
            </div>

            {/* Cargo Quantity */}
            <div data-error={!!errors.cargoQuantity}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Cargo Quantity (Metric Tonnes) <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.cargoQuantity} error={!!errors.cargoQuantity} />
              </label>
              <div style={{ display: 'flex' }}>
                <input
                  type="number"
                  value={shipment.cargoQuantity || ''}
                  placeholder="e.g. 75000"
                  min={5000} max={350000} step={1000}
                  onChange={e => {
                    updateShipment({ cargoQuantity: e.target.value ? parseInt(e.target.value) : '' });
                    clearError('cargoQuantity');
                  }}
                  style={{ ...inputBase, flex: 1,
                           border: fieldBorder(shipment.cargoQuantity, errors, 'cargoQuantity'),
                           borderRadius: '6px 0 0 6px' }}
                />
                <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)',
                              borderLeft: 'none', borderRadius: '0 6px 6px 0',
                              backgroundColor: '#f8fafc', fontSize: '0.85rem',
                              fontWeight: 700, color: '#64748b' }}>MT</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Min 5,000 MT • Handysize ≤35k • Supramax ≤58k • Panamax ≤82k • Capesize ≤200k
              </div>
              {errors.cargoQuantity && <ErrorHint msg={errors.cargoQuantity} />}
            </div>

            {/* Origin */}
            <div data-error={!!errors.origin}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Origin (Overseas Bulk Port) <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.origin} error={!!errors.origin} />
              </label>
              <select
                value={shipment.origin || ''}
                onChange={handleOriginChange}
                style={{ ...inputBase, border: fieldBorder(shipment.origin, errors, 'origin'),
                         color: shipment.origin ? '#0f172a' : '#94a3b8' }}
              >
                <option value="">— Select origin —</option>
                {ORIGINS.map(o => (
                  <option key={o.id} value={o.name}>{o.name} ({o.defaultPort})</option>
                ))}
              </select>
              {errors.origin && <ErrorHint msg={errors.origin} />}
            </div>

            {/* Destination */}
            <div data-error={!!errors.destinationPortId}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Destination (India East Coast Port) <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.destinationPortId} error={!!errors.destinationPortId} />
              </label>
              <select
                value={shipment.destinationPortId || ''}
                onChange={handlePortChange}
                style={{ ...inputBase, border: fieldBorder(shipment.destinationPortId, errors, 'destinationPortId'),
                         color: shipment.destinationPortId ? '#0f172a' : '#94a3b8' }}
              >
                <option value="">— Select destination port —</option>
                {PORTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Max Draft: {p.maxDraft}m • {p.currentCongestion} Congestion)
                  </option>
                ))}
              </select>
              {/* Inline port info chip */}
              {shipment.destinationPortId && (() => {
                const p = PORTS.find(x => x.id === shipment.destinationPortId);
                return p ? (
                  <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { label: `Max Draft: ${p.maxDraft}m`, color: '#04ADDE' },
                      { label: `Capacity: ${p.cargoHandlingCapacity}`, color: '#7c3aed' },
                      { label: `Congestion: ${p.currentCongestion}`, color: p.currentCongestion === 'High' ? '#ef4444' : '#059669' }
                    ].map(chip => (
                      <span key={chip.label} style={{ fontSize: '0.68rem', fontWeight: 700,
                            backgroundColor: `${chip.color}15`, color: chip.color,
                            border: `1px solid ${chip.color}30`, padding: '1px 6px', borderRadius: '6px' }}>
                        {chip.label}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}
              {errors.destinationPortId && <ErrorHint msg={errors.destinationPortId} />}
            </div>

            {/* Preferred Loading Date */}
            <div data-error={!!errors.preferredLoadingDate}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Preferred Loading Date <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.preferredLoadingDate} error={!!errors.preferredLoadingDate} />
              </label>
              <input
                type="date"
                value={shipment.preferredLoadingDate || ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => { updateShipment({ preferredLoadingDate: e.target.value }); clearError('preferredLoadingDate'); }}
                style={{ ...inputBase, border: fieldBorder(shipment.preferredLoadingDate, errors, 'preferredLoadingDate') }}
              />
              {errors.preferredLoadingDate && <ErrorHint msg={errors.preferredLoadingDate} />}
            </div>

            {/* Required Delivery Date */}
            <div data-error={!!errors.requiredDeliveryDate}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                              fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>
                <span>Required Delivery Date <span style={{ color: '#ef4444' }}>*</span></span>
                <Badge filled={!!shipment.requiredDeliveryDate} error={!!errors.requiredDeliveryDate} />
              </label>
              <input
                type="date"
                value={shipment.requiredDeliveryDate || ''}
                min={shipment.preferredLoadingDate || new Date().toISOString().split('T')[0]}
                onChange={e => { updateShipment({ requiredDeliveryDate: e.target.value }); clearError('requiredDeliveryDate'); }}
                style={{ ...inputBase, border: fieldBorder(shipment.requiredDeliveryDate, errors, 'requiredDeliveryDate') }}
              />
              {errors.requiredDeliveryDate && <ErrorHint msg={errors.requiredDeliveryDate} />}
            </div>

          </div>

          {/* Optimization Priority */}
          <div style={{ marginBottom: '2rem' }} data-error={!!errors.cargoPriority}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem',
                            fontWeight: 600, marginBottom: '0.6rem', color: '#0f172a' }}>
              <span>Optimization Priority <span style={{ color: '#ef4444' }}>*</span></span>
              <Badge filled={!!shipment.cargoPriority} error={!!errors.cargoPriority} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {priorities.map(p => {
                const active = shipment.cargoPriority === p;
                return (
                  <div
                    key={p}
                    onClick={() => { updateShipment({ cargoPriority: p }); clearError('cargoPriority'); }}
                    style={{
                      padding: '0.85rem 0.5rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                      border: errors.cargoPriority
                        ? '1.5px solid #ef4444'
                        : active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: active ? 'var(--primary-light)' : '#ffffff',
                      color: active ? 'var(--primary)' : '#0f172a',
                      fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p}
                  </div>
                );
              })}
            </div>
            {errors.cargoPriority && <ErrorHint msg={errors.cargoPriority} />}
          </div>

          {/* Global error banner */}
          {Object.keys(errors).length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} required —
                please complete all highlighted fields before running the ML pipeline.
              </span>
            </div>
          )}

          {/* Submit Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '380px' }}>
              {allFilled
                ? <span style={{ color: '#059669', fontWeight: 600 }}>
                    ✓ All parameters set — click to scan with ML pipeline and generate recommendation.
                  </span>
                : <span>Fill all {totalFields} fields to unlock the ML pipeline scan.</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.9rem 2.2rem',
                backgroundColor: allFilled ? 'var(--primary)' : '#94a3b8',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '0.95rem', fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                boxShadow: allFilled ? '0 4px 16px rgba(4,173,222,0.35)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Cpu size={18} />
              <span>{submitting ? 'Running Models...' : 'Run ML Models & Get Recommendation'}</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

// ─── Tiny inline error hint ───────────────────────────────────────────────────
function ErrorHint({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem',
                  marginTop: '0.3rem', fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
      <AlertCircle size={12} />
      {msg}
    </div>
  );
}
