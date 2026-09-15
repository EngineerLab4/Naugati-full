const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

// ARCHITECTURE.md §4: needs sticky sessions or shared Redis pub/sub so
// alert/ETA pushes fan out correctly across instances. We use Redis pub/sub
// so any instance can receive an event and forward it to its own connected clients.

const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-secret-change-me';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// userId -> Set of live sockets (a user may have multiple tabs/devices)
const clientsByUser = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  let userId;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.sub;
  } catch (err) {
    ws.close(4001, 'Invalid or missing token');
    return;
  }

  if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set());
  clientsByUser.get(userId).add(ws);

  ws.on('close', () => {
    clientsByUser.get(userId)?.delete(ws);
  });
});

function pushToUser(userId, payload) {
  const sockets = clientsByUser.get(userId);
  if (!sockets) return;
  const msg = JSON.stringify(payload);
  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

// Subscribe to the channels core-api / ingestion-service publish alerts/ETA changes on.
const subscriber = new Redis(REDIS_URL);
subscriber.subscribe('alerts.push', 'eta.push', (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to subscribe to Redis channels', err);
  }
});

subscriber.on('message', (channel, message) => {
  try {
    const event = JSON.parse(message); // expected shape: { user_id, ...payload }
    if (event.user_id) pushToUser(event.user_id, { channel, ...event });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Bad message on', channel, err);
  }
});

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`realtime-gateway listening on :${PORT} (ws path /ws)`);
});
