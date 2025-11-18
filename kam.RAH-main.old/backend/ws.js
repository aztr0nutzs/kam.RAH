const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;

const isAuthRequired = () => process.env.REQUIRE_AUTH !== 'false';

const initializeWebSocketServer = (server, options = {}) => {
  const { path = '/ws/events', heartbeatInterval = 30000 } = options;
  wss = new WebSocket.Server({ server, path });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, heartbeatInterval);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (ws, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (isAuthRequired()) {
      const token = url.searchParams.get('token');
      if (!token) {
        ws.close(4401, 'Authentication required');
        return;
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.id;
      } catch (err) {
        console.error('WebSocket auth failed:', err.message);
        ws.close(4403, 'Invalid token');
        return;
      }
    }

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      console.log('WS message from client:', message.toString());
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.send(JSON.stringify({ event: 'connected', payload: { message: 'Kam.RAH event channel ready.' } }));
  });

  console.log(`WebSocket server initialized on path ${path}`);
  return wss;
};

const buildPayload = (eventOrPayload, payload) => {
  if (typeof eventOrPayload === 'string') {
    return { event: eventOrPayload, payload };
  }
  return eventOrPayload;
};

const broadcast = (eventOrPayload, payload) => {
  if (!wss) {
    console.error('WebSocket server not initialized.');
    return;
  }

  const message = JSON.stringify(buildPayload(eventOrPayload, payload));
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const broadcastLog = (message, level = 'info') => {
  broadcast('log_entry', {
    message,
    level,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  initializeWebSocketServer,
  broadcast,
  broadcastLog,
};
