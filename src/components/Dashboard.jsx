import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StudentForm from './StudentForm'
import FileUpload from './FileUpload'
import ResultDisplay from './ResultDisplay'
import logo from '../assets/logo.jpeg'


function Dashboard() {
  const { user, logout } = useAuth()
  const [predictions, setPredictions] = useState([])
  const [activeTab, setActiveTab] = useState('manual') // 'manual' or 'excel'

  // Load predictions from localStorage on component mount
  useEffect(() => {
    const savedPredictions = localStorage.getItem(`predictions_${user.username}`)
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions))
    }
  }, [user.username])

  // Save predictions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`predictions_${user.username}`, JSON.stringify(predictions))
  }, [predictions, user.username])

  const handlePrediction = (studentData) => {
    const prediction = {
      ...studentData,
      predictedGrade: calculatePredictedGrade(studentData),
      suggestions: generateSuggestions(studentData),
      weaknesses: identifyWeaknesses(studentData),
      timestamp: new Date().toISOString(),
      id: Date.now() // Add unique ID for each prediction
    }
    
    setPredictions(prev => [prediction, ...prev])
  }

  const calculatePredictedGrade = (data) => {
    const subjectScores = Object.values(data.subjects)
    const averageScore = subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length
    
    if (averageScore >= 75) return 'Distinction'
    if (averageScore >= 65) return 'Upper Credit'
    if (averageScore >= 50) return 'Lower Credit'
    if (averageScore >= 45) return 'Pass'
    return 'Fail'
  }

  const generateSuggestions = (data) => {
    const suggestions = []
    const weakSubjects = Object.entries(data.subjects)
      .filter(([_, score]) => score < 50)
      .map(([subject]) => subject)

    if (weakSubjects.length > 0) {
      suggestions.push(`Focus on improving performance in: ${weakSubjects.join(', ')}`)
      suggestions.push('Consider seeking additional help through tutorials or study groups')
      suggestions.push('Develop a structured study plan focusing on weak areas')
    }

    if (data.attendance < 75) {
      suggestions.push('Improve class attendance to better understand course material')
      suggestions.push('Maintain a minimum of 75% attendance for optimal learning')
    }

    if (data.attendance >= 75 && weakSubjects.length === 0) {
      suggestions.push('Maintain current performance level')
      suggestions.push('Consider peer tutoring to help other students')
    }

    return suggestions
  }

  const identifyWeaknesses = (data) => {
    const weaknesses = []
    Object.entries(data.subjects)
      .filter(([_, score]) => score < 50)
      .forEach(([subject]) => {
        weaknesses.push(`Low performance in ${subject} - requires immediate attention`)
        weaknesses.push(`Consider additional practice exercises in ${subject}`)
      })

    if (data.attendance < 75) {
      weaknesses.push('Low attendance rate affecting overall performance. Student should improve attendance')
      weaknesses.push('Missing important class discussions and practical sessions. Attend all classes')
    }

    return weaknesses
  }

  // Add delete prediction functionality
  const handleDeletePrediction = (predictionId) => {
    setPredictions(prev => prev.filter(p => p.id !== predictionId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Navbar */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex-1 flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
              <img 
                src={logo}
                alt="HUK Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0xMiAwYzYuNjIzIDAgMTIgNS4zNzcgMTIgMTJzLTUuMzc3IDEyLTEyIDEyLTEyLTUuMzc3LTEyLTEyIDUuMzc3LTEyIDEyLTEyem0wIDFjNi4wNzEgMCAxMSA0LjkyOSAxMSAxMXMtNC45MjkgMTEtMTEgMTEtMTEtNC45MjktMTEtMTEgNC45MjktMTEgMTEtMTF6bS0uMDUgMTcuMDFjLS41NTIgMC0xIC40NDgtMSAxczQ0OCAxIDEgMSAxLS40NDggMS0xLS40NDgtMS0xLTF6bTAtMTRjLS41NTIgMC0xIC40NDgtMSAxdjhoMmMuNTUyIDAgMS0uNDQ4IDEtMXYtOGMwLS41NTItLjQ0OC0xLTEtMXoiLz48L3N2Zz4='
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-xl font-bold text-primary truncate">HUK Polytechnic</span>
              <span className="text-xs text-gray-600 hidden sm:block">Result Prediction System</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="badge badge-primary badge-outline text-xs sm:text-sm">
              {user.username}
            </div>
            <button 
              onClick={logout} 
              className="btn btn-ghost btn-sm gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Student Result Prediction System
          </h1>
          <p className="text-gray-600">Enter student data to generate performance predictions</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="tabs tabs-boxed justify-center">
              <button 
                className={`tab ${activeTab === 'manual' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                Manual Entry
              </button>
              <button 
                className={`tab ${activeTab === 'excel' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('excel')}
              >
                Excel Upload
              </button>
            </div>
            
            {activeTab === 'manual' ? (
              <StudentForm onSubmit={handlePrediction} />
            ) : (
              <FileUpload onDataProcessed={handlePrediction} />
            )}
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary">Recent Predictions</h2>
            <ResultDisplay 
              predictions={predictions} 
              onDelete={handleDeletePrediction}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard