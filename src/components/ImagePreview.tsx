import { useState, useEffect } from 'react';

interface ImagePreviewProps {
  file: File | null;
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) {
    return null;
  }

  return (
    <div className="w-full">
      <img src={preview} alt="Preview" className="max-w-[200px] h-auto rounded-md" />
    </div>
  );
}
