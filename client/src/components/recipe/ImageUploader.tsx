import { useRef, useState, useEffect } from 'react';
import { uploadFile } from '../../api/client';
import type { ImageUploadResponse } from '../../../../shared/types';
import Spinner from '../ui/Spinner';
import CropModal from './CropModal';

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function openCrop(file: File) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setOriginalFile(file);
    setCropSrc(url);
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    setError(null);
    openCrop(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleCropApply(blob: Blob) {
    setCropSrc(null);
    setUploading(true);
    setError(null);
    try {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const res = await uploadFile<ImageUploadResponse>('/images/upload', file);
      onChange(res.url);
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setCropSrc(null);
  }

  function handleEditCrop() {
    if (originalFile) {
      openCrop(originalFile);
    } else {
      // No original file in memory (e.g. editing a saved recipe) — let user re-select
      inputRef.current?.click();
    }
  }

  function handleRemove() {
    onChange(null);
    setOriginalFile(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Photo</span>

        {value ? (
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/5">
            <img src={value} alt="Recipe" className="w-full h-full object-cover" />

            {uploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Spinner />
              </div>
            )}

            {!uploading && (
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={handleEditCrop}
                  className="h-8 px-2.5 rounded-full bg-black/50 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-black/70 transition-colors"
                  aria-label="Edit crop"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit crop
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Remove photo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploading && inputRef.current?.click()}
            className="relative aspect-video rounded-2xl border-2 border-dashed border-black/15 bg-black/3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors duration-150"
          >
            {uploading ? (
              <Spinner />
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text/30">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm text-text/40">Click to upload or drag & drop</p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onApply={handleCropApply}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
