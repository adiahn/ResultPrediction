import { saveAs } from 'file-saver'
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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

function ResultDisplay({ predictions }) {
  const handleDownload = () => {
    const csvContent = [
      // CSV Headers
      ['Student Name', 'Student ID', 'Department', 'Level', 'Predicted Grade', 'Attendance', ...Object.keys(predictions[0].subjects), 'Suggestions', 'Weaknesses', 'Timestamp'].join(','),
      // CSV Data
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

  const getRadarData = (prediction) => ({
    labels: Object.keys(prediction.subjects),
    datasets: [
      {
        label: prediction.studentName,
        data: Object.values(prediction.subjects),
        backgroundColor: 'rgba(0, 100, 0, 0.2)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1,
      },
    ],
  })

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Assessment Results</h2>
        <button
          onClick={handleDownload}
          className="btn btn-primary"
        >
          Download Results (CSV)
        </button>
      </div>

      <div className="grid gap-8">
        {predictions.map((prediction, index) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-2">{prediction.studentName}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">Student ID:</p>
                          <p className="opacity-70">{prediction.studentId}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Department:</p>
                          <p className="opacity-70">{prediction.department}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Level:</p>
                          <p className="opacity-70">{prediction.level}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Attendance:</p>
                          <p className="opacity-70">{prediction.attendance}%</p>
                        </div>
                      </div>
                    </div>
                    <div className={`badge badge-lg ${
                      prediction.predictedGrade === 'Distinction' ? 'badge-success' :
                      prediction.predictedGrade === 'Upper Credit' ? 'badge-info' :
                      prediction.predictedGrade === 'Lower Credit' ? 'badge-warning' :
                      prediction.predictedGrade === 'Pass' ? 'badge-secondary' :
                      'badge-error'
                    }`}>
                      {prediction.predictedGrade}
                    </div>
                  </div>

                  <div className="card bg-base-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg mb-3">Performance Analysis</h4>
                    <div className="space-y-4">
                      {prediction.suggestions.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-primary mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            {prediction.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-gray-700">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {prediction.weaknesses.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-primary mb-2">Areas for Improvement:</h5>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            {prediction.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-gray-700">{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-[400px]">
                  <Radar data={getRadarData(prediction)} options={radarOptions} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultDisplay