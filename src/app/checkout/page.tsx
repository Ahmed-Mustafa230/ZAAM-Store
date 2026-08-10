'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  TAX_RATE,
} from '@/lib/checkout-constants';
import { calculateCouponDiscount } from '@/lib/coupon';

type Step = 'shipping' | 'review' | 'payment';

const PROVINCES = [
  'Sindh',
  'Punjab',
  'KPK',
  'Balochistan',
  'Gilgit Baltistan',
  'Islamabad Capital Territory',
  'Azad Kashmir',
];

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
  { value: 'easypaisa', label: 'Easypaisa', description: 'Pay via Easypaisa account' },
  { value: 'jazzcash', label: 'JazzCash', description: 'Pay via JazzCash account' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct bank transfer' },
  { value: 'credit-card', label: 'Debit / Credit Card', description: 'Visa / Mastercard via Stripe' },
];

const PAK_PHONE_REGEX = /^(03\d{9}|\+92\d{10})$/;

const PAID_METHODS = ['easypaisa', 'jazzcash', 'bank_transfer'];
const CARD_METHOD = 'credit-card';

interface WalletSettings {
  enabled: boolean;
  accountTitle: string;
  merchantNumber: string;
  qrCodeImage: string;
}

interface BankTransferSettings {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  qrCodeImage: string;
}

interface PaymentSettingsData {
  easypaisa: WalletSettings;
  jazzcash: WalletSettings;
  bankTransfer: BankTransferSettings;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AppliedCoupon {
  code: string;
  id: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minPurchase: number;
}

const COUPON_SESSION_KEYS = [
  'zaam_checkout_coupon',
  'zaam_checkout_discount',
  'zaam_checkout_coupon_id',
  'zaam_checkout_coupon_type',
  'zaam_checkout_coupon_value',
  'zaam_checkout_coupon_max_discount',
  'zaam_checkout_coupon_min_purchase',
] as const;

function readAppliedCoupon(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null;
  const code = sessionStorage.getItem('zaam_checkout_coupon');
  if (!code) return null;
  const discountType = sessionStorage.getItem('zaam_checkout_coupon_type');
  if (discountType !== 'percentage' && discountType !== 'flat') return null;
  return {
    code,
    id: sessionStorage.getItem('zaam_checkout_coupon_id') || '',
    discountType,
    discountValue: Number(sessionStorage.getItem('zaam_checkout_coupon_value')) || 0,
    maxDiscount: Number(sessionStorage.getItem('zaam_checkout_coupon_max_discount')) || 0,
    minPurchase: Number(sessionStorage.getItem('zaam_checkout_coupon_min_purchase')) || 0,
  };
}

function persistAppliedCoupon(coupon: AppliedCoupon | null) {
  if (typeof window === 'undefined') return;
  for (const key of COUPON_SESSION_KEYS) sessionStorage.removeItem(key);
  if (!coupon) return;
  sessionStorage.setItem('zaam_checkout_coupon', coupon.code);
  sessionStorage.setItem('zaam_checkout_discount', String(0));
  sessionStorage.setItem('zaam_checkout_coupon_id', coupon.id);
  sessionStorage.setItem('zaam_checkout_coupon_type', coupon.discountType);
  sessionStorage.setItem('zaam_checkout_coupon_value', String(coupon.discountValue));
  sessionStorage.setItem('zaam_checkout_coupon_max_discount', String(coupon.maxDiscount));
  sessionStorage.setItem('zaam_checkout_coupon_min_purchase', String(coupon.minPurchase));
}

interface CopyButtonProps {
  copied: boolean;
  label: string;
  onCopy: () => void;
}

function CopyButton({ copied, label, onCopy }: CopyButtonProps) {
  return (
    <button
      type='button'
      onClick={onCopy}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        copied
          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
          : 'text-[var(--color-mid-gray)] hover:bg-[var(--color-white)] hover:text-[var(--color-accent)]'
      }`}
    >
      {copied ? (
        <>
          <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items: cartItems, removeItem, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(readAppliedCoupon);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripeCardRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripeInstanceRef = useRef<any>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((subtotal + shipping + tax) * 100) / 100;
  const discount = appliedCoupon
    ? calculateCouponDiscount(grandTotal, {
        id: appliedCoupon.id,
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        maxDiscount: appliedCoupon.maxDiscount,
        minPurchase: appliedCoupon.minPurchase,
      })
    : 0;
  const total = Math.round((grandTotal - discount) * 100) / 100;

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      router.replace('/products');
    }
  }, [cartItems, orderPlaced, router]);

  useEffect(() => {
    let ignore = false;
    fetch('/api/payment-settings', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load payment settings');
        return res.json();
      })
      .then((json) => {
        if (ignore) return;
        setPaymentSettings(json.settings);
      })
      .catch(() => {
        if (ignore) return;
        setPaymentSettings(null);
      });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          firstName: session.user.name?.split(' ')[0] || prev.firstName,
          lastName: session.user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [session]);

  useEffect(() => {
    if (!showCardForm || !clientSecret || !cardContainerRef.current) return;

    const initCard = async () => {
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripeKey) return;

      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(stripeKey);
        if (!stripe || !cardContainerRef.current) return;

        stripeInstanceRef.current = stripe;

        const elements = stripe.elements({ clientSecret });
        const card = elements.create('card', {
          style: {
            base: {
              color: '#1a1a2e',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '16px',
              '::placeholder': { color: '#a0a0a0' },
            },
            invalid: { color: '#dc2626' },
          },
        });
        card.mount(cardContainerRef.current);
        stripeCardRef.current = card;
      } catch {
        setOrderError('Failed to load payment form. Please try again.');
      }
    };

    initCard();

    return () => {
      if (stripeCardRef.current) {
        stripeCardRef.current.destroy();
        stripeCardRef.current = null;
      }
    };
  }, [showCardForm, clientSecret]);

  const handleScreenshotChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentScreenshot(file);
    setPaymentScreenshotPreview(URL.createObjectURL(file));
    setPaymentErrors(prev => {
      const next = { ...prev };
      delete next.screenshot;
      return next;
    });
  }, []);

  const resetPaidMethodState = useCallback(() => {
    setTransactionId('');
    setPaymentScreenshot(null);
    setPaymentScreenshotPreview('');
    setPaymentErrors({});
  }, []);

  const handlePaymentMethodChange = useCallback((method: string) => {
    setPaymentMethod(method);
    setShowCardForm(false);
    setOrderError('');
    resetPaidMethodState();
  }, [resetPaidMethodState]);

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id);
  }, [removeItem]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
    persistAppliedCoupon(null);
  }, []);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback((field: string, value: string) => {
    if (!value || value === '—') return;
    const done = () => {
      setCopiedField(field);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          done();
        } catch {
          // Clipboard unavailable; keep the value selectable/readable.
        }
        document.body.removeChild(textarea);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        done();
      } catch {
        // Clipboard unavailable; keep the value selectable/readable.
      }
      document.body.removeChild(textarea);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!paymentSettings) return;
    const methodDisabled =
      (paymentMethod === 'easypaisa' && !paymentSettings.easypaisa.enabled) ||
      (paymentMethod === 'jazzcash' && !paymentSettings.jazzcash.enabled) ||
      (paymentMethod === 'bank_transfer' && !paymentSettings.bankTransfer.enabled);
    if (methodDisabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentMethod('cod');
      setShowCardForm(false);
      resetPaidMethodState();
    }
  }, [paymentSettings, paymentMethod, resetPaidMethodState]);

  if (cartItems.length === 0 && !orderPlaced) return null;

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'review', label: 'Review' },
    { key: 'payment', label: 'Payment' },
  ];

  const validateShipping = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!PAK_PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid Pakistan phone (03XXXXXXXXX or +92XXXXXXXXXX)';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'Province is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 'shipping') {
      if (validateShipping()) setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }
    if (appliedCoupon?.code === code) {
      setCouponFeedback({ type: 'error', text: 'This coupon is already applied.' });
      return;
    }

    setCouponLoading(true);
    setCouponFeedback(null);
    try {
      const rawSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const rawShipping = rawSubtotal > 0 && rawSubtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
      const rawGrandTotal = rawSubtotal + rawShipping + rawSubtotal * TAX_RATE;

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal: rawGrandTotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponFeedback({ type: 'error', text: data?.message || 'Invalid coupon code.' });
        return;
      }

      const c = data?.coupon;
      if (!c) {
        setCouponFeedback({ type: 'error', text: 'Failed to validate coupon. Please try again.' });
        return;
      }

      const nextCoupon: AppliedCoupon = {
        code: c.code,
        id: c.id || '',
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxDiscount: c.maxDiscount,
        minPurchase: c.minPurchase,
      };
      setAppliedCoupon(nextCoupon);
      persistAppliedCoupon(nextCoupon);
      setCouponInput(c.code);
      setCouponFeedback({
        type: 'success',
        text: `Coupon applied! You saved Rs ${(data.discountAmount ?? 0).toLocaleString()}.`,
      });
    } catch {
      setCouponFeedback({ type: 'error', text: 'Failed to validate coupon. Please try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setOrderError('');

    try {
      const shippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: `${formData.address.trim()}${formData.apartment ? `, ${formData.apartment.trim()}` : ''}`,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        country: 'Pakistan',
      };

      const cartPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      }));

      const res = await axios.post('/api/checkout', {
        items: cartPayload,
        shippingAddress,
        paymentMethod: 'cod',
        couponApplied: appliedCoupon?.code || '',
        couponId: appliedCoupon?.id || '',
        discountAmount: Math.round(discount * 100) / 100,
      });

      const { orderId: oid } = res.data;
      setOrderId(oid);

      clearCart();
      persistAppliedCoupon(null);
      setOrderPlaced(true);
      setLoading(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOrderError(err.response?.data?.message || 'Something went wrong. Please try again.');
      } else {
        setOrderError('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  const handlePaidMethodSubmit = async () => {
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    if (!paymentScreenshot) newErrors.screenshot = 'Payment screenshot is required';
    setPaymentErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setOrderError('');

    try {
      let screenshotUrl = '';
      if (paymentScreenshot) {
        setUploadingScreenshot(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', paymentScreenshot);
        const uploadRes = await axios.post('/api/payment/upload', uploadFormData);
        screenshotUrl = uploadRes.data.secure_url || uploadRes.data.url;
        setUploadingScreenshot(false);
      }

      const shippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: `${formData.address.trim()}${formData.apartment ? `, ${formData.apartment.trim()}` : ''}`,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        country: 'Pakistan',
      };

      const cartPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      }));

      const res = await axios.post('/api/checkout', {
        items: cartPayload,
        shippingAddress,
        paymentMethod,
        transactionId: transactionId.trim(),
        paymentScreenshot: screenshotUrl,
        couponApplied: appliedCoupon?.code || '',
        couponId: appliedCoupon?.id || '',
        discountAmount: Math.round(discount * 100) / 100,
      });

      setOrderId(res.data.orderId);

      clearCart();
      persistAppliedCoupon(null);
      setOrderPlaced(true);
      setLoading(false);
    } catch (err: unknown) {
      setUploadingScreenshot(false);
      if (axios.isAxiosError(err)) {
        setOrderError(err.response?.data?.message || 'Something went wrong. Please try again.');
      } else {
        setOrderError('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleCardSetup = async () => {
    if (!session?.user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setOrderError('');
    setShowCardForm(false);

    try {
      const shippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        street: `${formData.address.trim()}${formData.apartment ? `, ${formData.apartment.trim()}` : ''}`,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        country: 'Pakistan',
      };

      const cartPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      }));

      const res = await axios.post('/api/checkout', {
        items: cartPayload,
        shippingAddress,
        paymentMethod: 'credit-card',
        couponApplied: appliedCoupon?.code || '',
        couponId: appliedCoupon?.id || '',
        discountAmount: Math.round(discount * 100) / 100,
      });

      const { clientSecret: cs, orderId: oid } = res.data;
      setClientSecret(cs);
      setOrderId(oid);

      if (!cs) {
        setOrderError('Payment configuration error. Please contact support.');
        setLoading(false);
        return;
      }

      setShowCardForm(true);
      setLoading(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setOrderError(err.response?.data?.message || 'Something went wrong. Please try again.');
      } else {
        setOrderError('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!stripeInstanceRef.current || !stripeCardRef.current || !clientSecret) return;

    setConfirmingPayment(true);
    setOrderError('');

    try {
      const { error, paymentIntent } = await stripeInstanceRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card: stripeCardRef.current,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zip,
              country: 'PK',
            },
          },
        },
      });

      if (error) {
        setOrderError(error.message || 'Payment failed. Please try again.');
        setConfirmingPayment(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        clearCart();
        persistAppliedCoupon(null);
        setOrderPlaced(true);
      } else {
        setOrderError('Payment was not completed. Please try again.');
        setConfirmingPayment(false);
      }
    } catch {
      setOrderError('Payment failed. Please try again.');
      setConfirmingPayment(false);
    }
  };

  const getOrderNumber = () => {
    const prefix = (session?.user?.name?.split(' ')[0] || 'USER').replace(/[^A-Za-z]/g, '').toUpperCase() || 'USER';
    return `${prefix}-${(orderId || '').slice(-8).toUpperCase()}`;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isPaidMethod = PAID_METHODS.includes(paymentMethod);

  const availablePaymentMethods = paymentSettings
    ? PAYMENT_METHODS.filter((m) => {
        if (m.value === 'cod' || m.value === 'credit-card') return true;
        if (m.value === 'easypaisa') return paymentSettings.easypaisa.enabled;
        if (m.value === 'jazzcash') return paymentSettings.jazzcash.enabled;
        if (m.value === 'bank_transfer') return paymentSettings.bankTransfer.enabled;
        return true;
      })
    : PAYMENT_METHODS;

  if (orderPlaced) {
    return (
      <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
        <div className='container-luxury flex flex-col items-center justify-center py-24'>
          <div className='rounded-full bg-[var(--color-success)]/10 p-4'>
            <svg className='h-16 w-16 text-[var(--color-success)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <h1 className='mt-6 font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)]'>
            Order Placed!
          </h1>
          <p className='mt-2 text-[var(--color-mid-gray)]'>
            {isPaidMethod
              ? 'Your order has been placed. We will verify your payment shortly.'
              : paymentMethod === 'cod'
              ? 'Your order has been placed successfully.'
              : 'Your payment was successful. You will receive a confirmation email shortly.'}
          </p>
          {orderId && (
            <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6 text-center'>
              <p className='text-sm text-[var(--color-mid-gray)]'>Order Number</p>
              <p className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                #{getOrderNumber()}
              </p>
            </div>
          )}
          {isPaidMethod && (
            <div className='mt-4 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 text-center text-sm text-[var(--color-dark-gray)]'>
              <p>Payment Status: <span className='font-medium text-[var(--color-warning)]'>Pending Verification</span></p>
              <p className='mt-1 text-xs text-[var(--color-mid-gray)]'>We will update your order status once your payment is confirmed.</p>
            </div>
          )}
          <div className='mt-8 flex flex-wrap justify-center gap-4'>
            <Link href='/dashboard/orders' className='gold-button whitespace-nowrap px-8 py-3 text-sm font-medium'>
              View Orders
            </Link>
            <Link href='/products' className='whitespace-nowrap rounded-lg border border-[var(--color-light-gray)] px-8 py-3 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-white)] font-[family-name:var(--font-body)]'>
      <div className='container-luxury py-8'>
        <h1 className='font-[family-name:var(--font-heading)] text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl'>
          Checkout
        </h1>
        <div className='luxury-divider' />

        <div className='mb-10 flex w-full max-w-full flex-wrap items-center justify-center gap-y-3'>
          {steps.map((step, i) => (
            <div key={step.key} className='flex items-center'>
              <div className='flex items-center gap-1.5 sm:gap-3'>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all sm:h-10 sm:w-10 sm:text-sm ${
                    currentStep === step.key
                      ? 'bg-[var(--color-accent)] text-[var(--color-deep-black)] shadow-[var(--shadow-gold)]'
                      : steps.findIndex(s => s.key === currentStep) > i
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-cream)] text-[var(--color-mid-gray)] border border-[var(--color-light-gray)]'
                  }`}
                >
                  {steps.findIndex(s => s.key === currentStep) > i ? (
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`whitespace-nowrap text-xs font-medium sm:block sm:text-sm ${
                    currentStep === step.key
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-mid-gray)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-0.5 h-px w-4 sm:mx-4 sm:w-24 ${
                    steps.findIndex(s => s.key === currentStep) > i
                      ? 'bg-[var(--color-success)]'
                      : 'bg-[var(--color-light-gray)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='min-w-0 lg:col-span-2'>
            {currentStep === 'shipping' && (
              <div className='animate-fade-in' onFocusCapture={() => { if (window.innerWidth < 1024) setTimeout(() => document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Shipping Address
                </h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  Enter your shipping details
                </p>
                <div className='mt-6 space-y-4'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>First Name</label>
                      <input
                        type='text'
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        autoComplete='given-name'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.firstName ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='John'
                      />
                      {errors.firstName && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Last Name</label>
                      <input
                        type='text'
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        autoComplete='family-name'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.lastName ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='Doe'
                      />
                      {errors.lastName && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Email</label>
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        autoComplete='email'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='john@example.com'
                      />
                      {errors.email && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.email}</p>}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Phone</label>
                      <input
                        type='tel'
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        autoComplete='tel'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='03XXXXXXXXX'
                      />
                      {errors.phone && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Address</label>
                    <input
                      type='text'
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      autoComplete='street-address'
                      className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                        errors.address ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                      }`}
                      placeholder='123 Luxury Avenue'
                    />
                    {errors.address && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.address}</p>}
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>Apartment, Suite, etc. (optional)</label>
                    <input
                      type='text'
                      value={formData.apartment}
                      onChange={(e) => handleChange('apartment', e.target.value)}
                      autoComplete='address-line2'
                      className='mt-1 w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                      placeholder='Suite 4B'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-[var(--color-primary)]'>City</label>
                    <input
                      type='text'
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      autoComplete='address-level2'
                      className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                        errors.city ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                      }`}
                      placeholder='Karachi'
                    />
                    {errors.city && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.city}</p>}
                  </div>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>Province</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        autoComplete='address-level1'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.state ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                      >
                        <option value=''>Select province</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {errors.state && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.state}</p>}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>ZIP Code</label>
                      <input
                        type='text'
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value)}
                        autoComplete='postal-code'
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.zip ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='74000'
                      />
                      {errors.zip && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.zip}</p>}
                    </div>
                  </div>
                </div>
                <div className='mt-8 flex flex-wrap items-center justify-between gap-3'>
                  <Link href='/cart' className='min-w-0 rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors whitespace-nowrap'>
                    Back to Cart
                  </Link>
                  <button onClick={handleNext} className='gold-button whitespace-nowrap px-8 py-3 text-sm font-medium max-w-full'>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className='animate-fade-in'>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Review Your Order
                </h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  Please verify your order before proceeding
                </p>

                <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] p-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium text-[var(--color-primary)]'>Shipping To</h3>
                    <button onClick={() => setCurrentStep('shipping')} className='text-xs text-[var(--color-accent)] hover:underline'>
                      Edit
                    </button>
                  </div>
                  <p className='mt-2 text-sm text-[var(--color-dark-gray)]'>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className='text-sm text-[var(--color-dark-gray)]'>{formData.address}{formData.apartment ? `, ${formData.apartment}` : ''}</p>
                  <p className='text-sm text-[var(--color-dark-gray)]'>{formData.city}, {formData.state} {formData.zip}</p>
                  <p className='text-sm text-[var(--color-dark-gray)]'>{formData.email} | {formData.phone}</p>
                </div>

                <div className='mt-6 space-y-4'>
                  {cartItems.map((item) => (
                    <div key={item.id} className='flex gap-4 rounded-xl border border-[var(--color-light-gray)] p-4'>
                      <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)]'>
                        <Image src={item.image} alt={item.name} fill className='object-cover' sizes='80px' />
                      </div>
                      <div className='flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3'>
                        <div className='min-w-0'>
                          <h3 className='truncate font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-primary)]'>{item.name}</h3>
                          <p className='truncate text-xs text-[var(--color-mid-gray)]'>Qty: {item.quantity}{item.size ? ` | ${item.size}` : ''}{item.color ? ` | ${item.color}` : ''}</p>
                        </div>
                        <span className='shrink-0 font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-primary)] whitespace-nowrap'>
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-8 flex flex-wrap items-center justify-between gap-3'>
                  <button onClick={() => setCurrentStep('shipping')} className='min-w-0 whitespace-nowrap rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                    Back
                  </button>
                  <button onClick={handleNext} className='gold-button whitespace-nowrap px-8 py-3 text-sm font-medium max-w-full max-[380px]:flex-1 max-[380px]:px-4 max-[380px]:text-[13px]'>
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className='animate-fade-in'>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Payment
                </h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  Select your preferred payment method
                </p>

                {!session?.user && (
                  <div className='mt-6 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-4'>
                    <p className='text-sm text-[var(--color-primary)]'>
                      Please{' '}
                      <Link href='/auth/login' className='font-medium text-[var(--color-accent)] hover:underline'>
                        sign in
                      </Link>{' '}
                      to complete your purchase.
                    </p>
                  </div>
                )}

                <div className='mt-6 space-y-3'>
                  {availablePaymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => handlePaymentMethodChange(method.value)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        paymentMethod === method.value
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--color-light-gray)] bg-[var(--color-cream)] hover:border-[var(--color-mid-gray)]'
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        paymentMethod === method.value
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                          : 'border-[var(--color-mid-gray)]'
                      }`}>
                        {paymentMethod === method.value && (
                          <div className='h-2 w-2 rounded-full bg-[var(--color-deep-black)]' />
                        )}
                      </div>
                      <div>
                        <span className='text-sm font-medium text-[var(--color-primary)]'>{method.label}</span>
                        <p className='text-xs text-[var(--color-mid-gray)]'>{method.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'cod' && (
                  <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6'>
                    <div className='flex items-center gap-3'>
                      <svg className='h-8 w-8 text-[var(--color-success)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                      </svg>
                      <div>
                        <p className='font-medium text-[var(--color-primary)]'>Pay on Delivery</p>
                        <p className='text-sm text-[var(--color-mid-gray)]'>Pay with cash when your order is delivered.</p>
                      </div>
                    </div>
                  </div>
                )}

                {PAID_METHODS.includes(paymentMethod) && (
                  <div className='mt-6 space-y-5'>
                    {paymentMethod === 'easypaisa' && (
                      <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-5 space-y-3'>
                        <p className='font-medium text-[var(--color-primary)]'>Easypaisa Account Details</p>
                        <div className='grid grid-cols-1 gap-3 text-sm min-[400px]:grid-cols-2'>
                          <div className='min-w-0'>
                            <span className='text-[var(--color-mid-gray)]'>Merchant Number</span>
                            <div className='flex min-w-0 items-center gap-1'>
                              <p className='min-w-0 break-all font-mono font-bold text-[var(--color-primary)]'>{paymentSettings?.easypaisa.merchantNumber || '—'}</p>
                              <CopyButton
                                copied={copiedField === 'easypaisa-merchant'}
                                label={`merchant number ${paymentSettings?.easypaisa.merchantNumber || ''}`}
                                onCopy={() => handleCopy('easypaisa-merchant', paymentSettings?.easypaisa.merchantNumber || '')}
                              />
                            </div>
                          </div>
                          <div className='min-w-0'>
                            <span className='text-[var(--color-mid-gray)]'>Account Title</span>
                            <p className='break-words font-semibold text-[var(--color-primary)]'>{paymentSettings?.easypaisa.accountTitle || '—'}</p>
                          </div>
                        </div>
                        <div className='flex justify-center'>
                          <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                            {paymentSettings?.easypaisa.qrCodeImage ? (
                              <img src={paymentSettings.easypaisa.qrCodeImage} alt='Easypaisa QR code' className='h-full w-full object-contain' />
                            ) : (
                              <svg className='h-8 w-8 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 4v16m8-8H4' />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className='text-center text-xs text-[var(--color-mid-gray)]'>Scan QR to pay</p>
                      </div>
                    )}

                    {paymentMethod === 'jazzcash' && (
                      <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-5 space-y-3'>
                        <p className='font-medium text-[var(--color-primary)]'>JazzCash Account Details</p>
                        <div className='grid grid-cols-1 gap-3 text-sm min-[400px]:grid-cols-2'>
                          <div className='min-w-0'>
                            <span className='text-[var(--color-mid-gray)]'>Merchant Number</span>
                            <div className='flex min-w-0 items-center gap-1'>
                              <p className='min-w-0 break-all font-mono font-bold text-[var(--color-primary)]'>{paymentSettings?.jazzcash.merchantNumber || '—'}</p>
                              <CopyButton
                                copied={copiedField === 'jazzcash-merchant'}
                                label={`merchant number ${paymentSettings?.jazzcash.merchantNumber || ''}`}
                                onCopy={() => handleCopy('jazzcash-merchant', paymentSettings?.jazzcash.merchantNumber || '')}
                              />
                            </div>
                          </div>
                          <div className='min-w-0'>
                            <span className='text-[var(--color-mid-gray)]'>Account Title</span>
                            <p className='break-words font-semibold text-[var(--color-primary)]'>{paymentSettings?.jazzcash.accountTitle || '—'}</p>
                          </div>
                        </div>
                        <div className='flex justify-center'>
                          <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                            {paymentSettings?.jazzcash.qrCodeImage ? (
                              <img src={paymentSettings.jazzcash.qrCodeImage} alt='JazzCash QR code' className='h-full w-full object-contain' />
                            ) : (
                              <svg className='h-8 w-8 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 4v16m8-8H4' />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className='text-center text-xs text-[var(--color-mid-gray)]'>Scan QR to pay</p>
                      </div>
                    )}

                    {paymentMethod === 'bank_transfer' && (
                      <div className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-5 space-y-3'>
                        <p className='font-medium text-[var(--color-primary)]'>Bank Account Details</p>
                        <div className='space-y-2 text-sm'>
                          <div className='flex items-start justify-between gap-3'>
                            <span className='shrink-0 text-[var(--color-mid-gray)]'>Bank Name</span>
                            <span className='min-w-0 break-words text-right font-semibold text-[var(--color-primary)]'>{paymentSettings?.bankTransfer.bankName || '—'}</span>
                          </div>
                          <div className='flex items-start justify-between gap-3'>
                            <span className='shrink-0 text-[var(--color-mid-gray)]'>Account Title</span>
                            <span className='min-w-0 break-words text-right font-semibold text-[var(--color-primary)]'>{paymentSettings?.bankTransfer.accountTitle || '—'}</span>
                          </div>
                          <div className='flex items-start justify-between gap-3'>
                            <span className='shrink-0 text-[var(--color-mid-gray)]'>Account Number</span>
                            <span className='flex min-w-0 items-center justify-end gap-1'>
                              <span className='min-w-0 break-all text-right font-mono font-bold text-[var(--color-primary)]'>{paymentSettings?.bankTransfer.accountNumber || '—'}</span>
                              <CopyButton
                                copied={copiedField === 'bank-account'}
                                label={`account number ${paymentSettings?.bankTransfer.accountNumber || ''}`}
                                onCopy={() => handleCopy('bank-account', paymentSettings?.bankTransfer.accountNumber || '')}
                              />
                            </span>
                          </div>
                          <div className='flex items-start justify-between gap-3'>
                            <span className='shrink-0 text-[var(--color-mid-gray)]'>IBAN</span>
                            <span className='flex min-w-0 items-center justify-end gap-1'>
                              <span className='min-w-0 break-all text-right font-mono font-bold text-[var(--color-primary)]'>{paymentSettings?.bankTransfer.iban || '—'}</span>
                              <CopyButton
                                copied={copiedField === 'bank-iban'}
                                label={`IBAN ${paymentSettings?.bankTransfer.iban || ''}`}
                                onCopy={() => handleCopy('bank-iban', paymentSettings?.bankTransfer.iban || '')}
                              />
                            </span>
                          </div>
                          <div className='flex justify-center pt-2'>
                            <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--color-light-gray)] bg-[var(--color-white)]'>
                              {paymentSettings?.bankTransfer.qrCodeImage ? (
                                <img src={paymentSettings.bankTransfer.qrCodeImage} alt='Bank transfer QR code' className='h-full w-full object-contain' />
                              ) : (
                                <svg className='h-8 w-8 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M12 4v16m8-8H4' />
                                </svg>
                              )}
                            </div>
                          </div>
                          <p className='text-center text-xs text-[var(--color-mid-gray)]'>Scan QR to pay</p>
                        </div>
                      </div>
                    )}

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>Transaction ID <span className='text-[var(--color-error)]'>*</span></label>
                        <input
                          type='text'
                          value={transactionId}
                          onChange={(e) => { setTransactionId(e.target.value); setPaymentErrors(prev => { const n = { ...prev }; delete n.transactionId; return n; }); }}
                          className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                            paymentErrors.transactionId ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                          }`}
                          placeholder='Enter transaction ID'
                        />
                        {paymentErrors.transactionId && <p className='mt-1 text-xs text-[var(--color-error)]'>{paymentErrors.transactionId}</p>}
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-[var(--color-primary)]'>Payment Screenshot <span className='text-[var(--color-error)]'>*</span></label>
                        <div className='mt-1 flex items-center gap-4'>
                          <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${
                            paymentErrors.screenshot ? 'border-[var(--color-error)] bg-[var(--color-error)]/5' : 'border-[var(--color-light-gray)] bg-[var(--color-cream)] hover:border-[var(--color-mid-gray)]'
                          }`}>
                            <svg className='h-5 w-5 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                            </svg>
                            <span className='text-[var(--color-dark-gray)]'>{paymentScreenshot ? 'Change' : 'Upload'} Screenshot</span>
                            <input type='file' accept='image/*' onChange={handleScreenshotChange} className='hidden' />
                          </label>
                          {paymentScreenshot && (
                            <button
                              onClick={() => { setPaymentScreenshot(null); setPaymentScreenshotPreview(''); }}
                              className='text-sm text-[var(--color-error)] hover:underline'
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {paymentErrors.screenshot && <p className='mt-1 text-xs text-[var(--color-error)]'>{paymentErrors.screenshot}</p>}
                        {paymentScreenshotPreview && (
                          <div className='mt-3'>
                            <div className='relative h-40 w-60 max-w-full overflow-hidden rounded-lg border border-[var(--color-light-gray)]'>
                              <img src={paymentScreenshotPreview} alt='Payment screenshot preview' className='h-full w-full object-cover' />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'credit-card' && showCardForm && (
                  <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-5'>
                    <p className='text-sm font-medium text-[var(--color-primary)]'>Enter Card Details</p>
                    <div ref={cardContainerRef} className='mt-3 min-h-[40px] rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] p-3' />
                    <div className='mt-4 space-y-2 text-sm text-[var(--color-dark-gray)]'>
                      <div className='flex justify-between'>
                        <span className='text-[var(--color-mid-gray)]'>Name on Card</span>
                        <span className='font-medium'>{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-[var(--color-mid-gray)]'>Billing Email</span>
                        <span className='font-medium'>{formData.email}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-[var(--color-mid-gray)]'>Billing Address</span>
                        <span className='min-w-0 font-medium text-right max-w-[200px] truncate'>{formData.address}, {formData.city}</span>
                      </div>
                    </div>
                    <p className='mt-3 text-xs text-[var(--color-mid-gray)]'>Your card information is processed securely by Stripe.</p>
                  </div>
                )}

                {orderError && (
                  <div className='mt-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-4 text-sm text-[var(--color-error)]'>
                    <div className='flex items-start gap-2'>
                      <svg className='mt-0.5 h-4 w-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <span>{orderError}</span>
                    </div>
                  </div>
                )}

                <div className='mt-8 flex flex-wrap items-center justify-between gap-3'>
                  <button onClick={() => setCurrentStep('review')} className='min-w-0 whitespace-nowrap rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                    Back
                  </button>

                  {paymentMethod === 'cod' && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || !session?.user}
                      className='gold-button flex items-center gap-2 px-8 py-3 text-sm font-medium max-w-full max-[380px]:flex-1 max-[380px]:px-4 max-[380px]:text-[13px] disabled:cursor-not-allowed disabled:opacity-70'
                    >
                      {loading ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                          Processing...
                        </>
                      ) : (
                        `Place Order - Rs ${total.toLocaleString()}`
                      )}
                    </button>
                  )}

                  {PAID_METHODS.includes(paymentMethod) && (
                    <button
                      onClick={handlePaidMethodSubmit}
                      disabled={loading || uploadingScreenshot || !session?.user}
                      className='gold-button flex items-center gap-2 px-8 py-3 text-sm font-medium max-w-full max-[380px]:flex-1 max-[380px]:px-4 max-[380px]:text-[13px] disabled:cursor-not-allowed disabled:opacity-70'
                    >
                      {loading || uploadingScreenshot ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                          {uploadingScreenshot ? 'Uploading...' : 'Processing...'}
                        </>
                      ) : (
                        `Submit Order - Rs ${total.toLocaleString()}`
                      )}
                    </button>
                  )}

                  {paymentMethod === CARD_METHOD && !showCardForm && (
                    <button
                      onClick={handleCardSetup}
                      disabled={loading || !session?.user}
                      className='gold-button flex items-center gap-2 px-8 py-3 text-sm font-medium max-w-full max-[380px]:flex-1 max-[380px]:px-4 max-[380px]:text-[13px] disabled:cursor-not-allowed disabled:opacity-70'
                    >
                      {loading ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                          Processing...
                        </>
                      ) : (
                        `Place Order - Rs ${total.toLocaleString()}`
                      )}
                    </button>
                  )}

                  {paymentMethod === CARD_METHOD && showCardForm && (
                    <button
                      onClick={handleCardPayment}
                      disabled={confirmingPayment}
                      className='gold-button flex items-center gap-2 px-8 py-3 text-sm font-medium max-w-full max-[380px]:flex-1 max-[380px]:px-4 max-[380px]:text-[13px] disabled:cursor-not-allowed disabled:opacity-70'
                    >
                      {confirmingPayment ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-deep-black)] border-t-transparent' />
                          Processing...
                        </>
                      ) : (
                        `Pay Rs ${total.toLocaleString()}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='min-w-0 lg:col-span-1'>
            <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                Order Summary
              </h2>

              <div className='mt-6 space-y-3'>
                {cartItems.map((item) => (
                  <div key={item.id} className='flex gap-3'>
                    <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-white)]'>
                      <Image src={item.image} alt={item.name} fill className='object-cover' sizes='48px' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='line-clamp-2 break-words text-sm font-medium text-[var(--color-primary)]'>{item.name}</p>
                      <p className='mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--color-mid-gray)]'>
                        <span>Qty {item.quantity}</span>
                        <span className='whitespace-nowrap font-medium text-[var(--color-primary)]'>
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className='mt-1 inline-flex items-center gap-1 text-xs text-[var(--color-mid-gray)] transition-colors hover:text-[var(--color-error)]'
                      >
                        <svg className='h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='mt-6 border-t border-[var(--color-light-gray)] pt-5'>
                <label className='mb-2 block text-sm font-medium text-[var(--color-primary)]'>
                  Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className='flex items-center justify-between gap-2 rounded-lg border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 px-3 py-2.5'>
                    <p className='min-w-0 truncate text-xs font-medium text-[var(--color-success)]'>
                      Coupon applied: {appliedCoupon.code}
                    </p>
                    <button
                      onClick={handleRemoveCoupon}
                      className='shrink-0 whitespace-nowrap text-xs font-medium text-[var(--color-mid-gray)] transition-colors hover:text-[var(--color-error)]'
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className='flex w-full max-w-full gap-2'>
                    <input
                      type='text'
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponFeedback(null); }}
                      placeholder='Enter coupon code'
                      className='min-w-0 flex-1 rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-3 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]'
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className='shrink-0 rounded-lg border border-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-deep-black)] transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponFeedback && (
                  <p className={`mt-2 break-words text-xs ${couponFeedback.type === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
                    {couponFeedback.text}
                  </p>
                )}
                {appliedCoupon && subtotal > 0 && grandTotal < appliedCoupon.minPurchase && (
                  <p className='mt-2 break-words text-xs text-[var(--color-warning)]'>
                    Minimum purchase of Rs {appliedCoupon.minPurchase.toLocaleString()} is required for this coupon.
                  </p>
                )}
              </div>

              <div className='mt-6 space-y-3 border-t border-[var(--color-light-gray)] pt-6'>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Subtotal</span>
                  <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-primary)]'>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Shipping</span>
                  <span className={`shrink-0 whitespace-nowrap font-medium ${shipping === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'}`}>
                    {shipping === 0 ? 'Free' : `Rs ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <span className='min-w-0 break-words text-[var(--color-mid-gray)]'>Tax (8%)</span>
                  <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-primary)]'>Rs {tax.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between gap-2 border-t border-[var(--color-light-gray)] pt-3'>
                  <span className='min-w-0 break-words font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]'>
                    Grand Total
                  </span>
                  <span className='shrink-0 whitespace-nowrap font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--color-primary)]'>
                    Rs {grandTotal.toLocaleString()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className='flex items-center justify-between gap-2 text-sm'>
                    <span className='min-w-0 break-words text-[var(--color-success)]'>
                      Discount{appliedCoupon?.discountType === 'percentage' ? ` (${appliedCoupon.discountValue}%)` : ''}
                    </span>
                    <span className='shrink-0 whitespace-nowrap font-medium text-[var(--color-success)]'>-Rs {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className='flex items-center justify-between gap-2 border-t border-[var(--color-light-gray)] pt-3'>
                  <span className='min-w-0 break-words font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
                    Total Payable
                  </span>
                  <span className='shrink-0 whitespace-nowrap font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
                    Rs {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
