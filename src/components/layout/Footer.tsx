'use client';

import Link from 'next/link';
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
  return (
    <footer className='bg-[var(--color-off-white)] text-zinc-600 dark:text-zinc-400 dark:bg-zinc-950 border-t border-[var(--color-light-gray)] dark:border-zinc-800'>
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
            <p className='mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto sm:mx-0'>
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
                    className='w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-[var(--color-light-gray)] dark:border-zinc-700 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-300'
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-[var(--color-primary)] dark:text-[#ffffff] uppercase mb-5'>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-[var(--color-primary)] dark:text-[#ffffff] uppercase mb-5'>
              Categories
            </h3>
            <ul className='space-y-3'>
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className='text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200'
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Service */}
          <div className='text-center sm:text-left'>
            <h3 className='text-sm font-semibold tracking-wider text-[var(--color-primary)] dark:text-[#ffffff] uppercase mb-5'>
              Customer Service
            </h3>
            <ul className='space-y-3'>
              {customerService.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className='text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-200'
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods + Copyright */}
        <div className='py-8 border-t border-[var(--color-light-gray)] dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4'>
          <div className='flex items-center justify-center sm:justify-start gap-3'>
            <span className='text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider'>
              We Accept
            </span>
            <div className='flex items-center gap-2'>
              {paymentIcons.map((pm) => {
                const Icon = pm.icon;
                return (
                  <span
                    key={pm.label}
                    className='text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors'
                    title={pm.label}
                  >
                    <Icon size={22} />
                  </span>
                );
              })}
            </div>
          </div>
          <p className='text-xs text-zinc-600 dark:text-zinc-400'>
            &copy; {new Date().getFullYear()} ZAAM Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
