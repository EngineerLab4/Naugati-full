import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, Search, UserCircle, Activity, ExternalLink, 
  ChevronDown, Check, Ship, Anchor, AlertCircle, X, ShieldAlert, ArrowRight,
  Navigation, Map, Sparkles, TrendingUp, Sliders, Box, Layers, Crosshair, Award, CornerDownLeft, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useShipment } from '../../context/ShipmentContext';
import { PORTS, FLEET_VESSELS, MARITIME_ALERTS, ORIGINS } from '../../services/demoData';

// Curated trade routes across key bulk shipping corridors
const TRADE_ROUTES = [
  {
    id: 'route-aus-dhm',
    title: 'Hay Point / Gladstone → Dhamra Port',
    origin: 'Australia',
    originPort: 'Hay Point',
    destination: 'Dhamra Port',
    destPortId: 'dhamra',
    cargo: 'Coking / Thermal Coal',
    distance: '4,200 NM',
    transitDays: '12.5 days',
    keywords: ['australia', 'hay point', 'gladstone', 'dhamra', 'coal', 'queensland', 'route'],
    path: '/dashboard/route-optimization'
  },
  {
    id: 'route-aus-prt',
    title: 'Newcastle → Paradip Port',
    origin: 'Australia',
    originPort: 'Newcastle',
    destination: 'Paradip Port',
    destPortId: 'paradip',
    cargo: 'Thermal Coal',
    distance: '4,650 NM',
    transitDays: '13.8 days',
    keywords: ['australia', 'newcastle', 'paradip', 'thermal coal', 'nsw', 'route'],
    path: '/dashboard/route-optimization'
  },
  {
    id: 'route-hed-ggv',
    title: 'Port Hedland → Gangavaram Port',
    origin: 'Australia',
    originPort: 'Port Hedland',
    destination: 'Gangavaram Port',
    destPortId: 'gangavaram',
    cargo: 'Iron Ore Fines',
    distance: '3,850 NM',
    transitDays: '11.2 days',
    keywords: ['australia', 'port hedland', 'gangavaram', 'iron ore', 'pilbara', 'route'],
    path: '/dashboard/route-optimization'
  },
  {
    id: 'route-idn-prt',
    title: 'Samarinda → Paradip Port',
    origin: 'Indonesia',
    originPort: 'Samarinda',
    destination: 'Paradip Port',
    destPortId: 'paradip',
    cargo: 'Thermal Coal (Sub-Bituminous)',
    distance: '2,400 NM',
    transitDays: '7.2 days',
    keywords: ['indonesia', 'samarinda', 'kalimantan', 'paradip', 'coal', 'malacca', 'route'],
    path: '/dashboard/route-optimization'
  },
  {
    id: 'route-rb-dhm',
    title: 'Richards Bay → Dhamra Port',
    origin: 'South Africa',
    originPort: 'Richards Bay',
    destination: 'Dhamra Port',
    destPortId: 'dhamra',
    cargo: 'High-CV Thermal Coal',
    distance: '4,750 NM',
    transitDays: '14.5 days',
    keywords: ['south africa', 'richards bay', 'dhamra', 'rbct', 'indian ocean', 'route'],
    path: '/dashboard/route-optimization'
  },
  {
    id: 'route-idn-vzg',
    title: 'Balikpapan → Visakhapatnam Port',
    origin: 'Indonesia',
    originPort: 'Balikpapan',
    destination: 'Visakhapatnam Port',
    destPortId: 'visakhapatnam',
    cargo: 'Thermal Coal / Minerals',
    distance: '2,550 NM',
    transitDays: '7.8 days',
    keywords: ['indonesia', 'balikpapan', 'visakhapatnam', 'vizag', 'minerals', 'route'],
    path: '/dashboard/route-optimization'
  }
];

// Core dashboard navigation modules & AI tools
const DASHBOARD_PAGES = [
  {
    id: 'page-route',
    title: 'ETA & Route Optimization',
    subtitle: 'Dynamic weather routing, ECA zones, and live satellite AIS tracking',
    path: '/dashboard/route-optimization',
    category: 'NAVIGATION',
    icon: Map,
    keywords: ['route', 'eta', 'map', 'tracking', 'waypoints', 'satellite', 'ais', 'transit', 'navigation']
  },
  {
    id: 'page-port',
    title: 'Port Intelligence & Congestion',
    subtitle: 'Dual Random Forest congestion forecast, draft clearance & berth telematics',
    path: '/dashboard/port-intelligence',
    category: 'INTELLIGENCE',
    icon: Anchor,
    keywords: ['port', 'congestion', 'draft', 'waiting', 'berth', 'anchorage', 'tat', 'dhamra', 'paradip', 'haldia', 'chennai', 'visakhapatnam']
  },
  {
    id: 'page-freight',
    title: 'Freight Rate Forecast',
    subtitle: 'Multi-horizon ML predictions (1M, 3M, 6M) across bulk trade routes',
    path: '/dashboard/freight-forecast',
    category: 'INTELLIGENCE',
    icon: TrendingUp,
    keywords: ['freight', 'forecast', 'rates', 'market', 'bdi', 'charter', 'pricing', 'prediction']
  },
  {
    id: 'page-cargo',
    title: 'Cargo Requirements & Shipping Finder',
    subtitle: 'Specify bulk parcels and find optimum vessel chartering options',
    path: '/dashboard/cargo',
    category: 'WORKFLOW',
    icon: Box,
    keywords: ['cargo', 'shipping option', 'find vessel', 'booking', 'laycan', 'bulk requirement']
  },
  {
    id: 'page-contract',
    title: 'Contract Recommendation',
    subtitle: 'Spot vs COA vs Time Charter quantitative decision engine',
    path: '/dashboard/contract-recommendation',
    category: 'WORKFLOW',
    icon: Award,
    keywords: ['contract', 'spot', 'coa', 'time charter', 'hedging', 'risk mitigation']
  },
  {
    id: 'page-vessels',
    title: 'Vessel Availability & Matching',
    subtitle: 'Fleet compatibility scoring, repositioning windows, and specs',
    path: '/dashboard/vessels',
    category: 'FLEET',
    icon: Ship,
    keywords: ['vessels', 'matching', 'fleet', 'ships', 'capesize', 'panamax', 'supramax']
  },
  {
    id: 'page-risk',
    title: 'Risk & Geopolitical Intelligence',
    subtitle: 'Chokepoint disruptions, marine weather severity, and war risk zones',
    path: '/dashboard/risk-intelligence',
    category: 'INTELLIGENCE',
    icon: AlertCircle,
    keywords: ['risk', 'geopolitical', 'weather', 'chokepoint', 'malacca', 'sunda', 'cyclone', 'piracy']
  },
  {
    id: 'page-whatif',
    title: 'What-If Scenario Simulator',
    subtitle: 'Monte Carlo simulation for fuel price shocks and port congestion surges',
    path: '/dashboard/what-if',
    category: 'INTELLIGENCE',
    icon: Sliders,
    keywords: ['what if', 'simulation', 'bunker fuel', 'sensitivity', 'stress test']
  },
  {
    id: 'page-ai-sim',
    title: 'AI Autonomous Workflow Simulator',
    subtitle: 'Multi-agent orchestration simulating the end-to-end chartering process',
    path: '/dashboard/ai-simulator',
    category: 'AI ENGINE',
    icon: Sparkles,
    keywords: ['ai simulator', 'autonomous', 'workflow', 'orchestration', 'agentic']
  },
  {
    id: 'page-fleet',
    title: 'Fleet Status & Telematics',
    subtitle: 'Global commercial fleet tracking, bunker levels, and operational status',
    path: '/dashboard/fleet',
    category: 'FLEET',
    icon: Layers,
    keywords: ['fleet', 'carrier', 'shipowner', 'telematics', 'positions']
  },
  {
    id: 'page-deadheading',
    title: 'Deadheading Optimization',
    subtitle: 'Ballast leg minimization and triangular routing profit maximizer',
    path: '/dashboard/deadheading',
    category: 'FLEET',
    icon: Crosshair,
    keywords: ['deadheading', 'ballast', 'repositioning', 'triangulation', 'empty leg']
  },
  {
    id: 'page-alerts',
    title: 'Maritime Alerts & Advisories',
    subtitle: 'Real-time high swell warnings, port delays, and security notices',
    path: '/dashboard/alerts',
    category: 'ALERTS',
    icon: Bell,
    keywords: ['alerts', 'notices', 'advisories', 'warnings', 'security']
  }
];

// Major bulk commodities
const COMMODITIES = [
  { name: 'Thermal Coal', category: 'Energy', defaultOrigin: 'Australia', defaultQty: 75000, keywords: ['coal', 'thermal coal', 'energy', 'power'] },
  { name: 'Coking Coal', category: 'Energy / Steel', defaultOrigin: 'Australia', defaultQty: 150000, keywords: ['coal', 'coking coal', 'metallurgical', 'steel'] },
  { name: 'Iron Ore Fines', category: 'Metals', defaultOrigin: 'Australia', defaultQty: 170000, keywords: ['iron', 'iron ore', 'mining', 'steel'] },
  { name: 'Bauxite / Alumina', category: 'Metals', defaultOrigin: 'Indonesia', defaultQty: 55000, keywords: ['bauxite', 'aluminum', 'alumina', 'metals'] },
  { name: 'Grain & Wheat', category: 'Agriculture', defaultOrigin: 'United States', defaultQty: 60000, keywords: ['grain', 'wheat', 'agriculture', 'food'] },
  { name: 'Fertilizers (Urea / DAP)', category: 'Fertilizers', defaultOrigin: 'Russia', defaultQty: 45000, keywords: ['fertilizer', 'urea', 'dap', 'chemicals'] },
];

const Topnav = () => {
  const { userProfile, switchRole } = useAuth();
  const { updateShipment } = useShipment();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [alerts, setAlerts] = useState(MARITIME_ALERTS);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
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

  // Filter and aggregate search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { ports: [], vessels: [], routes: [], pages: [], commodities: [], all: [] };

    const ports = PORTS.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.unlocode.toLowerCase().includes(q) || 
      (p.state && p.state.toLowerCase().includes(q)) ||
      (p.authority && p.authority.toLowerCase().includes(q))
    ).map(p => ({
      id: `port-${p.id}`,
      type: 'port',
      title: p.name,
      subtitle: `${p.unlocode} • Max Draft: ${p.maxDraft}m • ${p.currentCongestion} Congestion`,
      badge: 'PORT',
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      icon: Anchor,
      item: p
    }));

    const vessels = FLEET_VESSELS.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.imo.includes(q) || 
      v.type.toLowerCase().includes(q) ||
      (v.currentVoyage && v.currentVoyage.toLowerCase().includes(q)) ||
      (v.destination && v.destination.toLowerCase().includes(q))
    ).map(v => ({
      id: `vessel-${v.id}`,
      type: 'vessel',
      title: v.name,
      subtitle: `${v.type} • ${v.dwt?.toLocaleString()} DWT • IMO ${v.imo} • ${v.status}`,
      badge: 'VESSEL',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      icon: Ship,
      item: v
    }));

    const routes = TRADE_ROUTES.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.origin.toLowerCase().includes(q) || 
      r.destination.toLowerCase().includes(q) || 
      r.cargo.toLowerCase().includes(q) ||
      r.keywords.some(k => k.includes(q))
    ).map(r => ({
      id: r.id,
      type: 'route',
      title: r.title,
      subtitle: `${r.distance} • ~${r.transitDays} • Cargo: ${r.cargo}`,
      badge: 'ROUTE',
      badgeColor: '#059669',
      badgeBg: '#d1fae5',
      icon: Navigation,
      item: r
    }));

    const pages = DASHBOARD_PAGES.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.subtitle.toLowerCase().includes(q) || 
      p.keywords.some(k => k.includes(q))
    ).map(p => ({
      id: p.id,
      type: 'page',
      title: p.title,
      subtitle: p.subtitle,
      badge: p.category,
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      icon: p.icon || Sparkles,
      item: p
    }));

    const commodities = COMMODITIES.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) || 
      c.keywords.some(k => k.includes(q))
    ).map(c => ({
      id: `commodity-${c.name}`,
      type: 'commodity',
      title: c.name,
      subtitle: `Typical: ${c.defaultQty.toLocaleString()} MT parcel from ${c.defaultOrigin}`,
      badge: 'CARGO',
      badgeColor: '#475569',
      badgeBg: '#f1f5f9',
      icon: Box,
      item: c
    }));

    const all = [...pages, ...ports, ...routes, ...vessels, ...commodities];
    return { ports, vessels, routes, pages, commodities, all };
  }, [searchQuery]);

  // Reset keyboard highlight on search change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Execute selected search item action
  const executeResult = (result) => {
    if (!result) return;
    setShowSearchResults(false);
    setSearchQuery('');

    if (result.type === 'port') {
      const p = result.item;
      updateShipment({ destination: p.name, destinationPortId: p.id });
      navigate('/dashboard/port-intelligence');
    } else if (result.type === 'vessel') {
      const v = result.item;
      navigate(`/dashboard/vessel/${v.id}`);
    } else if (result.type === 'route') {
      const r = result.item;
      updateShipment({
        origin: r.origin,
        originPort: r.originPort,
        destination: r.destination,
        destinationPortId: r.destPortId,
        cargoType: r.cargo
      });
      navigate(r.path);
    } else if (result.type === 'page') {
      navigate(result.item.path);
    } else if (result.type === 'commodity') {
      const c = result.item;
      updateShipment({
        cargoType: c.name,
        cargoQuantity: c.defaultQty,
        origin: c.defaultOrigin
      });
      navigate('/dashboard/cargo');
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    const list = searchResults.all;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.length > 0) {
        setSelectedIndex(prev => (prev + 1) % list.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.length > 0) {
        setSelectedIndex(prev => (prev - 1 + list.length) % list.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list.length > 0 && list[selectedIndex]) {
        executeResult(list[selectedIndex]);
      } else if (list.length > 0) {
        executeResult(list[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      inputRef.current?.blur();
    }
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
      <div ref={searchRef} style={{ position: 'relative', width: '420px', maxWidth: '42vw' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'var(--bg-main)', 
          borderRadius: 'var(--radius-md)', 
          padding: '0.5rem 0.9rem',
          border: showSearchResults ? '1px solid var(--primary)' : '1px solid var(--border-color)',
          boxShadow: showSearchResults ? '0 0 0 3px var(--primary-light)' : 'none',
          transition: 'all 0.15s ease'
        }}>
          <Search size={16} color="var(--primary)" style={{ marginRight: '0.6rem', flexShrink: 0 }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search ports, vessels, routes, or tools (e.g. Dhamra, ETA, Panamax)..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleKeyDown}
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
            <X 
              size={14} 
              className="text-muted" 
              style={{ cursor: 'pointer', marginLeft: '0.4rem', flexShrink: 0 }} 
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }} 
            />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.18), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
            border: '1px solid var(--border-color)',
            maxHeight: '440px',
            overflowY: 'auto',
            zIndex: 120,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Case A: Query is empty -> Show Quick Suggestions */}
            {searchQuery.trim().length === 0 ? (
              <div style={{ padding: '0.85rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                  QUICK DESTINATIONS & POPULAR SEARCHES
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {[
                    { name: 'Dhamra Port', type: 'port', sub: 'Deep-water Capesize', id: 'dhamra' },
                    { name: 'Paradip Port', type: 'port', sub: 'Major Bulk Trust', id: 'paradip' },
                    { name: 'Visakhapatnam', type: 'port', sub: 'Natural Harbor', id: 'visakhapatnam' },
                    { name: 'Haldia Dock', type: 'port', sub: 'Riverine Lock Gate', id: 'haldia' }
                  ].map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        updateShipment({ destination: p.name, destinationPortId: p.id });
                        setShowSearchResults(false);
                        navigate('/dashboard/port-intelligence');
                      }}
                      style={{
                        padding: '0.6rem 0.75rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Anchor size={14} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{p.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  CORE INTELLIGENCE MODULES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    { title: 'ETA & Route Optimization', path: '/dashboard/route-optimization', icon: Map },
                    { title: 'Port Intelligence & Congestion', path: '/dashboard/port-intelligence', icon: Anchor },
                    { title: 'Freight Rate ML Forecast', path: '/dashboard/freight-forecast', icon: TrendingUp },
                    { title: 'What-If Scenario Simulator', path: '/dashboard/what-if', icon: Sliders }
                  ].map(m => (
                    <div
                      key={m.path}
                      onClick={() => {
                        setShowSearchResults(false);
                        navigate(m.path);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#1e293b'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <m.icon size={15} color="var(--primary)" />
                        <span>{m.title}</span>
                      </div>
                      <ArrowRight size={13} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Case B: Query is present -> Show unified searchable items */
              <>
                {searchResults.all.length === 0 ? (
                  <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <Search size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      No results found for "{searchQuery}"
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Try searching for a port (e.g. <em>Dhamra</em>, <em>Paradip</em>), vessel (e.g. <em>Panamax</em>, <em>IMO</em>), or tool (e.g. <em>Route</em>, <em>Freight</em>).
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      color: '#94a3b8', 
                      padding: '0.35rem 0.6rem 0.45rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>SEARCH RESULTS ({searchResults.all.length})</span>
                      <span>Press ↵ to select</span>
                    </div>

                    {searchResults.all.map((item, idx) => {
                      const isHighlighted = idx === selectedIndex;
                      const IconComp = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => executeResult(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: isHighlighted ? 'var(--primary-light)' : 'transparent',
                            borderLeft: isHighlighted ? '3px solid var(--primary)' : '3px solid transparent',
                            transition: 'all 0.1s ease',
                            marginBottom: '0.2rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: item.badgeBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComp size={15} color={item.badgeColor} />
                            </div>

                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isHighlighted ? 'var(--primary)' : '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {item.title}
                                </span>
                                <span style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  padding: '0.1rem 0.35rem',
                                  borderRadius: '3px',
                                  backgroundColor: item.badgeBg,
                                  color: item.badgeColor,
                                  letterSpacing: '0.04em',
                                  flexShrink: 0
                                }}>
                                  {item.badge}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginTop: '0.1rem' }}>
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                            {isHighlighted && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                Go <CornerDownLeft size={11} />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer keyboard guide */}
                <div style={{
                  padding: '0.5rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.68rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
                  <span><strong>↵</strong> Select</span>
                  <span><strong>ESC</strong> Close</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Live ML and API Status Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #86efac',
          padding: '0.35rem 0.75rem', 
          borderRadius: '20px' 
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', letterSpacing: '0.03em' }}>
            LIVE ML INFERENCE • Real APIs Active
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
