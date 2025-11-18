const Camera = require('../models/Camera');
const { validationResult } = require('express-validator');
const { broadcast, broadcastLog } = require('../ws');

const mergeDeep = (target = {}, source = {}) => {
  const output = { ...target };
  Object.keys(source || {}).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
};

const buildCameraQuery = (req) => {
  if (process.env.REQUIRE_AUTH === 'false' || !req.user) {
    return {};
  }
  return { user: req.user._id };
};

// Utility to handle async controller actions and errors
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// @desc    Get all cameras
// @route   GET /api/cameras
// @access  Private (when protected)
const getCameras = asyncHandler(async (req, res) => {
  // In a multi-user system, this would be filtered by req.user.id
  const cameras = await Camera.find(buildCameraQuery(req)).sort({ createdAt: -1 });
  res.json(cameras);
});

// @desc    Get single camera by ID
// @route   GET /api/cameras/:id
// @access  Private (when protected)
const getCameraById = asyncHandler(async (req, res) => {
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });

    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }
    res.json(camera);
});

// @desc    Create a new camera
// @route   POST /api/cameras
// @access  Private (when protected)
const createCamera = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, url, type } = req.body;
    const camera = new Camera({
        name,
        url,
        type,
        ...(req.user ? { user: req.user._id } : {}),
    });
    const createdCamera = await camera.save();
    
    // Broadcast the new camera to all clients
    broadcast('camera_added', createdCamera);
    broadcastLog(`Camera "${createdCamera.name}" added`, 'info');

    res.status(201).json(createdCamera);
});

// @desc    Update a camera's core properties
// @route   PUT /api/cameras/:id
// @access  Private (when protected)
const updateCamera = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, url } = req.body;
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });

    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }

    camera.name = name || camera.name;
    camera.url = url || camera.url;

    const updatedCamera = await camera.save();
    broadcast('camera_settings_update', updatedCamera);
    res.json(updatedCamera);
});

// @desc    Update camera settings (control)
// @route   POST /api/cameras/:id/control
// @access  Private (when protected)
const controlCamera = asyncHandler(async (req, res) => {
    const { settings } = req.body;
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });

    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }

    const currentSettings =
        camera.settings && typeof camera.settings.toObject === 'function'
            ? camera.settings.toObject()
            : camera.settings;
    camera.settings = mergeDeep(currentSettings, settings);
    
    // Mark as modified if it's a mixed type
    camera.markModified('settings'); 

    const updatedCamera = await camera.save();

    // Broadcast the change to all clients
    broadcast('camera_settings_update', updatedCamera);

    res.json(updatedCamera);
});

// @desc    Toggle recording status
// @route   POST /api/cameras/:id/record
// @access  Private (when protected)
const toggleRecord = asyncHandler(async (req, res) => {
    const { record } = req.body; // true to start, false to stop
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });
    
    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }

    if (camera.status === 'OFFLINE') {
        res.status(400);
        throw new Error('Cannot change recording status of an offline camera');
    }

    camera.status = record ? 'RECORDING' : 'ONLINE';
    const updatedCamera = await camera.save();

    broadcast('camera_status_update', updatedCamera);
    broadcastLog(`Camera "${camera.name}" recording ${record ? 'started' : 'stopped'}`, 'info');

    res.json(updatedCamera);
});

// @desc    Toggle favorite status
// @route   POST /api/cameras/:id/favorite
// @access  Private (when protected)
const toggleFavorite = asyncHandler(async (req, res) => {
    const { isFavorite } = req.body;
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });

    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }

    camera.isFavorite = isFavorite;
    const updatedCamera = await camera.save();
    
    // Note: We don't broadcast this change as it's a user-specific preference.
    // The client that made the request will get the updated camera in the response.
    res.json(updatedCamera);
});

// @desc    Delete a camera
// @route   DELETE /api/cameras/:id
// @access  Private (when protected)
const deleteCamera = asyncHandler(async (req, res) => {
    const camera = await Camera.findOne({ _id: req.params.id, ...buildCameraQuery(req) });

    if (!camera) {
        res.status(404);
        throw new Error('Camera not found');
    }

    await camera.deleteOne();
    
    broadcast('camera_removed', { id: req.params.id });
    broadcastLog(`Camera "${camera.name}" removed`, 'warn');

    res.json({ message: 'Camera removed successfully' });
});


module.exports = {
  getCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCamera,
  controlCamera,
  toggleRecord,
  toggleFavorite,
};
