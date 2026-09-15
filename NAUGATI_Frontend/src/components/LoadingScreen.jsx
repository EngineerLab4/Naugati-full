import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 0-2s: Just ocean and ship
    const t1 = setTimeout(() => setPhase(1), 2000);
    // 2-4s: NAUGATI branding begins appearing
    const t2 = setTimeout(() => setPhase(2), 4000);
    // 4-6s: "Forecast. Optimize. Charter Smarter." revealed
    const t3 = setTimeout(() => setPhase(3), 6000);
    // 6-7s: Transition out
    const t4 = setTimeout(() => onComplete(), 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      opacity: phase === 3 ? 0 : 1,
      transition: 'opacity 1.5s ease-in-out'
    }}>
      {/* Background Image: The white ship on the ocean */}
      <div style={{
        position: 'absolute',
        inset: -100, // Make it slightly larger so we can pan
        backgroundImage: 'url(/cinematic_ship.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // We do a slow pan and scale over 8 seconds to simulate the camera following the ship
        animation: 'cinematicPan 8s linear forwards',
      }}>
        {/* Dark overlay to make text readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Text Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 800,
          letterSpacing: '0.2em',
          margin: 0,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          NAUGATI
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          fontWeight: 300,
          letterSpacing: '0.05em',
          marginTop: '1rem',
          color: 'var(--primary)',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          Forecast. Optimize. Charter Smarter.
        </p>
      </div>

      <style>{`
        @keyframes cinematicPan {
          0% {
            transform: scale(1.1) translateX(-2%);
          }
          100% {
            transform: scale(1) translateX(2%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
