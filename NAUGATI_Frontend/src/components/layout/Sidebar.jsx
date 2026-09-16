import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Search, TrendingUp, Navigation, 
  Map, FileText, AlertTriangle, Crosshair, Anchor, Bell, 
  BarChart2, Settings, User, LogOut, Sliders, Layers, Award, Sparkles, Ship
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const isShipowner = userProfile?.organizationType === 'Ocean Carrier' || userProfile?.role === 'shipowner';

  const activeStyle = {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: 600,
    borderRight: '3px solid var(--primary)'
  };
  
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 24px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  };

  const sectionHeadingStyle = {
    padding: '16px 24px 6px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Brand */}
      <div
        onClick={() => navigate('/')}
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
      >
        <img
          src="/logo.png"
          alt="NAUGATI"
          style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Role-Specific Navigation Links */}
      <div style={{ padding: '12px 0', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        
        <NavLink to="/dashboard" end style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
        </NavLink>

        {isShipowner ? (
          // ==================== OCEAN CARRIER / SHIPOWNER NAVIGATION ====================
          <>
            <div style={sectionHeadingStyle}>FLEET & COMMERCIAL</div>

            <NavLink to="/dashboard/fleet" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Ship size={18} />
              <span>Fleet Status & Positions</span>
            </NavLink>

            <NavLink to="/dashboard/vessel-availability" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Layers size={18} />
              <span>Vessel Availability</span>
            </NavLink>

            <NavLink to="/dashboard/deadheading" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Crosshair size={18} />
              <span>Deadheading Optimization</span>
            </NavLink>

            <NavLink to="/dashboard/backhaul" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Award size={18} />
              <span>Backhaul & Opportunities</span>
            </NavLink>


            <NavLink to="/dashboard/freight-forecast" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <TrendingUp size={18} />
              <span>Freight Market Intelligence</span>
            </NavLink>

            <NavLink to="/dashboard/route-optimization" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Map size={18} />
              <span>Route & Live Tracking</span>
            </NavLink>

            <NavLink to="/dashboard/risk-intelligence" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <AlertTriangle size={18} />
              <span>Risk & Geopolitical</span>
            </NavLink>

            <NavLink to="/dashboard/alerts" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Bell size={18} />
              <span>Alerts & Notifications</span>
            </NavLink>
          </>
        ) : (
          // ==================== SHIPPER / FORWARDER NAVIGATION ====================
          <>
            <div style={sectionHeadingStyle}>CHARTERING WORKFLOW</div>
            

            <NavLink to="/dashboard/cargo" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Search size={18} />
              <span>Find Best Shipping Option</span>
            </NavLink>

            <NavLink to="/dashboard/final-recommendation" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Award size={18} />
              <span>Recommended Strategy</span>
            </NavLink>

            <NavLink to="/dashboard/vessels" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Ship size={18} />
              <span>Vessel Matching</span>
            </NavLink>

            <NavLink to="/dashboard/freight-forecast" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <TrendingUp size={18} />
              <span>Freight Forecast</span>
            </NavLink>

            <NavLink to="/dashboard/contract-recommendation" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <FileText size={18} />
              <span>Contract Strategy</span>
            </NavLink>

            <div style={sectionHeadingStyle}>INTELLIGENCE & OPTIMIZATION</div>

            <NavLink to="/dashboard/route-optimization" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Map size={18} />
              <span>ETA & Route Optimization</span>
            </NavLink>

            <NavLink to="/dashboard/port-intelligence" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Anchor size={18} />
              <span>Port Intelligence</span>
            </NavLink>

            <NavLink to="/dashboard/risk-intelligence" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <AlertTriangle size={18} />
              <span>Risk & Congestion</span>
            </NavLink>

            <NavLink to="/dashboard/what-if" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Sliders size={18} />
              <span>What-If Simulator</span>
            </NavLink>

            <NavLink to="/dashboard/alerts" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
              <Bell size={18} />
              <span>Maritime Alerts</span>
            </NavLink>
          </>
        )}

        <div style={sectionHeadingStyle}>EXPORT & AUDIT</div>

        <NavLink to="/dashboard/reports" style={({isActive}) => isActive ? {...linkStyle, ...activeStyle} : linkStyle}>
          <BarChart2 size={18} />
          <span>Intelligence Reports</span>
        </NavLink>
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <button 
          onClick={logout}
          style={{
            ...linkStyle, 
            color: 'var(--semantic-red)', 
            border: 'none', 
            background: 'none', 
            width: '100%', 
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px'
          }}
          className="hover:bg-red-50"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
