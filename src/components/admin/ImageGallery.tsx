'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { FiStar, FiTrash2, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { ImageAsset } from './ImageUploader';

interface ImageGalleryProps {
  images: ImageAsset[];
  onChange: (images: ImageAsset[]) => void;
}

export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (asset: ImageAsset) => {
    setDeleting(asset.public_id);
    try {
      const token = localStorage.getItem('zaam_token');
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ public_id: asset.public_id }),
      });

      if (res.status === 401) {
        localStorage.removeItem('zaam_token');
        toast.error('Session expired, please login again');
        window.location.href = '/auth/login';
        return;
      }

      if (!res.ok) throw new Error('Delete failed');

      const updated = images.filter(i => i.public_id !== asset.public_id);
      if (asset.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      onChange(updated);
      toast.success('Image removed');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetPrimary = (public_id: string) => {
    const updated = images.map(i => ({
      ...i,
      is_primary: i.public_id === public_id,
    }));
    onChange(updated);
  };

  const handleReorder = (reordered: ImageAsset[]) => {
    const hasPrimary = reordered.some(i => i.is_primary);
    if (!hasPrimary && reordered.length > 0) {
      reordered[0].is_primary = true;
    }
    onChange(reordered);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-light-gray)] p-8 text-center">
        <FiAlertCircle className="mx-auto h-8 w-8 text-[var(--color-mid-gray)]" />
        <p className="mt-2 text-sm text-[var(--color-mid-gray)]">No images yet. Upload images above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--color-mid-gray)]">
        {images.length} image{images.length !== 1 ? 's' : ''} &mdash; Drag to reorder, click star to set primary
      </p>

      <Reorder.Group axis="x" values={images} onReorder={handleReorder} className="flex flex-wrap gap-3">
        <AnimatePresence>
          {images.map((asset, index) => (
            <Reorder.Item key={asset.public_id} value={asset} as="div">
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-28 aspect-square rounded-xl overflow-hidden bg-[var(--color-cream)] border border-[var(--color-light-gray)] group cursor-grab active:cursor-grabbing"
              >
                <img
                  src={asset.secure_url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {asset.is_primary && (
                  <div className="absolute top-1.5 left-1.5 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-deep-black)]">
                    Primary
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveItem(index, -1); }}
                    disabled={index === 0}
                    className="rounded-md bg-white/20 p-1 text-white hover:bg-white/30 disabled:opacity-30 transition-colors"
                  >
                    <FiChevronLeft className="h-3 w-3" />
                  </button>

                  {!asset.is_primary && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSetPrimary(asset.public_id); }}
                      className="rounded-md bg-white/20 p-1 text-white hover:bg-[var(--color-accent)] transition-colors"
                      title="Set as primary"
                    >
                      <FiStar className="h-3 w-3" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(asset)}
                    disabled={deleting === asset.public_id}
                    className="rounded-md bg-white/20 p-1 text-white hover:bg-[var(--color-error)] disabled:opacity-50 transition-colors"
                  >
                    {deleting === asset.public_id ? (
                      <div className="h-3 w-3 rounded-full border border-white/50 border-t-white animate-spin" />
                    ) : (
                      <FiTrash2 className="h-3 w-3" />
                    )}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); moveItem(index, 1); }}
                    disabled={index === images.length - 1}
                    className="rounded-md bg-white/20 p-1 text-white hover:bg-white/30 disabled:opacity-30 transition-colors"
                  >
                    <FiChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
