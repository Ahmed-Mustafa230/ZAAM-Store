'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

type Step = 'shipping' | 'review' | 'payment';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

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

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      router.replace('/products');
    }
  }, [cartItems, orderPlaced, router]);

  if (cartItems.length === 0 && !orderPlaced) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
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

  const handlePlaceOrder = async () => {
    setLoading(true);
    setOrderError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearCart();
      setOrderPlaced(true);
    } catch {
      setOrderError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Order Placed Successfully!
          </h1>
          <p className='mt-2 text-[var(--color-mid-gray)]'>
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          <div className='mt-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6 text-center'>
            <p className='text-sm text-[var(--color-mid-gray)]'>Order Number</p>
            <p className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
              #ZAAM-{String(Math.floor(Math.random() * 100000)).padStart(6, '0')}
            </p>
          </div>
          <div className='mt-8 flex gap-4'>
            <Link href='/dashboard/orders' className='gold-button px-8 py-3 text-sm font-medium'>
              View Orders
            </Link>
            <Link href='/products' className='rounded-lg border border-[var(--color-light-gray)] px-8 py-3 text-sm font-medium text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
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

        {/* Progress Steps */}
        <div className='mb-10 flex items-center justify-center'>
          {steps.map((step, i) => (
            <div key={step.key} className='flex items-center'>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
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
                  className={`hidden text-sm font-medium sm:block ${
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
                  className={`mx-4 h-px w-16 sm:w-24 ${
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
          {/* Main Content */}
          <div className='lg:col-span-2'>
            {/* Step 1: Shipping */}
            {currentStep === 'shipping' && (
              <div className='animate-fade-in'>
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
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='+1 (555) 000-0000'
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
                      className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                        errors.city ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                      }`}
                      placeholder='Karachi'
                    />
                    {errors.city && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.city}</p>}
                  </div>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>State</label>
                      <input
                        type='text'
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.state ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='Sindh'
                      />
                      {errors.state && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.state}</p>}
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-[var(--color-primary)]'>ZIP Code</label>
                      <input
                        type='text'
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value)}
                        className={`mt-1 w-full rounded-lg border bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] focus:ring-1 focus:ring-[var(--color-accent)] ${
                          errors.zip ? 'border-[var(--color-error)]' : 'border-[var(--color-light-gray)] focus:border-[var(--color-accent)]'
                        }`}
                        placeholder='74000'
                      />
                      {errors.zip && <p className='mt-1 text-xs text-[var(--color-error)]'>{errors.zip}</p>}
                    </div>
                  </div>
                </div>
                <div className='mt-8 flex justify-between'>
                  <Link href='/cart' className='rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                    Back to Cart
                  </Link>
                  <button onClick={handleNext} className='gold-button px-8 py-3 text-sm font-medium'>
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {currentStep === 'review' && (
              <div className='animate-fade-in'>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Review Your Order
                </h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  Please verify your order before proceeding
                </p>

                {/* Shipping Summary */}
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

                {/* Items Review */}
                <div className='mt-6 space-y-4'>
                  {cartItems.map((item) => (
                    <div key={item.id} className='flex gap-4 rounded-xl border border-[var(--color-light-gray)] p-4'>
                      <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--color-cream)]'>
                        <Image src={item.image} alt={item.name} fill className='object-cover' sizes='80px' />
                      </div>
                      <div className='flex flex-1 items-center justify-between'>
                        <div>
                          <h3 className='font-[family-name:var(--font-heading)] text-sm font-semibold text-[var(--color-primary)]'>{item.name}</h3>
                          <p className='text-xs text-[var(--color-mid-gray)]'>Qty: {item.quantity}{item.size ? ` | ${item.size}` : ''}{item.color ? ` | ${item.color}` : ''}</p>
                        </div>
                        <span className='font-[family-name:var(--font-heading)] text-base font-bold text-[var(--color-primary)]'>
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-8 flex justify-between'>
                  <button onClick={() => setCurrentStep('shipping')} className='rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                    Back
                  </button>
                  <button onClick={handleNext} className='gold-button px-8 py-3 text-sm font-medium'>
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 'payment' && (
              <div className='animate-fade-in'>
                <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                  Payment Method
                </h2>
                <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                  Choose your payment method
                </p>

                <div className='mt-6 space-y-4'>
                  {[
                    { id: 'easypaisa', label: 'Easypaisa', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'jazzcash', label: 'JazzCash', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'cod', label: 'Cash on Delivery', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        paymentMethod === method.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-[var(--shadow-gold)]'
                          : 'border-[var(--color-light-gray)] hover:bg-[var(--color-cream)]'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        paymentMethod === method.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-mid-gray)]'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className='h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]' />
                        )}
                      </div>
                      <svg className='h-6 w-6 text-[var(--color-mid-gray)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d={method.icon} />
                      </svg>
                      <span className='text-sm font-medium text-[var(--color-primary)]'>{method.label}</span>
                    </button>
                  ))}
                </div>

                {/* Payment Details */}
                {paymentMethod === 'easypaisa' && (
                  <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6 animate-fade-in'>
                    <h3 className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]'>Easypaisa Payment</h3>
                    <p className='mt-2 text-sm text-[var(--color-mid-gray)]'>
                      Send your payment to the following Easypaisa account:
                    </p>
                    <div className='mt-4 rounded-lg bg-[var(--color-white)] p-4 text-center'>
                      <p className='text-xs text-[var(--color-mid-gray)]'>Account Number</p>
                      <p className='font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-primary)]'>03XX-XXXXXXX</p>
                    </div>
                    <p className='mt-3 text-xs text-[var(--color-mid-gray)]'>
                      After sending payment, please share the transaction ID in the order notes.
                    </p>
                  </div>
                )}
                {paymentMethod === 'jazzcash' && (
                  <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6 animate-fade-in'>
                    <h3 className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]'>JazzCash Payment</h3>
                    <p className='mt-2 text-sm text-[var(--color-mid-gray)]'>
                      Send your payment to the following JazzCash account:
                    </p>
                    <div className='mt-4 rounded-lg bg-[var(--color-white)] p-4 text-center'>
                      <p className='text-xs text-[var(--color-mid-gray)]'>Account Number</p>
                      <p className='font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--color-primary)]'>03XX-XXXXXXX</p>
                    </div>
                    <p className='mt-3 text-xs text-[var(--color-mid-gray)]'>
                      After sending payment, please share the transaction ID in the order notes.
                    </p>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className='mt-6 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6 animate-fade-in'>
                    <h3 className='font-[family-name:var(--font-heading)] text-base font-semibold text-[var(--color-primary)]'>Cash on Delivery</h3>
                    <p className='mt-2 text-sm text-[var(--color-mid-gray)]'>
                      Pay with cash when your order is delivered to your doorstep.
                    </p>
                    <div className='mt-4 flex items-center gap-3 rounded-lg bg-[var(--color-white)] p-4'>
                      <svg className='h-6 w-6 text-[var(--color-accent)] shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p className='text-sm text-[var(--color-dark-gray)]'>
                        No additional fees. Pay exactly <strong>Rs {total.toLocaleString()}</strong> at your door.
                      </p>
                    </div>
                  </div>
                )}

                {orderError && (
                  <div className='mt-4 rounded-lg bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]'>
                    {orderError}
                  </div>
                )}

                <div className='mt-8 flex justify-between'>
                  <button onClick={() => setCurrentStep('review')} className='rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm text-[var(--color-dark-gray)] hover:bg-[var(--color-cream)] transition-colors'>
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className='gold-button flex items-center gap-2 px-8 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70'
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
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-8 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-6'>
              <h2 className='font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-primary)]'>
                Order Summary
              </h2>
              <div className='mt-6 space-y-3'>
                {cartItems.map((item) => (
                  <div key={item.id} className='flex items-center gap-3'>
                    <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-white)]'>
                      <Image src={item.image} alt={item.name} fill className='object-cover' sizes='48px' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-[var(--color-primary)] truncate'>{item.name}</p>
                      <p className='text-xs text-[var(--color-mid-gray)]'>Qty: {item.quantity}</p>
                    </div>
                    <span className='text-sm font-medium text-[var(--color-primary)]'>
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className='mt-6 space-y-3 border-t border-[var(--color-light-gray)] pt-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Subtotal</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-primary)]'}`}>
                    {shipping === 0 ? 'Free' : `Rs ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-[var(--color-mid-gray)]'>Tax (8%)</span>
                  <span className='font-medium text-[var(--color-primary)]'>Rs {tax.toLocaleString()}</span>
                </div>
                <div className='flex justify-between border-t border-[var(--color-light-gray)] pt-3'>
                  <span className='font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>Total</span>
                  <span className='font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-primary)]'>
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
