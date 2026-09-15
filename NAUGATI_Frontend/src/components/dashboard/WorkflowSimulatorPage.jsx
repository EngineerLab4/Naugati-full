import React from 'react';
import WorkflowAnimation from '../landing/WorkflowAnimation';
import { Sparkles, Play, Info } from 'lucide-react';

export default function WorkflowSimulatorPage() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '2rem', 
        flexWrap: 'wrap', 
        gap: '1rem',
        padding: '1.5rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> LIVE AI RATE & ROUTE ENGINE
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Watch How AI Calculates Rates & Optimizes Routes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
            Interactive simulation of NAUGATI's 5-step operational pipeline: freight rate forecasting, vessel/carrier matching, interactive shortcut routing, and automated charter agreement generation.
          </p>
        </div>
      </div>

      {/* Simulator Container */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <WorkflowAnimation />
      </div>
    </div>
  );
}
