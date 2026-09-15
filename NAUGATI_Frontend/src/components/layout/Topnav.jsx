import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Search, UserCircle, Activity, ExternalLink, 
  ChevronDown, Check, Ship, Anchor, AlertCircle, X, ShieldAlert, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useShipment } from '../../context/ShipmentContext';
import { PORTS, FLEET_VESSELS, MARITIME_ALERTS } from '../../services/demoData';

const Topnav = () => {
  const { userProfile, switchRole } = useAuth();
  const { updateShipment } = useShipment();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [alerts, setAlerts] = useState(MARITIME_ALERTS);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const roleRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search items
  const filteredPorts = searchQuery.trim() 
    ? PORTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.unlocode.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const filteredVessels = searchQuery.trim()
    ? FLEET_VESSELS.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.imo.includes(searchQuery) || v.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelectPort = (port) => {
    updateShipment({ destination: port.name, destinationPortId: port.id });
    setShowSearchResults(false);
    setSearchQuery('');
    navigate('/dashboard/port-intelligence');
  };

  const handleSelectVessel = (vessel) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/dashboard/vessel/${vessel.id}`);
  };

  const currentRole = userProfile?.organizationType || 'Enterprise Shipper';
  const isShipowner = currentRole === 'Ocean Carrier' || userProfile?.role === 'shipowner';

  return (
    <div style={{
      height: 'var(--topbar-height)',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      zIndex: 90
    }}>
      
      {/* Global Interactive Search */}
      <div ref={searchRef} style={{ position: 'relative', width: '360px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--bg-main)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.45rem 0.9rem',
          border: '1px solid var(--border-color)'
        }}>
          <Search size={16} className="text-muted" style={{ marginRight: '0.6rem' }} />
          <input 
            type="text" 
            placeholder="Search port, vessel IMO, or route..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              outline: 'none', 
              width: '100%', 
              fontFamily: 'Poppins', 
              fontSize: '0.85rem' 
            }}
          />
          {searchQuery && (
            <X size={14} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim().length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            maxHeight: '340px',
            overflowY: 'auto',
            zIndex: 110,
            padding: '8px'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '6px 8px', letterSpacing: '0.05em' }}>
              PORTS (EAST COAST INDIA)
            </div>
            {filteredPorts.length > 0 ? (
              filteredPorts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleSelectPort(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                  className="hover:bg-slate-50"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Anchor size={15} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.unlocode} • Max Draft: {p.maxDraft}m</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>Inspect &rarr;</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#94a3b8' }}>No matching ports</div>
            )}

            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '10px 8px 6px', letterSpacing: '0.05em', borderTop: '1px solid #f1f5f9', marginTop: '6px' }}>
              VESSELS & FLEET
            </div>
            {filteredVessels.length > 0 ? (
              filteredVessels.map(v => (
                <div 
                  key={v.id}
                  onClick={() => handleSelectVessel(v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  className="hover:bg-slate-50"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ship size={15} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.type} • {v.dwt.toLocaleString()} DWT • IMO {v.imo}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>View Specs &rarr;</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#94a3b8' }}>No matching vessels</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Transparent DEMO DATA Badge with Timestamp */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe',
          padding: '0.35rem 0.75rem', 
          borderRadius: '20px' 
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }}></div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', letterSpacing: '0.03em' }}>
            DEMO DATA • Updated Today 12:00 UTC
          </span>
        </div>

        {/* Quick Role Switcher for seamless testing */}
        <div ref={roleRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              cursor: 'pointer',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Role:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
              {isShipowner ? "Ocean Carrier" : "Shipper / Forwarder"}
            </span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '210px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              padding: '6px',
              zIndex: 110
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '6px 8px' }}>
                SWITCH PORTAL VIEW
              </div>
              <div 
                onClick={() => { switchRole('Enterprise Shipper'); setShowRoleMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: !isShipowner ? 700 : 400,
                  backgroundColor: !isShipowner ? 'var(--primary-light)' : 'transparent',
                  color: !isShipowner ? 'var(--primary)' : '#0f172a'
                }}
              >
                <span>Shipper / Forwarder</span>
                {!isShipowner && <Check size={14} />}
              </div>
              <div 
                onClick={() => { switchRole('Ocean Carrier'); setShowRoleMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: isShipowner ? 700 : 400,
                  backgroundColor: isShipowner ? 'var(--primary-light)' : 'transparent',
                  color: isShipowner ? 'var(--primary)' : '#0f172a'
                }}
              >
                <span>Ocean Carrier (Shipowner)</span>
                {isShipowner && <Check size={14} />}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              position: 'relative', 
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}
          >
            <Bell size={18} className="text-muted" />
            {alerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: 'var(--semantic-red)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}>{alerts.length}</span>
            )}
          </div>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '380px',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              zIndex: 110,
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Maritime Alerts & Advisories</div>
                <span 
                  onClick={() => navigate('/dashboard/alerts')}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  View All
                </span>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {alerts.map(alt => (
                  <div 
                    key={alt.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/dashboard/alerts');
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    className="hover:bg-slate-50"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{
                        marginTop: '2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: alt.severity === 'critical' ? 'var(--semantic-red)' : (alt.severity === 'warning' ? 'var(--semantic-amber)' : 'var(--primary)'),
                        flexShrink: 0
                      }}></div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {alt.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                          {alt.description.slice(0, 110)}...
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{alt.timestamp}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>Inspect &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Guest User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {userProfile?.company || 'Maritime Logistics'}
            </div>
          </div>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {userProfile?.firstName?.charAt(0) || 'U'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Topnav;
