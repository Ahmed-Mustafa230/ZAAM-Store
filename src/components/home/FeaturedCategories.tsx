'use client'

import { useRef, useState, useEffect, useCallback, type MouseEvent } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate, type Variants, type PanInfo, type MotionValue } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { GiPerfumeBottle, GiTShirt, GiTrousers, GiWatch } from 'react-icons/gi'

const categories = [
  {
    id: 'perfumes',
    name: 'Perfumes',
    description: 'Discover captivating fragrances that leave a lasting impression.',
    icon: GiPerfumeBottle,
    color: 'from-amber-500/30 to-amber-700/10',
    gradient: 'from-amber-400 to-amber-600',
    image: '/CollectionCard/Perfumes-Card.jpeg',
    slug: '/products?category=perfumes',
  },
  {
    id: 'shirts',
    name: 'Shirts',
    description: 'Premium fabrics meet contemporary design for effortless style.',
    icon: GiTShirt,
    color: 'from-blue-500/30 to-blue-700/10',
    gradient: 'from-blue-400 to-blue-600',
    image: '/CollectionCard/Shirt-Card.jpeg',
    slug: '/products?category=shirts',
  },
  {
    id: 'pants',
    name: 'Pants',
    description: 'Sharp, tailored trousers and casual pants for every occasion.',
    icon: GiTrousers,
    color: 'from-rose-500/30 to-rose-700/10',
    gradient: 'from-rose-400 to-rose-600',
    image: '/CollectionCard/Pant-Card.jpeg',
    slug: '/products?category=pants',
  },
  {
    id: 'watches',
    name: 'Watches',
    description: 'Timeless craftsmanship for those who value every second.',
    icon: GiWatch,
    color: 'from-emerald-500/30 to-emerald-700/10',
    gradient: 'from-emerald-400 to-emerald-600',
    image: '/CollectionCard/Watch-Card.jpeg',
    slug: '/products?category=watches',
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function CategoryCard({
  category,
}: {
  category: (typeof categories)[0]
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  const Icon = category.icon

  return (
    <motion.div
      variants={cardVariants}
      className='group relative'
    >
      <a href={category.slug}>
        <div
          ref={cardRef}
          className='relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[380px] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 ease-out'
          style={{ transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url(${category.image})` }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60`}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700' />

          <div
            className='relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center'
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className='mb-3 sm:mb-4 md:mb-5 p-2 sm:p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all duration-300'>
              <Icon className='text-2xl sm:text-3xl md:text-4xl text-[#d4af37]' />
            </div>

            <h3
              className='text-xl sm:text-2xl md:text-3xl font-bold text-zinc-100 mb-2 sm:mb-3'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {category.name}
            </h3>

            <p className='text-zinc-400 text-xs sm:text-sm md:text-base max-w-[200px] sm:max-w-[220px] leading-relaxed mb-4 sm:mb-6'>
              {category.description}
            </p>

            <span className='inline-flex items-center gap-2 text-[#d4af37] text-sm font-medium group-hover:gap-3 transition-all'>
              Explore
              <FiArrowRight className='text-sm' />
            </span>
          </div>

          <div
            className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center'
          />
        </div>
      </a>
    </motion.div>
  )
}

export default function FeaturedCategories() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className='relative py-12 sm:py-14 md:py-16 lg:py-20 bg-[var(--color-off-white)] dark:bg-[#0a0a0a] overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_60%)]' />

      <div className='container-luxury relative z-10'>
        <div ref={ref} className='text-center mb-10 sm:mb-14 md:mb-20'>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-[#d4af37] text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase mb-2 sm:mb-4'
          >
            Collections
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Shop by Category
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className='luxury-divider luxury-divider-center'
          />
        </div>

        {/* Desktop / Tablet grid */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </motion.div>

        <MobileCarousel categories={categories} />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile 3D infinite carousel  —  4 logical cards with cyclic wrap   */
/* ------------------------------------------------------------------ */

function MobileCarousel({ categories: cats }: { categories: typeof categories }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackX = useMotionValue(0)
  const [rawIdx, setRawIdx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const len = cats.length

  /* ── Animate the track to centre a given rawIdx ── */
  const animateTo = useCallback(
    (idx: number, velocity = 0) => {
      const w = containerRef.current?.offsetWidth || 375
      animate(trackX, -(idx * w * 0.65) + w * 0.5, {
        type: 'spring',
        stiffness: 150,
        damping: 24,
        mass: 1,
        velocity,
      })
    },
    [trackX],
  )

  /* ── Snap (position + velocity aware) ── */
  const snap = useCallback(
    (swipeVelocity = 0) => {
      const w = containerRef.current?.offsetWidth || 375
      const spacing = w * 0.65
      const threshold = 600

      const raw = (-trackX.get() + w * 0.5) / spacing
      let nearest: number
      if (Math.abs(swipeVelocity) > threshold) {
        nearest = Math.round(raw) + (swipeVelocity > 0 ? -1 : 1)
      } else {
        nearest = Math.round(raw)
      }

      setRawIdx((prev) => {
        const seg = Math.floor(prev / len)
        let t = seg * len + ((nearest % len) + len) % len
        if (t - prev > len / 2) t -= len
        else if (prev - t > len / 2) t += len
        animateTo(t, swipeVelocity)
        return t
      })
    },
    [len, trackX, animateTo],
  )

  /* ── Auto-play ── */
  useEffect(() => {
    if (isDragging || !shouldAutoPlay) return
    const t = setTimeout(() => {
      setRawIdx((prev) => {
        const next = prev + 1
        animateTo(next)
        return next
      })
    }, 5000)
    return () => clearTimeout(t)
  }, [isDragging, shouldAutoPlay, rawIdx, animateTo])

  /* ── Pan handlers (drag follow) ── */
  const handlePanStart = () => {
    setIsDragging(true)
    setShouldAutoPlay(false)
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
  }

  const handlePan = (_: any, info: PanInfo) => {
    trackX.set(trackX.get() + info.delta.x)
  }

  const handlePanEnd = (_: any, info: PanInfo) => {
    setIsDragging(false)
    snap(info.velocity.x)
    pauseTimerRef.current = setTimeout(() => setShouldAutoPlay(true), 5000)
  }

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [])

  const activeDot = ((rawIdx % len) + len) % len

  return (
    <div className='sm:hidden'>
      <div className='-mx-4'>
        <motion.div
          ref={containerRef}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className='relative w-full overflow-hidden select-none'
          style={{ height: 280, perspective: 1000, touchAction: 'pan-y' }}
        >
          {cats.map((cat, i) => (
            <CarouselCard key={cat.id} cat={cat} index={i} trackX={trackX} len={len} />
          ))}
        </motion.div>
      </div>

      {/* Dot indicators — exactly 4 dots */}
      <div className='flex justify-center items-center gap-2 mt-6'>
        {cats.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => {
              const seg = Math.floor(rawIdx / len)
              const t = seg * len + i
              setRawIdx(t)
              animateTo(t)
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeDot
                ? 'bg-[#d4af37] w-5 h-2'
                : 'bg-zinc-600 w-2 h-2 hover:bg-zinc-500'
            }`}
            aria-label={`Go to ${cat.name}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Single carousel card with cyclic wrapping ── */
function CarouselCard({
  cat,
  index,
  trackX,
  len,
}: {
  cat: (typeof categories)[0]
  index: number
  trackX: MotionValue<number>
  len: number
}) {
  /* distance from viewport center (in card‑units) with cyclic wrap */
  const screenCenterPx = useTransform(trackX, (val: number) => {
    const w = window.innerWidth || 375
    const spacing = w * 0.65
    const cycle = spacing * len
    const vpCenter = w * 0.5

    let sc = val + index * spacing
    while (sc - vpCenter > cycle / 2) sc -= cycle
    while (vpCenter - sc > cycle / 2) sc += cycle
    return sc
  })

  const dist = useTransform(screenCenterPx, (sc: number) => {
    const w = window.innerWidth || 375
    const spacing = w * 0.65
    const vpCenter = w * 0.5
    return (sc - vpCenter) / spacing
  })

  const x = useTransform(screenCenterPx, (sc: number) => {
    const cardHalf = (window.innerWidth || 375) * 0.3   // 60vw / 2
    return sc - cardHalf
  })

  const scale = useTransform(dist, (d: number) => {
    const a = Math.abs(d)
    return a < 0.1 ? 1 : Math.max(0.85, 1 - a * 0.15)
  })

  const rotateY = useTransform(dist, (d: number) => d * 15)

  const zIndex = useTransform(dist, (d: number) => Math.abs(d) < 0.5 ? 10 : 5)

  const opacity = useTransform(dist, (d: number) => {
    const a = Math.abs(d)
    if (a > 1.8) return 0
    if (a < 1) return 1
    return 1 - (a - 1) / 0.8
  })

  const Icon = cat.icon

  return (
    <motion.div
      className='absolute top-0'
      style={{ width: '60vw', height: 280, x, scale, rotateY, zIndex, opacity }}
    >
      <a href={cat.slug}>
        <div className='relative w-full h-full rounded-2xl overflow-hidden'>
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url(${cat.image})` }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60`}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

          <div className='relative z-10 h-full flex flex-col items-center justify-center p-4 text-center'>
            <div className='mb-3 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10'>
              <Icon className='text-2xl text-[#d4af37]' />
            </div>
            <h3
              className='text-xl font-bold text-zinc-100 mb-2'
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {cat.name}
            </h3>
            <p className='text-zinc-400 text-xs max-w-[200px] leading-relaxed mb-4'>
              {cat.description}
            </p>
            <span className='inline-flex items-center gap-2 text-[#d4af37] text-sm font-medium'>
              Explore
              <FiArrowRight className='text-sm' />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
