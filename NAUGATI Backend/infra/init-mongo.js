// Runs automatically on first mongodb container start (docker-entrypoint-initdb.d).
// Mongo has no fixed schema/DDL, so this only sets up indexes — uniqueness
// constraints and the geospatial index that replaces PostGIS.

db = db.getSiblingDB('naugati');

// --- core-api collections (Mongoose creates these on first write; indexes
// are still worth declaring up front so uniqueness is enforced from day one) ---

db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });

db.createCollection('ports');
db.ports.createIndex({ unlocode: 1 }, { unique: true });
// Geospatial index — replaces PostGIS spatial indexes (ARCHITECTURE.md §9)
// for port-proximity and deadheading-distance queries. Ports/vessels should
// store a GeoJSON `location: { type: "Point", coordinates: [lng, lat] }` field.
db.ports.createIndex({ location: '2dsphere' });

db.createCollection('port_status');
db.port_status.createIndex({ port_id: 1 }, { unique: true });

db.createCollection('vessels');
db.vessels.createIndex({ imo: 1 }, { unique: true });

db.createCollection('vessel_states');
db.vessel_states.createIndex({ vessel_id: 1 }, { unique: true });
db.vessel_states.createIndex({ current_location: '2dsphere' });

db.createCollection('vessel_availability_declarations');
db.vessel_availability_declarations.createIndex({ vessel_id: 1 });

db.createCollection('shipments');
db.shipments.createIndex({ user_id: 1 });

db.createCollection('contracts');
db.contracts.createIndex({ shipment_id: 1 });

db.createCollection('alerts');
db.alerts.createIndex({ user_id: 1, created_at: -1 });

// --- ingestion-service raw-write collections (no TypeORM/Mongoose entity) ---

db.createCollection('data_source_health');
db.data_source_health.createIndex({ source: 1 }, { unique: true });

db.createCollection('port_distances');
db.port_distances.createIndex({ origin_port_id: 1, destination_port_id: 1 }, { unique: true });

db.createCollection('vessel_performance');
db.vessel_performance.createIndex({ vessel_id: 1 }, { unique: true });
