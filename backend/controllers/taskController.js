const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');

const auditLogPath = path.resolve(__dirname, '../logs/audit.jsonl');

/**
 * Ensures the log directory exists before writing.
 */
const ensureLogDir = () => {
  const logDir = path.dirname(auditLogPath);
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
};

/**
 * Writes a structured log entry to the audit log file.
 * @param {string} actorId - The ID of the user performing the action.
 * @param {string} action - The action being performed (e.g., 'create_task').
 * @param {string} taskId - The ID of the task being affected.
 * @param {object} details - Any additional metadata.
 */
const auditLog = (actorId, action, taskId, details = {}) => {
  ensureLogDir();
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      actorId: actorId ? actorId.toString() : 'system',
      action,
      taskId: taskId ? taskId.toString() : 'N/A',
      ...details,
    };
    fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write to audit log:', error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  const { title, description, meta } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const task = new Task({
      title,
      description,
      meta,
      ownerId: req.user.id, // From 'protect' middleware
      status: 'pending',
    });

    const createdTask = await task.save();
    auditLog(req.user.id, 'create_task', createdTask._id, { title });
    res.status(201).json(createdTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get a task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // RBAC: Check if user is owner OR an admin
    if (task.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('getTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    List tasks for the current user (or all if admin)
 * @route   GET /api/tasks
 * @access  Private
 */
const listTasks = async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  let query = {};
  
  // RBAC: Admins can query by ownerId, users can only see their own
  if (req.user.role === 'admin') {
    if (req.query.ownerId) {
        query.ownerId = req.query.ownerId;
    }
    // If no ownerId is provided, admin sees all tasks
  } else {
    // Regular users can only see their own tasks
    query.ownerId = req.user.id;
  }

  if (status) {
    query.status = status;
  }

  try {
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);
    
    const tasks = await Task.find(query)
      .limit(limitNum)
      .skip(offsetNum)
      .sort({ createdAt: -1 });
      
    const total = await Task.countDocuments(query);

    res.status(200).json({
      data: tasks,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('listTasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a task
 * @route   PATCH /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  const { title, description, status, meta } = req.body;
  
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // RBAC: Check if user is owner or admin
    if (task.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Apply partial updates
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (meta) task.meta = meta;

    const updatedTask = await task.save();
    auditLog(req.user.id, 'update_task', updatedTask._id, { changes: Object.keys(req.body) });
    res.status(200).json(updatedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    console.error('updateTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
   try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(44).json({ message: 'Task not found' });
    }

    // RBAC: Check if user is owner or admin
    if (task.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne(); // Use deleteOne()
    
    auditLog(req.user.id, 'delete_task', req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
};