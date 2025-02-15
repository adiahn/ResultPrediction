import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FiUser, FiLock } from 'react-icons/fi'

function Login() {
  const { login } = useAuth()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(credentials)
    } catch (error) {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-base-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md bg-base-100 shadow-xl"
      >
        <div className="card-body p-8">
          {/* School Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 mb-4 bg-base-200 rounded-full flex items-center justify-center">
              {/* Replace with actual logo */}
              <img 
                src="/huk-logo.png" 
                alt="HUK Logo" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0xMiAwYzYuNjIzIDAgMTIgNS4zNzcgMTIgMTJzLTUuMzc3IDEyLTEyIDEyLTEyLTUuMzc3LTEyLTEyIDUuMzc3LTEyIDEyLTEyem0wIDFjNi4wNzEgMCAxMSA0LjkyOSAxMSAxMXMtNC45MjkgMTEtMTEgMTEtMTEtNC45MjktMTEtMTEgNC45MjktMTEgMTEtMTF6bS0uMDUgMTcuMDFjLS41NTIgMC0xIC40NDgtMSAxczQ0OCAxIDEgMSAxLS40NDggMS0xLS40NDgtMS0xLTF6bTAtMTRjLS41NTIgMC0xIC40NDgtMSAxdjhoMmMuNTUyIDAgMS0uNDQ4IDEtMXYtOGMwLS41NTItLjQ0OC0xLTEtMXoiLz48L3N2Zz4='
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-center text-primary">
              Hassan Usman Katsina Polytechnic
            </h2>
            <div className="divider my-2">Result Prediction System</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiUser />
                </span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="input input-bordered w-full pl-10"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiLock />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full pl-10"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
            >
              Login to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} HUK Polytechnic. All rights reserved.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login