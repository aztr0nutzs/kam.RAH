const { WebSocketServer } = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');

let wssInstance = null;

/**
 * Initializes the WebSocket server and attaches authentication middleware.
 * @param {http.Server} server - The HTTP server to attach to.
 * @returns {WebSocketServer} The configured WebSocket server instance.
 */
const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    try {
      // P0-4: Validate WebSocket connection
      const q = url.parse(req.url, true).query;
      const token = q.token;

      if (!token) {
        ws.send(JSON.stringify({ event: 'auth_failed', message: 'No token provided' }));
        ws.close(4001, 'Unauthorized');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.user = decoded; // Attach user info to the connection

      ws.send(JSON.stringify({ event: 'auth_success', message: 'Connected' }));
      
      ws.on('message', (message) => {
        // Handle incoming messages, e.g., keep-alive
        if (message.toString() === 'ping') {
          ws.send(JSON.stringify({ event: 'pong' }));
        }
      });

      ws.on('close', () => {
        // console.log('Client disconnected:', ws.user ? ws.user.id : 'unknown');
      });

    } catch (err) {
      // Handle JWT verification error
      ws.send(JSON.stringify({ event: 'auth_failed', message: 'Invalid token' }));
      ws.close(4001, 'Unauthorized');
      return;
    }
  });
  
  wssInstance = wss;
  return wss;
};

/**
 * Broadcasts a message to all connected and authenticated clients.
 * @param {object} data - The data payload to send (will be JSON.stringified).
 */
const broadcast = (data) => {
    if (!wssInstance) return;
    
    wssInstance.clients.forEach(client => {
        // Check if client is authenticated (ws.user is set) and open
        if (client.user && client.readyState === 1) { // 1 = WebSocket.OPEN
            client.send(JSON.stringify(data));
        }
    });
};

/**
 * Sends a message to a specific user by their ID.
 * @param {string} userId - The user's ID (from JWT payload).
 * @param {object} data - The data payload to send.
 */
const sendToUser = (userId, data) => {
    if (!wssInstance) return;
    
    wssInstance.clients.forEach(client => {
        if (client.user && client.user.id === userId && client.readyState === 1) {
             client.send(JSON.stringify(data));
        }
    });
};


module.exports = {
  initializeWebSocketServer,
  broadcast,
  sendToUser,
};