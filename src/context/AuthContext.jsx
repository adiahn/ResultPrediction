import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

// Predefined users for demo purposes
const VALID_USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'lecturer', password: 'lecturer123' }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = async (credentials) => {
    // Check if credentials match any valid user
    const validUser = VALID_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    )

    if (!validUser) {
      throw new Error('Invalid credentials')
    }

    // Create user object without password
    const userObj = {
      username: validUser.username,
      role: validUser.username === 'admin' ? 'admin' : 'lecturer'
    }

    setUser(userObj)
    return userObj
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)