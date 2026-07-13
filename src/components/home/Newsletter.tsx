'use client'

import { useState, useRef, type FormEvent } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { FiSend, FiCheck, FiAlertCircle, FiMail } from 'react-icons/fi'

const variants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const particleVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 0.3, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 3 + Math.random() * 2,
      delay: i * 0.2,
      repeat: Infinity,
      repeatDelay: Math.random() * 2,
    },
  }),
}

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const particles = Array.from({ length: 6 })

  return (
    <section className='relative py-24 md:py-32 bg-zinc-950 dark:bg-[#0a0a0a] overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05)_0%,transparent_60%)]' />

      <div className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(212,175,55,1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {particles.map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={particleVariants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='absolute w-2 h-2 bg-[#d4af37]/30 rounded-full'
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
        />
      ))}

      <div ref={ref} className='container-luxury relative z-10'>
        <motion.div
          variants={variants}
          initial='hidden'
          animate={isInView ? 'visible' : 'hidden'}
          className='max-w-2xl mx-auto text-center'
        >
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-8'>
            <FiMail className='text-2xl text-[#d4af37]' />
          </div>

          <h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4'
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            Join the ZAAM Community
          </h2>

          <p className='text-zinc-300 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed'>
            Subscribe for exclusive access to limited drops, early sale previews, and members-only offers.
          </p>

          <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
            <div className='relative flex items-center gap-3'>
              <div className='relative flex-1'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'error') setStatus('idle')
                  }}
                  placeholder='Enter your email'
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full px-5 py-4 bg-white/10 border rounded-xl text-white placeholder-white/60 transition-all duration-300 focus:outline-none ${
                    status === 'error'
                      ? 'border-rose-500/50 focus:border-rose-500'
                      : 'border-white/20 focus:border-[#d4af37]/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='absolute -bottom-6 left-0 text-xs text-rose-400 flex items-center gap-1'
                  >
                    <FiAlertCircle />
                    {errorMessage}
                  </motion.p>
                )}
              </div>

              <motion.button
                type='submit'
                disabled={status === 'loading' || status === 'success'}
                className={`px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 ${
                  status === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-[#8b6914] via-[#d4af37] to-[#f0d060] text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
                whileHover={status === 'idle' ? { scale: 1.02 } : {}}
                whileTap={status === 'idle' ? { scale: 0.98 } : {}}
              >
                {status === 'loading' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className='w-5 h-5 border-2 border-[#0a0a0a] border-t-transparent rounded-full'
                  />
                ) : status === 'success' ? (
                  <FiCheck className='text-lg' />
                ) : (
                  <FiSend className='text-lg' />
                )}
                <span className='hidden sm:inline'>
                  {status === 'loading'
                    ? 'Subscribing...'
                    : status === 'success'
                      ? 'Subscribed!'
                      : 'Subscribe'}
                </span>
              </motion.button>
            </div>

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-emerald-400 text-sm mt-6'
              >
                You've been subscribed. Welcome to the ZAAM community!
              </motion.p>
            )}
          </form>

          <p className='text-white/70 text-xs mt-8'>
            No spam, ever. Unsubscribe at any time. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
