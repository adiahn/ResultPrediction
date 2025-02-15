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
import { FiDownload, FiTrash2, FiAward, FiBarChart2, FiBook, FiCalendar } from 'react-icons/fi'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function ResultDisplay({ predictions, onDelete }) {
  const calculateTotalScore = (subject) => {
    return subject.firstCA + subject.secondCA + subject.score
  }

  const calculateOverallPerformance = (prediction) => {
    const totalScores = Object.values(prediction.subjects).map(calculateTotalScore)
    const average = totalScores.reduce((a, b) => a + b, 0) / totalScores.length
    return {
      average: average.toFixed(2),
      passed: totalScores.filter(score => score >= 50).length,
      failed: totalScores.filter(score => score < 50).length,
      highest: Math.max(...totalScores).toFixed(2),
      lowest: Math.min(...totalScores).toFixed(2)
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
      data: Object.values(prediction.subjects).map(calculateTotalScore),
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiBarChart2 className="text-primary w-5 h-5" />
          <h2 className="text-xl font-bold text-primary">Assessment Results</h2>
          <span className="badge badge-primary badge-sm">{predictions.length}</span>
        </div>
        {predictions.length > 0 && (
          <button
            onClick={handleDownloadCSV}
            className="btn btn-outline btn-sm gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export All
          </button>
        )}
      </div>

      <AnimatePresence>
        {predictions.map((prediction) => {
          const performance = calculateOverallPerformance(prediction)
          
          return (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="card-body p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold">{prediction.studentName}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <FiBook className="w-4 h-4" />
                        {prediction.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {prediction.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
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

                {/* Performance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <StatCard
                    icon={<FiAward />}
                    label="Average Score"
                    value={`${performance.average}%`}
                    className={getPerformanceColor(performance.average)}
                  />
                  <StatCard
                    label="Passed Subjects"
                    value={performance.passed}
                    className="text-success"
                  />
                  <StatCard
                    label="Failed Subjects"
                    value={performance.failed}
                    className="text-error"
                  />
                  <StatCard
                    label="Highest Score"
                    value={`${performance.highest}%`}
                  />
                  <StatCard
                    label="Lowest Score"
                    value={`${performance.lowest}%`}
                  />
                </div>

                {/* Chart and Table Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px] bg-base-200 rounded-lg p-4">
                    <Radar data={getRadarData(prediction)} options={radarOptions} />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>First CA</th>
                          <th>Second CA</th>
                          <th>Exam</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(prediction.subjects).map(([subject, data]) => {
                          const total = calculateTotalScore(data)
                          return (
                            <tr key={subject}>
                              <td className="font-medium">{subject}</td>
                              <td>{data.firstCA}</td>
                              <td>{data.secondCA}</td>
                              <td>{data.score}</td>
                              <td className={`font-semibold ${getPerformanceColor(total)}`}>
                                {total}%
                              </td>
                              <td>
                                <span className={`badge badge-sm ${total >= 50 ? 'badge-success' : 'badge-error'}`}>
                                  {total >= 50 ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Suggestions and Weaknesses */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-primary">Suggestions</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {prediction.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-error">Areas for Improvement</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {prediction.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

const StatCard = ({ icon, label, value, className = "" }) => (
  <div className="stat-box bg-base-200 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-primary">{icon}</span>}
      <p className="text-xs font-semibold opacity-70">{label}</p>
    </div>
    <p className={`font-mono text-lg font-bold ${className}`}>
      {value}
    </p>
  </div>
)

export default ResultDisplay