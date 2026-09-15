import React from 'react';
import { Ship, Menu, BarChart2, Briefcase } from 'lucide-react';

const TopNavDark = ({ onLoginClick }) => {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--topbar-height)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'rgba(6, 17, 30, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 100
    }}>
      {/* Logo */}
      <div className="flex items-center gap-4 cursor-pointer" style={{ width: '300px' }}>
        <Ship size={32} className="text-white" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em' }}>NAUGATI</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>INTELLIGENCE</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center h-full">
        <button 
          onClick={onLoginClick}
          className="flex items-center justify-center gap-3 h-full px-8 hover:bg-white hover:bg-opacity-5 transition-colors"
          style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}
        >
          <BarChart2 size={18} className="text-white opacity-70" />
          <span className="text-sm font-medium">Login to Platform</span>
        </button>

        <button 
          className="flex items-center justify-center gap-3 h-full px-8 hover:bg-white hover:bg-opacity-5 transition-colors"
          style={{ borderRight: '1px solid var(--border-color)' }}
        >
          <Briefcase size={18} className="text-white opacity-70" />
          <span className="text-sm font-medium">Login to Research</span>
        </button>

        <button className="flex items-center justify-center h-full px-8 hover:bg-white hover:bg-opacity-5 transition-colors">
          <Menu size={24} className="text-white" />
        </button>
      </div>
    </nav>
  );
};

export default TopNavDark;
