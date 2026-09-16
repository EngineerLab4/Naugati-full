import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type WebSocketType from 'ws';
const WebSocket = require('ws');

export interface LiveAisVessel {
  mmsi: string;
  shipName: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  timestamp: string;

  // Backwards compatibility fields for frontend & ML pipeline
  name: string;
  lat: number;
  lng: number;
  sog_knots: number;
  cog_degrees: number;
  heading_degrees?: number;
  destination?: string;
  last_updated: string;
  source: 'aisstream_live' | 'baseline_fleet';
}

@Injectable()
export class AisStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AisStreamService.name);
  private readonly aisstreamUrl = 'wss://stream.aisstream.io/v0/stream';
  private ws: any = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private readonly maxTrackedVessels = 5000;

  // In-memory normalized vessel state store
  private readonly liveVessels = new Map<string, LiveAisVessel>();

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.isDestroyed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
  }

  private getApiKey(): string | undefined {
    return process.env.AISSTREAM_API_KEY;
  }

  private connect() {
    if (this.isDestroyed) return;

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn('No AISSTREAM_API_KEY provided in environment. Operating with live fleet baseline.');
      return;
    }

    try {
      this.ws = new WebSocket(this.aisstreamUrl);

      this.ws.on('open', () => {
        this.logger.log('AISStream WebSocket connected. Subscribing to live AIS stream.');

        // Subscription structure specified in AISStream documentation:
        // Focus on Indo-Pacific maritime corridor (Bay of Bengal, Arabian Sea, Indian Ocean, Malacca Strait)
        // Bounding box format: [[[lat_min, lon_min], [lat_max, lon_max]]]
        const subscription = {
          APIKey: apiKey,
          BoundingBoxes: [
            [
              [-15, 45],
              [30, 125],
            ],
          ],
          FilterMessageTypes: ['PositionReport', 'ShipStaticData', 'StandardClassBPositionReport'],
        };

        this.ws?.send(JSON.stringify(subscription));
      });

      this.ws.on('message', (raw: any) => {
        try {
          const message = JSON.parse(raw.toString());
          this.processAISMessage(message);
        } catch (error: any) {
          // Ignore parse errors on malformed frames
        }
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error(`AISStream error: ${error.message}`);
      });

      this.ws.on('close', () => {
        this.logger.warn('AISStream connection closed. Reconnecting in 5000ms...');
        this.scheduleReconnect();
      });
    } catch (error: any) {
      this.logger.error(`AISStream initialization error: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  /**
   * Process and normalize incoming AIS messages according to NAUGATI spec
   */
  private processAISMessage(message: any) {
    if (!message) return;

    const msgType = message.MessageType;

    if (msgType === 'PositionReport' || msgType === 'StandardClassBPositionReport') {
      const meta = message.MetaData;
      const report = message.Message?.PositionReport || message.Message?.StandardClassBPositionReport;
      if (!meta && !report) return;

      const rawMmsi = meta?.MMSI ?? meta?.MMSI_String ?? report?.UserID;
      if (!rawMmsi) return;
      const mmsi = String(rawMmsi);

      const lat = Number(meta?.Latitude ?? meta?.latitude ?? report?.Latitude);
      const lon = Number(meta?.Longitude ?? meta?.longitude ?? report?.Longitude);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return;
      }

      const shipName = (meta?.ShipName || `Vessel ${mmsi}`).trim();
      const speed = Number(report?.Sog ?? 0);
      const course = Number(report?.Cog ?? 0);
      const heading = Number(report?.TrueHeading ?? course);
      const timestamp = meta?.time_utc || new Date().toISOString();

      const existing = this.liveVessels.get(mmsi);

      const normalized: LiveAisVessel = {
        mmsi,
        shipName,
        latitude: lat,
        longitude: lon,
        speed,
        course,
        heading,
        timestamp,
        // Compatibility fields
        name: shipName,
        lat,
        lng: lon,
        sog_knots: speed,
        cog_degrees: course,
        heading_degrees: heading,
        destination: existing?.destination,
        last_updated: timestamp,
        source: 'aisstream_live',
      };

      // Memory safeguard: keep collection bounded
      if (this.liveVessels.size >= this.maxTrackedVessels && !this.liveVessels.has(mmsi)) {
        const oldestKey = this.liveVessels.keys().next().value;
        if (oldestKey) this.liveVessels.delete(oldestKey);
      }

      this.liveVessels.set(mmsi, normalized);
    } else if (msgType === 'ShipStaticData' || msgType === 'ShipAndVoyageData') {
      const meta = message.MetaData;
      const staticData = message.Message?.ShipStaticData || message.Message?.ShipAndVoyageData;
      const rawMmsi = meta?.MMSI ?? meta?.MMSI_String ?? staticData?.UserID;
      if (!rawMmsi) return;

      const mmsi = String(rawMmsi);
      const existing = this.liveVessels.get(mmsi);
      const destination = staticData?.Destination || staticData?.ShipStaticData?.Destination;
      const shipName = (meta?.ShipName || staticData?.Name || existing?.shipName || `Vessel ${mmsi}`).trim();

      if (existing) {
        if (destination) existing.destination = destination;
        existing.shipName = shipName;
        existing.name = shipName;
      }
    }
  }

  getLiveVessels(): LiveAisVessel[] {
    return Array.from(this.liveVessels.values());
  }

  getVesselByMmsi(mmsi: string | number): LiveAisVessel | undefined {
    return this.liveVessels.get(String(mmsi));
  }

  getVesselCountNearPort(portLat: number, portLng: number, radiusNm: number = 30): number {
    let count = 0;
    const radiusKm = radiusNm * 1.852;
    for (const v of this.liveVessels.values()) {
      const dKm = this.haversineDistance(portLat, portLng, v.lat, v.lng);
      if (dKm <= radiusKm) {
        count++;
      }
    }
    return count;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }


}
