'use client';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'image';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
}

const variantDefaults: Record<SkeletonVariant, { width: string; height: string; rounded: string }> = {
  text: { width: '100%', height: '1rem', rounded: 'rounded-md' },
  circular: { width: '3rem', height: '3rem', rounded: 'rounded-full' },
  rectangular: { width: '100%', height: '12rem', rounded: 'rounded-lg' },
  card: { width: '100%', height: '18rem', rounded: 'rounded-xl' },
  image: { width: '100%', height: '16rem', rounded: 'rounded-lg' },
};

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  return (
    <div
      className={`
        relative overflow-hidden bg-zinc-200 dark:bg-zinc-800
        ${defaults.rounded}
        ${className}
      `}
      style={{
        width: width || defaults.width,
        height: height || defaults.height,
      }}
    >
      <div
        className='absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]'
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
