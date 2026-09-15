import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, ArrowRight, CheckCircle2, TrendingUp, 
  Ship, Navigation, ShieldCheck, DollarSign, Calendar, MapPin, 
  Layers, ChevronRight, Zap, Award, Clock, ArrowUpRight, Compass,
  Sliders, Fuel, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkflowAnimation = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1); // 1x, 1.5x, 2x

  // Preset scenarios that users can click to test different routes & predictions
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scenarios = [
    {
      name: 'Australia -> Dhamra Port',
      origin: 'Newcastle (Australia)',
      originCode: 'AUNC',
      destination: 'Dhamra Port (India)',
      destCode: 'INDHM',
      cargo: '75,000 MT Coking Coal',
      vesselClass: 'Panamax (78,000 DWT)',
      distance: '5,420 NM',
      predictedRate: '$18.40',
      totalCost: '$1,380,000',
      confidence: '96.2%',
      transitDays: '16.5 Days',
      carrier: 'Eastern Bulk Marine',
      carrierRating: 4.9,
      shortcutSavings: '4.5 Days & $142,000'
    },
    {
      name: 'Guangzhou -> Paradip Port',
      origin: 'Guangzhou (China)',
      originCode: 'CNGZ',
      destination: 'Paradip Port (India)',
      destCode: 'INPDP',
      cargo: '120,000 MT Iron Ore',
      vesselClass: 'Capesize (125,000 DWT)',
      distance: '4,150 NM',
      predictedRate: '$14.25',
      totalCost: '$1,710,000',
      confidence: '94.8%',
      transitDays: '12.8 Days',
      carrier: 'Oceanic Global Lines',
      carrierRating: 4.8,
      shortcutSavings: '3.2 Days & $118,000'
    },
    {
      name: 'Samarinda -> Haldia Port',
      origin: 'Samarinda (Indonesia)',
      originCode: 'IDSM',
      destination: 'Haldia Dock (India)',
      destCode: 'INHLD',
      cargo: '55,000 MT Thermal Coal',
      vesselClass: 'Supramax (58,000 DWT)',
      distance: '2,880 NM',
      predictedRate: '$11.80',
      totalCost: '$649,000',
      confidence: '95.5%',
      transitDays: '9.4 Days',
      carrier: 'Nippon Dry Bulk',
      carrierRating: 4.9,
      shortcutSavings: '2.0 Days & $65,000'
    }
  ];

  const currentScenario = scenarios[selectedScenario];

  const steps = [
    {
      id: 1,
      number: '01',
      title: 'Enter Cargo & Voyage Route',
      subtitle: 'Input origin, destination port, commodity, and laycan window.',
      tag: 'SEARCH & INPUT',
      icon: <MapPin size={20} className="text-[#04ADDE]" />
    },
    {
      id: 2,
      number: '02',
      title: 'AI Freight Rate Prediction',
      subtitle: 'Real-time AI econometric models forecast $/MT and market curves.',
      tag: 'PREDICT ENGINE',
      icon: <TrendingUp size={20} className="text-[#04ADDE]" />
    },
    {
      id: 3,
      number: '03',
      title: 'Carrier & Vessel Matching',
      subtitle: 'Rank verified vessels by DWT, draft compatibility, and ratings.',
      tag: 'MATCH & CAPACITY',
      icon: <Ship size={20} className="text-[#04ADDE]" />
    },
    {
      id: 4,
      number: '04',
      title: 'Route Optimization & Shortcut',
      subtitle: 'Simulate weather, fuel burn, canal/strait shortcuts, and ETA.',
      tag: 'ROUTE & SIMULATION',
      icon: <Navigation size={20} className="text-[#04ADDE]" />
    },
    {
      id: 5,
      number: '05',
      title: 'Executive Decision Brief',
      subtitle: 'Instant charter booking recommendation with complete risk assurance.',
      tag: 'EXECUTIVE BRIEF',
      icon: <ShieldCheck size={20} className="text-[#04ADDE]" />
    }
  ];

  // Auto-play timer for animation loop
  const STEP_DURATION = 4500 / speed; // 4.5s per step at 1x
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveStep((curr) => (curr >= 5 ? 1 : curr + 1));
            return 0;
          }
          return prev + 100 / (STEP_DURATION / 50);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeStep, speed]);

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setActiveStep(1);
    setProgress(0);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Top Controls & Mode Bar (Light Blue Background with Dark Blue & White Fonts) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '1.2rem 2rem',
        backgroundColor: '#e0f2fe',
        border: '1.5px solid #93c5fd',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 4px 15px rgba(10, 37, 64, 0.05)'
      }}>
        {/* Scenario Switcher Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#0a2540', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Voyage Route:
          </span>
          {scenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => { setSelectedScenario(idx); setProgress(0); }}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: selectedScenario === idx ? '1.5px solid #04ADDE' : '1.5px solid #bfdbfe',
                backgroundColor: selectedScenario === idx ? '#0a2540' : '#ffffff',
                color: selectedScenario === idx ? '#ffffff' : '#0a2540',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: selectedScenario === idx ? '0 4px 12px rgba(10, 37, 64, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              <Compass size={15} style={{ color: selectedScenario === idx ? '#38bdf8' : '#0a2540' }} />
              {sc.name}
            </button>
          ))}
        </div>

        {/* Video / Animation Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isPlaying ? '#10b981' : '#f59e0b', display: 'inline-block', boxShadow: isPlaying ? '0 0 10px #10b981' : 'none' }}></span>
            <span style={{ fontSize: '0.8rem', color: '#0a2540', fontWeight: 700, textTransform: 'uppercase' }}>
              {isPlaying ? 'Live Workflow Demo' : 'Paused'}
            </span>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: '8px', padding: '2px', border: '1.5px solid #93c5fd' }}>
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: speed === s ? '#0a2540' : 'transparent',
                  color: speed === s ? '#ffffff' : '#0a2540',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#0a2540',
              color: '#ffffff',
              border: '1.5px solid #04ADDE',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(10, 37, 64, 0.25)'
            }}
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: '#0a2540',
              border: '1.5px solid #93c5fd',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
            title="Restart Workflow"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Steps Navigator & Right Live Simulator Window */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 380px) 1fr',
        gap: '0',
        backgroundColor: '#071e3d',
        border: '1.5px solid #93c5fd',
        borderTop: 'none',
        borderRadius: '0 0 20px 20px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* LEFT COLUMN: Stepper Guide */}
        <div style={{
          backgroundColor: '#e0f2fe',
          borderRight: '1.5px solid #93c5fd',
          padding: '2.5rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              STEP-BY-STEP WORKFLOW
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0a2540', marginBottom: '1.8rem', fontFamily: "'Poppins', sans-serif" }}>
              How Shipowners & Charterers Predict Rates
            </h3>

            {/* Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {steps.map((step) => {
                const isActive = activeStep === step.id;
                const isPassed = activeStep > step.id;

                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    style={{
                      padding: '1rem 1.15rem',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#04ADDE' : (step.id === 2 || step.id === 5) ? '#f0f9ff' : '#ffffff',
                      border: isActive ? '2px solid #0284c7' : (step.id === 2 || step.id === 5) ? '1.5px solid #04ADDE' : '1.5px solid #bfdbfe',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isActive ? '0 8px 24px rgba(4, 173, 222, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {/* Active Step Progress Fill Indicator */}
                    {isActive && isPlaying && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          height: '3px',
                          backgroundColor: '#ffffff',
                          width: `${progress}%`,
                          transition: 'width 0.05s linear'
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#0a2540' : isPassed ? '#0a2540' : '#e0f2fe',
                        color: '#ffffff',
                        border: !isActive && !isPassed ? '1.5px solid #93c5fd' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {isPassed ? <CheckCircle2 size={16} /> : step.number}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isActive ? '#0a2540' : '#0369a1', letterSpacing: '0.08em' }}>
                            {step.tag}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: 800, backgroundColor: '#0a2540', padding: '2px 8px', borderRadius: '6px' }}>
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: isActive ? '#ffffff' : '#0a2540', margin: '0.2rem 0 0.25rem' }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: isActive ? '#f0f9ff' : '#475569', margin: 0, lineHeight: 1.4, fontWeight: isActive ? 500 : 400 }}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Start Action in Left Rail */}
          <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1.5px solid #bfdbfe', boxShadow: '0 4px 15px rgba(10, 37, 64, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#0a2540', fontWeight: 700 }}>Ready to predict rates?</span>
              <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 800, backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '10px', border: '1px solid #93c5fd' }}>AI Active</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a2540',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(10, 37, 64, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              Open Freight Engine <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Mockup / Video Simulation Window */}
        <div style={{
          backgroundColor: '#0a192f',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Mockup Browser/App Header Bar */}
          <div style={{
            padding: '0.85rem 1.5rem',
            backgroundColor: '#061324',
            borderBottom: '1px solid rgba(4, 173, 222, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            {/* Window Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            </div>

            {/* URL / Path Display */}
            <div style={{
              flex: 1,
              maxWidth: '520px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '0.35rem 1rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#04ADDE', fontWeight: 700 }}>https://</span>
              <span>naugati.ai/freight-engine/{currentScenario.originCode}-to-{currentScenario.destCode}</span>
            </div>

            {/* Stage Indicator Pill */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(4, 173, 222, 0.15)',
              border: '1px solid rgba(4, 173, 222, 0.4)',
              color: '#38bdf8'
            }}>
              STAGE {activeStep} OF 5
            </div>
          </div>

          {/* Top Workflow Stepper (Freightos Style: Search -> Results -> Recommended -> Booking -> Verification) */}
          <div style={{
            padding: '1rem 2rem',
            backgroundColor: '#081c36',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '50%', left: '80px', right: '80px', height: '2px', backgroundColor: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)', zIndex: 0 }} />

            {[
              { id: 1, label: 'Search & Input' },
              { id: 2, label: 'AI Prediction' },
              { id: 3, label: 'Carrier Match' },
              { id: 4, label: 'Route & ETA' },
              { id: 5, label: 'Execution' }
            ].map((st) => {
              const isCurr = activeStep === st.id;
              const isPast = activeStep > st.id;
              return (
                <div 
                  key={st.id} 
                  onClick={() => handleStepClick(st.id)}
                  style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isCurr ? '#04ADDE' : isPast ? '#10b981' : '#0f2744',
                    border: isCurr ? '2px solid #ffffff' : isPast ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurr ? '0 0 12px rgba(4,173,222,0.8)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isPast ? '✓' : st.id}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: isCurr ? 700 : 500,
                    color: isCurr ? '#ffffff' : isPast ? '#94a3b8' : '#64748b'
                  }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Global Freightos-style Parameter Bar (Origin, Destination, Load, Goods) */}
          <div style={{
            padding: '0.9rem 2rem',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(4, 173, 222, 0.2)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr auto',
            gap: '1.25rem',
            alignItems: 'center'
          }}>
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Origin Port</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <MapPin size={14} className="text-[#04ADDE]" />
                {currentScenario.origin}
              </div>
            </div>

            <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Destination Port</div>
              <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <MapPin size={14} className="text-emerald-400" />
                {currentScenario.destination}
              </div>
            </div>

            <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Cargo Volume</div>
              <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, marginTop: '0.15rem' }}>
                {currentScenario.cargo}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Vessel Spec</div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600, marginTop: '0.15rem' }}>
                {currentScenario.vesselClass}
              </div>
            </div>

            <button
              onClick={() => handleStepClick(activeStep === 5 ? 1 : activeStep + 1)}
              style={{
                backgroundColor: 'rgba(4, 173, 222, 0.2)',
                border: '1px solid #04ADDE',
                color: '#38bdf8',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>

          {/* DYNAMIC VIEW CONTAINER BASED ON ACTIVE STEP */}
          <div style={{ padding: '2rem', flex: 1, minHeight: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              
              {/* === STEP 1: CARGO & VOYAGE REQUIREMENTS === */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#04ADDE', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 1 • VOYAGE CONFIGURATION</span>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>Input Cargo & Voyage Parameters</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                        BDI Index: 2,184 ▲ +3.4%
                      </span>
                      <span style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(4, 173, 222, 0.15)', border: '1px solid rgba(4,173,222,0.3)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700 }}>
                        VLSFO: $624/MT
                      </span>
                    </div>
                  </div>

                  {/* Form Grid Simulation */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(4, 173, 222, 0.3)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Origin Port & Terminal</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{currentScenario.origin}</div>
                      <div style={{ fontSize: '0.8rem', color: '#04ADDE', marginTop: '0.35rem' }}>Draft Available: 17.5m (Cape OK)</div>
                    </div>

                    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(4, 173, 222, 0.3)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Discharge Port (East Coast India)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{currentScenario.destination}</div>
                      <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.35rem' }}>Berth Congestion: Low (0.8 days wait)</div>
                    </div>

                    <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(4, 173, 222, 0.3)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Laycan Window & Commodity</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{currentScenario.cargo}</div>
                      <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.35rem' }}>Laycan: Next 10-15 Days</div>
                    </div>
                  </div>

                  {/* Visual Call-to-action simulation */}
                  <div style={{
                    padding: '1.25rem 1.75rem',
                    backgroundColor: 'rgba(4, 173, 222, 0.1)',
                    border: '1px dashed #04ADDE',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#04ADDE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                        <Zap size={22} />
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>AI Forecast Model Ready</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Synthesizing historical fixtures, FFA forward curves, and port turnaround times...</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStepClick(2)}
                      style={{
                        padding: '0.75rem 1.6rem',
                        backgroundColor: '#04ADDE',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '30px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 6px 20px rgba(4, 173, 222, 0.4)'
                      }}
                    >
                      Calculate AI Rate <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === STEP 2: AI FREIGHT RATE PREDICTION ENGINE === */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#04ADDE', fontWeight: 800, letterSpacing: '0.05em' }}>STEP 2 • FREIGHT RATE INTELLIGENCE & DECISION BRIEF</span>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>AI Freight Rate Prediction Breakdown</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                      <ShieldCheck size={18} /> Model Confidence: {currentScenario.confidence}
                    </div>
                  </div>

                  {/* Big Hero Rate Card */}
                  <div style={{
                    padding: '1.75rem 2rem',
                    backgroundColor: '#04ADDE',
                    background: 'linear-gradient(135deg, #04ADDE 0%, #0284c7 100%)',
                    border: '2px solid #38bdf8',
                    borderRadius: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    gap: '2rem',
                    alignItems: 'center',
                    boxShadow: '0 12px 35px rgba(4, 173, 222, 0.4)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#071e3d', textTransform: 'uppercase', fontWeight: 800 }}>Predicted Forward Freight Rate</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 900, color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
                          {currentScenario.predictedRate}
                        </span>
                        <span style={{ fontSize: '1.2rem', color: '#071e3d', fontWeight: 800 }}>/ MT</span>
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'line-through', marginLeft: '0.5rem' }}>$20.15/MT</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#0a2540', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, marginTop: '0.5rem', display: 'inline-block' }}>
                        ▼ 8.6% below 30-day market average (Optimal Charter Window)
                      </div>
                    </div>

                    <div style={{ borderLeft: '1.5px solid rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#071e3d', textTransform: 'uppercase', fontWeight: 800 }}>Total Estimated Voyage Cost</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>{currentScenario.totalCost}</div>
                      <div style={{ fontSize: '0.8rem', color: '#f0f9ff', marginTop: '0.2rem', fontWeight: 600 }}>Distance: {currentScenario.distance}</div>
                    </div>

                    <div style={{ borderLeft: '1.5px solid rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#071e3d', textTransform: 'uppercase', fontWeight: 800 }}>Est. Voyage Duration</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>{currentScenario.transitDays}</div>
                      <div style={{ fontSize: '0.8rem', color: '#ffffff', marginTop: '0.2rem', fontWeight: 700 }}>Speed: 13.5 kts Eco-mode</div>
                    </div>
                  </div>

                  {/* Factor Attribution Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { name: 'Base Baltic Index', val: '$16.90', impact: 'neutral' },
                      { name: 'Bunker Fuel Surcharge', val: '+$1.40', impact: 'up' },
                      { name: 'Port Wait Congestion', val: '+$0.60', impact: 'up' },
                      { name: 'AI Optimization Discount', val: '-$0.50', impact: 'down' }
                    ].map((f, i) => (
                      <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(2, 6, 23, 0.6)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{f.name}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: f.impact === 'down' ? '#10b981' : f.impact === 'up' ? '#38bdf8' : '#ffffff', marginTop: '0.25rem' }}>
                          {f.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* === STEP 3: CARRIER & VESSEL MATCHING (Freightos-style) === */}
              {activeStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#04ADDE', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 3 • CARRIER & VESSEL MATCHING</span>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>Verified Vessel Capacity & Instant Rates</h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Showing 3 Top Verified Bulk Carriers</span>
                  </div>

                  {/* Freightos Style Card 1 (Recommended Top Match) */}
                  <div style={{
                    padding: '1.25rem 1.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1.5px solid #04ADDE',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    boxShadow: '0 8px 25px rgba(4, 173, 222, 0.25)'
                  }}>
                    <div style={{ flex: 1.5 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ backgroundColor: '#04ADDE', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          Guaranteed Capacity
                        </span>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                          Top Logistics Provider
                        </span>
                      </div>
                      
                      {/* Port-to-Port Flow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Ship size={16} className="text-[#04ADDE]" />
                        <span>Bulk Ocean</span>
                        <span style={{ color: '#64748b' }}>|</span>
                        <span>Est. {currentScenario.transitDays}</span>
                        <span style={{ color: '#64748b' }}>({currentScenario.originCode} → {currentScenario.destCode})</span>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{currentScenario.carrier}</span>
                        <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>★★★★★ ({currentScenario.carrierRating})</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>$19.80/MT</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
                        {currentScenario.predictedRate} <span style={{ fontSize: '1rem', color: '#04ADDE' }}>/ MT</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Rate expires: Next 48h (UTC)</div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => handleStepClick(4)}
                        style={{
                          padding: '0.8rem 1.8rem',
                          backgroundColor: '#04ADDE',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(4, 173, 222, 0.4)'
                        }}
                      >
                        Select Vessel
                      </button>

                      {/* Animated Pointer / Cursor Icon like in Freightos reference */}
                      <motion.div
                        animate={{ x: [8, -4, 8], y: [12, -4, 12] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute',
                          right: '-8px',
                          bottom: '-12px',
                          pointerEvents: 'none',
                          zIndex: 5
                        }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000" stroke="#ffffff" strokeWidth="1.5">
                          <path d="M3 3l7 18 3-7 7-3L3 3z" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>

                  {/* Freightos Style Card 2 (Quickest Transit Alternative) */}
                  <div style={{
                    padding: '1.1rem 1.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    opacity: 0.85
                  }}>
                    <div style={{ flex: 1.5 }}>
                      <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                        Quickest Transit
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.35rem' }}>
                        <Ship size={16} className="text-purple-400" />
                        <span>Bulk Ocean</span>
                        <span style={{ color: '#64748b' }}>|</span>
                        <span>Est. 14.2 Days (High Speed 14.8 kts)</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '0.25rem' }}>
                        Pacific Horizon Shipping ★★★★★ (4.8)
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                        $19.10 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ MT</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total: $1,432,500</div>
                    </div>

                    <button
                      onClick={() => handleStepClick(4)}
                      style={{
                        padding: '0.7rem 1.4rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      Select
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === STEP 4: INTERACTIVE ROUTE OPTIMIZATION & MAP SIMULATOR === */}
              {activeStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#04ADDE', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 4 • ROUTE & SHORTCUT SIMULATOR</span>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>Interactive Voyage Route & Shortcut Tracking</h3>
                    </div>
                    <div style={{ padding: '0.35rem 0.9rem', borderRadius: '20px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontWeight: 800, fontSize: '0.8rem' }}>
                      ⚡ Saves {currentScenario.shortcutSavings}
                    </div>
                  </div>

                  {/* Freightos Style Animated Map Canvas Container */}
                  <div style={{
                    position: 'relative',
                    height: '240px',
                    borderRadius: '16px',
                    backgroundColor: '#051428',
                    border: '1px solid rgba(4, 173, 222, 0.4)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* SVG Ocean Grid and Route Paths */}
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#04ADDE" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(4, 173, 222, 0.08)" strokeWidth="1" />
                        </pattern>
                      </defs>

                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Simplified Continental Landmass Outlines for visual reference */}
                      {/* Asia / India */}
                      <path d="M 280,40 Q 320,80 340,110 L 330,160 Q 300,180 270,140 Z" fill="rgba(30, 58, 102, 0.4)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
                      {/* Southeast Asia */}
                      <path d="M 400,100 Q 450,130 460,170 Q 430,200 390,160 Z" fill="rgba(30, 58, 102, 0.4)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
                      {/* Australia */}
                      <path d="M 520,150 Q 600,140 620,190 Q 560,230 500,200 Z" fill="rgba(30, 58, 102, 0.4)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />

                      {/* Standard Route (Dotted Red / Slower) */}
                      <path
                        d="M 550,170 Q 450,90 310,130"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.4)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />

                      {/* AI Optimized Shortcut Route (Glowing Cyan/Emerald with Moving Dash) */}
                      <path
                        d="M 550,170 Q 420,150 310,130"
                        fill="none"
                        stroke="url(#routeGrad)"
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                      />
                    </svg>

                    {/* Animated Vessel Marker Gliding Along Route */}
                    <motion.div
                      animate={{
                        x: [240, -10, -240],
                        y: [40, 20, -40]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      style={{
                        position: 'absolute',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        padding: '0.3rem 0.7rem',
                        backgroundColor: '#04ADDE',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        borderRadius: '20px',
                        boxShadow: '0 0 15px #04ADDE',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginBottom: '4px'
                      }}>
                        <Ship size={12} />
                        <span>MV PACIFIC LEADER • 13.8 kts</span>
                      </div>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffffff', border: '3px solid #04ADDE' }} />
                    </motion.div>

                    {/* Origin Pin */}
                    <div style={{ position: 'absolute', right: '18%', bottom: '26%', textAlign: 'center' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#38bdf8', border: '2px solid white', margin: '0 auto', boxShadow: '0 0 10px #38bdf8' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'rgba(15,23,42,0.85)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                        {currentScenario.originCode}
                      </span>
                    </div>

                    {/* Destination Pin */}
                    <div style={{ position: 'absolute', left: '26%', top: '35%', textAlign: 'center' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10b981', border: '3px solid white', margin: '0 auto', boxShadow: '0 0 12px #10b981' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(15,23,42,0.85)', padding: '2px 6px', borderRadius: '4px', marginTop: '2px', display: 'inline-block' }}>
                        {currentScenario.destCode} (DISCHARGE)
                      </span>
                    </div>

                    {/* Animated Mouse Cursor navigating map like in Freightos reference */}
                    <motion.div
                      animate={{
                        x: [120, -40, -160, 80, 120],
                        y: [20, -30, -50, 40, 20]
                      }}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        zIndex: 20,
                        pointerEvents: 'none'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000" stroke="#ffffff" strokeWidth="1.5">
                        <path d="M3 3l7 18 3-7 7-3L3 3z" />
                      </svg>
                    </motion.div>

                    {/* Floating Info Overlay */}
                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', backgroundColor: 'rgba(2,6,23,0.85)', border: '1px solid rgba(4,173,222,0.3)', borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', gap: '1.25rem', fontSize: '0.75rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>Weather:</span> <span style={{ color: '#10b981', fontWeight: 700 }}>Optimal (Wave 1.2m)</span></div>
                      <div><span style={{ color: '#94a3b8' }}>Sunda Strait Clearance:</span> <span style={{ color: '#38bdf8', fontWeight: 700 }}>Approved</span></div>
                      <div><span style={{ color: '#94a3b8' }}>ETA:</span> <span style={{ color: '#ffffff', fontWeight: 700 }}>Oct 14, 08:30 IST</span></div>
                    </div>
                  </div>

                  {/* Route Comparison Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '0.9rem 1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>Standard Route (via Malacca)</div>
                        <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>21.0 Days • High Congestion Risk</div>
                      </div>
                      <span style={{ color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>$1,522,000</span>
                    </div>

                    <div style={{ padding: '0.9rem 1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>NAUGATI AI Optimized Shortcut</div>
                        <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{currentScenario.transitDays} • Smooth Deep-Water</div>
                      </div>
                      <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>{currentScenario.totalCost}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === STEP 5: EXECUTIVE DECISION & INSTANT CHARTERING === */}
              {activeStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#04ADDE', fontWeight: 700, letterSpacing: '0.05em' }}>STEP 5 • EXECUTIVE DECISION BRIEF</span>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>Final Recommendation & Instant Execution</h3>
                    </div>
                    <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(4, 173, 222, 0.2)', border: '1px solid #04ADDE', color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem' }}>
                      Ready to Charter
                    </span>
                  </div>

                  {/* Summary Card with Instant Actions */}
                  <div style={{
                    padding: '2rem',
                    backgroundColor: '#04ADDE',
                    background: 'linear-gradient(135deg, #04ADDE 0%, #0284c7 100%)',
                    border: '2px solid #38bdf8',
                    borderRadius: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr',
                    gap: '2rem',
                    boxShadow: '0 12px 35px rgba(4, 173, 222, 0.4)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontWeight: 900, fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={18} color="#04ADDE" />
                        </div>
                        Recommended Action: FIX SPOT CHARTER
                      </div>
                      <p style={{ color: '#f0f9ff', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                        Locking in <strong style={{ color: '#ffffff', textDecoration: 'underline' }}>{currentScenario.carrier}</strong> at <strong style={{ color: '#0a2540', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>{currentScenario.predictedRate}/MT</strong> captures a forward rate 8.6% below historical average, avoiding projected $2.20/MT bunker inflation next week.
                      </p>

                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>Total Voyage Cost</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0a2540' }}>{currentScenario.totalCost}</div>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>Risk Index</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>Low (1.4/10)</div>
                        </div>
                        <div style={{ backgroundColor: '#ffffff', padding: '0.75rem 1rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>Contract Format</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7' }}>Gencon Spot</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem' }}>
                      <button
                        onClick={() => navigate('/auth')}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          backgroundColor: '#0a2540',
                          color: '#ffffff',
                          borderRadius: '10px',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 8px 25px rgba(10, 37, 64, 0.35)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Execute Charter in Platform <ArrowUpRight size={18} />
                      </button>

                      <button
                        onClick={handleReset}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#ffffff',
                          color: '#0a2540',
                          borderRadius: '10px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        <RotateCcw size={15} /> Replay Simulation
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkflowAnimation;
