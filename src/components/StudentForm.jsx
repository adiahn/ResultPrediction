import { useState } from 'react'
import toast from 'react-hot-toast'

const SUBJECTS = [
  'Use of English',
  'Databse Design',
  'Frontend Development',
  'Backend Development',
  'Computer Networking',
  'Backend Development',
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
    
    // Calculate final scores and validate
    const processedSubjects = {}
    let isValid = true

    Object.entries(formData.subjects).forEach(([subject, scores]) => {
      const total = (scores.firstCA || 0) + (scores.secondCA || 0) + (scores.score || 0)
      if (total > 100) {
        toast.error(`Total score for ${subject} cannot exceed 100`)
        isValid = false
      }
      processedSubjects[subject] = total
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Student Name</span>
          </label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="w-[10vw] h-[5vh] text-[14px] input border-b border-gray-300 focus:outline-none focus:border-primary focus:ring-0"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Student ID</span>
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-[10vw] h-[5vh] text-[14px] input border-b border-gray-300 focus:outline-none focus:border-primary focus:ring-0"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Department</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-[10vw] h-[5vh] text-[14px] input border-b border-gray-300 focus:outline-none focus:border-primary focus:ring-0"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Level</span>
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="select select-bordered focus:select-primary"
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
          <label className="label">
            <span className="label-text font-medium">Attendance (%)</span>
          </label>
          <input
            type="number"
            name="attendance"
            value={formData.attendance}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-[10vw] h-[5vh] text-[14px] input border-b border-gray-300 focus:outline-none focus:border-primary focus:ring-0"
            required
          />
        </div>
      </div>

      <div className="divider text-lg font-semibold">Subject Scores</div>

      <div className="grid gap-8">
        {SUBJECTS.map(subject => (
          <div key={subject} className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-primary">{subject}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First CA (20%)</span>
                  </label>
                  <input
                    type="number"
                    name={`subject-${subject}-firstCA`}
                    value={formData.subjects[subject].firstCA}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    className="w-[7vw] bg-transparent border-white h-[6vh] input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Second CA (20%)</span>
                  </label>
                  <input
                    type="number"
                    name={`subject-${subject}-secondCA`}
                    value={formData.subjects[subject].secondCA}
                    onChange={handleChange}
                    min="0"
                    max="20"
                    className="w-[7vw] bg-transparent border-white h-[6vh] input input-bordered focus:input-primary"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Exam Score (60%)</span>
                  </label>
                  <input
                    type="number"
                    name={`subject-${subject}-score`}
                    value={formData.subjects[subject].score}
                    onChange={handleChange}
                    min="0"
                    max="60"
                    className="w-[7vw] bg-transparent border-white h-[6vh] input input-bordered focus:input-primary"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full max-w-md mx-auto mt-8"
      >
        Submit Assessment
      </button>
    </form>
  )
}

export default StudentForm