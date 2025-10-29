const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // Added for security headers
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const mongoose = require('mongoose'); // Needed for graceful shutdown

// Load env vars
dotenv.config();

// --- CRITICAL FIX: Pre-flight check for environment variables ---
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! FATAL ERROR: Missing required environment variables:');
    missingEnvVars.forEach(v => console.error(`!!! - ${v}`));
    console.error('!!!');
    console.error('!!! Please create a .env file in the /backend directory');
    console.error('!!! and add these variables.');
    console.error('!!! Refer to .env.example for a template.');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    process.exit(1); // Exit gracefully with an error code
}
// --- END OF CRITICAL FIX ---


const { connectDB, checkDBHealth } = require('./config/db');
const { initializeWebSocketServer } = require('./ws');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const userRoutes = require('./routes/userRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Added new task routes


// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server and attach to the HTTP server
const wss = initializeWebSocketServer(server);

// --- Middleware ---

// Security headers
app.use(helmet()); 

// Body parser
app.use(express.json()); 

// Enable CORS with specific origin
const allowedOrigins = [
  'http://127.0.0.1:3000', // Vite dev server
  'http://localhost:3000'
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions)); 

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - Applied to API routes
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter); // Apply to all /api/ routes

// Make WSS available to routes
app.set('wss', wss);

// --- API Documentation ---
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Mount Routes ---
app.get('/', (req, res) => res.send('CyberSec Command API is running...'));

// Health Check Endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDBHealth();
  const healthStatus = {
    ok: true,
    uptime: process.uptime(),
    db: dbHealthy,
    gitCommit: process.env.GIT_COMMIT || 'unknown',
    timestamp: new Date().toISOString()
  };
  
  if (!dbHealthy) {
    return res.status(503).json({ ...healthStatus, ok: false, message: 'Database connection failed' });
  }
  
  res.status(200).json(healthStatus);
});

app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/tasks', taskRoutes); // Mounted new task routes

// TODO: Add routes for recordings and interfaces
// app.use('/api/recordings', require('./routes/recordingRoutes'));
// app.use('/api/interfaces', require('./routes/interfaceRoutes'));

// --- Custom Error Handlers ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1'; // P1-2: Configurable host

const runningServer = server.listen(PORT, HOST, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`)
);

// --- Graceful Shutdown ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Stop accepting new connections
  runningServer.close(async () => {
    console.log('HTTP server closed.');
    
    // Close WebSocket connections
    if (wss) {
      wss.close(() => {
        console.log('WebSocket server closed.');
      });
      // Forcefully terminate connections after a delay
      wss.clients.forEach(client => client.terminate());
    }

    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
    
    console.log('Shutdown complete.');
    process.exit(0);
  });

  // Force shutdown after a timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000); // 10 seconds
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));