'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi'
import { IoMdQuote } from 'react-icons/io'

interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  quote: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Isabella Rossi',
    role: 'Fashion Editor, Vogue Italia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    quote: 'ZAAM Store has completely transformed my shopping experience. The curation is impeccable and every piece feels like it was made just for me. The quality exceeds even my highest expectations.',
    rating: 5,
  },
  {
    id: 2,
    name: 'James Whitfield',
    role: 'Interior Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    quote: 'The attention to detail is remarkable. From the packaging to the product quality, everything exudes luxury. I\'ve never felt more confident in my purchases.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Amara Okafor',
    role: 'Lifestyle Blogger',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    quote: 'Discovering ZAAM was like finding a hidden gem. Their collection of perfumes is unmatched, and the personalized recommendations are spot-on every single time.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Alexander Chen',
    role: 'CEO, Luxe Ventures',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    quote: 'I\'ve shopped at luxury stores worldwide, but ZAAM stands out for its seamless experience and extraordinary product selection. A true game-changer in luxury e-commerce.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Sophie Laurent',
    role: 'Brand Consultant',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    quote: 'The watch collection is breathtaking. Every timepiece tells a story, and the craftsmanship speaks for itself. ZAAM has become my go-to destination for luxury accessories.',
    rating: 5,
  },
  {
    id: 6,
    name: 'Marcus Thompson',
    role: 'Art Collector',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    quote: 'The paint selection at ZAAM is unparalleled. As an artist, I appreciate the premium quality and the thoughtful curation. It\'s rare to find such dedication to excellence.',
    rating: 4,
  },
]

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`text-sm ${star <= rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-500'}`}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })

  const totalSlides = testimonials.length

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current]
  )

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      goNext()
    }, 5000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, goNext])

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  }

  const testimonial = testimonials[current]

  return (
    <section
      ref={sectionRef}
      className='relative py-24 md:py-32 bg-zinc-950 dark:bg-[#0a0a0a] overflow-hidden'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_60%)]' />
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />

      <div className='container-luxury relative z-10'>
        <motion.div
          variants={titleVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='text-center mb-16 md:mb-20'
        >
          <p className='text-[#d4af37] text-sm md:text-base tracking-[0.3em] uppercase mb-4'>
            Testimonials
          </p>
          <h2
            className='text-4xl sm:text-5xl md:text-6xl font-bold text-white'
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            What Our Customers Say
          </h2>
          <div className='luxury-divider luxury-divider-center' />
        </motion.div>

        <div className='max-w-4xl mx-auto'>
          <div
            className='relative min-h-[320px] md:min-h-[280px] flex items-center'
          >
            <button
              onClick={goPrev}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-gray-400 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all -ml-2 md:-ml-14'
              aria-label='Previous testimonial'
            >
              <FiChevronLeft size={20} />
            </button>

            <div className='w-full overflow-hidden px-2'>
              <AnimatePresence mode='wait' custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  className='w-full'
                >
                  <div className='flex flex-col items-center text-center px-4'>
                    <div className='relative mb-8'>
                      <IoMdQuote className='text-5xl md:text-6xl text-[#d4af37]/50 absolute -top-4 -left-4 -z-10' />
                      <div className='w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#d4af37]/30 ring-2 ring-[#d4af37]/10'>
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className='w-full h-full object-cover'
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const fallback = document.createElement('div')
                              fallback.className = 'w-full h-full flex items-center justify-center bg-[#d4af37]/20 text-[#d4af37] text-xl font-bold'
                              fallback.textContent = testimonial.name.charAt(0)
                              parent.appendChild(fallback)
                            }
                          }}
                        />
                      </div>
                    </div>

                    <blockquote className='text-lg md:text-xl text-gray-300 leading-relaxed mb-6 max-w-2xl italic'>
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    <StarDisplay rating={testimonial.rating} />

                    <div className='mt-4'>
                      <p
                        className='text-white font-semibold text-lg'
                        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                      >
                        {testimonial.name}
                      </p>
                      <p className='text-gray-400 text-sm'>{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={goNext}
              className='absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-gray-400 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all -mr-2 md:-mr-14'
              aria-label='Next testimonial'
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          <div className='flex items-center justify-center gap-2 mt-8'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? 'w-8 bg-[#d4af37]'
                    : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
