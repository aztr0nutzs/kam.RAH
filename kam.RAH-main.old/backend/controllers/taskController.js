const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { broadcast, broadcastLog } = require('../ws');

const buildTaskQuery = (req) => {
  if (process.env.REQUIRE_AUTH === 'false' || !req.user) {
    return {};
  }
  return { user: req.user._id };
};

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req)).sort({ createdAt: -1 });
  res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, ...buildTaskQuery(req) });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
});

const createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const payload = {
    ...req.body,
  };

  if (req.user) {
    payload.user = req.user._id;
  }

  const task = await Task.create(payload);
  broadcast('task_created', task);
  broadcastLog(`Task "${task.name}" scheduled`, 'info');
  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const task = await Task.findOne({ _id: req.params.id, ...buildTaskQuery(req) });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  Object.assign(task, req.body);
  const updatedTask = await task.save();
  broadcast('task_updated', updatedTask);
  res.json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, ...buildTaskQuery(req) });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  broadcast('task_deleted', { id: req.params.id });
  broadcastLog(`Task "${task.name}" removed`, 'warn');
  res.json({ message: 'Task deleted' });
});

const runTaskNow = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, ...buildTaskQuery(req) });
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.status = 'running';
  task.lastRunAt = new Date();
  await task.save();
  broadcast('task_triggered', task);
  broadcastLog(`Task "${task.name}" triggered manually`, 'info');
  res.json(task);
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  runTaskNow,
};
