const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/Task')

// GET /api/tasks/my - get tasks assigned to me
router.get('/my', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// GET /api/tasks/project/:projectId - get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// POST /api/tasks - create task (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can create tasks' })
    }

    const { title, description, project, assignedTo, priority, dueDate } = req.body

    if (!title || !project) {
      return res.status(400).json({ msg: 'Title and project are required' })
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate: dueDate || null
    })

    await task.save()
    await task.populate('assignedTo', 'name email')
    await task.populate('createdBy', 'name email')

    res.json(task)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// PUT /api/tasks/:id - update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ msg: 'Task not found' })

    // members can only update the status field
    if (req.user.role === 'Member') {
      if (req.body.status) task.status = req.body.status
    } else {
      // admins can update everything
      const { title, description, assignedTo, priority, dueDate, status } = req.body
      if (title) task.title = title
      if (description !== undefined) task.description = description
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null
      if (priority) task.priority = priority
      if (dueDate !== undefined) task.dueDate = dueDate || null
      if (status) task.status = status
    }

    await task.save()
    await task.populate('assignedTo', 'name email')
    await task.populate('createdBy', 'name email')

    res.json(task)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// DELETE /api/tasks/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can delete tasks' })
    }

    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).json({ msg: 'Task not found' })

    res.json({ msg: 'Task deleted' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router
