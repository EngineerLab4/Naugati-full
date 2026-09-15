import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  RotateCcw, Search, Eye, EyeOff, Play, Pause, 
  FastForward, ShieldAlert, Wind, Anchor, Ship, Navigation, AlertTriangle, Layers, Info
} from 'lucide-react';
import { PORTS } from '../../services/demoData';
import { maritimeRiskService } from '../../services/maritimeRiskService';
import { vesselTrackingService } from '../../services/vesselTrackingService';

export default function InteractiveMaritimeMap({
  selectedVessel,
  selectedRoute,
  alternativeRoute,
  shortcutRoute,
  onSelectVessel,
  onSelectPort,
  onSelectRiskZone,
  followVessel = false,
  onToggleFollowVessel,
  showWeather = true,
  showCongestion = true,
  showGeopolitical = true,
  showNavigation = true,
  showAlternativeRoutes = true,
  showPorts = true,
  showVesselLayer = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    vessel: null,
    ports: [],
    risks: [],
    routeLines: []
  });

  // Search & UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 5x, 10x
  const [playbackProgress, setPlaybackProgress] = useState(100); // 0 to 100%
  const playbackTimerRef = useRef(null);
  const [playbackWaypoints, setPlaybackWaypoints] = useState([]);

  // Fetch playback waypoints for active vessel
  useEffect(() => {
    if (selectedVessel) {
      const wps = vesselTrackingService.getPlaybackWaypoints(selectedVessel.id);
      setPlaybackWaypoints(wps);
    }
  }, [selectedVessel?.id]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center between Bay of Bengal and Australia (Indo-Pacific corridor)
    const initialCenter = [7.5, 98.0];
    const initialZoom = 4;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Esri World Dark Gray Base - enterprise nautical dark map with crisp coastlines, zero watermarks
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, DeLorme, NAVTEQ'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (selectedVessel) {
      mapInstanceRef.current?.setView([selectedVessel.currentPosition.lat, selectedVessel.currentPosition.lng], 5, { animate: true });
    } else {
      mapInstanceRef.current?.setView([8.0, 95.0], 4, { animate: true });
    }
  };

  // Follow Vessel camera lock
  useEffect(() => {
    if (followVessel && selectedVessel && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedVessel.currentPosition.lat, selectedVessel.currentPosition.lng], {
        animate: true,
        duration: 1.0
      });
    }
  }, [followVessel, selectedVessel?.currentPosition?.lat, selectedVessel?.currentPosition?.lng]);

  // Update Route Polylines (Recommended: Completed Solid vs Remaining Dashed; Alt; Shortcut)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route lines
    markersRef.current.routeLines.forEach(line => map.removeLayer(line));
    markersRef.current.routeLines = [];

    if (!selectedRoute || !selectedVessel) return;

    const vesselPos = [selectedVessel.currentPosition.lat, selectedVessel.currentPosition.lng];

    // 1. RECOMMENDED ROUTE — Completed (Solid) vs Remaining (Dashed)
    const recWaypoints = selectedRoute.waypoints.map(w => [w.lat, w.lng]);
    
    // Find closest waypoint to vessel to split path
    let splitIdx = 4; // Mid-journey index for Gladstone -> Dhamra
    const completedCoords = [...recWaypoints.slice(0, splitIdx + 1), vesselPos];
    const remainingCoords = [vesselPos, ...recWaypoints.slice(splitIdx + 1)];

    // Glow background line for completed route
    const glowLine = L.polyline(completedCoords, {
      color: '#04ADDE',
      weight: 8,
      opacity: 0.3
    }).addTo(map);
    markersRef.current.routeLines.push(glowLine);

    // Completed Travelled Line (Solid High-Contrast Cyan)
    const traveledLine = L.polyline(completedCoords, {
      color: '#04ADDE',
      weight: 4,
      opacity: 0.95
    }).addTo(map);
    markersRef.current.routeLines.push(traveledLine);

    // Remaining Voyage Line (Dashed Luminous Cyan)
    const remainingLine = L.polyline(remainingCoords, {
      color: '#38bdf8',
      weight: 3.5,
      dashArray: '8, 8',
      opacity: 0.9
    }).addTo(map);
    markersRef.current.routeLines.push(remainingLine);

    // 2. ALTERNATIVE ROUTE (Dashed Silver/Slate)
    if (showAlternativeRoutes && alternativeRoute) {
      const altCoords = alternativeRoute.waypoints.map(w => [w.lat, w.lng]);
      const altLine = L.polyline(altCoords, {
        color: '#94a3b8',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.7
      }).addTo(map);
      markersRef.current.routeLines.push(altLine);
    }

    // 3. SHORTCUT ROUTE (Vibrant Emerald / Dash)
    if (showAlternativeRoutes && shortcutRoute) {
      const shortCoords = shortcutRoute.waypoints.map(w => [w.lat, w.lng]);
      const shortLine = L.polyline(shortCoords, {
        color: '#10b981',
        weight: 3,
        dashArray: '4, 4',
        opacity: 0.85
      }).addTo(map);
      markersRef.current.routeLines.push(shortLine);
    }
  }, [selectedRoute, alternativeRoute, shortcutRoute, selectedVessel, showAlternativeRoutes]);

  // Update Risk Zones Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.risks.forEach(r => map.removeLayer(r));
    markersRef.current.risks = [];

    const allZones = maritimeRiskService.getAllRiskZones();

    allZones.forEach(zone => {
      // Visibility filters
      if (zone.category === 'Weather Risk' && !showWeather) return;
      if (zone.category.includes('Congestion') && !showCongestion) return;
      if (zone.category === 'Geopolitical Risk' && !showGeopolitical) return;
      if (zone.category === 'Navigation Risk' && !showNavigation) return;

      const circle = L.circle(zone.coordinates, {
        radius: zone.radiusKm * 1000,
        color: zone.color,
        fillColor: zone.fillColor,
        fillOpacity: 0.28,
        weight: 1.8,
        dashArray: zone.severity === 'High' ? '4, 4' : '6, 6'
      }).addTo(map);

      // Tooltip
      circle.bindTooltip(`
        <div style="font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 600;">
          <span style="color: ${zone.color};">● ${zone.category}</span><br/>
          <strong>${zone.name}</strong><br/>
          <span style="color: #64748b;">${zone.expectedImpact}</span>
        </div>
      `, { sticky: true, className: 'naugati-map-tooltip' });

      // Click modal/action
      circle.on('click', () => {
        if (onSelectRiskZone) onSelectRiskZone(zone);
      });

      markersRef.current.risks.push(circle);
    });
  }, [showWeather, showCongestion, showGeopolitical, showNavigation, onSelectRiskZone]);

  // Update Port Markers (Matching Reference Image Glowing Red/Amber Pins)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.ports.forEach(p => map.removeLayer(p));
    markersRef.current.ports = [];

    if (!showPorts) return;

    PORTS.forEach(port => {
      // Coords in demoData are [lng, lat]
      const lat = port.coordinates[1];
      const lng = port.coordinates[0];

      const isHighCongestion = port.currentCongestion === 'High';
      const isDhamra = port.id === 'dhamra';
      const pinColor = isHighCongestion ? '#ef4444' : (isDhamra ? '#04ADDE' : '#10b981');

      const portIcon = L.divIcon({
        className: 'naugati-port-icon',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Outer Ripple Glow -->
            <div style="
              width: ${isDhamra ? '26px' : '20px'}; 
              height: ${isDhamra ? '26px' : '20px'}; 
              border-radius: 50%; 
              background: ${pinColor}; 
              opacity: 0.25; 
              position: absolute; 
              top: -3px; 
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            
            <!-- Pin Head with dot -->
            <div style="
              width: 14px; 
              height: 14px; 
              border-radius: 50%; 
              background: ${pinColor}; 
              border: 2px solid #ffffff; 
              box-shadow: 0 0 10px ${pinColor};
              z-index: 2;
            "></div>
            
            <!-- Port Name Tag -->
            <div style="
              margin-top: 3px; 
              background: rgba(11, 25, 44, 0.92); 
              color: ${isDhamra ? '#38bdf8' : '#e2e8f0'}; 
              font-family: 'Poppins', sans-serif;
              font-size: 10px; 
              font-weight: 700; 
              padding: 2px 6px; 
              border-radius: 4px; 
              white-space: nowrap; 
              border: 1px solid rgba(255,255,255,0.15);
              box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            ">
              ${port.name.replace(' Port', '').replace(' Dock Complex', '')}
              <span style="font-size: 8px; color: ${isHighCongestion ? '#f87171' : '#4ade80'}; margin-left: 2px;">
                ${port.unlocode}
              </span>
            </div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 7]
      });

      const marker = L.marker([lat, lng], { icon: portIcon }).addTo(map);

      // Popup card with rich port info
      marker.bindPopup(`
        <div style="font-family: 'Poppins', sans-serif; padding: 4px; min-width: 220px;">
          <div style="font-size: 11px; font-weight: 800; color: #04ADDE; text-transform: uppercase;">
            ${port.country} • ${port.unlocode}
          </div>
          <h4 style="margin: 3px 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
            ${port.name}
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #f8fafc; padding: 6px; border-radius: 6px;">
            <div>
              <span style="color: #64748b; font-size: 9px;">CONGESTION</span><br/>
              <strong style="color: ${isHighCongestion ? '#ef4444' : '#10b981'};">${port.currentCongestion} (${port.waitingVessels} ships)</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 9px;">WAITING TIME</span><br/>
              <strong>${port.averageWaitingTimeDays} days</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 9px;">MAX DRAFT</span><br/>
              <strong>${port.maxDraft} m</strong>
            </div>
            <div>
              <span style="color: #64748b; font-size: 9px;">WEATHER</span><br/>
              <strong style="color: #04ADDE;">${port.weatherRisk}</strong>
            </div>
          </div>
          <div style="font-size: 10px; color: #64748b; line-height: 1.3; margin-bottom: 8px;">
            ${port.restrictions || "Direct approach deep-water navigation corridor."}
          </div>
          <button id="btn-view-port-${port.id}" style="
            width: 100%; 
            padding: 5px 8px; 
            background: #04ADDE; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            font-size: 11px; 
            font-weight: 700; 
            cursor: pointer;
          ">
            View Port Intelligence
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-port-${port.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectPort) onSelectPort(port.id);
            map.closePopup();
          };
        }
      });

      markersRef.current.ports.push(marker);
    });
  }, [showPorts, onSelectPort]);

  // Update Vessel Marker (Ship Icon with Heading Rotation and Click Card)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersRef.current.vessel) {
      map.removeLayer(markersRef.current.vessel);
      markersRef.current.vessel = null;
    }

    if (!showVesselLayer || !selectedVessel) return;

    const lat = selectedVessel.currentPosition.lat;
    const lng = selectedVessel.currentPosition.lng;
    const heading = selectedVessel.headingDeg || 0;

    const vesselIcon = L.divIcon({
      className: 'naugati-vessel-marker',
      html: `
        <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <!-- Radar wave animation -->
          <div style="
            position: absolute; 
            width: 44px; 
            height: 44px; 
            border-radius: 50%; 
            border: 2px solid #04ADDE; 
            background: rgba(4, 173, 222, 0.2); 
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>

          <!-- Rotating Ship Marker Body -->
          <div style="
            width: 28px; 
            height: 28px; 
            background: #071e3d; 
            border: 2px solid #04ADDE; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 0 12px rgba(4, 173, 222, 0.8);
            transform: rotate(${heading}deg);
            transition: transform 0.4s ease;
          ">
            <!-- Ship Arrow Icon pointing north inside rotation -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#04ADDE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>

          <!-- Vessel Label Pill -->
          <div style="
            position: absolute; 
            bottom: -18px; 
            background: rgba(11, 25, 44, 0.95); 
            color: #ffffff; 
            font-family: 'Poppins', sans-serif; 
            font-size: 9px; 
            font-weight: 800; 
            padding: 1px 6px; 
            border-radius: 4px; 
            white-space: nowrap; 
            border: 1px solid #04ADDE;
            box-shadow: 0 2px 6px rgba(0,0,0,0.8);
          ">
            ${selectedVessel.name.replace('MV ', '')} • ${selectedVessel.speedKnots} kn
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    const vesselMarker = L.marker([lat, lng], { icon: vesselIcon, zIndexOffset: 1000 }).addTo(map);

    // Vessel Compact Click Card
    vesselMarker.bindPopup(`
      <div style="font-family: 'Poppins', sans-serif; padding: 4px; min-width: 230px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 800; color: #04ADDE; text-transform: uppercase;">
            ${selectedVessel.vesselType} • IMO ${selectedVessel.imo}
          </span>
          <span style="font-size: 9px; background: #e0f2fe; color: #0369a1; padding: 1px 5px; border-radius: 3px; font-weight: 700;">
            LIVE AIS
          </span>
        </div>
        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
          ${selectedVessel.name}
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px; background: #f8fafc; padding: 6px; border-radius: 6px;">
          <div>
            <span style="color: #64748b; font-size: 9px;">SPEED</span><br/>
            <strong>${selectedVessel.speedKnots} kn</strong>
          </div>
          <div>
            <span style="color: #64748b; font-size: 9px;">HEADING</span><br/>
            <strong>${selectedVessel.courseOverGround}</strong>
          </div>
          <div>
            <span style="color: #64748b; font-size: 9px;">DESTINATION</span><br/>
            <strong>${selectedVessel.destinationPort}</strong>
          </div>
          <div>
            <span style="color: #64748b; font-size: 9px;">ETA</span><br/>
            <strong style="color: #04ADDE;">${selectedVessel.eta.split(',')[0]}</strong>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-popup-follow-vessel" style="
            flex: 1; 
            padding: 6px; 
            background: #04ADDE; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            font-size: 10px; 
            font-weight: 700; 
            cursor: pointer;
          ">
            ${followVessel ? 'Stop Following' : 'Track Vessel'}
          </button>
          <button id="btn-popup-view-vessel" style="
            flex: 1; 
            padding: 6px; 
            background: #f1f5f9; 
            color: #334155; 
            border: 1px solid #cbd5e1; 
            border-radius: 4px; 
            font-size: 10px; 
            font-weight: 700; 
            cursor: pointer;
          ">
            View Details
          </button>
        </div>
      </div>
    `);

    vesselMarker.on('popupopen', () => {
      const btnFollow = document.getElementById('btn-popup-follow-vessel');
      if (btnFollow) {
        btnFollow.onclick = () => {
          if (onToggleFollowVessel) onToggleFollowVessel();
          map.closePopup();
        };
      }
      const btnView = document.getElementById('btn-popup-view-vessel');
      if (btnView) {
        btnView.onclick = () => {
          if (onSelectVessel) onSelectVessel(selectedVessel.id);
          map.closePopup();
        };
      }
    });

    markersRef.current.vessel = vesselMarker;
  }, [selectedVessel, showVesselLayer, followVessel, onToggleFollowVessel, onSelectVessel]);

  // Search autocomplete logic
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val || val.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const q = val.toLowerCase();
    const results = [];

    // Vessels
    const vessels = vesselTrackingService.getAllVessels();
    vessels.forEach(v => {
      if (v.name.toLowerCase().includes(q) || v.imo.includes(q)) {
        results.push({
          type: 'vessel',
          id: v.id,
          title: v.name,
          subtitle: `IMO ${v.imo} • ${v.vesselType}`,
          lat: v.currentPosition.lat,
          lng: v.currentPosition.lng
        });
      }
    });

    // Ports
    PORTS.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.unlocode.toLowerCase().includes(q)) {
        results.push({
          type: 'port',
          id: p.id,
          title: p.name,
          subtitle: `${p.country} • ${p.unlocode}`,
          lat: p.coordinates[1],
          lng: p.coordinates[0]
        });
      }
    });

    setSearchResults(results.slice(0, 6));
    setIsSearching(true);
  };

  const handleSelectSearchResult = (res) => {
    setIsSearching(false);
    setSearchQuery(res.title);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 7, {
        duration: 1.5
      });
    }
    if (res.type === 'vessel' && onSelectVessel) onSelectVessel(res.id);
    if (res.type === 'port' && onSelectPort) onSelectPort(res.id);
  };

  // Playback timer tick
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 2 * playbackSpeed);
        });
      }, 300);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // When playback progress changes, move map/marker if playing
  useEffect(() => {
    if (!playbackWaypoints || playbackWaypoints.length === 0) return;
    const idx = Math.min(
      playbackWaypoints.length - 1,
      Math.floor((playbackProgress / 100) * (playbackWaypoints.length - 1))
    );
    const targetWp = playbackWaypoints[idx];
    if (targetWp && markersRef.current.vessel && isPlaying) {
      markersRef.current.vessel.setLatLng([targetWp.lat, targetWp.lng]);
    }
  }, [playbackProgress, playbackWaypoints, isPlaying]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '560px', backgroundColor: '#071e3d', overflow: 'hidden', borderRadius: '12px' }}>
      
      {/* Top Left: Search & Telematics Overlay */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '16px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '340px',
        width: 'calc(100% - 32px)'
      }}>
        {/* Search Box */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(11, 25, 44, 0.92)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '6px 12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
          }}>
            <Search size={16} color="#04ADDE" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search vessel, port, or UN/LOCODE..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setIsSearching(true)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                width: '100%',
                fontFamily: 'Poppins, sans-serif'
              }}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#0b192c',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
              zIndex: 600
            }}>
              {searchResults.map((res, i) => (
                <div 
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(4, 173, 222, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{res.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '10px' }}>{res.subtitle}</div>
                  </div>
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: res.type === 'vessel' ? 'rgba(4, 173, 222, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: res.type === 'vessel' ? '#38bdf8' : '#34d399',
                    fontWeight: 700
                  }}>
                    {res.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Right: Map Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '16px',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <button 
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(11, 25, 44, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
          }}
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(11, 25, 44, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
          }}
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleResetView}
          title="Center Vessel"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(11, 25, 44, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#04ADDE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
          }}
        >
          <RotateCcw size={16} />
        </button>
        <button 
          onClick={onToggleFollowVessel}
          title={followVessel ? "Stop Following" : "Follow Vessel Mode"}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: followVessel ? '#04ADDE' : 'rgba(11, 25, 44, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: followVessel ? 'white' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
          }}
        >
          <Navigation size={16} />
        </button>
        <button 
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(11, 25, 44, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div style={{
        position: 'absolute',
        bottom: '68px',
        left: '16px',
        zIndex: 500,
        backgroundColor: 'rgba(11, 25, 44, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '11px',
        color: '#e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#04ADDE', boxShadow: '0 0 6px #04ADDE' }} />
          <span style={{ fontWeight: 600 }}>Active Vessel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '3px', background: '#04ADDE' }} />
          <span>Travelled Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '2px', borderTop: '2px dashed #38bdf8' }} />
          <span>Remaining Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '2px', borderTop: '2px dashed #10b981' }} />
          <span style={{ color: '#34d399', fontWeight: 600 }}>Shortcut Pass</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span>Congested Port</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Weather / Nav Risk</span>
        </div>
      </div>

      {/* Bottom Row: Route Playback Timeline Scrubber */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        zIndex: 500,
        backgroundColor: 'rgba(11, 25, 44, 0.94)',
        backdropFilter: 'blur(10px)',
        padding: '8px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            backgroundColor: '#04ADDE',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '3px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <span><strong>Departure:</strong> Gladstone, Australia</span>
            <span style={{ color: '#04ADDE', fontWeight: 700 }}>
              Playback Progress: {Math.round(playbackProgress)}%
            </span>
            <span><strong>Current AIS:</strong> Bay of Bengal (13.85°N, 85.98°E)</span>
          </div>

          {/* Scrubber Range */}
          <input 
            type="range"
            min="0"
            max="100"
            value={playbackProgress}
            onChange={(e) => {
              setPlaybackProgress(Number(e.target.value));
              setIsPlaying(false);
            }}
            style={{
              width: '100%',
              accentColor: '#04ADDE',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Speed Selector Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {[1, 2, 5, 10].map(spd => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              style={{
                padding: '3px 7px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: playbackSpeed === spd ? '#04ADDE' : 'rgba(255,255,255,0.08)',
                color: playbackSpeed === spd ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', zIndex: 1 }} 
      />

    </div>
  );
}
