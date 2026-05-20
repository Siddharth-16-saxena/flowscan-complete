'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, XCircle, Loader } from 'lucide-react'
import clsx from 'clsx'

type Status = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

interface FileUploadProps {
  onUpload?: (file: File, result: any) => void
  apiUrl?: string
}

export default function FileUpload({ onUpload, apiUrl = 'http://localhost:5000' }: FileUploadProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const uploadFile = useCallback(async (f: File) => {
    setStatus('uploading')
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 85))
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', f)

      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)

      const data = await res.json()
      setStatus('success')
      onUpload?.(f, data)
    } catch (err: any) {
      clearInterval(interval)
      setStatus('error')
      setError(err.message || 'Upload failed. Check your backend is running.')
    }
  }, [apiUrl, onUpload])

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setError('')
    void uploadFile(f)
  }, [uploadFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDragEnter: () => setStatus('dragging'),
    onDragLeave: () => setStatus('idle'),
  })

  const reset = () => {
    setStatus('idle')
    setFile(null)
    setError('')
    setProgress(0)
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'dragging' ? (
          <div
            {...getRootProps()}
            className={clsx(
              'relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300',
              isDragActive
                ? 'border-acid-300 bg-acid-300/5 acid-glow'
                : 'border-white/15 hover:border-white/25 hover:bg-white/2'
            )}
          >
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={clsx(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-all',
                  isDragActive ? 'bg-acid-300/20' : 'bg-white/5'
                )}>
                  <Upload size={28} className={isDragActive ? 'text-acid-300' : 'text-ink-300'} />
                </div>
                <div>
                  <p className="font-display font-700 text-white text-lg mb-1">
                    {isDragActive ? 'Drop it here' : 'Upload workflow data'}
                  </p>
                  <p className="text-ink-400 text-sm">
                    Drag & drop a <span className="text-acid-300 font-500">.csv</span> or{' '}
                    <span className="text-acid-300 font-500">.json</span> file, or{' '}
                    <span className="text-white underline decoration-dotted">browse</span>
                  </p>
                </div>
                <div className="text-xs text-ink-500 font-mono bg-ink-800 px-4 py-2 rounded-lg">
                  task_name · start_time · end_time · assigned_to
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : status === 'uploading' ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/10 p-10 text-center glass"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-frost-400/10 flex items-center justify-center">
                <Loader size={24} className="text-frost-400 animate-spin" />
              </div>
            </div>
            <p className="font-display font-700 text-white mb-1">Analyzing workflow...</p>
            <p className="text-ink-400 text-sm mb-6">{file?.name}</p>
            <div className="w-full bg-ink-800 rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full bg-gradient-to-r from-frost-400 to-acid-300"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-ink-500 mt-2 font-mono">{progress}%</p>
          </motion.div>
        ) : status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-acid-300/20 p-10 text-center bg-acid-300/5"
          >
            <div className="flex items-center justify-center mb-4">
              <CheckCircle size={40} className="text-acid-300" />
            </div>
            <p className="font-display font-700 text-white text-lg mb-1">Upload Successful!</p>
            <p className="text-ink-400 text-sm mb-2">{file?.name}</p>
            <p className="text-acid-300 text-sm mb-6">Workflow analysis complete. View results below.</p>
            <button
              onClick={reset}
              className="text-sm text-ink-400 hover:text-white underline decoration-dotted transition-colors"
            >
              Upload another file
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-ember-400/20 p-10 text-center bg-ember-400/5"
          >
            <div className="flex items-center justify-center mb-4">
              <XCircle size={40} className="text-ember-400" />
            </div>
            <p className="font-display font-700 text-white text-lg mb-1">Upload Failed</p>
            <p className="text-ink-400 text-sm mb-2">{error}</p>
            <button
              onClick={reset}
              className="mt-4 px-6 py-2 rounded-lg bg-ember-400/20 text-ember-400 text-sm font-500 hover:bg-ember-400/30 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sample data hint */}
      {(status === 'idle' || status === 'dragging') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-xl bg-ink-800/60 border border-white/5"
        >
          <p className="text-xs text-ink-500 font-mono mb-2">// sample CSV format</p>
          <pre className="text-xs text-ink-300 font-mono leading-relaxed overflow-x-auto">
{`task_name,start_time,end_time,assigned_to
Design,10:00,11:30,Alice
Development,11:30,15:00,Bob
Testing,15:30,18:00,Carol
Fix Bugs,18:30,20:00,Bob`}
          </pre>
        </motion.div>
      )}
    </div>
  )
}
