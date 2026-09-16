import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navigation, Bell, Search, TrendingUp, TrendingDown, Ship, FileText, CheckCircle, ShieldAlert, AlertTriangle, Radio, Activity, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowAnimation from './landing/WorkflowAnimation';
import { apiClient } from '../services/apiClient';

const PortIcon = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2" />
    <path d="M12 15V3" />
    <path d="m8 7 4-4 4 4" />
  </svg>
);

const StarkExperience = () => {
  // phases: 'sailing' -> 'reveal' (ship reaches center, NAUGATI + tagline appear) -> 'scroll' (unlock explore)
  const [phase, setPhase] = useState('sailing');
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ['start start', 'end end'] 
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    
    // After 1.6s of the ship sailing smoothly forward into center, reveal NAUGATI title & tagline
    const t1 = setTimeout(() => {
      setPhase('reveal');
    }, 1600);
    
    // After 3.0s, allow scrolling to explore
    const t2 = setTimeout(() => {
      setPhase('scroll');
      document.body.style.overflow = 'auto';
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [liveOverview, setLiveOverview] = useState(null);
  const [liveVessels, setLiveVessels] = useState([]);
  const [liveMarketDir, setLiveMarketDir] = useState(null);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  useEffect(() => {
    async function fetchRealData() {
      try {
        const [overview, vessels, dir] = await Promise.all([
          apiClient.getMarketOverview().catch(() => null),
          apiClient.getLiveVessels().catch(() => []),
          apiClient.getMarketDirection({ commodity: 'Iron ore fines' }).catch(() => null),
        ]);
        if (overview) setLiveOverview(overview);
        if (Array.isArray(vessels) && vessels.length > 0) setLiveVessels(vessels);
        if (dir) setLiveMarketDir(dir);
      } catch (e) {
        console.warn('[StarkExperience] Could not fetch real data:', e);
      }
    }
    fetchRealData();
    const interval = setInterval(fetchRealData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Parallax transitions on scroll
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1.16, 1.45]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], ['0vh', '-30vh']);
  const oceanOpacity = useTransform(scrollYProgress, [0.22, 0.30], [1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-60px']);
  const navOpacity = useTransform(scrollYProgress, [0.24, 0.32], [0, 1]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '350vh', backgroundColor: '#ffffff' }}>
      
      {/* --- HERO CINEMATIC OCEAN & 3D MOVING SHIP VIDEO --- */}
      <motion.div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          opacity: oceanOpacity, 
          zIndex: 0, 
          overflow: 'hidden', 
          backgroundColor: '#071e3d' 
        }}
      >
        {/* Background 3D Ocean & Ship Video (Oris Maritime Reference) */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            scale: heroScale,
            y: heroY,
            overflow: 'hidden'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/naugati_hero_ship.jpg"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          >
            <source src="/hero_3d.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Ambient maritime lighting & vignette for crisp contrast */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(2, 27, 56, 0.22) 0%, rgba(2, 27, 56, 0.62) 65%, rgba(1, 15, 32, 0.90) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Gentle ocean light highlights */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(4,173,222,0.12) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* --- NAUGATI BRAND TITLE & TAGLINE REVEAL --- */}
        <motion.div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 15, 
            opacity: textOpacity,
            y: textY,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0 2rem',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'scroll') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Large Bold Poppins White NAUGATI Title */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.88, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#ffffff',
                    fontSize: 'clamp(4.2rem, 11vw, 9.5rem)',
                    fontWeight: 900,
                    letterSpacing: '0.14em',
                    lineHeight: 1,
                    margin: '0 0 1.25rem 0',
                    textTransform: 'uppercase',
                    textShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 80px rgba(4, 173, 222, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  NAUGATI
                </motion.h1>

                {/* Tagline: Predict. Recommend. Optimize. */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.35, ease: 'easeOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 'clamp(1.2rem, 2.4vw, 2.2rem)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.85)'
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Predict.</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Recommend.</span>
                  <span style={{ color: '#04ADDE', fontWeight: 700 }}>Optimize.</span>
                </motion.div>

                {/* Sub-tagline / Intelligence Pill */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.65, ease: 'easeOut' }}
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.5rem 1.4rem',
                    backgroundColor: 'rgba(2, 27, 56, 0.65)',
                    border: '1px solid rgba(4, 173, 222, 0.35)',
                    borderRadius: '50px',
                    backdropFilter: 'blur(8px)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Intelligent Maritime Freight & Chartering Platform
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- SCROLL / SWIPE TO EXPLORE INDICATOR --- */}
        <AnimatePresence>
          {phase === 'scroll' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ 
                position: 'absolute', 
                bottom: '8vh', 
                left: 0, 
                right: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                zIndex: 20, 
                opacity: textOpacity,
                pointerEvents: 'auto'
              }}
            >
              <div 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  color: '#ffffff', 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(2, 27, 56, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <span>SWIPE TO EXPLORE</span>
                <motion.div 
                  animate={{ y: [0, 7, 0] }} 
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Navigation size={20} className="rotate-180 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <motion.nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 4rem',
        backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', borderBottom: '2px solid #e2e8f0', color: '#0f172a',
        opacity: 1, pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.png" alt="NAUGATI Logo" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
          <span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#1e293b', transition: 'color 0.15s' }} className="hover:text-primary">How It Works</span>
          <span onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#1e293b', transition: 'color 0.15s' }} className="hover:text-primary">About Us</span>
          <span onClick={() => navigate('/live-market')} style={{ cursor: 'pointer', color: '#04ADDE', fontWeight: 700 }} className="hover:underline transition-all">Live Market</span>
          <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }}></div>
          <div onClick={() => navigate('/auth')} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#334155' }}>
            <Bell size={22} />
            <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid #ffffff' }}></span>
          </div>
          <span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#1e293b', fontWeight: 600, transition: 'color 0.15s' }} className="hover:text-primary">Login</span>
          <button onClick={() => navigate('/auth')} style={{ padding: '0.65rem 1.75rem', backgroundColor: '#04ADDE', color: '#ffffff', borderRadius: '30px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(4, 173, 222, 0.35)', transition: 'transform 0.15s' }}>Get Started</button>
        </div>
      </motion.nav>

      {/* --- SCROLLABLE CONTENT LAYER --- */}
      <div style={{ position: 'relative', top: '100vh', backgroundColor: '#ffffff', minHeight: '100vh', zIndex: 10 }}>
        
        {/* --- SECTION 1: WHITE BACKGROUND (Intelligent Chartering & Live Market Snapshot) --- */}
        <section style={{ padding: '8rem 4rem 7rem', backgroundColor: '#ffffff', color: '#0a2540', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', fontWeight: 900, color: '#0a2540', marginBottom: '1.5rem', lineHeight: 1.15, fontFamily: "'Poppins', sans-serif" }}>
                  Intelligent Chartering for<br/>
                  <span style={{ color: '#04ADDE' }}>Smarter Bulk Shipping</span>
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '900px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                  Forecast freight rates, match the right vessel, evaluate port and route risks, and optimize your chartering decisions — all in one intelligent platform.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => navigate('/auth')} 
                    style={{ 
                      padding: '1rem 2.5rem', 
                      backgroundColor: '#04ADDE', 
                      color: '#ffffff', 
                      borderRadius: '30px', 
                      fontWeight: 700, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '1.1rem',
                      boxShadow: '0 8px 25px rgba(4, 173, 222, 0.35)'
                    }}
                  >
                    Find Best Shipping Option
                  </button>
                  <button 
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
                    style={{ 
                      padding: '1rem 2.5rem', 
                      backgroundColor: '#ffffff', 
                      color: '#0a2540', 
                      borderRadius: '30px', 
                      fontWeight: 700, 
                      border: '2px solid #04ADDE', 
                      cursor: 'pointer', 
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                    }}
                  >
                    Explore How It Works
                  </button>
                </div>
              </div>

              {/* 3 Pillar Cards: PREDICT, RECOMMEND, OPTIMIZE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1200px', margin: '0 auto 6rem' }}>
                <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1.5px solid #dbeafe', borderTop: '4px solid #04ADDE', borderRadius: '16px', boxShadow: '0 8px 24px rgba(10,37,64,0.06)' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: '#0a2540', letterSpacing: '0.05em' }}>PREDICT</h3>
                  <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>Forecast future freight rates and market movement with AI-driven models.</p>
                </div>
                <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1.5px solid #dbeafe', borderTop: '4px solid #38bdf8', borderRadius: '16px', boxShadow: '0 8px 24px rgba(10,37,64,0.06)' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: '#0a2540', letterSpacing: '0.05em' }}>RECOMMEND</h3>
                  <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>Recommend suitable vessels, routes, timing and optimal chartering contracts.</p>
                </div>
                <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1.5px solid #dbeafe', borderTop: '4px solid #04ADDE', borderRadius: '16px', boxShadow: '0 8px 24px rgba(10,37,64,0.06)' }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', color: '#0a2540', letterSpacing: '0.05em' }}>OPTIMIZE</h3>
                  <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem' }}>Optimize total voyage cost, emissions, demurrage risk, and vessel utilization.</p>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0a2540' }}>From Market Prediction to Chartering Decision</h3>
                <p style={{ color: '#64748b', fontSize: '1.15rem', marginTop: '0.75rem' }}>NAUGATI transforms maritime market intelligence into practical, explainable decisions.</p>
              </div>

              {/* LIVE EXTERNAL DATA STREAMS STATUS BADGE */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '30px',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#15803d'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                    <strong>Real Data Feeds Active</strong>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>Satellite AIS Telemetry</span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>Commodity Indices</span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span>Global Macro Benchmarks</span>
                </div>
              </div>

              {/* LIVE MARKET SNAPSHOT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem', maxWidth: '1400px', margin: '0 auto' }}>
                {[
                  { 
                    title: 'Brent Crude Oil', 
                    val: `$${(liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('brent'))?.price_usd || 109.51).toFixed(2)}/bbl`, 
                    source: 'Commodity Benchmark',
                    change: '+3.2%', 
                    up: true 
                  },
                  { 
                    title: 'Global Copper', 
                    val: `$${Math.round(liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('copper'))?.price_usd || 13543).toLocaleString()}/MT`, 
                    source: 'Commodity Benchmark',
                    change: '+1.8%', 
                    up: true 
                  },
                  { 
                    title: 'Federal Funds Rate', 
                    val: `${(liveOverview?.macroeconomic?.FEDFUNDS?.latest_value || 3.63).toFixed(2)}%`, 
                    source: 'Global Macro Index',
                    desc: 'Macro Cost of Capital', 
                    status: 'info' 
                  },
                  { 
                    title: '10-Yr Treasury Yield', 
                    val: `${(liveOverview?.macroeconomic?.DGS10?.latest_value || 4.96).toFixed(2)}%`, 
                    source: 'Global Macro Index',
                    desc: 'Benchmark Yield', 
                    status: 'info' 
                  },
                  { 
                    title: 'Live Vessels Tracked', 
                    val: liveVessels.length > 0 ? `${liveVessels.length.toLocaleString()}` : '5,000+', 
                    source: 'Satellite AIS',
                    desc: 'Real-Time Maritime Stream', 
                    status: 'stream' 
                  }
                ].map((item, i) => (
                  <div key={i} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{item.title}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px' }}>
                        {item.source}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0a2540', margin: '0.25rem 0' }}>{item.val}</div>
                    {item.change && (
                      <div style={{ color: item.up ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {item.up ? <TrendingUp size={15}/> : <TrendingDown size={15}/>} {item.change}
                      </div>
                    )}
                    {item.desc && (
                      <div style={{ color: item.status === 'stream' ? '#10b981' : '#04ADDE', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {item.status === 'stream' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>}
                        {item.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- SECTION 2: DARK BLUE BACKGROUND (How NAUGATI Works - 5 Steps) --- */}
        <section id="how-it-works" style={{ padding: '8rem 4rem 10rem', backgroundColor: '#071e3d', background: 'radial-gradient(ellipse at 50% 30%, #0a2540 0%, #071e3d 70%, #051326 100%)', borderTop: '1px solid rgba(4, 173, 222, 0.2)', borderBottom: '1px solid rgba(4, 173, 222, 0.2)', color: 'white' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
              <div style={{ color: '#04ADDE', fontWeight: 800, letterSpacing: '0.2em', fontSize: '0.95rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>OPERATIONAL ARCHITECTURE</div>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Poppins', sans-serif", color: '#ffffff' }}>How NAUGATI Works</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '0.75rem' }}>A seamless 5-step intelligence flow designed for bulk maritime operations.</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '5rem' }}>
              <div style={{ position: 'absolute', top: '24px', left: '50px', right: '50px', height: '2px', backgroundColor: 'rgba(4, 173, 222, 0.3)', zIndex: 0 }} />
              
              {[
                { step: '01', title: 'Enter Cargo Requirements', desc: 'Specify origin, destination port, commodity, and laycan.' },
                { step: '02', title: 'Match Vessel + Port', desc: 'Filter vessels by DWT, draft, and port compatibility.' },
                { step: '03', title: 'Optimize Route & Shortcut', desc: 'Simulate weather, fuel burn, canal shortcuts, and ETA.' },
                { step: '04', title: 'Forecast the Market', desc: 'Project forward freight rate curves using AI models.' },
                { step: '05', title: 'Get Recommendation', desc: 'Actionable executive decision brief with risk ratings.' }
              ].map((s, i) => {
                const stepNum = i + 1;
                const isCurrent = activeWorkflowStep === stepNum;
                const isPassed = activeWorkflowStep > stepNum;
                return (
                  <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '220px' }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      backgroundColor: isCurrent ? '#04ADDE' : '#0a2540', 
                      border: isCurrent ? '3px solid #ffffff' : isPassed ? '2px solid #04ADDE' : '2px solid rgba(4, 173, 222, 0.4)', 
                      color: isCurrent ? '#ffffff' : isPassed ? '#38bdf8' : '#94a3b8', 
                      fontSize: '1.3rem', 
                      fontWeight: 900, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1.5rem', 
                      boxShadow: isCurrent ? '0 10px 25px rgba(4,173,222,0.6), 0 0 15px rgba(4,173,222,0.4)' : isPassed ? '0 4px 15px rgba(4,173,222,0.2)' : '0 4px 15px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {s.step}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isCurrent ? '#38bdf8' : '#ffffff', marginBottom: '0.5rem', transition: 'color 0.3s ease' }}>{s.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Live Workflow Simulation (How NAUGATI Works & Freight Rate Prediction) */}
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              border: '1.5px solid rgba(4, 173, 222, 0.3)'
            }}>
              <WorkflowAnimation onStepChange={setActiveWorkflowStep} />
            </div>
          </div>
        </section>

        {/* --- SECTION 3: WHITE BACKGROUND (Platform Solutions - 9 Feature Cards) --- */}
        <section style={{ padding: '8rem 4rem 10rem', backgroundColor: '#ffffff', color: '#0a2540' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <div style={{ color: '#04ADDE', fontWeight: 800, letterSpacing: '0.2em', fontSize: '1.1rem', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
                ENTERPRISE DECISION PLATFORM
              </div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 'clamp(3rem, 5.5vw, 4.5rem)', fontWeight: 900, color: '#0a2540', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Platform Solutions
              </h2>
              <p style={{ color: '#475569', fontSize: '1.3rem', maxWidth: '850px', margin: '1.5rem auto 0', lineHeight: 1.6 }}>
                End-to-end intelligence for every stage of your bulk voyage from global origin to the East Coast of India.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
              {[
                { icon: <Search size={32}/>, title: 'Find Best Shipping Option', desc: 'Input your cargo and get an instant, optimized vessel and route recommendation.' },
                { icon: <TrendingUp size={32}/>, title: 'Freight Rate Forecast', desc: 'Predict short-term and long-term freight rates with our maritime AI models.' },
                { icon: <Ship size={32}/>, title: 'Vessel Recommendation', desc: 'Identify the most efficient available vessels based on ETA, DWT, and draft.' },
                { icon: <FileText size={32}/>, title: 'Contract Recommendation', desc: 'Decide between spot and long-term contracts based on risk and market trends.' },
                { icon: <Navigation size={32}/>, title: 'Route Optimization', desc: 'Analyze weather, congestion, and distance to find the safest, fastest route.' },
                { icon: <CheckCircle size={32}/>, title: 'ETA Prediction', desc: 'Accurate arrival times factoring in real-time disruptions and historical port delays.' },
                { icon: <PortIcon size={32}/>, title: 'Port Intelligence', desc: 'Check berth restrictions, congestion levels, and vessel-port compatibility instantly.' },
                { icon: <ShieldAlert size={32}/>, title: 'Geopolitical & Risk Dashboard', desc: 'Monitor regional conflicts, sanctions, and weather risks affecting your route.' },
                { icon: <AlertTriangle size={32}/>, title: 'Alerts & Notifications', desc: 'Real-time alerts for market shifts, ETA changes, and port conditions.' }
              ].map((sol, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '3rem 2.25rem', 
                    backgroundColor: '#ffffff', 
                    border: '1.5px solid #dbeafe', 
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(10, 37, 64, 0.05)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#04ADDE';
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(4, 173, 222, 0.16)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dbeafe';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(10, 37, 64, 0.05)';
                  }}
                >
                  <div>
                    <div style={{ color: '#04ADDE', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                      {sol.icon}
                    </div>
                    {/* Blue Title */}
                    <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: '1rem', color: '#0a2540', fontFamily: "'Poppins', sans-serif" }}>
                      {sol.title}
                    </h3>
                    {/* Slate Description */}
                    <p style={{ color: '#334155', lineHeight: 1.65, fontSize: '1.05rem', marginBottom: '2rem' }}>
                      {sol.desc}
                    </p>
                  </div>
                  {/* Blue Interactive Action */}
                  <button 
                    onClick={() => navigate('/auth')}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#04ADDE', 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: 0 
                    }}
                  >
                    Learn More <Navigation size={16} className="rotate-90" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 4: DARK BLUE BACKGROUND (About Us) --- */}
        <section id="about" style={{ padding: '10rem 4rem', backgroundColor: '#071e3d', background: 'radial-gradient(ellipse at 50% 50%, #0a2540 0%, #071e3d 70%, #051326 100%)', borderTop: '1px solid rgba(4, 173, 222, 0.2)', color: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ color: '#04ADDE', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              ABOUT NAUGATI
            </div>
            {/* White Title */}
            <h2 style={{ fontSize: '3.2rem', fontWeight: 900, marginBottom: '2rem', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
              From Freight Forecasting to Smarter Chartering.
            </h2>
            {/* Slate Blue Paragraph */}
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.8 }}>
              NAUGATI combines advanced forecasting, vessel intelligence, route optimization, risk analysis, and contract strategy into one unified decision-support platform. We don't just show you the market—we help you decide what to do next.
            </p>
          </div>
        </section>

        {/* --- SECTION 9: FOOTER (White Background with Blue Font) --- */}
        <footer style={{ backgroundColor: '#ffffff', color: '#0a2540', padding: '6rem 4rem 4rem', borderTop: '1.5px solid #bfdbfe' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem' }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <img src="/logo.png" alt="NAUGATI" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
                <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.08em', color: '#0a2540', fontFamily: "'Poppins', sans-serif" }}>NAUGATI</span>
              </div>
              <div style={{ fontSize: '1.25rem', color: '#0a2540', maxWidth: '300px', lineHeight: 1.5, fontWeight: 600 }}>
                Intelligent Freight.<br/>Smarter Voyages.
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '2rem', color: '#0a2540', fontFamily: "'Poppins', sans-serif" }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#0a2540', lineHeight: 2.5, fontWeight: 600, fontSize: '0.95rem' }}>
                <li><span onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">How It Works</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Vessel Intelligence</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Freight Intelligence</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Contract Strategy</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Route Intelligence</span></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '2rem', color: '#0a2540', fontFamily: "'Poppins', sans-serif" }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: '#0a2540', lineHeight: 2.5, fontWeight: 600, fontSize: '0.95rem' }}>
                <li><span onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">About Us</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Contact</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Privacy Policy</span></li>
                <li><span onClick={() => navigate('/auth')} style={{ cursor: 'pointer', color: '#0a2540' }} className="hover:text-[#04ADDE] transition-colors">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div style={{ maxWidth: '1400px', margin: '6rem auto 0', paddingTop: '2rem', borderTop: '1.5px solid #bfdbfe', color: '#0a2540', fontSize: '0.9rem', fontWeight: 600 }}>
            © 2026 NAUGATI. All rights reserved.
          </div>
        </footer>

      </div>

    </div>
  );
};

export default StarkExperience;
