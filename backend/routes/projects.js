const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Project = require('../models/Project')
const User = require('../models/User')

// GET /api/projects - get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 })

    res.json(projects)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// POST /api/projects - create project (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can create projects' })
    }

    const { name, description } = req.body
    if (!name) return res.status(400).json({ msg: 'Project name is required' })

    const project = new Project({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    })

    await project.save()
    await project.populate('owner', 'name email')
    await project.populate('members', 'name email')

    res.json(project)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// GET /api/projects/:id - get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')

    if (!project) return res.status(404).json({ msg: 'Project not found' })

    const isMember = project.members.some(m => m._id.toString() === req.user.id) ||
      project.owner._id.toString() === req.user.id

    if (!isMember) return res.status(403).json({ msg: 'You are not a member of this project' })

    res.json(project)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// POST /api/projects/:id/members - add member (Admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can add members' })
    }

    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ msg: 'Project not found' })

    const { email } = req.body
    if (!email) return res.status(400).json({ msg: 'Email is required' })

    const userToAdd = await User.findOne({ email })
    if (!userToAdd) return res.status(404).json({ msg: 'No user found with that email' })

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ msg: 'User is already a member' })
    }

    project.members.push(userToAdd._id)
    await project.save()
    await project.populate('owner', 'name email')
    await project.populate('members', 'name email')

    res.json(project)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// PUT /api/projects/:id - update project (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can update projects' })
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('owner', 'name email')
      .populate('members', 'name email')

    if (!project) return res.status(404).json({ msg: 'Project not found' })

    res.json(project)
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// DELETE /api/projects/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Only admins can delete projects' })
    }

    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ msg: 'Project not found' })

    res.json({ msg: 'Project deleted successfully' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: 'Server error' })
  }
})

module.exports = router
