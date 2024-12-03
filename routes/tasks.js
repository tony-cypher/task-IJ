const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body, user: req.user._id
    });
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all tasks for a user with filtering and search
router.get('/', auth, async (req, res) => {
  try {
    const match = { user: req.user._id };
    const sort = {};

    if (req.query.priority) {
      match.priority = req.query.priority;
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if (req.query.search) {
      match.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(match).sort(sort);
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

// Get a specific task
router.get('/:id', auth, async (req, res) => {
  try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
      if (!task) {
          return res.status(404).send();
      }
      res.send(task);
  } catch (error) {
      res.status(500).send();
  }
});

// Update a task
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'deadline', 'priority', 'completed'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

      if (!task) {
          return res.status(404).send();
      }

      updates.forEach((update) => task[update] = req.body[update]);
      await task.save();
      res.send(task);
  } catch (error) {
      res.status(400).send(error);
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

