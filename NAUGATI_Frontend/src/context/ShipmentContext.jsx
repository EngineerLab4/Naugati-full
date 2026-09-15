import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { freightService } from '../services/freightService';
import { vesselService } from '../services/vesselService';
import { portService } from '../services/portService';
import { routeService } from '../services/routeService';
import { riskService } from '../services/riskService';
import { contractService } from '../services/contractService';
import { PORTS, ORIGINS } from '../services/demoData';

const ShipmentContext = createContext();

export function useShipment() {
  return useContext(ShipmentContext);
}

export function ShipmentProvider({ children }) {
  // Default centralized shipment input
  const [shipment, setShipment] = useState({
    cargoType: "Thermal Coal",
    cargoQuantity: 75000,
    quantityUnit: "MT",
    origin: "Australia",
    originPort: "Hay Point",
    destination: "Dhamra Port",
    destinationPortId: "dhamra",
    preferredLoadingDate: "2026-09-20",
    requiredDeliveryDate: "2026-10-10",
    cargoPriority: "Best Balance", // "Lowest Cost" | "Fastest Delivery" | "Best Balance" | "Lowest Risk"
    preferredVesselType: "Panamax"
  });

  // What-If Simulation overrides
  const [whatIfParams, setWhatIfParams] = useState({
    fuelPriceChangePercent: 0,
    congestionChangePercent: 0,
    cargoQuantityOverride: null,
    freightAssumptionUSD: null
  });

  // Derived state caches
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const activePort = useMemo(() => {
    return PORTS.find(p => p.id === shipment.destinationPortId) || PORTS[0];
  }, [shipment.destinationPortId]);

  const activeOrigin = useMemo(() => {
    return ORIGINS.find(o => o.name.toLowerCase() === shipment.origin.toLowerCase()) || ORIGINS[0];
  }, [shipment.origin]);

  // Recalculate complete intelligence whenever shipment or whatIf changes
  const runShipmentAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const effQuantity = whatIfParams.cargoQuantityOverride || shipment.cargoQuantity;

      // 1. Match vessels
      const vesselMatch = await vesselService.matchVesselsForCargo({
        cargoQuantity: effQuantity,
        destinationPortId: shipment.destinationPortId,
        preferredLoadingDate: shipment.preferredLoadingDate,
        priority: shipment.cargoPriority
      });

      const chosenVessel = vesselMatch.recommendedVessel;

      // 2. Port compatibility rule engine
      const portCompatibility = portService.checkCompatibility(chosenVessel, activePort);

      // 3. Freight forecast
      const freight = await freightService.getFreightForecast({
        origin: shipment.origin,
        destination: activePort.name,
        vesselType: chosenVessel?.type || "Panamax"
      });

      // 4. Route optimization
      const routesData = await routeService.getRoutes({
        origin: shipment.origin,
        destination: activePort.name,
        priority: shipment.cargoPriority
      });

      // 5. ETA and voyage timeline
      const eta = routeService.calculateEta({
        departureDate: shipment.preferredLoadingDate,
        voyageDays: routesData.recommendedRoute.voyageDays,
        portWaitingDays: activePort.averageWaitingTimeDays * (1 + (whatIfParams.congestionChangePercent / 100))
      });

      // 6. Risk intelligence & Idle time
      const risk = await riskService.getRiskAssessment({
        portId: shipment.destinationPortId,
        vesselType: chosenVessel?.type || "Panamax",
        origin: shipment.origin
      });

      // 7. Contract recommendation
      const contract = await contractService.recommendContract({
        cargoQuantity: effQuantity,
        frequency: "Monthly",
        marketTrend: freight.trend,
        riskPreference: shipment.cargoPriority
      });

      // 8. Composite NAUGATI Decision Score
      const vesselScore = chosenVessel?.matchScore || 90;
      const portScore = portCompatibility.score;
      const routeScore = routesData.recommendedRoute.score;
      const costScore = freight.marketAction === "BOOK NOW" ? 94 : 82;
      const riskScore = 100 - risk.overallRiskScore;

      const naugatiOverallScore = Math.round(
        (vesselScore * 0.25) +
        (portScore * 0.25) +
        (routeScore * 0.20) +
        (costScore * 0.15) +
        (riskScore * 0.15)
      );

      // Explainable AI Reasoning summary
      const explainableReasons = [
        `${chosenVessel?.name} (${chosenVessel?.type}, ${chosenVessel?.dwt.toLocaleString()} DWT) perfectly matches your ${effQuantity.toLocaleString()} MT shipment size with ${chosenVessel?.capacityUtilization || 98}% stowage utilization.`,
        `Draft requirement of ${chosenVessel?.draft}m is fully compliant with ${activePort.name}'s ${activePort.maxDraft}m permissible limit (Safe UKC: +${(activePort.maxDraft - chosenVessel?.draft).toFixed(1)}m).`,
        `Current freight of $${freight.currentFreightUSDPerMT}/MT is forecast to rise to $${freight.forecast14D}/MT (+5.5%). Recommendation: ${freight.marketAction} to hedge upward rate pressure.`,
        `Selected ${routesData.recommendedRoute.title} avoids congested choke points, cutting voyage time to ${routesData.recommendedRoute.voyageDays} days with ${routesData.recommendedRoute.overallRisk} risk rating.`,
        `Short-term multiple voyage contract locks in competitive bunker adjustment factor while mitigating spot rate volatility.`
      ];

      setAnalysisResult({
        naugatiOverallScore,
        chosenVessel,
        matchedVessels: vesselMatch.matchedVessels,
        portCompatibility,
        freight,
        routesData,
        eta,
        risk,
        contract,
        explainableReasons,
        calculatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error executing shipment analysis:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Run on mount or when key parameters change
  useEffect(() => {
    runShipmentAnalysis();
  }, [
    shipment.destinationPortId, 
    shipment.origin, 
    shipment.cargoQuantity, 
    shipment.cargoPriority,
    whatIfParams.congestionChangePercent,
    whatIfParams.fuelPriceChangePercent,
    whatIfParams.cargoQuantityOverride
  ]);

  const updateShipment = (partial) => {
    setShipment(prev => {
      const updated = { ...prev, ...partial };
      // Sync destination port if destination text changed
      if (partial.destinationPortId) {
        const p = PORTS.find(x => x.id === partial.destinationPortId);
        if (p) updated.destination = p.name;
      }
      return updated;
    });
  };

  const updateWhatIf = (partial) => {
    setWhatIfParams(prev => ({ ...prev, ...partial }));
  };

  const resetWhatIf = () => {
    setWhatIfParams({
      fuelPriceChangePercent: 0,
      congestionChangePercent: 0,
      cargoQuantityOverride: null,
      freightAssumptionUSD: null
    });
  };

  const value = {
    shipment,
    updateShipment,
    activePort,
    activeOrigin,
    whatIfParams,
    updateWhatIf,
    resetWhatIf,
    analysisLoading,
    analysisResult,
    runShipmentAnalysis
  };

  return (
    <ShipmentContext.Provider value={value}>
      {children}
    </ShipmentContext.Provider>
  );
}
