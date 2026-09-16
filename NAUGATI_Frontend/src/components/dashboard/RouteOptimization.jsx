import React, { useState, useEffect } from 'react';
import { 
  Navigation, ShieldAlert, Zap, Clock, DollarSign, 
  CheckCircle2, Fuel, MapPin, Sliders, AlertTriangle, ArrowRight, 
  BarChart2, RefreshCw, Ship, Eye, Layers, Compass, ExternalLink,
  ChevronRight, Calendar, AlertCircle, Sparkles, Check
} from 'lucide-react';
import InteractiveMaritimeMap from './InteractiveMaritimeMap';
import { PORTS } from '../../services/demoData';
import { vesselTrackingService, TRACKED_VESSELS } from '../../services/vesselTrackingService';
import { routeService, COMPREHENSIVE_ROUTES } from '../../services/routeService';
import { apiClient } from '../../services/apiClient';
import { useShipment } from '../../context/ShipmentContext';

export default function RouteOptimization() {
  const shipmentContext = useShipment?.() || {};
  const { shipment } = shipmentContext;

  // Master selection states
  const [selectedVesselId, setSelectedVesselId] = useState('VES-STAR');
  const [selectedPortId, setSelectedPortId] = useState(shipment?.destinationPortId || 'dhamra');
  const [selectedObjective, setSelectedObjective] = useState('Best Overall');
  const [cargoType, setCargoType] = useState(shipment?.cargoType ? `${shipment.cargoType} (${(shipment.cargoQuantity || 75000).toLocaleString()} MT)` : 'Coking Coal (165,000 MT)');
  const [activeRouteId, setActiveRouteId] = useState('route-rec');
  
  // Real-time telemetry simulation state
  const [liveVessels, setLiveVessels] = useState(TRACKED_VESSELS);
  const [lastTelemetryTime, setLastTelemetryTime] = useState(new Date().toLocaleTimeString('en-IN') + ' IST');
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState(false);
  const [followVessel, setFollowVessel] = useState(false);

  // Map layer filter states
  const [showWeather, setShowWeather] = useState(true);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showGeopolitical, setShowGeopolitical] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showVesselLayer, setShowVesselLayer] = useState(true);

  // Modals & Details
  const [selectedRiskZone, setSelectedRiskZone] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  // Entry and fetched data states — Only fetch data after entry!
  const [hasEntered, setHasEntered] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [liveEtaData, setLiveEtaData] = useState(null);
  const [liveWeatherData, setLiveWeatherData] = useState(null);

  // Currently active vessel
  const selectedVessel = liveVessels.find(v => v.id === selectedVesselId) || liveVessels[0];

  // Derived routes from fetched routeData (only populated after entry)
  const routes = routeData?.routes || [];
  const recommendedRoute = routeData?.recommendedRoute || routes[0] || null;
  const alternativeRoute = routeData?.alternativeRoute || routes[1] || null;
  const shortcutRoute = routeData?.shortcutRoute || routes[2] || null;
  const compatibility = routeData?.compatibility || null;
  const currentActiveRoute = routes.find(r => r.id === activeRouteId) || recommendedRoute;

  // Periodic AIS Telemetry Simulation Heartbeat (updates every 6s in demo mode)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVessels(prev => {
        return prev.map(v => {
          if (v.id === selectedVesselId) {
            // Jitter coordinates slightly along course
            const deltaLat = (Math.random() - 0.45) * 0.005;
            const deltaLng = (Math.random() - 0.45) * 0.005;
            const deltaSpeed = +(Math.random() * 0.4 - 0.2).toFixed(1);
            const newSpeed = +(Math.max(11.5, Math.min(14.5, v.speedKnots + deltaSpeed))).toFixed(1);

            return {
              ...v,
              currentPosition: {
                ...v.currentPosition,
                lat: +(v.currentPosition.lat + deltaLat).toFixed(4),
                lng: +(v.currentPosition.lng + deltaLng).toFixed(4)
              },
              speedKnots: newSpeed,
              traveledDistanceNM: v.traveledDistanceNM + 1,
              remainingDistanceNM: Math.max(10, v.remainingDistanceNM - 1),
              progressPercentage: +(((v.traveledDistanceNM + 1) / v.totalDistanceNM) * 100).toFixed(1)
            };
          }
          return v;
        });
      });
      setLastTelemetryTime(new Date().toLocaleTimeString('en-IN') + ' IST');
    }, 6000);

    return () => clearInterval(interval);
  }, [selectedVesselId]);

  // Manual Telemetry Refresh
  const handleRefreshTelemetry = () => {
    setIsRefreshingTelemetry(true);
    setTimeout(() => {
      setLastTelemetryTime(new Date().toLocaleTimeString('en-IN') + ' IST');
      setIsRefreshingTelemetry(false);
    }, 500);
  };

  // Run Route Optimization & Fetch Live Data after entry
  const handleOptimize = async () => {
    setIsFetchingData(true);
    setOptimizing(true);
    try {
      const selectedPort = PORTS.find(p => p.id === selectedPortId) || PORTS[0];
      const originPortName = selectedVessel?.originPort || 'Newcastle';
      const destPortName = selectedPort?.name || 'Dhamra Port';

      // 1. Fetch live ML predictions concurrently: voyage ETA and marine weather risk
      const [etaRes, weatherRes] = await Promise.allSettled([
        apiClient.getVoyageEta({
          origin: originPortName,
          destination: destPortName,
          vessel_speed_knots: selectedVessel?.speedKnots || 12.8,
          vessel_class: selectedVessel?.vesselType || 'Panamax'
        }),
        apiClient.getWeatherRisk({
          origin: originPortName,
          destination: destPortName
        })
      ]);

      const etaData = etaRes.status === 'fulfilled' ? etaRes.value : null;
      const weatherData = weatherRes.status === 'fulfilled' ? weatherRes.value : null;

      setLiveEtaData(etaData);
      setLiveWeatherData(weatherData);

      // 2. Compute dynamic route optimization results
      const results = routeService.getOptimizedRoutes({
        vesselId: selectedVesselId,
        originPort: originPortName,
        destinationPortId: selectedPortId,
        objective: selectedObjective
      });

      // Augment recommended route with live ETA model response if available
      if (etaData && etaData.transit_days) {
        results.routes = results.routes.map(r => {
          if (r.type === 'recommended') {
            return {
              ...r,
              voyageDays: etaData.transit_days,
              voyageDurationFormatted: `${Math.floor(etaData.transit_days)}d ${Math.round((etaData.transit_days % 1) * 24)}h`,
              etaArrival: etaData.estimated_ocean_arrival,
              delayProbability: etaData.delay_probability_percent ? `${etaData.delay_probability_percent}%` : r.riskLevel
            };
          }
          return r;
        });
      }

      setRouteData(results);
      setActiveRouteId(results.recommendedRoute?.id || 'route-rec');
      setHasEntered(true);
    } catch (err) {
      console.warn('Route optimization live fetch fallback:', err.message);
      const results = routeService.getOptimizedRoutes({
        vesselId: selectedVesselId,
        originPort: selectedVessel?.originPort || 'Newcastle',
        destinationPortId: selectedPortId,
        objective: selectedObjective
      });
      setRouteData(results);
      setActiveRouteId(results.recommendedRoute?.id || 'route-rec');
      setHasEntered(true);
    } finally {
      setIsFetchingData(false);
      setOptimizing(false);
    }
  };

  const objectivesList = [
    "Best Overall",
    "Fastest Arrival",
    "Lowest Fuel Cost",
    "Lowest Operating Cost",
    "Lowest Risk"
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* SECTION: Top Header Bar & Telemetry Status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '1.25rem', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              color: '#04ADDE', 
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              NAUGATI MARITIME INTELLIGENCE PLATFORM
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Live Fleet Telematics & Route Optimizer
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
            Route Optimization & Live Vessel Tracking
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Track vessel position, compare alternative corridors, calculate dynamic ETAs, and identify actionable shortcuts.
          </p>
        </div>

        {/* Live AIS Telematics Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backgroundColor: '#ffffff',
          padding: '0.5rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} className="animate-pulse" />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
              Live Telemetry — Stream updated: <span style={{ color: '#04ADDE' }}>{lastTelemetryTime}</span>
            </span>
          </div>

          <button
            onClick={handleRefreshTelemetry}
            disabled={isRefreshingTelemetry}
            title="Poll AIS Telemetry"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b',
              padding: '2px'
            }}
          >
            <RefreshCw size={14} className={isRefreshingTelemetry ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* SECTION: Top Configuration Controls (Left: Optimizer Inputs, Right: Active Vessel Status) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '1.25rem' 
      }}>
        
        {/* Left: Route Optimization Control Panel */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="#04ADDE" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Route Optimization Panel
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              Multi-Objective AI
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
            {/* Vessel Select & Select Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Select Vessel
                </label>
                <span style={{ fontSize: '0.68rem', color: '#04ADDE', fontWeight: 700 }}>FLEET TONNAGE</span>
              </div>
              <select
                value={selectedVesselId}
                onChange={(e) => setSelectedVesselId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: '0.35rem'
                }}
              >
                {liveVessels.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vesselType} • {v.dwt.toLocaleString()} DWT)
                  </option>
                ))}
              </select>
              {/* Quick Select Vessel Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {liveVessels.slice(0, 3).map(v => {
                  const isSel = selectedVesselId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVesselId(v.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: isSel ? '1.5px solid #04ADDE' : '1px solid #e2e8f0',
                        backgroundColor: isSel ? '#f0f9ff' : '#f8fafc',
                        color: isSel ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSel ? '✓ ' : ''}{v.name.replace('MV ', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destination Port Select & Select Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Destination Port
                </label>
                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>EAST COAST INDIA</span>
              </div>
              <select
                value={selectedPortId}
                onChange={(e) => setSelectedPortId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: '0.35rem'
                }}
              >
                {PORTS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Max Draft {p.maxDraft}m)
                  </option>
                ))}
              </select>
              {/* Quick Select Port Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {PORTS.slice(0, 4).map(p => {
                  const isSel = selectedPortId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPortId(p.id)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: isSel ? '1.5px solid #04ADDE' : '1px solid #e2e8f0',
                        backgroundColor: isSel ? '#f0f9ff' : '#f8fafc',
                        color: isSel ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSel ? '✓ ' : ''}{p.name.replace(' Port', '')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cargo Select & Select Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Cargo & Volume
                </label>
              </div>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: '0.35rem'
                }}
              >
                <option value="Coking Coal (165,000 MT)">Coking Coal (165,000 MT)</option>
                <option value="Thermal Coal (75,000 MT)">Thermal Coal (75,000 MT)</option>
                <option value="Iron Ore Fines (160,000 MT)">Iron Ore Fines (160,000 MT)</option>
                <option value="Bauxite (55,000 MT)">Bauxite (55,000 MT)</option>
              </select>
              {/* Quick Select Cargo Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {[
                  'Coking Coal (165,000 MT)',
                  'Thermal Coal (75,000 MT)',
                  'Iron Ore Fines (160,000 MT)'
                ].map(c => {
                  const isSel = cargoType === c;
                  const label = c.split(' (')[0];
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCargoType(c)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: isSel ? '1.5px solid #04ADDE' : '1px solid #e2e8f0',
                        backgroundColor: isSel ? '#f0f9ff' : '#f8fafc',
                        color: isSel ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSel ? '✓ ' : ''}{label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optimization Objective Select Buttons */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Optimization Objective
                </label>
                <span style={{ fontSize: '0.68rem', color: '#8b5cf6', fontWeight: 700 }}>AI WEIGHTING</span>
              </div>
              {/* Interactive Objective Select Buttons */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                {objectivesList.map(obj => {
                  const isSel = selectedObjective === obj;
                  return (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setSelectedObjective(obj)}
                      style={{
                        padding: '0.3rem 0.55rem',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: isSel ? '1.5px solid #04ADDE' : '1px solid #cbd5e1',
                        backgroundColor: isSel ? '#04ADDE' : '#ffffff',
                        color: isSel ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: isSel ? '0 2px 6px rgba(4,173,222,0.3)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isSel && <Check size={10} color="#ffffff" />}
                      {obj}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Origin: <strong>{selectedVessel.originPort}</strong>
              {hasEntered && (
                <span style={{ marginLeft: '0.5rem', color: '#10b981', fontWeight: 700 }}>
                  • Optimization Live ✓
                </span>
              )}
            </div>
            
            <button
              onClick={handleOptimize}
              disabled={optimizing || isFetchingData}
              style={{
                backgroundColor: '#04ADDE',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.55rem 1.35rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(4, 173, 222, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {optimizing || isFetchingData ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Fetching Live Route Data...</span>
                </>
              ) : hasEntered ? (
                <>
                  <Zap size={14} />
                  <span>Re-Calculate & Fetch Routes</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Optimize Route & Fetch Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Vessel Telematics Status Card */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#04ADDE', textTransform: 'uppercase' }}>
                  {selectedVessel.vesselType} • DWT {selectedVessel.dwt.toLocaleString()} MT
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0.1rem', color: '#0f172a' }}>
                  {selectedVessel.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  IMO {selectedVessel.imo} • Flag: {selectedVessel.flag}
                </span>
              </div>

              {/* Follow Vessel Button */}
              <button
                onClick={() => setFollowVessel(!followVessel)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: followVessel ? '2px solid #04ADDE' : '1px solid #cbd5e1',
                  backgroundColor: followVessel ? '#f0f9ff' : '#ffffff',
                  color: followVessel ? '#04ADDE' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Navigation size={13} />
                {followVessel ? 'Following' : 'Follow Vessel'}
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '0.5rem', 
              backgroundColor: '#f8fafc', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '0.75rem' 
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>CURRENT SPEED</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{selectedVessel.speedKnots} kn</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>HEADING</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{selectedVessel.courseOverGround}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>DRAFT</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{selectedVessel.draft} m</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>UPDATED ETA</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#04ADDE' }}>{selectedVessel.eta.split(',')[0]}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
              <span><strong>Position:</strong> {selectedVessel.currentPosition.lat}°N, {selectedVessel.currentPosition.lng}°E</span>
              <span><strong>Location:</strong> {selectedVessel.currentPosition.locationName}</span>
            </div>
          </div>

          <div style={{ marginTop: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
            <span>Charterer: <strong>{selectedVessel.commercialCharterer}</strong></span>
            <span>Expected Delay: <strong style={{ color: '#f59e0b' }}>{selectedVessel.expectedDelayHours}</strong></span>
          </div>
        </div>

      </div>

      {/* SECTION: Route Optimization Results (Only rendered after entry!) */}
      {!hasEntered || !routeData || !compatibility ? (
        <div className="card" style={{
          padding: '3rem 2rem',
          backgroundColor: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(4, 173, 222, 0.1)',
            border: '2px solid rgba(4, 173, 222, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#04ADDE'
          }}>
            <Compass size={30} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#f0f9ff',
            color: '#0369a1',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={13} /> AWAITING ROUTE PARAMETERS ENTRY
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Configure Voyage & Click 'Optimize Route & Fetch Data'
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '650px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
            Select your vessel, destination port, cargo volume, and optimization priority in the panel above. Once entered, NAUGATI will query live ML models to compute deep-water corridors, transit ETA, swell risks, and shortcut channels.
          </p>

          {/* 4 Feature Preview Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            maxWidth: '1000px',
            margin: '0 auto 2rem',
            textAlign: 'left'
          }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#04ADDE', fontWeight: 700, fontSize: '0.85rem' }}>
                <Navigation size={16} /> Multi-Corridor Routing
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Compares Sunda Deep-Water Pass, Malacca Strait TSS, and Torres Strait Direct shortcut.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                <Clock size={16} /> ML ETA Prediction
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Predicts accurate arrival windows, anchorage queue variance, and weather delays.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
                <ShieldAlert size={16} /> Marine Swell Risk
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Calibrated meteorological evaluation identifying wave heights and monsoon advisories.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.85rem' }}>
                <Layers size={16} /> Port UKC Clearance
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Under-keel clearance calculation verifying draft safety against port limits.
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={optimizing || isFetchingData}
            style={{
              backgroundColor: '#04ADDE',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 14px rgba(4, 173, 222, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Zap size={17} />
            {optimizing || isFetchingData ? 'Fetching Live Predictions...' : 'Run Optimization with Selected Parameters'}
          </button>
        </div>
      ) : (
        <>
          {/* SECTION: Port Compatibility Warning Alert (Section 25 of user spec) */}
          {!compatibility.isCompatible ? (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          color: '#991b1b'
        }}>
          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.85rem' }}>⚠ Port Compatibility Issue Detected: </strong>
            <span style={{ fontSize: '0.82rem' }}>{compatibility.warningMessage}</span>
          </div>
        </div>
      ) : compatibility.draftMargin < 1.0 ? (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          color: '#92400e'
        }}>
          <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem' }}>
            <strong>Tight Under-Keel Clearance:</strong> {compatibility.warningMessage}
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '0.55rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.25rem',
          color: '#166534',
          fontSize: '0.78rem'
        }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span>
            <strong>Vessel & Port Compatible:</strong> {selectedVessel.name} (Draft {selectedVessel.draft}m) is safe to berth at {compatibility.portMaxDraft ? `Dhamra Port (Max Draft ${compatibility.portMaxDraft}m)` : 'destination'}.
          </span>
        </div>
      )}

      {/* SECTION: Main Interactive Map Hero */}
      <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', height: '620px', marginBottom: '1.25rem', border: '1px solid #1e3a5f' }}>
        
        {/* Layer Toggles Floating Control Header */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '370px',
          zIndex: 500,
          display: 'flex',
          gap: '0.4rem',
          backgroundColor: 'rgba(11, 25, 44, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          fontSize: '0.72rem'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}>
            <input type="checkbox" checked={showWeather} onChange={e => setShowWeather(e.target.checked)} />
            <span>Weather</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}>
            <input type="checkbox" checked={showCongestion} onChange={e => setShowCongestion(e.target.checked)} />
            <span>Congestion</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}>
            <input type="checkbox" checked={showNavigation} onChange={e => setShowNavigation(e.target.checked)} />
            <span>Nav Restrictions</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}>
            <input type="checkbox" checked={showAlternativeRoutes} onChange={e => setShowAlternativeRoutes(e.target.checked)} />
            <span>Alternative Routes</span>
          </label>
        </div>

        <InteractiveMaritimeMap 
          selectedVessel={selectedVessel}
          selectedRoute={currentActiveRoute}
          alternativeRoute={alternativeRoute}
          shortcutRoute={shortcutRoute}
          onSelectVessel={(id) => setSelectedVesselId(id)}
          onSelectPort={(id) => setSelectedPortId(id)}
          onSelectRiskZone={(zone) => setSelectedRiskZone(zone)}
          followVessel={followVessel}
          onToggleFollowVessel={() => setFollowVessel(!followVessel)}
          showWeather={showWeather}
          showCongestion={showCongestion}
          showGeopolitical={showGeopolitical}
          showNavigation={showNavigation}
          showAlternativeRoutes={showAlternativeRoutes}
          showPorts={showPorts}
          showVesselLayer={showVesselLayer}
        />
      </div>

      {/* SECTION: Route Voyage Progress Metric Bar (Section 5 of user spec) */}
      <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#04ADDE', textTransform: 'uppercase' }}>
              VOYAGE PROGRESS INTELLIGENCE
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedVessel.traveledDistanceNM.toLocaleString()} / {selectedVessel.totalDistanceNM.toLocaleString()} NM Completed ({selectedVessel.progressPercentage}%)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>REMAINING DISTANCE</span>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedVessel.remainingDistanceNM.toLocaleString()} NM</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>CURRENT SPEED</span>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedVessel.speedKnots} knots</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>PREDICTED ARRIVAL (ETA)</span>
              <div style={{ fontWeight: 800, color: '#04ADDE' }}>{selectedVessel.eta}</div>
            </div>
          </div>
        </div>

        {/* Progress bar visual */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${selectedVessel.progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #04ADDE, #38bdf8)',
            borderRadius: '4px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* SECTION: Shortcut Available Callout Banner (Section 8 of user spec) */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', maxWidth: '850px' }}>
          <div style={{
            backgroundColor: '#10b981',
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shortcut Available — Route 3 (Torres Reef Direct Pass)
              </span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                120 NM / 12 Hours Saved
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
              The optimized route reduces approximately <strong>120 nautical miles</strong> and may reduce voyage time by approximately <strong>12 hours (~55 MT fuel saving)</strong>, subject to Torres Strait weather and navigation draft clearance.
            </p>

            <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>
              *Note: Not automatically recommended because shallow reef draft restrictions (12.2m) require daylight navigation and mandatory coastal pilotage.
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveRouteId('route-short')}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.6rem 1.2rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
          }}
        >
          <span>Evaluate Shortcut</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* SECTION: 3-Way Route Comparison Cards (Section 7 of user spec) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Comparative Route Analysis
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Evaluating speed, bunker consumption, weather swell delays, and canal choke risks
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {routes.map(r => {
            const isSelected = r.id === activeRouteId;
            const isRec = r.type === 'recommended';
            const isShort = r.type === 'shortcut';

            return (
              <div
                key={r.id}
                onClick={() => setActiveRouteId(r.id)}
                className="card"
                style={{
                  padding: '1.25rem',
                  border: isSelected ? '2px solid #04ADDE' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(4, 173, 222, 0.18)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isRec ? '#04ADDE' : (isShort ? '#10b981' : '#64748b'),
                    color: 'white'
                  }}>
                    {r.displayName.toUpperCase()}
                  </span>

                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                    Score: {r.overallScore}/100
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                  {r.title}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '0.75rem', backgroundColor: isSelected ? '#ffffff' : '#f8fafc', padding: '0.6rem', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>DISTANCE</span>
                    <div style={{ fontWeight: 800 }}>{r.distanceNM.toLocaleString()} NM</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>ETA DURATION</span>
                    <div style={{ fontWeight: 800, color: '#04ADDE' }}>{r.voyageDurationFormatted}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>BUNKER FUEL</span>
                    <div style={{ fontWeight: 800 }}>{r.fuelConsumptionMT} MT</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>EST. VOYAGE COST</span>
                    <div style={{ fontWeight: 800 }}>${r.estimatedCostUSD.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>WEATHER RISK</span>
                    <div style={{ fontWeight: 700, color: r.riskLevel.includes('Low') ? '#10b981' : '#f59e0b' }}>
                      {r.riskLevel}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>CONGESTION</span>
                    <div style={{ fontWeight: 700, color: r.congestionLevel === 'Low' ? '#10b981' : '#ef4444' }}>
                      {r.congestionLevel}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                  {r.whyRecommended}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveRouteId(r.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #04ADDE' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#04ADDE' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: isSelected ? '0 2px 8px rgba(4, 173, 222, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSelected ? <Check size={14} color="#ffffff" /> : <Navigation size={13} color="#04ADDE" />}
                  {isSelected ? 'FOLLOWING THIS ROUTE ✓' : `SELECT THIS ROUTE`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: Explainable AI Route Decision Dossier (Section 10 & 20 of user spec) */}
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#04ADDE', letterSpacing: '0.05em' }}>
              RECOMMENDATION INTELLIGENCE
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.1rem 0 0.2rem', color: '#0f172a' }}>
              Why This Route? — Explainable Voyage Dossier
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
              NAUGATI AI evaluates 7 independent maritime variables to prevent black-box decisions.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '0.5rem 1rem',
            borderRadius: '8px'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700 }}>COMPOSITE ROUTE SCORE</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#04ADDE' }}>
                {currentActiveRoute.overallScore} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Factor Score Breakdown Bar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {Object.entries(currentActiveRoute.scoreBreakdown).map(([factor, score]) => (
            <div key={factor} style={{ backgroundColor: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                <span style={{ textTransform: 'capitalize', color: '#475569', fontWeight: 600 }}>{factor}</span>
                <strong style={{ color: score >= 85 ? '#10b981' : (score >= 75 ? '#04ADDE' : '#f59e0b') }}>{score}</strong>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  width: `${score}%`,
                  height: '100%',
                  backgroundColor: score >= 85 ? '#10b981' : (score >= 75 ? '#04ADDE' : '#f59e0b')
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #04ADDE', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
          <strong>Decision Summary: </strong>
          {currentActiveRoute.id === 'route-rec' ? (
            <span>
              Route 1 is designated as the <strong>Recommended Route</strong> because it delivers the optimal harmony between arrival certainty, bunker efficiency, and navigational safety for this <strong>180,000 DWT Capesize vessel</strong>. By navigating via the Sunda Strait deep-water trench, it completely avoids the high vessel collision risk and Singapore anchorage bottlenecks in the Malacca Strait (&gt;220 commercial vessels/day). Furthermore, unlike Route 3 (Shortcut), it guarantees safe under-keel clearance (&gt;4.2m) without requiring tidal delays or high coastal pilotage surcharges.
            </span>
          ) : currentActiveRoute.id === 'route-short' ? (
            <span>
              The <strong>Shortcut Route</strong> achieves the shortest nautical transit ({currentActiveRoute.distanceNM} NM), delivering an estimated voyage reduction of <strong>12 hours and $16,500 in bunker savings</strong>. However, shipowners must account for mandatory Torres Strait pilotage and speed restrictions (12 knots) through the Prince of Wales channel.
            </span>
          ) : (
            <span>
              The <strong>Alternative Highway Route</strong> offers well-established sea lanes and direct access to Singapore bunkering berths, but adds 170 nautical miles and 18 hours of voyage time due to Traffic Separation Scheme speed constraints.
            </span>
          )}
        </div>
      </div>
      </>
      )}

      {/* SECTION: Clicked Risk Zone Detail Modal */}
      {selectedRiskZone && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: selectedRiskZone.color,
                backgroundColor: selectedRiskZone.fillColor,
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {selectedRiskZone.category.toUpperCase()} • SEVERITY: {selectedRiskZone.severity.toUpperCase()}
              </span>

              <button
                onClick={() => setSelectedRiskZone(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              {selectedRiskZone.name}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>EXPECTED IMPACT</span>
              <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>
                {selectedRiskZone.expectedImpact}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REASON & CAUSE</span>
              <p style={{ margin: '0.2rem 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                {selectedRiskZone.reason}
              </p>
            </div>

            {selectedRiskZone.activeWarnings && (
              <div style={{ marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>ACTIVE ADVISORIES:</span>
                <ul style={{ margin: '0.3rem 0 0 1rem', padding: 0, fontSize: '0.78rem', color: '#475569' }}>
                  {selectedRiskZone.activeWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b', marginBottom: '1rem' }}>
              <span>Affected: {selectedRiskZone.affectedSegment}</span>
              <span>Updated: {selectedRiskZone.lastUpdated}</span>
            </div>

            <button
              onClick={() => setSelectedRiskZone(null)}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#04ADDE',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
