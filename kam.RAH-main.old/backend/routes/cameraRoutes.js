const express = require('express');
const {
  getCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCamera,
  controlCamera,
  toggleRecord,
  toggleFavorite,
} = require('../controllers/cameraController');
const { protect } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

const router = express.Router();

if (process.env.REQUIRE_AUTH !== 'false') {
  router.use(protect);
}

router.route('/')
  .get(getCameras)
  .post(
    [
      body('name', 'Name is required').not().isEmpty().trim().escape(),
      body('url', 'A valid URL is required').isURL(),
      body('type').optional().isIn(['IP', 'USB', 'Android']),
    ],
    createCamera
  );

router.route('/:id')
  .get([param('id').isMongoId()], getCameraById)
  .put(
    [
      param('id').isMongoId(),
      body('name').optional().isString(),
      body('url').optional().isURL(),
    ],
    updateCamera
  )
  .delete([param('id').isMongoId()], deleteCamera);

router.route('/:id/control')
  .post(
    [
      param('id').isMongoId(),
      // Add more specific validation for settings as needed
      body('settings', 'Settings object is required').isObject(),
    ],
    controlCamera
  );

router.route('/:id/record')
  .post(
    [
      param('id').isMongoId(),
      body('record', 'Record flag must be a boolean').isBoolean(),
    ],
    toggleRecord
  );

router.route('/:id/favorite')
    .post(
        [
            param('id').isMongoId(),
            body('isFavorite', 'isFavorite flag must be a boolean').isBoolean(),
        ],
        toggleFavorite
    );

module.exports = router;
