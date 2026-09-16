import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, TrendingUp, AlertTriangle, ArrowRight, 
  RotateCcw, DollarSign, Clock, ShieldAlert, Anchor, Ship 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { PORTS, ORIGINS } from '../../services/demoData';
import LockedGate from './LockedGate';

export default function WhatIfSimulator() {
  const navigate = useNavigate();
  const { 
    shipment, 
    updateShipment, 
    activePort, 
    activeOrigin, 
    whatIfParams, 
    updateWhatIf, 
    resetWhatIf, 
    analysisResult,
    hasExecuted,
    runShipmentAnalysis 
  } = useShipment();

  // All hooks must be declared before any conditional return
  const [congestionDelta, setCongestionDelta] = useState(whatIfParams.congestionChangePercent || 0);
  const [fuelDelta, setFuelDelta] = useState(whatIfParams.fuelPriceChangePercent || 0);
  const [simQuantity, setSimQuantity] = useState(shipment.cargoQuantity || 75000);
  const [simVesselType, setSimVesselType] = useState(shipment.preferredVesselType || 'Panamax');
  const [applying, setApplying] = useState(false);

  // Lock gate — only accessible after cargo form + ML pipeline run
  if (!hasExecuted || !analysisResult) {
    return <LockedGate pageName="What-If Simulator" />;
  }

  const handleApplySimulation = async () => {
    setApplying(true);
    try {
      updateWhatIf({
        congestionChangePercent: congestionDelta,
        fuelPriceChangePercent: fuelDelta,
        cargoQuantityOverride: simQuantity
      });
      updateShipment({
        preferredVesselType: simVesselType,
        cargoQuantity: simQuantity
      });
      await runShipmentAnalysis({
        cargoQuantity: simQuantity,
        preferredVesselType: simVesselType,
        bunkerPriceUSD: 600 * (1 + fuelDelta / 100)
      });
      navigate('/dashboard');
    } catch (err) {
      console.error("Simulation recalculation failed:", err);
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setCongestionDelta(0);
    setFuelDelta(0);
    setSimQuantity(75000);
    setSimVesselType('Panamax');
    resetWhatIf();
  };

  // Recalculated dynamic impact preview
  const baseWaitingDays = activePort?.averageWaitingTimeDays || 2.5;
  const simulatedWaitingDays = +(baseWaitingDays * (1 + congestionDelta / 100)).toFixed(1);
  const addedDelayDays = +(simulatedWaitingDays - baseWaitingDays).toFixed(1);

  const baseFuelCost = analysisResult?.chosenVessel?.fuelCostUSD || 630000;
  const simulatedFuelCost = Math.round(baseFuelCost * (1 + fuelDelta / 100));
  const fuelCostDelta = simulatedFuelCost - baseFuelCost;

  const baseRate = analysisResult?.freight?.currentFreightUSDPerMT || 24.07;
  const simulatedFreightTotal = Math.round(simQuantity * baseRate);
  const baseDemurrageDaily = simVesselType === 'Capesize' ? 26500 : (simVesselType === 'Panamax' ? 16800 : 12500);
  const simulatedIdleCost = Math.round(simulatedWaitingDays * baseDemurrageDaily);

  const simulatedTotalVoyageCost = simulatedFreightTotal + simulatedFuelCost + simulatedIdleCost;

  let simulatedRiskLevel = "Low";
  if (congestionDelta >= 40 || addedDelayDays >= 1.5) simulatedRiskLevel = "High";
  else if (congestionDelta >= 15 || fuelDelta >= 15) simulatedRiskLevel = "Medium";

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            SCENARIO PLANNING & SENSITIVITY TESTING
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Maritime What-If Simulator
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Simulate market shocks: port congestion spikes, bunker fuel price swings, cargo volume shifts, and alternative vessel types.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleReset}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
          <button 
            onClick={handleApplySimulation}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Apply to Platform
          </button>
        </div>
      </div>

      {/* Split Simulation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Left: Interactive Input Sliders & Scenarios */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Scenario Input Assumptions</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Congestion Delta Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {activePort.name} Congestion Shock:
                </span>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: congestionDelta > 0 ? 'var(--semantic-red)' : (congestionDelta < 0 ? 'var(--semantic-green)' : '#64748b') 
                }}>
                  {congestionDelta >= 0 ? `+${congestionDelta}%` : `${congestionDelta}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-30" 
                max="100" 
                step="5"
                value={congestionDelta} 
                onChange={e => setCongestionDelta(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                <span>-30% (Fast Turnaround)</span>
                <span>Normal (0%)</span>
                <span>+100% (Severe Queue)</span>
              </div>
            </div>

            {/* Bunker Fuel Price Delta Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Bunker Fuel Price Swing (VLSFO):
                </span>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: fuelDelta > 0 ? 'var(--semantic-red)' : (fuelDelta < 0 ? 'var(--semantic-green)' : '#64748b') 
                }}>
                  {fuelDelta >= 0 ? `+${fuelDelta}%` : `${fuelDelta}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-25" 
                max="50" 
                step="5"
                value={fuelDelta} 
                onChange={e => setFuelDelta(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                <span>-25% ($468/MT)</span>
                <span>Base ($624/MT)</span>
                <span>+50% ($936/MT)</span>
              </div>
            </div>

            {/* Cargo Quantity Override */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Cargo Quantity (MT):
              </label>
              <input 
                type="number" 
                step="5000"
                value={simQuantity} 
                onChange={e => setSimQuantity(parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins' }}
              />
            </div>

            {/* Candidate Vessel Class Override */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Vessel Size Class:
              </label>
              <select 
                value={simVesselType} 
                onChange={e => setSimVesselType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', outline: 'none', fontFamily: 'Poppins' }}
              >
                <option value="Panamax">Panamax (76,000 DWT - Standard)</option>
                <option value="Capesize">Capesize (180,000 DWT - Heavy Bulk)</option>
                <option value="Supramax">Supramax (58,000 DWT - Geared)</option>
                <option value="Handysize">Handysize (35,000 DWT - Shallow Draft)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Right: Real-Time Dynamic Simulation Impact */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Simulated Operational Impact</h2>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: simulatedRiskLevel === 'High' ? 'var(--semantic-red-light)' : (simulatedRiskLevel === 'Medium' ? 'var(--semantic-amber-light)' : 'var(--semantic-green-light)'),
                color: simulatedRiskLevel === 'High' ? 'var(--semantic-red)' : (simulatedRiskLevel === 'Medium' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
              }}>
                Simulated Risk: {simulatedRiskLevel}
              </span>
            </div>

            {/* Impact Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TOTAL VOYAGE ETA DELAY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: addedDelayDays > 0 ? 'var(--semantic-red)' : '#0f172a', margin: '0.2rem 0' }}>
                  {addedDelayDays >= 0 ? `+${addedDelayDays}` : addedDelayDays} Days
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Waiting at anchorage: <strong>{simulatedWaitingDays} days</strong>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DEMURRAGE & IDLE COST</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--semantic-red)', margin: '0.2rem 0' }}>
                  ${simulatedIdleCost.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Based on ${baseDemurrageDaily.toLocaleString()}/day charter
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>BUNKER EXPENSE DELTA</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: fuelCostDelta > 0 ? 'var(--semantic-red)' : (fuelCostDelta < 0 ? 'var(--semantic-green)' : '#0f172a'), margin: '0.2rem 0' }}>
                  {fuelCostDelta >= 0 ? `+$${fuelCostDelta.toLocaleString()}` : `-$${Math.abs(fuelCostDelta).toLocaleString()}`}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Total bunker: ${simulatedFuelCost.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>REVISED TOTAL VOYAGE OUTLAY</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: '0.2rem 0' }}>
                  ${(simulatedTotalVoyageCost / 1000000).toFixed(2)}M
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Freight + Fuel + Anchorage Idle
                </div>
              </div>

            </div>

            {/* AI Strategic Recommendation based on Simulation */}
            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: congestionDelta >= 30 ? '#fef2f2' : 'var(--primary-light)',
              border: `1px solid ${congestionDelta >= 30 ? '#fecaca' : 'rgba(4,173,222,0.3)'}`,
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: congestionDelta >= 30 ? '#b91c1c' : 'var(--primary)' }}>
                {congestionDelta >= 30 ? "CRITICAL CONGESTION DIVERSION ADVISORY" : "OPTIMAL SCENARIO ADVISORY"}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#1e293b', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                {congestionDelta >= 30 
                  ? `With ${congestionDelta}% increased waiting queue at ${activePort.name}, diverting cargo to Vizag Outer Harbor or Gangavaram saves approximately ${(addedDelayDays * 24).toFixed(0)} hours and $${(addedDelayDays * baseDemurrageDaily).toLocaleString()} in vessel demurrage fees.`
                  : `Current simulated parameters maintain favorable margins on ${simVesselType} class. Recommend executing voyage charter before additional Pacific bunker surcharges take effect.`
                }
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              onClick={() => navigate('/dashboard/final-recommendation')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>View Updated Recommendation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
