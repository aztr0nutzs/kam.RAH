const express = require('express');
const { body, param } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  runTaskNow,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const requireAuth = process.env.REQUIRE_AUTH !== 'false';

if (requireAuth) {
  router.use(protect);
}

const taskValidators = [
  body('name', 'Task name is required').trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('triggerType').optional().isIn(['manual', 'schedule', 'event']),
  body('action').optional().isIn(['record', 'stopRecord', 'snapshot', 'ptz', 'notify', 'custom']),
  body('targetCameras').optional().isArray(),
  body('schedule').optional().isObject(),
];

router
  .route('/')
  .get(getTasks)
  .post(taskValidators, createTask);

router
  .route('/:id')
  .get([param('id').isMongoId()], getTaskById)
  .put([param('id').isMongoId(), ...taskValidators], updateTask)
  .delete([param('id').isMongoId()], deleteTask);

router.post('/:id/run', [param('id').isMongoId()], runTaskNow);

module.exports = router;
