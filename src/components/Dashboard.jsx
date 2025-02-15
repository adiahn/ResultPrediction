import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import StudentForm from './StudentForm'
import FileUpload from './FileUpload'
import ResultDisplay from './ResultDisplay'

function Dashboard() {
  const { user, logout } = useAuth()
  const [predictions, setPredictions] = useState([])

  const handlePrediction = (studentData) => {
    const prediction = {
      ...studentData,
      predictedGrade: calculatePredictedGrade(studentData),
      suggestions: generateSuggestions(studentData),
      weaknesses: identifyWeaknesses(studentData),
      timestamp: new Date().toISOString()
    }
    
    setPredictions([prediction, ...predictions])
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

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content sticky top-0 z-50 shadow-lg rounded-lg p-5">
        <div className="flex-1">
          <span className="text-xl font-bold">HUK Polytechnic</span>
        </div>
        <div className="flex-none gap-2">
          <span className="text-sm">Welcome, {user.username}</span>
          <button onClick={logout} className="btn btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          Student Result Prediction System
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Manual Entry</h2>
              <StudentForm onSubmit={handlePrediction} />
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Excel Upload</h2>
              <FileUpload onDataProcessed={handlePrediction} />
            </div>
          </div>
        </div>

        {predictions.length > 0 && (
          <div className="mt-12">
            <ResultDisplay predictions={predictions} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard