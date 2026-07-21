'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaApplePay,
} from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

const categories = [
  { href: '/products?category=perfumes', label: 'Perfumes' },
  { href: '/products?category=shirts', label: 'Shirts' },
  { href: '/products?category=pants', label: 'Pants' },
  { href: '/products?category=watches', label: 'Watches' },
];

const customerService = [
  { href: '/shipping', label: 'Shipping' },
  { href: '/returns', label: 'Returns' },
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const socialLinks = [
  { href: '#', icon: FaInstagram, label: 'Instagram' },
  { href: '#', icon: FaTwitter, label: 'Twitter' },
  { href: '#', icon: FaFacebookF, label: 'Facebook' },
  { href: '#', icon: FaPinterestP, label: 'Pinterest' },
  { href: '#', icon: FaYoutube, label: 'YouTube' },
];

const paymentIcons = [
  { icon: FaCcVisa, label: 'Visa' },
  { icon: FaCcMastercard, label: 'Mastercard' },
  { icon: FaCcAmex, label: 'Amex' },
  { icon: FaCcPaypal, label: 'PayPal' },
  { icon: FaApplePay, label: 'Apple Pay' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Subscribed successfully!');
    setEmail('');
    setSubscribing(false);
  };

  return (
    <footer className='bg-zinc-950 text-zinc-400 border-t border-zinc-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Main Grid */}
        <div className='py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8'>
          {/* Column 1: Brand */}
          <div className='sm:col-span-2 lg:col-span-1 text-center sm:text-left'>
            <Link href='/'>
              <span className='text-2xl font-bold tracking-[0.3em] text-amber-500 font-serif'>
                ZAAM
              </span>
            </Link>
            <p className='mt-4 text-sm leading-relaxed text-zinc-500 max-w-xs mx-auto sm:mx-0'>
              Curating the finest luxury lifestyle products from around the world.
              Experience elegance, craftsmanship, and timeless design.
            </p>
            <div className='flex items-center justify-center sm:justify-start gap-3 mt-6'>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-amber-600 hover:text-white transition-all duration-300'
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-white uppercase mb-5'>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-500 hover:text-amber-500 transition-colors duration-200'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-white uppercase mb-5'>
              Categories
            </h3>
            <ul className='space-y-3'>
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className='text-sm text-zinc-500 hover:text-amber-500 transition-colors duration-200'
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-white uppercase mb-5'>
              Customer Service
            </h3>
            <ul className='space-y-3'>
              {customerService.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='text-sm text-zinc-500 hover:text-amber-500 transition-colors duration-200'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className='py-10 border-t border-zinc-800'>
          <div className='max-w-xl mx-auto text-center'>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Join the ZAAM Circle
            </h3>
            <p className='text-sm text-zinc-500 mb-6'>
              Subscribe for exclusive access to new drops, private sales, and luxury insights.
            </p>
            <form onSubmit={handleSubscribe} className='flex flex-col sm:flex-row gap-3 sm:gap-2 max-w-md mx-auto'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
                className='w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 outline-none focus:border-amber-500 transition-colors text-sm'
              />
              <motion.button
                type='submit'
                disabled={subscribing}
                whileTap={{ scale: 0.97 }}
                className='w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-semibold rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 disabled:opacity-60'
              >
                {subscribing ? (
                  <svg className='animate-spin w-5 h-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                  </svg>
                ) : (
                  <HiOutlineArrowRight size={20} />
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Payment Methods + Copyright */}
        <div className='py-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4'>
          <div className='flex items-center justify-center sm:justify-start gap-3'>
            <span className='text-xs text-zinc-600 uppercase tracking-wider'>
              We Accept
            </span>
            <div className='flex items-center gap-2'>
              {paymentIcons.map((pm) => {
                const Icon = pm.icon;
                return (
                  <span
                    key={pm.label}
                    className='text-zinc-600 hover:text-zinc-400 transition-colors'
                    title={pm.label}
                  >
                    <Icon size={22} />
                  </span>
                );
              })}
            </div>
          </div>
          <p className='text-xs text-zinc-600'>
            &copy; {new Date().getFullYear()} ZAAM Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
