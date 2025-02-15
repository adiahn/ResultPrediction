import { useRef } from 'react'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

function FileUpload({ onDataProcessed }) {
  const fileInput = useRef(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)

        // Validate data format
        const isValidData = data.every(row => 
          row.studentName && 
          row.studentId && 
          !isNaN(row.attendance) && 
          !isNaN(row.assignments) && 
          !isNaN(row.midtermScore) && 
          !isNaN(row.classParticipation)
        )

        if (!isValidData) {
          toast.error('Invalid data format in Excel file')
          return
        }

        // Process each row
        data.forEach(row => {
          onDataProcessed(row)
        })

        toast.success(`Successfully processed ${data.length} student records`)
        fileInput.current.value = ''
      } catch (error) {
        toast.error('Error processing file')
        console.error(error)
      }
    }

    reader.readAsBinaryString(file)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileUpload}
          accept=".xlsx,.xls"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-primary hover:text-primary/80"
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M24 14v6m0 0v6m0-6h6m-6 0h-6"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary">
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

      <div className="bg-secondary rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-2">Excel Format Requirements:</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Column headers: studentName, studentId, attendance, assignments, midtermScore, classParticipation</li>
          <li>Numeric values should be percentages (0-100)</li>
          <li>All fields are required</li>
        </ul>
      </div>
    </div>
  )
}

export default FileUpload