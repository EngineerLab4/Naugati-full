import React from 'react';
import { Ship, Anchor, Search, BarChart2, TrendingUp, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingHome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1.5rem 3rem',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Ship size={32} color="var(--primary)" />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>NAUGATI</span>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>About Us</a>
          <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
          <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Live Market</a>
          <button className="btn-secondary">Login</button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6rem 3rem',
        maxWidth: '1400px',
        margin: '0 auto',
        gap: '4rem'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Smarter Maritime Decisions,<br/>
            <span style={{ color: 'var(--primary)' }}>Powered by Intelligent Forecasting.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px' }}>
            NAUGATI transforms freight data, vessel intelligence, port conditions and market signals into actionable chartering decisions.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('/dashboard/cargo')}>
              Find Best Shipping Option
            </button>
            <button className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Get Freight Recommendation
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Subtle Maritime Visual Placeholder */}
          <div style={{ 
            width: '100%', 
            height: '400px', 
            borderRadius: 'var(--radius-lg)', 
            background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(255,255,255,0) 100%)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Ship size={120} color="var(--primary)" style={{ opacity: 0.1, position: 'absolute' }} />
            <div className="card" style={{ position: 'absolute', top: '10%', right: '10%', padding: '1rem', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} className="text-green" />
                <span style={{ fontWeight: 600 }}>Freight Forecast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Market Snapshot */}
      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem 3rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.1em' }}>LIVE MARKET SNAPSHOT</h4>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
            
            <div className="flex flex-col gap-2">
              <span style={{ fontWeight: 500 }}>Baltic Dry Index</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>2,145</span>
                <span className="text-green" style={{ fontSize: '0.875rem', fontWeight: 600 }}>↑ 3.4%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span style={{ fontWeight: 500 }}>VLSFO Fuel Price</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>$592/MT</span>
                <span className="text-red" style={{ fontSize: '0.875rem', fontWeight: 600 }}>↓ 1.2%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span style={{ fontWeight: 500 }}>Port Congestion (Dhamra)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>LOW</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Updated 5m ago</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span style={{ fontWeight: 500 }}>Weather (Bay of Bengal)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="text-yellow" style={{ fontSize: '1.5rem', fontWeight: 700 }}>MODERATE</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Predict -> Recommend -> Optimize */}
      <div style={{ padding: '6rem 3rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '4rem' }}>How NAUGATI Works</h2>
        
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
          
          <div className="card flex-col items-center" style={{ flex: 1, padding: '3rem 2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>01</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>PREDICT</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Freight rates, ETA, market movement and geopolitical risks.</p>
          </div>

          <div className="card flex-col items-center" style={{ flex: 1, padding: '3rem 2rem', borderColor: 'var(--primary)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>02</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>RECOMMEND</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Vessel selection, contract negotiation and booking decisions.</p>
          </div>

          <div className="card flex-col items-center" style={{ flex: 1, padding: '3rem 2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--semantic-green-light)', color: 'var(--semantic-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>03</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>OPTIMIZE</h3>
            <p className="text-muted" style={{ lineHeight: 1.6 }}>Route planning, deadheading reduction, cost and operational efficiency.</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LandingHome;
