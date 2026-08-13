'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShoppingBag, HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSun, HiOutlineMoon, HiOutlineHome, HiOutlineViewGrid, HiOutlineInformationCircle, HiOutlineMail, HiOutlineClipboardList, HiOutlineTemplate, HiOutlineLogout, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { InboxNavBadge } from '@/app/admin/inbox-unread';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const categories = [
  { label: 'Perfumes', href: '/products?category=perfumes' },
  { label: 'Shirts', href: '/products?category=shirts' },
  { label: 'Watches', href: '/products?category=watches' },
  { label: 'Pants', href: '/products?category=pants' },
];

function CategoriesParamReader({ onCategory }: { onCategory: (category: string | null) => void }) {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  useEffect(() => {
    onCategory(category);
  }, [category, onCategory]);
  return null;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, unreadCount } = useCart();
  const { wishlistCount } = useWishlist();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('zaam_theme');
    const isDark = stored ? stored === 'dark' : false;
    const timer = setTimeout(() => {
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }, 0);
    return () => clearTimeout(timer);
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
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setIsVisible(true);
      } else if (window.scrollY > 80) {
        setIsVisible(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      setIsSearchOpen(false);
      setIsMobileCategoriesOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('zaam_theme', next ? 'dark' : 'light');
  };

  const handleMobileMenuToggle = () => {
    const opening = !isMobileOpen;
    setIsMobileOpen(opening);
    setIsMobileCategoriesOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const ordersHref = user?.role === 'admin' ? '/admin/orders' : '/dashboard/orders';
  const dashboardHref = user?.role === 'admin' ? '/admin' : '/dashboard';
  const profileHref = user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const isDashboardActive = pathname === dashboardHref;

  return (
    <>
      <Suspense fallback={null}>
        <CategoriesParamReader onCategory={setActiveCategory} />
      </Suspense>
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
              <div className='flex items-center gap-2'>
                <Image 
                  src='/logo/ZAAMHeaderLogo.png' 
                  alt='ZAAM'
                  width={40} 
                  height={0}
                  style={{ width: '45px', height: 'auto' }}
                  priority
                />
                <span className='text-2xl lg:text-3xl font-bold tracking-[0.3em] text-[#F2AA00] font-serif'>
                  ZAAM
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className='hidden lg:flex items-center gap-1'>
              {navLinks.map((link) =>
                link.label === 'Categories' ? (
                  <div
                    key={link.label}
                    className='relative'
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <button
                      className={`
                        flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${activeCategory
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                          : 'text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }
                      `}
                      aria-haspopup='menu'
                      aria-expanded={isCategoriesOpen}
                    >
                      Categories
                      <HiOutlineChevronDown
                        size={14}
                        className={`shrink-0 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className='absolute left-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden py-2'
                        >
                          {categories.map((cat) => (
                            <Link
                              key={cat.label}
                              href={cat.href}
                              className='flex items-center justify-between px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
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
                )
              )}
            </div>

            {/* Right Actions */}
            <div className='flex items-center gap-[5px] md:gap-2'>
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className='p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Search'
              >
                <HiOutlineSearch size={20} />
              </button>

              {/* Theme Toggle - Desktop only */}
              <button
                onClick={toggleTheme}
                className='hidden md:flex p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Toggle theme'
              >
                {isDarkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
              </button>

              {/* Wishlist - Desktop only */}
              <Link
                href='/wishlist'
                className='hidden md:flex relative p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
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
                className='hidden md:flex relative p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                aria-label='Cart'
              >
                <HiOutlineShoppingBag size={20} />
                {unreadCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop only */}
              <div className='relative' ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className='hidden md:flex p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                  aria-label='User menu'
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className='h-8 w-8 rounded-full object-cover' />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center'>
                      <span className='text-xs font-bold text-white'>
                        {user?.name
                          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : <HiOutlineUser size={18} />}
                      </span>
                    </div>
                  )}
                  </button>

                {/* Mobile Account Icon */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className='md:hidden p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all'
                  aria-label='Account'
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className='h-8 w-8 rounded-full object-cover' />
                  ) : (
                    <div className='h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center'>
                      <span className='text-xs font-bold text-white'>
                        {user?.name
                          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : <HiOutlineUser size={18} />}
                      </span>
                    </div>
                  )}
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
                            href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                            className='block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href={user?.role === 'admin' ? '/admin/orders' : '/dashboard/orders'}
                            className='block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href={user?.role === 'admin' ? '/admin/profile' : '/dashboard/profile'}
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
                onClick={handleMobileMenuToggle}
                className='relative lg:hidden p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all'
                aria-label='Menu'
              >
                {isMobileOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
                {totalItems > 0 && unreadCount > 0 && !isMobileOpen && (
                  <span className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0a0a0a]' />
                )}
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
                      className='w-full pl-11 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-amber-500 dark:focus:border-amber-400 rounded-xl text-white placeholder:text-zinc-400 outline-none transition-all autofill:bg-zinc-800 autofill:text-white'
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
            transition={{ duration: 0.25 }}
            onClick={() => setIsMobileOpen(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-md z-[9997] lg:hidden'
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className='fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0a0a0a] shadow-2xl z-[9999] lg:hidden overflow-y-auto border-r border-zinc-200 dark:border-zinc-800/60'
          >
            {/* Drawer Header */}
            <div className='sticky top-0 z-10 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/60'>
              <span className='text-xl font-bold tracking-[0.3em] text-[#F2AA00] font-serif'>
                ZAAM
              </span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className='p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60 transition-all'
                aria-label='Close menu'
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            {/* Account - top */}
            <div className='px-4 pt-5 pb-4 space-y-1 border-b border-zinc-200 dark:border-zinc-800/60'>
              <p className='px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-500'>
                Account
              </p>
              {user ? (
                <>
                  <div className='px-4 py-2 flex items-center gap-3'>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className='h-10 w-10 rounded-full object-cover' />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center'>
                        <span className='text-sm font-bold text-white'>
                          {user?.name
                            ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : <HiOutlineUser size={18} />}
                        </span>
                      </div>
                    )}
                    <div className='min-w-0'>
                      <p className='text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate'>{user.name}</p>
                      <p className='text-xs text-zinc-500 dark:text-zinc-400 truncate'>{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href={profileHref}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive(profileHref)
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                      }
                    `}
                  >
                    <HiOutlineUser size={20} className='shrink-0' />
                    Profile
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isDashboardActive
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                      }
                    `}
                  >
                    <HiOutlineTemplate size={20} className='shrink-0' />
                    Dashboard
                  </Link>
                  <Link
                    href={ordersHref}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive(ordersHref)
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                      }
                    `}
                  >
                    <HiOutlineClipboardList size={20} className='shrink-0' />
                    Orders
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      href='/admin/contact-messages'
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                        ${isActive('/admin/contact-messages')
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                          : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                        }
                      `}
                    >
                      <HiOutlineMail size={20} className='shrink-0' />
                      Inbox
                      <InboxNavBadge />
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    className='flex items-center gap-4 w-full px-4 py-3 text-sm font-medium rounded-xl text-zinc-700 hover:text-red-500 hover:bg-red-500/10 dark:text-zinc-400 dark:hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200'
                  >
                    <HiOutlineLogout size={20} className='shrink-0' />
                    Logout
                  </button>
                </>
              ) : (
                <div className='flex flex-col gap-3 px-2'>
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
            </div>

            {/* Menu */}
            <div className='px-4 pt-4 pb-4 space-y-1 border-b border-zinc-200 dark:border-zinc-800/60'>
              <p className='px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-500'>
                Menu
              </p>
              <Link
                href='/'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <HiOutlineHome size={20} className='shrink-0' />
                Home
              </Link>
              <Link
                href='/products'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/products')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <HiOutlineShoppingBag size={20} className='shrink-0' />
                Shop
              </Link>

              {/* Categories Expandable */}
              <div>
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className={`
                    flex items-center justify-between w-full gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${activeCategory
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                    }
                  `}
                  aria-expanded={isMobileCategoriesOpen}
                >
                  <span className='flex items-center gap-4'>
                    <HiOutlineViewGrid size={20} className='shrink-0' />
                    Categories
                  </span>
                  <HiOutlineChevronRight
                    size={18}
                    className={`shrink-0 transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isMobileCategoriesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className='overflow-hidden'
                    >
                      <div className='ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1'>
                        {categories.map((cat, i) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            onClick={() => setIsMobileOpen(false)}
                            style={{ animationDelay: `${i * 40}ms` }}
                            className='flex items-center gap-4 px-4 py-2.5 text-sm font-medium rounded-xl text-zinc-700 hover:text-amber-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-amber-400 dark:hover:bg-zinc-800/40 border border-transparent transition-all duration-200'
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <Link
                href='/cart'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/cart')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <span className='relative shrink-0'>
                  <HiOutlineShoppingCart size={20} />
                </span>
                Cart
                {unreadCount > 0 && (
                  <span className='ml-auto shrink-0 flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold'>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link
                href='/wishlist'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/wishlist')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <span className='relative shrink-0'>
                  <HiOutlineHeart size={20} />
                  {wishlistCount > 0 && (
                    <span className='absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center bg-amber-600 text-white text-[9px] font-bold rounded-full'>
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </span>
                Wishlist
              </Link>
            </div>

            {/* Information */}
            <div className='px-4 pt-4 pb-4 space-y-1 border-b border-zinc-200 dark:border-zinc-800/60'>
              <p className='px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-500'>
                Information
              </p>
              <Link
                href='/about'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/about')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <HiOutlineInformationCircle size={20} className='shrink-0' />
                About
              </Link>
              <Link
                href='/contact'
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive('/contact')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                  }
                `}
              >
                <HiOutlineMail size={20} className='shrink-0' />
                Contact
              </Link>
            </div>

            {/* Preferences */}
            <div className='px-4 pt-4 pb-8 space-y-1'>
              <p className='px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 dark:text-zinc-500'>
                Preferences
              </p>
              <button
                onClick={() => { toggleTheme(); setIsMobileOpen(false); }}
                className='flex items-center gap-4 w-full px-4 py-3 text-sm font-medium rounded-xl text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent transition-all duration-200'
              >
                {isDarkMode ? <HiOutlineSun size={20} className='shrink-0' /> : <HiOutlineMoon size={20} className='shrink-0' />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content overlap */}
      <div className='h-16 lg:h-20' />
    </>
  );
}
