import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Cpu } from 'lucide-react';

/**
 * LockedGate — wraps any dashboard page that depends on cargo form submission.
 * If hasExecuted is false (user hasn't run the ML pipeline yet), shows a
 * locked placeholder directing them to the cargo intake form.
 *
 * Usage:
 *   if (!hasExecuted) return <LockedGate pageName="Recommended Strategy" />;
 */
export default function LockedGate({ pageName = 'This Page', icon: Icon = Lock }) {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '2rem'
    }}>
      <div style={{
        maxWidth: '560px', width: '100%', textAlign: 'center',
        backgroundColor: '#ffffff', border: '2px dashed #cbd5e1',
        borderRadius: '16px', padding: '3rem 2.5rem'
      }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: 'rgba(4,173,222,0.08)',
          border: '2px solid rgba(4,173,222,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Lock size={28} color="var(--primary)" />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          {pageName} — Awaiting Cargo Input
        </h2>

        {/* Sub-text */}
        <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
          This section requires your cargo parameters to be scanned by the NAUGATI ML pipeline first.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 2rem' }}>
          Enter your <strong style={{ color: '#0f172a' }}>commodity, quantity, origin, destination, dates and priority</strong> in the
          cargo intake form — then run the trained ML models to unlock this page.
        </p>

        {/* Pipeline hint cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { label: 'Freight Rate Engine', sub: 'Random Forest (20 feats)', color: '#04ADDE' },
            { label: 'Fleet OR Solver', sub: 'Charter Optimizer', color: '#7c3aed' },
            { label: 'Wave Predictor', sub: 'ExtraTrees (35 feats)', color: '#d97706' },
          ].map(c => (
            <div key={c.label} style={{
              padding: '0.75rem', borderRadius: '8px',
              backgroundColor: `${c.color}0d`, border: `1px solid ${c.color}30`, textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: c.color, marginBottom: '0.15rem' }}>
                LOCKED
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{c.label}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/dashboard/cargo')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.85rem 2rem',
            backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: '8px',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(4,173,222,0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Cpu size={18} />
          <span>Go to Cargo Intake Form</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
