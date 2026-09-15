import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      
      {/* LEFT SIDE: Cinematic Visual */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        display: 'none', // Hide on mobile
        '@media (minWidth: 1024px)': { display: 'block' },
        overflow: 'hidden',
        backgroundColor: '#0a1128' // Deep navy fallback
      }} className="hidden lg:block lg:flex-1 relative overflow-hidden">
        
        {/* We reuse the stark_ship background for the auth page */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/stark_ship.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)',
          zIndex: 1
        }} />
        
        {/* Subtle overlay gradient */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(4,173,222,0.2) 0%, rgba(10,17,40,0.6) 100%)',
          zIndex: 2
        }} />

        <div style={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem' }}>
          <img src="/logo.png" alt="NAUGATI" style={{ height: '48px', objectFit: 'contain', marginBottom: '2rem', filter: 'brightness(0) invert(1)' }} />
          <h1 style={{ color: 'white', fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Predict.<br/>Recommend.<br/>Optimize.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', maxWidth: '400px', lineHeight: 1.6 }}>
            The intelligent maritime platform for smarter chartering, freight forecasting, and vessel intelligence.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Panel */}
      <div className="flex-1 flex flex-col justify-center relative bg-white" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'white' }}>
        
        <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
          
          {/* Brand Logo and Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <img src="/logo.png" alt="NAUGATI" style={{ height: '48px', objectFit: 'contain' }} />
            <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-main)' }}>NAUGATI</span>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', marginBottom: '3rem', borderBottom: '2px solid #f1f5f9', position: 'relative' }}>
            
            <button 
              onClick={() => setActiveTab('login')}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                color: activeTab === 'login' ? 'var(--primary)' : '#94a3b8',
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}
            >
              Login
            </button>
            
            <button 
              onClick={() => setActiveTab('signup')}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                background: 'none', 
                border: 'none', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                color: activeTab === 'signup' ? 'var(--primary)' : '#94a3b8',
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}
            >
              Sign Up
            </button>

            {/* Animated Tab Indicator */}
            <motion.div 
              layout
              initial={false}
              animate={{
                x: activeTab === 'login' ? '0%' : '100%',
                width: '50%'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: 0,
                height: '2px',
                backgroundColor: 'var(--primary)',
                zIndex: 1
              }}
            />
          </div>

          {/* Form Area */}
          <div style={{ position: 'relative', minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div 
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <SignUpForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}
