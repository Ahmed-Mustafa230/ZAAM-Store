'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('zaam_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 20);
      setIsVisible(currentY < lastScrollY || currentY < 80);
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('zaam_theme', next ? 'dark' : 'light');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -120 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-0 left-0 right-0 z-[9998]
          transition-all duration-300
          ${isScrolled
            ? 'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg shadow-zinc-900/5 border-b border-zinc-200/50 dark:border-zinc-800/50'
            : 'bg-transparent'
          }
        `}
      >
        <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 lg:h-20'>
            {/* Logo */}
            <Link href='/' className='relative z-10'>
              <span className='text-2xl lg:text-3xl font-bold tracking-[0.3em] text-amber-600 dark:text-amber-400 font-serif'>
                ZAAM
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className='hidden lg:flex items-center gap-1'>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive(link.href)
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className='flex items-center gap-2'>
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className='p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Search'
              >
                <HiOutlineSearch size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className='p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Toggle theme'
              >
                {isDarkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
              </button>

              {/* Wishlist */}
              <Link
                href='/wishlist'
                className='relative p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Wishlist'
              >
                <HiOutlineHeart size={20} />
                {wishlistCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-amber-600 text-white text-[10px] font-bold rounded-full'>
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href='/cart'
                className='relative p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Cart'
              >
                <HiOutlineShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-amber-600 text-white text-[10px] font-bold rounded-full'>
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className='p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                  aria-label='User menu'
                >
                  <HiOutlineUser size={20} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className='absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden'
                    >
                      {user ? (
                        <div className='py-2'>
                          <div className='px-4 py-3 border-b border-zinc-100 dark:border-zinc-800'>
                            <p className='text-sm font-medium text-zinc-900 dark:text-white truncate'>
                              {user.name}
                            </p>
                            <p className='text-xs text-zinc-500 truncate'>
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href='/dashboard'
                            className='block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href='/dashboard/orders'
                            className='block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href='/dashboard/profile'
                            className='block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <div className='border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1'>
                            <button
                              onClick={() => {
                                logout();
                                setIsUserMenuOpen(false);
                              }}
                              className='w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className='p-4'>
                          <p className='text-sm text-zinc-500 mb-3'>
                            Sign in to your account
                          </p>
                          <Link href='/auth/login' onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant='primary' size='sm' className='w-full'>
                              Sign In
                            </Button>
                          </Link>
                          <Link
                            href='/auth/register'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full mt-2 text-amber-600'
                            >
                              Create Account
                            </Button>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className='lg:hidden p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Menu'
              >
                {isMobileOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Expandable Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden border-t border-zinc-100 dark:border-zinc-800'
              >
                <div className='py-3'>
                  <div className='relative'>
                    <HiOutlineSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400' size={18} />
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder='Search luxury products...'
                      autoFocus
                      className='w-full pl-11 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition-all'
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997] lg:hidden'
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className='fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl z-[9999] lg:hidden overflow-y-auto'
          >
            <div className='flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800'>
              <span className='text-xl font-bold tracking-[0.3em] text-amber-600 dark:text-amber-400 font-serif'>
                ZAAM
              </span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className='p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div className='p-5 space-y-1'>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    block px-4 py-3 text-base font-medium rounded-xl transition-all
                    ${isActive(link.href)
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {user && (
              <div className='px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800 pt-4'>
                <p className='text-sm font-medium text-zinc-900 dark:text-white mb-1'>
                  {user.name}
                </p>
                <p className='text-xs text-zinc-500 mb-4'>{user.email}</p>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileOpen(false);
                  }}
                  className='w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors'
                >
                  Logout
                </button>
              </div>
            )}

            {!user && (
              <div className='px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2'>
                <Link href='/auth/login' onClick={() => setIsMobileOpen(false)}>
                  <Button variant='primary' className='w-full'>
                    Sign In
                  </Button>
                </Link>
                <Link href='/auth/register' onClick={() => setIsMobileOpen(false)}>
                  <Button variant='secondary' className='w-full'>
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content overlap */}
      <div className='h-16 lg:h-20' />
    </>
  );
}
