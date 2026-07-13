'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export interface ImageAsset {
  public_id: string;
  url: string;
  secure_url: string;
  is_primary: boolean;
}

interface ImageUploaderProps {
  onUploadComplete: (assets: ImageAsset[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ onUploadComplete, maxFiles = 10 }: ImageUploaderProps) {
  const [files, setFiles] = useState<{ file: File; preview: string; progress: number; status: 'pending' | 'uploading' | 'done' | 'error'; error?: string }[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    const remaining = maxFiles - files.filter(f => f.status === 'done').length;
    const toAdd = accepted.slice(0, remaining);

    const newFiles = toAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    const uploadedAssets: ImageAsset[] = [];

    for (const entry of newFiles) {
      setFiles(prev => prev.map(f => f.preview === entry.preview ? { ...f, status: 'uploading' as const } : f));

      const formData = new FormData();
      formData.append('file', entry.file);

      try {
        const token = localStorage.getItem('zaam_token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.status === 401) {
          localStorage.removeItem('zaam_token');
          toast.error('Session expired, please login again');
          window.location.href = '/auth/login';
          return;
        }

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        uploadedAssets.push({
          public_id: data.public_id,
          url: data.url,
          secure_url: data.secure_url,
          is_primary: false,
        });

        setFiles(prev => prev.map(f => f.preview === entry.preview ? { ...f, status: 'done' as const, progress: 100 } : f));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setFiles(prev => prev.map(f => f.preview === entry.preview ? { ...f, status: 'error' as const, error: msg } : f));
      }
    }

    if (uploadedAssets.length > 0) {
      onUploadComplete(uploadedAssets);
    }
  }, [maxFiles, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif'] },
    maxSize: 10 * 1024 * 1024,
    maxFiles,
    disabled: files.filter(f => f.status === 'done').length >= maxFiles,
  });

  const removeFile = (preview: string) => {
    setFiles(prev => prev.filter(f => f.preview !== preview));
    URL.revokeObjectURL(preview);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-[0_0_30px_rgba(217,119,6,0.1)]'
            : 'border-[var(--color-light-gray)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-cream)]/50'
        } ${files.filter(f => f.status === 'done').length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          backdropFilter: 'blur(12px)',
          background: isDragActive
            ? 'linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))',
        }}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="rounded-full bg-[var(--color-accent)]/10 p-4">
            <FiUploadCloud className="h-8 w-8 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              {isDragActive ? 'Drop images here' : 'Drag & drop product images'}
            </p>
            <p className="mt-1 text-xs text-[var(--color-mid-gray)]">
              PNG, JPG, WebP up to 10MB each
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-4 py-1.5 text-xs font-medium text-[var(--color-accent-dark)]">
            <FiUploadCloud className="h-3.5 w-3.5" />
            Browse Files
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
          >
            {files.map((entry) => (
              <motion.div
                key={entry.preview}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-[var(--color-cream)] border border-[var(--color-light-gray)] group"
              >
                <img
                  src={entry.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {entry.status === 'uploading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </div>
                )}

                {entry.status === 'done' && (
                  <div className="absolute top-1.5 right-1.5 rounded-full bg-[var(--color-success)] p-0.5">
                    <FiCheck className="h-3 w-3 text-white" />
                  </div>
                )}

                {entry.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center px-2">
                      <FiAlertCircle className="h-5 w-5 text-[var(--color-error)] mx-auto" />
                      <p className="text-[10px] text-white mt-1 leading-tight">{entry.error || 'Failed'}</p>
                    </div>
                  </div>
                )}

                {(entry.status === 'pending' || entry.status === 'error') && (
                  <button
                    onClick={() => removeFile(entry.preview)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="h-3 w-3 text-white" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
