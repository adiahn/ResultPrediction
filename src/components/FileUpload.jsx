import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

function FileUpload({ onDataProcessed }) {
  const fileInput = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const processExcelData = (data) => {
    return data.map(row => ({
      studentName: row['Student Name'] || row['studentName'] || '',
      studentId: row['Student ID'] || row['studentId'] || '',
      department: row['Department'] || row['department'] || '',
      level: row['Level'] || row['level'] || '',
      attendance: Number(row['Attendance'] || row['attendance'] || 0),
      subjects: {
        'Use of English': {
          firstCA: Number(row['Use of English (First CA)'] || 0),
          secondCA: Number(row['Use of English (Second CA)'] || 0),
          score: Number(row['Use of English (Exam)'] || 0)
        },
        'Database Design': {
          firstCA: Number(row['Database Design (First CA)'] || 0),
          secondCA: Number(row['Database Design (Second CA)'] || 0),
          score: Number(row['Database Design (Exam)'] || 0)
        },
        'Frontend Development': {
          firstCA: Number(row['Frontend Development (First CA)'] || 0),
          secondCA: Number(row['Frontend Development (Second CA)'] || 0),
          score: Number(row['Frontend Development (Exam)'] || 0)
        },
        'Backend Development': {
          firstCA: Number(row['Backend Development (First CA)'] || 0),
          secondCA: Number(row['Backend Development (Second CA)'] || 0),
          score: Number(row['Backend Development (Exam)'] || 0)
        },
        'Computer Networking': {
          firstCA: Number(row['Computer Networking (First CA)'] || 0),
          secondCA: Number(row['Computer Networking (Second CA)'] || 0),
          score: Number(row['Computer Networking (Exam)'] || 0)
        },
        'Data Structures': {
          firstCA: Number(row['Data Structures (First CA)'] || 0),
          secondCA: Number(row['Data Structures (Second CA)'] || 0),
          score: Number(row['Data Structures (Exam)'] || 0)
        },
        'Algorithms': {
          firstCA: Number(row['Algorithms (First CA)'] || 0),
          secondCA: Number(row['Algorithms (Second CA)'] || 0),
          score: Number(row['Algorithms (Exam)'] || 0)
        },
        'Software Engineering': {
          firstCA: Number(row['Software Engineering (First CA)'] || 0),
          secondCA: Number(row['Software Engineering (Second CA)'] || 0),
          score: Number(row['Software Engineering (Exam)'] || 0)
        }
      }
    }))
  }

  const validateData = (data) => {
    return data.every(student => {
      // Check required fields
      if (!student.studentName || !student.studentId || !student.department || !student.level) {
        toast.error('Missing required student information')
        return false
      }

      if (student.attendance < 0 || student.attendance > 100) {
        toast.error('Invalid attendance percentage')
        return false
      }

      for (const subject of Object.values(student.subjects)) {
        if (
          subject.firstCA < 0 || subject.firstCA > 20 ||
          subject.secondCA < 0 || subject.secondCA > 20 ||
          subject.score < 0 || subject.score > 60
        ) {
          toast.error('Invalid score range detected')
          return false
        }
      }

      return true
    })
  }

  const handleFile = async (file) => {
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        toast.error('No data found in the Excel file')
        return
      }

      const processedData = processExcelData(jsonData)
      
      if (!validateData(processedData)) {
        return
      }

      // Process each student record
      processedData.forEach(studentData => {
        onDataProcessed(studentData)
      })

      toast.success(`Successfully processed ${processedData.length} student records`)
      if (fileInput.current) {
        fileInput.current.value = ''
      }
    } catch (error) {
      console.error('Excel processing error:', error)
      toast.error('Error processing Excel file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file?.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file?.type !== 'application/vnd.ms-excel') {
      toast.error('Please upload only Excel files')
      return
    }
    
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${isDragging ? 'border-primary' : 'hover:border-primary/50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInput}
          onChange={(e) => handleFile(e.target.files?.[0])}
          accept=".xlsx,.xls"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 text-primary">
              <svg
                className="h-full w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M24 14v6m0 0v6m0-6h6m-6 0h-6"
                />
              </svg>
            </div>
            <div className="text-sm">
              <span className="font-medium text-primary hover:text-primary/80">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              Excel files only (.xlsx, .xls)
            </p>
          </div>
        </label>
      </div>

      {/* Template Download Section */}
      <div className="bg-base-200 rounded-lg p-6">
        <h3 className="font-medium text-primary mb-4">Excel Template Format</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Required columns:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Student Name, Student ID, Department, Level, Attendance</li>
              <li>For each subject: (First CA), (Second CA), (Exam)</li>
              <li>Example: "Use of English (First CA)", "Use of English (Second CA)", "Use of English (Exam)"</li>
            </ul>
          </div>
          <button
            onClick={() => {/* Add template download logic */}}
            className="btn btn-outline btn-primary btn-sm gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileUpload