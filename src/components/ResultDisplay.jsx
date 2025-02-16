import { saveAs } from 'file-saver'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiTrash2, FiAward, FiBarChart2, FiBook, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useState } from 'react'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function ResultDisplay({ predictions, onDelete }) {
  const [expandedResults, setExpandedResults] = useState({})

  if (!predictions || predictions.length === 0) {
    return (
      <div className="text-center py-8 bg-base-200 rounded-lg">
        <p className="text-gray-500">No predictions available yet</p>
      </div>
    )
  }

  const toggleExpand = (id) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const calculateTotalScore = (subject) => {
    const firstCA = Number(subject.firstCA) || 0
    const secondCA = Number(subject.secondCA) || 0
    const examScore = Number(subject.score) || 0
    return firstCA + secondCA + examScore
  }

  const calculateOverallPerformance = (prediction) => {
    console.log('Calculating performance for prediction:', prediction) // Debugging log
    const subjectScores = Object.entries(prediction.subjects).map(([subject, scores]) => ({
      subject,
      firstCA: Number(scores.firstCA) || 0,
      secondCA: Number(scores.secondCA) || 0,
      examScore: Number(scores.score) || 0,
      total: calculateTotalScore(scores)
    }))

    const totalScores = subjectScores.map(s => s.total)
    const average = totalScores.reduce((a, b) => a + b, 0) / totalScores.length

    console.log('Subject scores:', subjectScores) // Debugging log
    console.log('Total scores:', totalScores) // Debugging log
    console.log('Average score:', average) // Debugging log

    return {
      average: average.toFixed(2),
      passed: totalScores.filter(score => score >= 50).length,
      failed: totalScores.filter(score => score < 50).length,
      highest: Math.max(...totalScores).toFixed(2),
      lowest: Math.min(...totalScores).toFixed(2),
      attendance: prediction.attendance || 0,
      predictedGrade: prediction.predictedGrade,
      subjectAnalysis: subjectScores,
      studentId: prediction.studentId,
      timestamp: new Date(prediction.timestamp).toLocaleDateString()
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 75) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-error'
  }

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Student Name', 'Student ID', 'Department', 'Level', 'Predicted Grade', 'Attendance', ...Object.keys(predictions[0].subjects), 'Suggestions', 'Weaknesses', 'Timestamp'].join(','),
      ...predictions.map(p => [
        p.studentName,
        p.studentId,
        p.department,
        p.level,
        p.predictedGrade,
        p.attendance,
        ...Object.values(p.subjects),
        `"${p.suggestions.join('; ')}"`,
        `"${p.weaknesses.join('; ')}"`,
        p.timestamp
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `HUK_predictions_${new Date().toISOString()}.csv`)
  }

  const handleDownloadPDF = (prediction) => {
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
    doc.text(`Predicted Grade: ${prediction.predictedGrade}`, 20, 70)
    
    // Add subject scores
    const tableData = Object.entries(prediction.subjects).map(([subject, data]) => [
      subject,
      data.firstCA,
      data.secondCA,
      data.score,
      data.firstCA + data.secondCA + data.score,
      (data.firstCA + data.secondCA + data.score) >= 50 ? 'Pass' : 'Fail'
    ])
    
    doc.autoTable({
      startY: 80,
      head: [['Subject', 'First CA', 'Second CA', 'Exam', 'Total', 'Status']],
      body: tableData,
    })
    
    doc.save(`${prediction.studentName}_report.pdf`)
  }

  const getRadarData = (prediction) => ({
    labels: Object.keys(prediction.subjects),
    datasets: [{
      label: 'Subject Scores',
      data: Object.values(prediction.subjects).map(subject => 
        Number(subject.firstCA) + Number(subject.secondCA) + Number(subject.score)
      ),
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(34, 197, 94)',
    }]
  })

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      }
    },
    plugins: {
      legend: { position: 'top' },
    },
    maintainAspectRatio: false,
  }

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

      <AnimatePresence>
        {predictions.map(prediction => {
          const performance = calculateOverallPerformance(prediction)
          const isExpanded = expandedResults[prediction.id]

          return (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card bg-base-100 shadow-lg"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{prediction.studentName}</h3>
                    <p className="text-sm text-gray-500">ID: {prediction.studentId}</p>
                    <p className="text-sm text-gray-500">{prediction.department} - Level {prediction.level}</p>
                  </div>
                  <button
                    onClick={() => onDelete(prediction.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <StatCard
                    icon={<FiBarChart2 />}
                    label="Average Score"
                    value={`${performance.average}%`}
                    className={getPerformanceColor(Number(performance.average))}
                  />
                  <StatCard
                    icon={<FiAward />}
                    label="Subjects Status"
                    value={`${performance.passed}/${performance.passed + performance.failed}`}
                    subtext={`${((performance.passed/(performance.passed + performance.failed)) * 100).toFixed(1)}% Pass Rate`}
                  />
                  <StatCard
                    icon={<FiBook />}
                    label="Attendance"
                    value={`${prediction.attendance}%`}
                    className={prediction.attendance >= 75 ? 'text-success' : 'text-warning'}
                  />
                  <StatCard
                    icon={<FiCalendar />}
                    label="Predicted Grade"
                    value={prediction.predictedGrade}
                    className="text-primary"
                  />
                </div>

                {/* Expand/Collapse Button */}
                <button 
                  onClick={() => toggleExpand(prediction.id)}
                  className="btn btn-ghost btn-sm w-full mt-4 gap-2 hover:bg-base-200"
                >
                  {isExpanded ? (
                    <>
                      <span>Show Less</span>
                      <FiChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>View Detailed Analysis</span>
                      <FiChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Detailed Analysis */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-6"
                  >
                    <div className="divider">Performance Analysis</div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="h-[300px] bg-base-200 rounded-lg p-4">
                        <Radar data={getRadarData(prediction)} options={radarOptions} />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>First CA (20%)</th>
                              <th>Second CA (20%)</th>
                              <th>Exam (60%)</th>
                              <th>Total</th>
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
                                <td>
                                  <span className={`badge badge-sm ${total >= 50 ? 'badge-success' : 'badge-error'}`}>
                                    {total >= 50 ? 'Pass' : 'Fail'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Additional Analysis */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-primary">Recommendations</h4>
                        <ul className="space-y-2 text-sm">
                          {prediction.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-primary">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-error">Areas for Improvement</h4>
                        <ul className="space-y-2 text-sm">
                          {prediction.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-error">•</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-right">
                      Generated on: {performance.timestamp}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
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