const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load env vars
dotenv.config();

// --- CRITICAL FIX: Pre-flight check for environment variables ---
// This prevents the server from crashing silently if configuration is missing.
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


const connectDB = require('./config/db');
const { initializeWebSocketServer } = require('./ws');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const userRoutes = require('./routes/userRoutes');
const cameraRoutes = require('./routes/cameraRoutes');


// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server and attach to the HTTP server
const wss = initializeWebSocketServer(server);

// Middleware
app.use(express.json()); // Body parser
app.use(cors()); // Enable CORS

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // Limit each IP to 200 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Make WSS available to routes
app.set('wss', wss);

// API Documentation
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routes
app.get('/', (req, res) => res.send('CyberSec Command API is running...'));
app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
// TODO: Add routes for recordings and interfaces
// app.use('/api/recordings', require('./routes/recordingRoutes'));
// app.use('/api/interfaces', require('./routes/interfaceRoutes'));

// Custom error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '127.0.0.1', () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://127.0.0.1:${PORT}`)
);
