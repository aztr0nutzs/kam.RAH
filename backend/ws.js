const WebSocket = require('ws');

let wss;

const initializeWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server, path: '/ws/events' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      console.log('received: %s', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.send(JSON.stringify({ event: 'connected', message: 'Welcome to CyberSec Command Real-Time Events.' }));
  });

  console.log('WebSocket server initialized.');
  return wss;
};

const broadcast = (data) => {
  if (!wss) {
    console.error('WebSocket server not initialized.');
    return;
  }

  const jsonData = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
};

module.exports = {
  initializeWebSocketServer,
  broadcast,
};
