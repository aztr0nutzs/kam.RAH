const express = require('express');
const router = express.Router();
const {
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this file
router.use(protect);

router.route('/')
  .post(createTask)
  .get(listTasks);
  
router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;