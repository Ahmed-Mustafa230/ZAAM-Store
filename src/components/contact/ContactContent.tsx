'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ContactContent() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 1500))
    toast.success('Message sent successfully! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <main className='min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] pt-24'>
      <section className='relative py-24 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_60%)]' />
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-center max-w-3xl mx-auto mb-16'
          >
            <span className='text-amber-600 dark:text-amber-400 text-sm tracking-[0.3em] uppercase'>Get in Touch</span>
            <h1 className='text-5xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-8' style={{ fontFamily: 'var(--font-heading)' }}>
              We&apos;d Love to Hear from You
            </h1>
            <p className='text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed'>
              Whether you have a question about our products, a special request, or just want to say hello.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className='space-y-5'>
                <div>
                  <input
                    type='text'
                    placeholder='Your Name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className='w-full px-5 py-4 bg-zinc-100 dark:bg-white/[0.12] border border-zinc-300 dark:border-white/[0.2] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500 dark:focus:border-amber-400/50 focus:outline-none transition-colors'
                  />
                </div>
                <div>
                  <input
                    type='email'
                    placeholder='Your Email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className='w-full px-5 py-4 bg-zinc-100 dark:bg-white/[0.12] border border-zinc-300 dark:border-white/[0.2] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500 dark:focus:border-amber-400/50 focus:outline-none transition-colors'
                  />
                </div>
                <div>
                  <input
                    type='text'
                    placeholder='Subject'
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className='w-full px-5 py-4 bg-zinc-100 dark:bg-white/[0.12] border border-zinc-300 dark:border-white/[0.2] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500 dark:focus:border-amber-400/50 focus:outline-none transition-colors'
                  />
                </div>
                <div>
                  <textarea
                    placeholder='Your Message'
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className='w-full px-5 py-4 bg-zinc-100 dark:bg-white/[0.12] border border-zinc-300 dark:border-white/[0.2] rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500 dark:focus:border-amber-400/50 focus:outline-none transition-colors resize-none'
                  />
                </div>
                <button
                  type='submit'
                  disabled={sending}
                  className='w-full py-4 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 dark:from-[#8b6914] dark:via-[#d4af37] dark:to-[#f0d060] text-zinc-900 font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50'
                >
                  {sending ? 'Sending...' : 'Send Message'}
                  <FiSend />
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='space-y-6'
            >
              {[
                { icon: FiMail, title: 'Email', value: 'ahmedmuatafa0786@gmail.com', desc: 'We respond within 24 hours' },
                { icon: FiPhone, title: 'Phone', value: '+92-3153104783', desc: 'Mon-Fri 9AM-6PM EST' },
                { icon: FiMapPin, title: 'Visit Us', value: '123 Luxury Avenue, Karachi, Pakistan', desc: 'By appointment only' },
              ].map((item) => (
                <div key={item.title} className='flex items-start gap-5 p-6 rounded-xl bg-zinc-100/50 dark:bg-white/[0.1] border border-zinc-200 dark:border-white/[0.18]'>
                  <item.icon className='text-amber-600 dark:text-amber-400 text-xl mt-1 shrink-0' />
                  <div>
                    <h3 className='text-zinc-900 dark:text-zinc-100 font-medium mb-1'>{item.title}</h3>
                    <p className='text-zinc-700 dark:text-zinc-300'>{item.value}</p>
                    <p className='text-zinc-500 dark:text-zinc-500 text-sm mt-1'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
