
const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(
    [
      body('title', 'Title is required').not().isEmpty(),
      body('status').optional().isIn(['pending', 'in-progress', 'completed']),
      body('dueDate').optional().isISO8601().toDate(),
    ],
    createTask
  );

router.route('/:id')
  .get(getTaskById)
  .put(
    [
      body('title').optional().not().isEmpty(),
      body('status').optional().isIn(['pending', 'in-progress', 'completed']),
      body('dueDate').optional().isISO8601().toDate(),
    ],
    updateTask
  )
  .delete(deleteTask);

module.exports = router;
