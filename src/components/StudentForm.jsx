import { useState } from 'react'
import toast from 'react-hot-toast'

const SUBJECTS = [
  'Use of English',
  'Database Design',
  'Frontend Development',
  'Data Structures',
  'Algorithms',
  'Software Engineering',
]

function StudentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    department: '',
    level: '',
    attendance: '',
    subjects: SUBJECTS.reduce((acc, subject) => ({
      ...acc,
      [subject]: {
        firstCA: '',
        secondCA: '',
        score: ''
      }
    }), {})
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('subject-')) {
      const [_, subject, type] = name.split('-')
      setFormData(prev => ({
        ...prev,
        subjects: {
          ...prev.subjects,
          [subject]: {
            ...prev.subjects[subject],
            [type]: Number(value)
          }
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'studentName' || name === 'studentId' || name === 'department' || name === 'level' 
          ? value 
          : Number(value)
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const processedSubjects = {}
    let isValid = true

    Object.entries(formData.subjects).forEach(([subject, scores]) => {
      const firstCA = Number(scores.firstCA) || 0
      const secondCA = Number(scores.secondCA) || 0
      const examScore = Number(scores.score) || 0
      const total = firstCA + secondCA + examScore
      
      if (total > 100) {
        toast.error(`Total score for ${subject} cannot exceed 100`)
        isValid = false
      }
      processedSubjects[subject] = {
        firstCA,
        secondCA,
        score: examScore
      }
    })

    if (!isValid) return

    if (!formData.studentName || !formData.studentId || !formData.department || !formData.level) {
      toast.error('Please fill in all required fields')
      return
    }

    const submissionData = {
      ...formData,
      subjects: processedSubjects
    }

    onSubmit(submissionData)
    toast.success('Student data submitted successfully')
    
    // Reset form
    setFormData({
      studentName: '',
      studentId: '',
      department: '',
      level: '',
      attendance: '',
      subjects: SUBJECTS.reduce((acc, subject) => ({
        ...acc,
        [subject]: {
          firstCA: '',
          secondCA: '',
          score: ''
        }
      }), {})
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Student Info Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <h3 className="card-title text-primary text-lg mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="input input-bordered input-sm focus:input-primary bg-gray-50"
                placeholder="Enter student name"
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Student ID</span>
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="input input-bordered input-sm focus:input-primary bg-gray-50 font-mono"
                placeholder="Enter ID number"
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Department</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="select select-bordered select-sm focus:select-primary bg-gray-50"
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Level</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="select select-bordered select-sm focus:select-primary bg-gray-50"
                required
              >
                <option value="">Select Level</option>
                <option value="ND1">ND1</option>
                <option value="ND2">ND2</option>
                <option value="HND1">HND1</option>
                <option value="HND2">HND2</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium">Attendance (%)</span>
              </label>
              <input
                type="number"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                min="0"
                max="100"
                className="input input-bordered input-sm focus:input-primary bg-gray-50"
                placeholder="Enter attendance %"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <h3 className="card-title text-primary text-lg mb-4">Subject Scores</h3>
          <div className="grid gap-6">
            {SUBJECTS.map(subject => (
              <div key={subject} className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-  gray-700">{subject}</h4>
                  <div className="badge badge-primary badge-outline">
                    Total: {
                      (formData.subjects[subject].firstCA || 0) + 
                      (formData.subjects[subject].secondCA || 0) + 
                      (formData.subjects[subject].score || 0)
                    }%
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ScoreInput
                    label="First CA (20%)"
                    name={`subject-${subject}-firstCA`}
                    value={formData.subjects[subject].firstCA}
                    onChange={handleChange}
                    max={20}
                  />
                  <ScoreInput
                    label="Others (20%)"
                    name={`subject-${subject}-secondCA`}
                    value={formData.subjects[subject].secondCA}
                    onChange={handleChange}
                    max={20}
                  />
                  <ScoreInput
                    label="Exam Score (60%)"
                    name={`subject-${subject}-score`}
                    value={formData.subjects[subject].score}
                    onChange={handleChange}
                    max={60}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full max-w-xs mx-auto"
      >
        Submit Assessment
      </button>
    </form>
  )
}

const ScoreInput = ({ label, name, value, onChange, max }) => (
  <div className="form-control">
    <label className="label py-0.5">
      <span className="label-text text-xs font-medium text-gray-600">{label}</span>
    </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      min="0"
      max={max}
      className="input input-bordered input-sm focus:input-primary bg-white"
      required
    />
  </div>
)

export default StudentForm