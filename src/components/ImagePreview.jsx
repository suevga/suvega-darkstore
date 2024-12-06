import { useState, useEffect } from 'react'

export function ImagePreview({ file }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!preview) {
    return null
  }

  return (
    <div className="mt-2">
      <img
        src={preview}
        alt="Preview"
        className="max-w-[200px] h-auto rounded-md"
      />
    </div>
  )
}