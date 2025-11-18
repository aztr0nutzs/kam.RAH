const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load env vars (prefer backend/.env but allow repo root fallbacks)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const connectDB = require('./config/db');
const { initializeWebSocketServer } = require('./ws');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { requestContext } = require('./middleware/requestContext');

const userRoutes = require('./routes/userRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const taskRoutes = require('./routes/taskRoutes');

connectDB();

const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);

const wsPath = process.env.WS_PATH || '/ws/events';
const wss = initializeWebSocketServer(server, { path: wsPath });
app.set('wss', wss);

const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(requestContext);

const helmetConfig = {
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' },
};

app.use(helmet(helmetConfig));
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));
}

app.use(compression());
app.use(express.json({ limit: '1mb' }));

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
app.use(cors(corsOptions));

morgan.token('req-id', (req) => req.requestId || '-');
if (process.env.NODE_ENV !== 'test') {
  const logFormat = process.env.NODE_ENV === 'development'
    ? ':method :url :status :response-time ms reqId=:req-id'
    : '[:date[iso]] :method :url :status :res[content-length] - :response-time ms reqId=:req-id';
  app.use(morgan(logFormat));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/', (req, res) => res.send('Kam.RAH backend is online.'));

app.use('/api/users', userRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`Server running (${process.env.NODE_ENV || 'production'}) on http://${HOST}:${PORT}`);
  console.log(`WS endpoint: ws://${HOST}:${PORT}${wsPath}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
