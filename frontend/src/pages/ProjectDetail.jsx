import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Add member
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [memberError, setMemberError] = useState('')

  // Create task modal
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  })
  const [taskError, setTaskError] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)

  useEffect(() => {
    loadProject()
    loadTasks()
  }, [id])

  const loadProject = async () => {
    try {
      const res = await axios.get(`${API}/projects/${id}`)
      setProject(res.data)
    } catch (err) {
      setPageError(err.response?.data?.msg || 'Failed to load project')
    }
    setLoading(false)
  }

  const loadTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks/project/${id}`)
      setTasks(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setMemberError('')
    try {
      const res = await axios.post(`${API}/projects/${id}/members`, { email: memberEmail })
      setProject(res.data)
      setMemberEmail('')
      setShowAddMember(false)
    } catch (err) {
      setMemberError(err.response?.data?.msg || 'Failed to add member')
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setTaskError('')
    setTaskLoading(true)
    try {
      const res = await axios.post(`${API}/tasks`, {
        ...taskForm,
        project: id,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined
      })
      setTasks([res.data, ...tasks])
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' })
    } catch (err) {
      setTaskError(err.response?.data?.msg || 'Failed to create task')
    }
    setTaskLoading(false)
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${API}/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await axios.delete(`${API}/tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
    } catch (err) {
      console.log(err)
    }
  }

  const handleUpdateProjectStatus = async (status) => {
    try {
      const res = await axios.put(`${API}/projects/${id}`, { status })
      setProject(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  if (loading) return <div className="loading">Loading project...</div>
  if (pageError) return (
    <div className="container">
      <div className="page">
        <div className="error-msg">{pageError}</div>
        <button className="btn-secondary" onClick={() => navigate('/projects')} style={{ marginTop: '10px' }}>
          Back to Projects
        </button>
      </div>
    </div>
  )

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  return (
    <div className="container">
      <div className="page">
        <div className="project-detail-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <button
                onClick={() => navigate('/projects')}
                style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', marginBottom: '10px', fontSize: '14px', padding: 0 }}
              >
                ← Back to Projects
              </button>
              <h1>{project?.name}</h1>
              <p style={{ marginTop: '6px' }}>{project?.description || 'No description'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className={`project-status status-${project?.status}`} style={{ fontSize: '14px' }}>
                {project?.status}
              </span>
              {user?.role === 'Admin' && (
                <select
                  value={project?.status}
                  onChange={(e) => handleUpdateProjectStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="two-col">
          {/* Left: Tasks */}
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Tasks ({tasks.length})</h2>
                {user?.role === 'Admin' && (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}
                    onClick={() => setShowTaskModal(true)}
                  >
                    + Add Task
                  </button>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="no-data">No tasks yet. {user?.role === 'Admin' ? 'Add the first one!' : ''}</div>
              ) : (
                tasks.map(task => (
                  <div className="task-item" key={task._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="task-title">{task.title}</div>
                      {user?.role === 'Admin' && (
                        <button className="btn-danger" onClick={() => handleDeleteTask(task._id)}>
                          Delete
                        </button>
                      )}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '13px', color: '#777', margin: '6px 0' }}>{task.description}</p>
                    )}
                    <div className="task-meta">
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.assignedTo ? (
                        <span>Assigned: {task.assignedTo.name}</span>
                      ) : (
                        <span style={{ color: '#bbb' }}>Unassigned</span>
                      )}
                      {task.dueDate && (
                        <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? '#ea4335' : '#888' }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Members & Summary */}
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ margin: 0 }}>Members ({project?.members?.length})</h2>
                {user?.role === 'Admin' && (
                  <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={() => setShowAddMember(!showAddMember)}>
                    {showAddMember ? 'Cancel' : '+ Add'}
                  </button>
                )}
              </div>

              {showAddMember && (
                <form onSubmit={handleAddMember} style={{ marginBottom: '14px' }}>
                  {memberError && <div className="error-msg" style={{ marginBottom: '8px', padding: '8px' }}>{memberError}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="User email address"
                      required
                      style={{ flex: 1, padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '7px 14px', fontSize: '13px' }}>
                      Add
                    </button>
                  </div>
                </form>
              )}

              <div className="members-list">
                {project?.members?.map(member => (
                  <span key={member._id} className="member-tag">
                    {member.name}
                    {project.owner?._id === member._id ? ' (Owner)' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Task Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#e8eaed', borderRadius: '5px' }}>
                  <span style={{ fontSize: '14px' }}>Todo</span>
                  <strong>{todoCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff3e0', borderRadius: '5px' }}>
                  <span style={{ fontSize: '14px' }}>In Progress</span>
                  <strong>{inProgressCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#e6f4ea', borderRadius: '5px' }}>
                  <span style={{ fontSize: '14px' }}>Done</span>
                  <strong>{doneCount}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Task</h2>
              {taskError && <div className="error-msg">{taskError}</div>}
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Optional details..."
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  >
                    <option value="">-- Unassigned --</option>
                    {project?.members?.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={taskLoading}>
                    {taskLoading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail
