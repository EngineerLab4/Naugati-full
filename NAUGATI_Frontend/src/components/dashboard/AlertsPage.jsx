import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, AlertTriangle, TrendingUp, Anchor, 
  CloudRain, ShieldAlert, FileText, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { MARITIME_ALERTS } from '../../services/demoData';

export default function AlertsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [alerts, setAlerts] = useState(MARITIME_ALERTS);

  const filterTabs = ['All', 'Critical', 'Freight', 'Port', 'Weather', 'Contract'];

  const filteredAlerts = alerts.filter(a => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Critical') return a.severity === 'critical';
    return a.category.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleAction = (alert) => {
    if (alert.category === 'Freight') navigate('/dashboard/freight-forecast');
    else if (alert.category === 'Port') navigate('/dashboard/port-intelligence');
    else if (alert.category === 'Weather') navigate('/dashboard/route-optimization');
    else if (alert.category === 'Contract') navigate('/dashboard/contract-recommendation');
    else navigate('/dashboard/final-recommendation');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            OPERATIONAL ADVISORIES & INCIDENT MONITORING
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Maritime Alerts & Notifications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Automated notifications on freight price shifts, port berth queues, weather advisories, and backhaul opportunities.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: activeFilter === tab ? 'none' : '1px solid var(--border-color)',
              backgroundColor: activeFilter === tab ? 'var(--primary)' : 'white',
              color: activeFilter === tab ? 'white' : '#64748b',
              fontWeight: activeFilter === tab ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No alerts matching the selected category filter.
          </div>
        ) : (
          filteredAlerts.map(alt => {
            const isCritical = alt.severity === 'critical';
            const isWarning = alt.severity === 'warning';

            return (
              <div 
                key={alt.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${isCritical ? 'var(--semantic-red)' : (isWarning ? 'var(--semantic-amber)' : 'var(--primary)')}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: isCritical ? 'var(--semantic-red-light)' : (isWarning ? 'var(--semantic-amber-light)' : 'var(--primary-light)'),
                      color: isCritical ? 'var(--semantic-red)' : (isWarning ? 'var(--semantic-amber)' : 'var(--primary)')
                    }}>
                      {alt.severity} • {alt.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{alt.timestamp}</span>
                  </div>

                  {alt.relatedPort && (
                    <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Port: <strong>{alt.relatedPort}</strong>
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.3rem 0 0.5rem', color: '#0f172a' }}>
                  {alt.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  {alt.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                    <strong>Recommended Action:</strong> {alt.recommendedAction}
                  </div>

                  <button
                    onClick={() => handleAction(alt)}
                    style={{
                      padding: '0.45rem 1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>Take Action</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
