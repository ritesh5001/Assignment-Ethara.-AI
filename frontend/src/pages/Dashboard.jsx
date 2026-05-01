import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          axios.get(`${API}/tasks/my`),
          axios.get(`${API}/projects`)
        ])
        setTasks(tasksRes.data)
        setProjects(projectsRes.data)
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const today = new Date()
  const totalTasks = tasks.length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => {
    return t.dueDate && new Date(t.dueDate) < today && t.status !== 'done'
  }).length

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="container">
      <div className="page">
        <div className="page-header">
          <h1>Hello, {user?.name}!</h1>
          <span style={{ fontSize: '14px', color: '#888' }}>{user?.role} Account</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="stat-number">{totalTasks}</div>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <div className="stat-number">{inProgress}</div>
          </div>
          <div className="stat-card done">
            <h3>Completed</h3>
            <div className="stat-number">{done}</div>
          </div>
          <div className="stat-card overdue">
            <h3>Overdue</h3>
            <div className="stat-number">{overdue}</div>
          </div>
        </div>

        <div className="two-col">
          <div className="card">
            <h2>My Assigned Tasks</h2>
            {tasks.length === 0 ? (
              <div className="no-data">No tasks assigned to you yet.</div>
            ) : (
              tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < today && task.status !== 'done'
                return (
                  <div className="task-item" key={task._id}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {task.project && (
                        <Link to={`/projects/${task.project._id}`} style={{ color: '#1a73e8', textDecoration: 'none' }}>
                          {task.project.name}
                        </Link>
                      )}
                      {task.dueDate && (
                        <span style={{ color: isOverdue ? '#ea4335' : '#666' }}>
                          {isOverdue ? 'Overdue: ' : 'Due: '}
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="card">
            <h2>My Projects ({projects.length})</h2>
            {projects.length === 0 ? (
              <div className="no-data">You're not in any projects yet.</div>
            ) : (
              <>
                {projects.slice(0, 6).map(project => (
                  <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none' }}>
                    <div className="task-item" style={{ marginBottom: '8px' }}>
                      <div className="task-title" style={{ color: '#1a73e8' }}>{project.name}</div>
                      <div className="task-meta">
                        <span className={`project-status status-${project.status}`}>{project.status}</span>
                        <span>{project.members?.length} members</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {projects.length > 6 && (
                  <Link to="/projects" style={{ color: '#1a73e8', fontSize: '14px', display: 'block', marginTop: '8px' }}>
                    View all {projects.length} projects →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
