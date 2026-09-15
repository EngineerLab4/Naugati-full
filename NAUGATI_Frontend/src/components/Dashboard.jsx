import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import UserDashboard from './dashboard/UserDashboard';
import ShipownerDashboard from './dashboard/ShipownerDashboard';
import CargoRequirement from './dashboard/CargoRequirement';
import VesselAvailability from './dashboard/VesselAvailability';
import VesselDetails from './dashboard/VesselDetails';
import FreightForecast from './dashboard/FreightForecast';
import ContractRecommendation from './dashboard/ContractRecommendation';
import EtaPrediction from './dashboard/EtaPrediction';
import DeadheadingOptimization from './dashboard/DeadheadingOptimization';
import BackhaulOpportunities from './dashboard/BackhaulOpportunities';
import RiskIntelligence from './dashboard/RiskIntelligence';
import RouteOptimization from './dashboard/RouteOptimization';
import PortIntelligence from './dashboard/PortIntelligence';
import WhatIfSimulator from './dashboard/WhatIfSimulator';
import FinalRecommendation from './dashboard/FinalRecommendation';
import FleetPage from './dashboard/FleetPage';
import VesselAvailabilityManager from './dashboard/VesselAvailabilityManager';
import AlertsPage from './dashboard/AlertsPage';
import Reports from './dashboard/Reports';
import WorkflowSimulatorPage from './dashboard/WorkflowSimulatorPage';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const isShipowner = userProfile?.organizationType === 'Ocean Carrier' || userProfile?.role === 'shipowner';

  return (
    <Routes>
      {/* Dynamic Overview based on role */}
      <Route path="/" element={isShipowner ? <ShipownerDashboard /> : <UserDashboard />} />
      
      {/* Shipper & Forwarder Core Workflow */}
      <Route path="/cargo" element={<CargoRequirement />} />
      <Route path="/vessels" element={<VesselAvailability />} />
      <Route path="/vessel/:id" element={<VesselDetails />} />
      <Route path="/vessel-intelligence" element={<Navigate to="/dashboard/vessels" replace />} />
      <Route path="/final-recommendation" element={<FinalRecommendation />} />
      
      {/* Intelligence & Optimization */}
      <Route path="/ai-simulator" element={<WorkflowSimulatorPage />} />
      <Route path="/workflow-simulator" element={<WorkflowSimulatorPage />} />
      <Route path="/freight-forecast" element={<FreightForecast />} />
      <Route path="/contract-recommendation" element={<ContractRecommendation />} />
      <Route path="/eta-prediction" element={<EtaPrediction />} />
      <Route path="/route-optimization" element={<RouteOptimization />} />
      <Route path="/live-map" element={<RouteOptimization />} />
      <Route path="/port-intelligence" element={<PortIntelligence />} />
      <Route path="/risk-intelligence" element={<RiskIntelligence />} />
      <Route path="/what-if" element={<WhatIfSimulator />} />

      {/* Ocean Carrier / Shipowner Specific Modules */}
      <Route path="/fleet" element={<FleetPage />} />
      <Route path="/vessel-availability" element={<VesselAvailabilityManager />} />
      <Route path="/deadheading" element={<DeadheadingOptimization />} />
      <Route path="/backhaul" element={<BackhaulOpportunities />} />

      {/* Shared Services */}
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/reports" element={<Reports />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default Dashboard;
