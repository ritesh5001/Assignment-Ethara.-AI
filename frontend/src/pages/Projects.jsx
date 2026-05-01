import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Projects() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/projects`)
      setProjects(res.data)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setFormLoading(true)
    try {
      const res = await axios.post(`${API}/projects`, { name, description })
      setProjects([res.data, ...projects])
      setShowModal(false)
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create project')
    }
    setFormLoading(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setName('')
    setDescription('')
    setError('')
  }

  if (loading) return <div className="loading">Loading projects...</div>

  return (
    <div className="container">
      <div className="page">
        <div className="page-header">
          <h1>Projects</h1>
          {user?.role === 'Admin' && (
            <button
              className="btn-primary"
              style={{ width: 'auto' }}
              onClick={() => setShowModal(true)}
            >
              + New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="card">
            <div className="no-data">
              {user?.role === 'Admin'
                ? 'No projects yet. Create your first one!'
                : 'You haven\'t been added to any project yet.'}
            </div>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div
                className="project-card"
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <h3>{project.name}</h3>
                <p>{project.description || 'No description provided'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`project-status status-${project.status}`}>
                    {project.status}
                  </span>
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', marginTop: '10px' }}>
                  Owner: {project.owner?.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Project</h2>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={3}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create Project'}
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

export default Projects
