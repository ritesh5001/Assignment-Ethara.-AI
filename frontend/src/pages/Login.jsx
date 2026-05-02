import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        {loading && (
          <div className="render-notice">
            <span className="render-notice-icon">⏳</span>
            <div>
              <strong>Please wait a moment…</strong>
              <p>This project runs on Render's free tier. The server may take up to 30–60 seconds to wake up on the first request. Thank you for your patience!</p>
            </div>
          </div>
        )}
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#1a73e8' }}>Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
