import { saveAs } from 'file-saver'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiTrash2, FiAward, FiBarChart2, FiChevronDown, FiX } from 'react-icons/fi'
import { useState } from 'react'

function ResultDisplay({ predictions, onDelete }) {
  const [expandedResultId, setExpandedResultId] = useState(null)

  if (!predictions || predictions.length === 0) {
    return (
      <div className="text-center py-8 bg-base-200 rounded-lg">
        <p className="text-gray-500">No predictions available yet</p>
      </div>
    )
  }

  const openResultModal = (id) => {
    setExpandedResultId(id)
  }

  const closeResultModal = () => {
    setExpandedResultId(null)
  }

  const calculateTotalScore = (subject) => {
    const firstCA = Number(subject.firstCA) || 0
    const secondCA = Number(subject.secondCA) || 0
    const examScore = Number(subject.score) || 0
    return firstCA + secondCA + examScore
  }

  const getGrade = (score) => {
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    if (score >= 45) return 'D'
    if (score >= 40) return 'E'
    return 'F'
  }

  const getGradePoint = (score) => {
    if (score >= 70) return 5.0
    if (score >= 60) return 4.0
    if (score >= 50) return 3.0
    if (score >= 45) return 2.0
    if (score >= 40) return 1.0
    return 0.0
  }

  const calculateCreditUnits = () => {
    // Default credit unit value (could be customized based on actual subject data)
    return 3
  }

  const calculateOverallPerformance = (prediction) => {
    const subjectScores = Object.entries(prediction.subjects).map(([subject, scores]) => {
      const total = calculateTotalScore(scores)
      const creditUnits = calculateCreditUnits()
      const gradePoint = getGradePoint(total)
      const weightedPoints = gradePoint * creditUnits
      
      return {
        subject,
        firstCA: Number(scores.firstCA) || 0,
        secondCA: Number(scores.secondCA) || 0,
        examScore: Number(scores.score) || 0,
        total,
        creditUnits,
        gradePoint,
        weightedPoints
      }
    })

    const totalScores = subjectScores.map(s => s.total)
    const totalCreditUnits = subjectScores.reduce((sum, s) => sum + s.creditUnits, 0)
    const totalWeightedPoints = subjectScores.reduce((sum, s) => sum + s.weightedPoints, 0)
    
    // Calculate GPA for this semester
    const gpa = totalWeightedPoints / totalCreditUnits
    
    // For CGPA calculation, we would need previous semesters' data
    // For now, we'll assume this is the first semester or use a placeholder
    const cgpa = prediction.previousCGPA ? 
      ((prediction.previousCGPA * prediction.previousCreditUnits) + totalWeightedPoints) / 
      (prediction.previousCreditUnits + totalCreditUnits) : 
      gpa

    const average = totalScores.reduce((a, b) => a + b, 0) / totalScores.length

    return {
      average: average.toFixed(2),
      passed: totalScores.filter(score => score >= 40).length,
      failed: totalScores.filter(score => score < 40).length,
      highest: Math.max(...totalScores).toFixed(2),
      lowest: Math.min(...totalScores).toFixed(2),
      attendance: prediction.attendance || 0,
      predictedGrade: prediction.predictedGrade,
      subjectAnalysis: subjectScores,
      gpa: gpa.toFixed(2),
      cgpa: cgpa.toFixed(2),
      totalCreditUnits,
      totalWeightedPoints: totalWeightedPoints.toFixed(2),
      studentId: prediction.studentId,
      timestamp: new Date(prediction.timestamp).toLocaleDateString()
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 70) return 'text-success'
    if (score >= 50) return 'text-warning'
    if (score >= 40) return 'text-info'
    return 'text-error'
  }

  const getGPAColor = (gpa) => {
    if (gpa >= 4.5) return 'text-success'
    if (gpa >= 3.5) return 'text-primary'
    if (gpa >= 2.5) return 'text-warning'
    if (gpa >= 1.0) return 'text-info'
    return 'text-error'
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Department', 'Level', 'Previous CGPA', 'Previous Credit Units', 'GPA', 'CGPA', 'Predicted Grade', 'Attendance', ...Object.keys(predictions[0].subjects), 'Suggestions', 'Weaknesses', 'Timestamp'].join(','),
      ...predictions.map(p => {
        const performance = calculateOverallPerformance(p)
        return [
          p.studentName,
          p.studentId,
          p.department,
          p.level,
          p.previousCGPA || '',
          p.previousCreditUnits || '',
          performance.gpa,
          performance.cgpa,
          p.predictedGrade,
          p.attendance,
          ...Object.values(p.subjects),
          `"${p.suggestions.join('; ')}"`,
          `"${p.weaknesses.join('; ')}"`,
          p.timestamp
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `HUK_predictions_${new Date().toISOString()}.csv`)
  }

  const handleDownloadPDF = (prediction) => {
    const performance = calculateOverallPerformance(prediction)
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(20)
    doc.text('Student Performance Report', 105, 15, { align: 'center' })
    
    // Add student info
    doc.setFontSize(12)
    doc.text(`Name: ${prediction.studentName}`, 20, 30)
    doc.text(`ID: ${prediction.studentId}`, 20, 40)
    doc.text(`Department: ${prediction.department}`, 20, 50)
    doc.text(`Level: ${prediction.level}`, 20, 60)
    doc.text(`GPA: ${performance.gpa}`, 20, 70)
    doc.text(`CGPA: ${performance.cgpa}`, 110, 70)
    doc.text(`Predicted Grade: ${prediction.predictedGrade}`, 20, 80)
    
    // Add previous CGPA info if available
    if (prediction.previousCGPA) {
      doc.text(`Previous CGPA: ${prediction.previousCGPA}`, 110, 80)
      doc.text(`Previous Credit Units: ${prediction.previousCreditUnits}`, 110, 90)
    }
    
    // Add subject scores
    const tableData = performance.subjectAnalysis.map(subjectData => {
      return [
        subjectData.subject,
        subjectData.firstCA,
        subjectData.secondCA,
        subjectData.examScore,
        subjectData.total,
        getGrade(subjectData.total),
        subjectData.creditUnits,
        subjectData.gradePoint.toFixed(1),
        subjectData.weightedPoints.toFixed(1),
        subjectData.total >= 40 ? 'Pass' : 'Fail'
      ]
    })
    
    doc.autoTable({
      startY: 90,
      head: [['Subject', 'First CA', 'Second CA', 'Exam', 'Total', 'Grade', 'CU', 'GP', 'WP', 'Status']],
      body: tableData,
    })
    
    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10
    doc.text(`GPA: ${performance.gpa}`, 20, finalY)
    doc.text(`CGPA: ${performance.cgpa}`, 80, finalY)
    doc.text(`Total Credit Units: ${performance.totalCreditUnits}`, 140, finalY)
    
    // Add CGPA calculation explanation
    if (prediction.previousCGPA) {
      doc.text(`CGPA Calculation: ((${prediction.previousCGPA} × ${prediction.previousCreditUnits}) + ${performance.totalWeightedPoints}) ÷ (${prediction.previousCreditUnits} + ${performance.totalCreditUnits})`, 20, finalY + 10)
    }
    
    doc.save(`${prediction.studentName}_report.pdf`)
  }

  const currentPrediction = expandedResultId ? 
    predictions.find(p => p.id === expandedResultId) : null
  const currentPerformance = currentPrediction ? 
    calculateOverallPerformance(currentPrediction) : null

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={handleDownloadCSV}
          className="btn btn-ghost btn-sm gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {predictions.map(prediction => {
            const performance = calculateOverallPerformance(prediction)
            return (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card bg-base-100 shadow-lg"
              >
                <div className="card-body p-5">
                  {/* Student info header */}
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{prediction.studentName}</h3>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                        <p>ID: {prediction.studentId}</p>
                        <p>{prediction.department}</p>
                        <p>Level: {prediction.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownloadPDF(prediction)}
                        className="btn btn-ghost btn-sm"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(prediction.id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="bg-base-200 p-4 rounded-lg flex flex-col">
                      <span className="text-xs font-semibold opacity-70 mb-1">GPA</span>
                      <span className={`font-bold text-2xl ${getGPAColor(Number(performance.gpa))}`}>
                        {performance.gpa}
                      </span>
                    </div>
                    <div className="bg-base-200 p-4 rounded-lg flex flex-col">
                      <span className="text-xs font-semibold opacity-70 mb-1">CGPA</span>
                      <span className={`font-bold text-2xl ${getGPAColor(Number(performance.cgpa))}`}>
                        {performance.cgpa}
                      </span>
                      {prediction.previousCGPA && (
                        <span className="text-xs text-gray-500 mt-1">Previous: {prediction.previousCGPA}</span>
                      )}
                    </div>
                    <div className="bg-base-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold opacity-70">Subject Results</span>
                        <span className="badge badge-sm">{performance.passed + performance.failed} Total</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Pass Rate: </span>
                        <span className="font-bold">{((performance.passed/(performance.passed + performance.failed)) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{width: `${(performance.passed/(performance.passed + performance.failed)) * 100}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Passed: <span className="font-semibold text-success">{performance.passed}</span></span>
                        <span>Failed: <span className="font-semibold text-error">{performance.failed}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Subject summary table - for wider screens */}
                  <div className="overflow-x-auto mt-4 hidden md:block">
                    <table className="table table-xs table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>First CA</th>
                          <th>Others</th>
                          <th>Exam</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performance.subjectAnalysis.map(({ subject, firstCA, secondCA, examScore, total }) => (
                          <tr key={subject}>
                            <td className="font-medium">{subject}</td>
                            <td>{firstCA}</td>
                            <td>{secondCA}</td>
                            <td>{examScore}</td>
                            <td className={`font-semibold ${getPerformanceColor(total)}`}>
                              {total}%
                            </td>
                            <td className={`font-semibold ${getPerformanceColor(total)}`}>
                              {getGrade(total)}
                            </td>
                            <td>
                              <span className={`badge badge-sm ${total >= 40 ? 'badge-success' : 'badge-error'}`}>
                                {total >= 40 ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View Details Button */}
                  <button 
                    onClick={() => openResultModal(prediction.id)}
                    className="btn btn-primary btn-sm w-full mt-4 gap-2"
                  >
                    <span>View Detailed Analysis</span>
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Modal for Detailed Analysis */}
      {expandedResultId && currentPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-base-100 rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-base-100 p-4 border-b border-base-300 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold">
                  {currentPrediction.studentName} - Performance Analysis
                </h2>
                <p className="text-sm text-gray-500">{currentPrediction.department} - Level {currentPrediction.level} - ID: {currentPrediction.studentId}</p>
              </div>
              <button 
                onClick={closeResultModal}
                className="btn btn-ghost btn-sm text-error"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<FiBarChart2 />}
                  label="Average Score"
                  value={`${currentPerformance.average}%`}
                  className={getPerformanceColor(Number(currentPerformance.average))}
                />
                <StatCard
                  icon={<FiAward />}
                  label="Average Grade"
                  value={getGrade(Number(currentPerformance.average))}
                  className={getPerformanceColor(Number(currentPerformance.average))}
                />
                <StatCard
                  icon={<FiBarChart2 />}
                  label="GPA"
                  value={currentPerformance.gpa}
                  className={getGPAColor(Number(currentPerformance.gpa))}
                />
                <StatCard
                  icon={<FiBarChart2 />}
                  label="CGPA"
                  value={currentPerformance.cgpa}
                  className={getGPAColor(Number(currentPerformance.cgpa))}
                />
              </div>

              {/* Full-width Results Table */}
              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-0">
                  <div className="p-4 bg-base-200 border-b border-base-300">
                    <h3 className="font-semibold">Results Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>First CA</th>
                          <th>Others</th>
                          <th>Exam</th>
                          <th>Total</th>
                          <th>Grade</th>
                          <th>CU</th>
                          <th>GP</th>
                          <th>WP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPerformance.subjectAnalysis.map(({ subject, firstCA, secondCA, examScore, total, creditUnits, gradePoint, weightedPoints }) => (
                          <tr key={subject}>
                            <td className="font-medium">{subject}</td>
                            <td>{firstCA}</td>
                            <td>{secondCA}</td>
                            <td>{examScore}</td>
                            <td className={`font-semibold ${getPerformanceColor(total)}`}>
                              {total}%
                            </td>
                            <td className={`font-semibold ${getPerformanceColor(total)}`}>
                              {getGrade(total)}
                            </td>
                            <td>{creditUnits}</td>
                            <td>{gradePoint.toFixed(1)}</td>
                            <td>{weightedPoints.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="6" className="text-right font-semibold">Total:</td>
                          <td>{currentPerformance.totalCreditUnits}</td>
                          <td></td>
                          <td>{currentPerformance.totalWeightedPoints}</td>
                        </tr>
                        <tr>
                          <td colSpan="6" className="text-right font-semibold">GPA:</td>
                          <td colSpan="3" className={`font-bold ${getGPAColor(Number(currentPerformance.gpa))}`}>
                            {currentPerformance.gpa}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="6" className="text-right font-semibold">CGPA:</td>
                          <td colSpan="3" className={`font-bold ${getGPAColor(Number(currentPerformance.cgpa))}`}>
                            {currentPerformance.cgpa}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Two column layout for additional info */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* CGPA Calculation */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-0">
                    <div className="p-4 bg-base-200 border-b border-base-300">
                      <h3 className="font-semibold">CGPA Calculation</h3>
                    </div>
                    <div className="p-4">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr>
                            <th>Previous CGPA</th>
                            <th>Previous CU</th>
                            <th>Current GPA</th>
                            <th>Current CU</th>
                            <th>Final CGPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{currentPrediction.previousCGPA || 'N/A'}</td>
                            <td>{currentPrediction.previousCreditUnits || 'N/A'}</td>
                            <td>{currentPerformance.gpa}</td>
                            <td>{currentPerformance.totalCreditUnits}</td>
                            <td className={`font-bold ${getGPAColor(Number(currentPerformance.cgpa))}`}>
                              {currentPerformance.cgpa}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-3 p-2 bg-base-200 rounded-lg text-xs">
                        <p>
                          {currentPrediction.previousCGPA ? 
                            `Formula: ((${currentPrediction.previousCGPA} × ${currentPrediction.previousCreditUnits}) + ${currentPerformance.totalWeightedPoints}) ÷ (${currentPrediction.previousCreditUnits} + ${currentPerformance.totalCreditUnits})` : 
                            "First semester CGPA equals current GPA"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grading Scale */}
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-0">
                    <div className="p-4 bg-base-200 border-b border-base-300">
                      <h3 className="font-semibold">Grading Scale</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-success">A</span>
                          <span className="text-xs mt-1">70-100% (5.0)</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-success">B</span>
                          <span className="text-xs mt-1">60-69% (4.0)</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-warning">C</span>
                          <span className="text-xs mt-1">50-59% (3.0)</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-warning">D</span>
                          <span className="text-xs mt-1">45-49% (2.0)</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-info">E</span>
                          <span className="text-xs mt-1">40-44% (1.0)</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="badge badge-lg text-error">F</span>
                          <span className="text-xs mt-1">0-39% (0.0)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations and Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-0">
                    <div className="p-4 bg-base-200 border-b border-base-300">
                      <h3 className="font-semibold text-primary">Recommendations</h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2 text-sm">
                        {currentPrediction.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-primary">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-0">
                    <div className="p-4 bg-base-200 border-b border-base-300">
                      <h3 className="font-semibold text-error">Areas for Improvement</h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2 text-sm">
                        {currentPrediction.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="text-error">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-xs text-gray-500">
                  Generated on: {currentPerformance.timestamp}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDownloadPDF(currentPrediction)}
                    className="btn btn-primary gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download Report
                  </button>
                  <button
                    onClick={closeResultModal}
                    className="btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value, subtext, className = "" }) => (
  <div className="stat-box bg-base-200 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-primary">{icon}</span>}
      <p className="text-xs font-semibold opacity-70">{label}</p>
    </div>
    <p className={`font-mono text-lg font-bold ${className}`}>
      {value}
    </p>
    {subtext && (
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    )}
  </div>
)

export default ResultDisplay