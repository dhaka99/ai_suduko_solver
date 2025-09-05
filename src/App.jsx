import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [apiUrl, setApiUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resultJson, setResultJson] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      setPreviewUrl('')
      return
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file')
      setSelectedFile(null)
      setPreviewUrl('')
      return
    }
    setErrorMessage('')
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  function clearSelection() {
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSolve() {
    setErrorMessage('')
    setResultJson(null)

    if (!apiUrl) {
      setErrorMessage('Please enter the API URL')
      return
    }
    if (!selectedFile) {
      setErrorMessage('Please choose a Sudoku image to upload')
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        let serverMessage = ''
        try {
          if (contentType.includes('application/json')) {
            const json = await response.json()
            serverMessage = JSON.stringify(json, null, 2)
          } else {
            serverMessage = await response.text()
          }
        } catch (e) {
          serverMessage = 'Failed to read error response.'
        }
        throw new Error(`Request failed (${response.status}): ${serverMessage}`)
      }

      if (contentType.includes('application/json')) {
        const json = await response.json()
        setResultJson(json)
      } else {
        const text = await response.text()
        setResultJson({ raw: text })
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  function renderSolutionGrid(json) {
    const grid = json?.solution || json?.grid || json?.result
    if (!Array.isArray(grid)) return null

    return (
      <div className="solution-grid" role="table" aria-label="Sudoku solution grid">
        {grid.map((row, rowIndex) => (
          <div className="solution-row" role="row" key={`row-${rowIndex}`}>
            {Array.isArray(row) ? row : String(row).split('')}
            {Array.isArray(row)
              ? row.map((cell, cellIndex) => (
                  <div className="solution-cell" role="cell" key={`cell-${rowIndex}-${cellIndex}`}>
                    {cell}
                  </div>
                ))
              : null}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Sudoku Solver</h1>
      <p className="subtitle">Upload a Sudoku image and call your solver API.</p>

      <div className="panel">
        <label htmlFor="apiUrl" className="label">API URL</label>
        <input
          id="apiUrl"
          type="url"
          className="input"
          placeholder="https://your-api.example.com/solve"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          autoComplete="off"
        />

        <div className="file-row">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {selectedFile && (
            <button className="secondary" onClick={clearSelection} disabled={isLoading}>
              Clear
            </button>
          )}
        </div>

        <button className="primary" onClick={handleSolve} disabled={isLoading || !selectedFile || !apiUrl}>
          {isLoading ? 'Solving…' : 'Solve'}
        </button>
      </div>

      {previewUrl && (
        <div className="panel">
          <div className="preview">
            <img src={previewUrl} alt="Selected Sudoku preview" />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="panel error" role="alert">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {resultJson && (
        <div className="panel results">
          <h2>Result</h2>
          {renderSolutionGrid(resultJson)}
          <details>
            <summary>Raw response</summary>
            <pre className="code-block">{JSON.stringify(resultJson, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default App
