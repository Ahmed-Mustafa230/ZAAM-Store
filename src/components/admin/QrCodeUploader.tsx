'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUploadCloud } from 'react-icons/fi';

interface QrCodeUploaderProps {
  currentImage: string;
  onChange: (url: string) => void;
}

export default function QrCodeUploader({ currentImage, onChange }: QrCodeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 401) {
        toast.error('Session expired, please login again');
        window.location.href = '/auth/login';
        return;
      }

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onChange(data.secure_url || data.url || '');
      toast.success('QR code uploaded');
    } catch {
      toast.error('Failed to upload QR code.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)]'>
        {currentImage ? (
          <img src={currentImage} alt='QR code preview' className='h-full w-full object-contain' />
        ) : (
          <span className='text-xs text-[var(--color-mid-gray)]'>No QR</span>
        )}
      </div>
      <div className='space-y-2'>
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className='inline-flex items-center gap-2 rounded-lg border border-[var(--color-light-gray)] px-3 py-2 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors disabled:opacity-50'
        >
          <FiUploadCloud className='h-4 w-4 text-[var(--color-accent)]' />
          {uploading ? 'Uploading...' : currentImage ? 'Replace QR' : 'Upload QR'}
        </button>
        {currentImage && (
          <button
            type='button'
            onClick={() => onChange('')}
            className='block text-xs text-[var(--color-error)] hover:underline'
          >
            Remove
          </button>
        )}
      </div>
      <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={handleFile} />
    </div>
  );
}
