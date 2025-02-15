import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Demo credentials - in production, this should be replaced with proper authentication
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      login({ username: credentials.username, role: 'admin' })
      navigate('/')
    } else {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-6">
            Hassan Usman Katsina Polytechnic
          </h2>
          <h3 className="text-xl text-center mb-8">Result Prediction System</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Username"
                className="input input-bordered"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login