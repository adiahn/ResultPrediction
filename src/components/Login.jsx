import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FiUser, FiLock } from 'react-icons/fi'
import logo from '../assets/logo.jpeg'

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
      // Login successful - navigation is handled by PrivateRoute
    } catch (error) {
      toast.error('Invalid username or password')
    }
  }

  return (
    <div className="flex justify-center items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md bg-base-100 shadow-xl mx-4 sm:mx-0"
      >
          <div className="flex flex-col items-center mb-2 sm:mb-2">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4 rounded-full flex items-center justify-center">
              <img 
                src={logo} 
                alt="HUK Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain transform hover:scale-105 transition-transform rounded-full"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0xMiAwYzYuNjIzIDAgMTIgNS4zNzcgMTIgMTJzLTUuMzc3IDEyLTEyIDEyLTEyLTUuMzc3LTEyLTEyIDUuMzc3LTEyIDEyLTEyem0wIDFjNi4wNzEgMCAxMSA0LjkyOSAxMSAxMXMtNC45MjkgMTEtMTEgMTEtMTEtNC45MjktMTEtMTEgNC45MjktMTEgMTEtMTF6bS0uMDUgMTcuMDFjLS41NTIgMC0xIC40NDgtMSAxczQ0OCAxIDEgMSAxLS40NDggMS0xLS40NDgtMS0xLTF6bTAtMTRjLS41NTIgMC0xIC40NDgtMSAxdjhoMmMuNTUyIDAgMS0uNDQ4IDEtMXYtOGMwLS41NTItLjQ0OC0xLTEtMXoiLz48L3N2Zz4='
                }}
              />
            </div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl sm:text-2xl font-bold text-center text-primary px-2"
            >
              Hassan Usman Katsina Polytechnic
            </motion.h2>
            <div className="divider my-2 px-4">
              <span className="text-sm sm:text-base text-gray-600">Result Processing System</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-primary">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="input input-bordered w-full pl-10 h-10 sm:h-12 text-sm sm:text-base focus:input-primary"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-hover:text-primary">
                  <FiLock className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full pl-10 h-10 sm:h-12 text-sm sm:text-base focus:input-primary"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="btn btn-primary w-full h-10 sm:h-12 mt-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login to Dashboard
            </motion.button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
            <p>© {new Date().getFullYear()} HUK Polytechnic. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login