'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiStar, FiCheck, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';

interface ReviewUser {
  _id?: string;
  name?: string;
  avatar?: string | null;
}

interface ReviewItem {
  _id: string;
  user?: ReviewUser | null;
  product?: { _id?: string; name?: string } | null;
  rating: number;
  title?: string;
  comment: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ReviewsSectionProps {
  productId: string;
  onProductUpdated?: (data: { rating: number; reviewCount: number }) => void;
}

const REVIEWS_LIMIT = 10;

function initials(name?: string): string {
  return (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          size={size}
          className={
            n <= Math.round(rating)
              ? 'text-[var(--color-accent)] fill-[var(--color-accent)]'
              : 'text-[var(--color-light-gray)]'
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId, onProductUpdated }: ReviewsSectionProps) {
  const { status } = useSession();
  const loggedIn = status === 'authenticated';
  const productHref = `/products/${productId}`;

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [pagination, setPagination] = useState<ReviewPagination | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [myReview, setMyReview] = useState<ReviewItem | null>(null);
  const [eligible, setEligible] = useState(false);
  const [eligibilityLoaded, setEligibilityLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = useCallback(
    async (pageNum: number) => {
      try {
        const res = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}&page=${pageNum}&limit=${REVIEWS_LIMIT}`
        );
        const data = await res.json();
        if (res.ok) {
          setReviews(data.reviews || []);
          setListError('');
          const next = data.pagination || null;
          setPagination(next);
          if (loggedIn) {
            setMyReview(data.myReview || null);
            setEligible(!!data.eligible);
            setEligibilityLoaded(true);
          }
        } else {
          setListError(data.message || 'Failed to load reviews.');
        }
      } catch {
        setListError('Failed to load reviews.');
      } finally {
        setListLoading(false);
      }
    },
    [productId, loggedIn]
  );

  useEffect(() => {
    if (status === 'loading') return;
    const loadInitialReviews = async () => {
      await fetchReviews(1);
    };
    loadInitialReviews();
  }, [status, fetchReviews]);

  const refreshProduct = useCallback(async () => {
    if (!onProductUpdated) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const prod = data.product || data;
      if (typeof prod.rating === 'number') {
        onProductUpdated({
          rating: prod.rating,
          reviewCount: prod.numReviews ?? prod.reviewCount ?? 0,
        });
      }
    } catch {
      // non-fatal: header count stays until next page load
    }
  }, [productId, onProductUpdated]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (rating < 1) {
      setFormError('Please select a rating (1–5 stars).');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write a short review comment.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productId,
          rating,
          title: title.trim() ? title.trim() : undefined,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setShowForm(false);
          setFormError('You have already reviewed this product.');
        } else if (res.status === 403) {
          setFormError(
            data?.message ||
              'You must purchase and receive this product before writing a review.'
          );
        } else {
          setFormError(data?.message || 'Failed to submit your review. Please try again.');
        }
        await fetchReviews(1);
        return;
      }

      setSuccessMsg('Thank you! Your review has been submitted.');
      setRating(0);
      setTitle('');
      setComment('');
      setShowForm(false);
      await Promise.all([fetchReviews(1), refreshProduct()]);
    } catch {
      setFormError('Failed to submit your review. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const promptState =
    status === 'loading'
      ? 'loading'
      : status === 'unauthenticated'
        ? 'signin'
        : !eligibilityLoaded
          ? 'loading'
          : myReview
            ? 'reviewed'
            : eligible
              ? 'eligible'
              : 'not-eligible';

  return (
    <div className='max-w-3xl'>
      {/* Success message */}
      {successMsg && (
        <div className='mb-6 flex items-center gap-2 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-[var(--color-success)]'>
          <FiCheck className='shrink-0' />
          {successMsg}
        </div>
      )}

      {/* Write a review action area */}
      <div className='mb-10 rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)] p-5'>
        {promptState === 'loading' && (
          <p className='text-sm text-[var(--color-mid-gray)]'>Checking review access&hellip;</p>
        )}

        {promptState === 'signin' && (
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-medium text-[var(--color-primary)]'>Write a Review</p>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                Sign in to review this product after you receive your order.
              </p>
            </div>
            <Link
              href={`/auth/login?redirect=${productHref}`}
              className='gold-button shrink-0 px-6 py-3 text-sm'
            >
              Sign in to Review
            </Link>
          </div>
        )}

        {promptState === 'reviewed' && (
          <div className='flex items-start gap-3'>
            <div className='rounded-full bg-[var(--color-success)]/10 p-2 text-[var(--color-success)]'>
              <FiCheck className='h-4 w-4' />
            </div>
            <div>
              <p className='font-medium text-[var(--color-primary)]'>
                You have already reviewed this product.
              </p>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                Thank you for sharing your feedback.
              </p>
            </div>
          </div>
        )}

        {promptState === 'not-eligible' && (
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-medium text-[var(--color-primary)]'>Write a Review</p>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                You can review this product once you purchase and receive it. Reviews are
                available to verified customers.
              </p>
            </div>
          </div>
        )}

        {promptState === 'eligible' && (
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='font-medium text-[var(--color-primary)]'>Write a Review</p>
              <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
                Tell others what you think about this product.
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className='flex items-center gap-2 rounded-lg bg-[var(--color-deep-black)] px-6 py-3 text-sm font-medium text-[var(--color-white)] transition-colors hover:bg-[var(--color-charcoal)]'
            >
              <FiMessageSquare className='h-4 w-4' />
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>
        )}

        {promptState === 'eligible' && showForm && (
          <form onSubmit={handleSubmit} className='mt-5 border-t border-[var(--color-light-gray)] pt-5'>
            <div className='space-y-4'>
              <div>
                <p className='mb-2 text-sm font-medium text-[var(--color-primary)]'>
                  Rating <span className='text-[var(--color-error)]'>*</span>
                </p>
                <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type='button'
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      className='p-0.5'
                    >
                      <FiStar
                        size={28}
                        className={
                          n <= (hoverRating || rating)
                            ? 'text-[var(--color-accent)] fill-[var(--color-accent)]'
                            : 'text-[var(--color-light-gray)]'
                        }
                      />
                    </button>
                  ))}
                  <span className='ml-2 text-sm text-[var(--color-mid-gray)]'>
                    {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor='review-title'
                  className='mb-2 block text-sm font-medium text-[var(--color-primary)]'
                >
                  Review Title <span className='font-normal text-[var(--color-mid-gray)]'>(optional)</span>
                </label>
                <input
                  id='review-title'
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder='Great quality and fast delivery'
                  className='w-full rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] outline-none transition-colors focus:border-[var(--color-accent)]'
                />
              </div>

              <div>
                <label
                  htmlFor='review-comment'
                  className='mb-2 block text-sm font-medium text-[var(--color-primary)]'
                >
                  Review Comment <span className='text-[var(--color-error)]'>*</span>
                </label>
                <textarea
                  id='review-comment'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder='Share your experience with this product&hellip;'
                  className='w-full resize-y rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-mid-gray)] outline-none transition-colors focus:border-[var(--color-accent)]'
                />
                <p className='mt-1 text-right text-xs text-[var(--color-mid-gray)]'>
                  {comment.length}/2000
                </p>
              </div>

              {formError && (
                <p className='flex items-start gap-2 text-sm text-[var(--color-error)]'>
                  <FiAlertCircle className='mt-0.5 shrink-0' />
                  {formError}
                </p>
              )}

              <div className='flex flex-wrap gap-3'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='gold-button px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70'
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowForm(false)}
                  className='rounded-lg border border-[var(--color-light-gray)] px-6 py-3 text-sm font-medium text-[var(--color-dark-gray)] transition-colors hover:bg-[var(--color-white)]'
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Reviews list */}
      <div>
        <h3 className='mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--color-primary)]'>
          Customer Reviews
          {pagination && pagination.total > 0 && (
            <span className='ml-2 text-sm font-normal text-[var(--color-mid-gray)]'>
              ({pagination.total})
            </span>
          )}
        </h3>

        {listLoading ? (
          <div className='space-y-3'>
            {[0, 1].map((n) => (
              <div
                key={n}
                className='h-24 animate-pulse rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-cream)]'
              />
            ))}
          </div>
        ) : listError ? (
          <p className='text-sm text-[var(--color-error)]'>{listError}</p>
        ) : reviews.length === 0 ? (
          <div className='rounded-xl border border-dashed border-[var(--color-light-gray)] bg-[var(--color-cream)] p-8 text-center'>
            <FiMessageSquare className='mx-auto h-8 w-8 text-[var(--color-mid-gray)]' />
            <p className='mt-3 font-medium text-[var(--color-primary)]'>No reviews yet.</p>
            <p className='mt-1 text-sm text-[var(--color-mid-gray)]'>
              Be the first to share your experience.
            </p>
          </div>
        ) : (
          <ul className='space-y-4'>
            {reviews.map((review) => (
              <li
                key={review._id}
                className='rounded-xl border border-[var(--color-light-gray)] bg-[var(--color-white)] p-5'
              >
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[var(--color-accent)]/15'
                      style={
                        review.user?.avatar
                          ? {
                              backgroundImage: `url(${review.user.avatar})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : undefined
                      }
                    >
                      {!review.user?.avatar && (
                        <span className='flex h-full w-full items-center justify-center text-xs font-bold text-[var(--color-accent-dark)]'>
                          {initials(review.user?.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-[var(--color-primary)]'>
                        {review.user?.name || 'Anonymous'}
                      </p>
                      {review.isVerified && (
                        <span className='mt-0.5 inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent-dark)]'>
                          <FiCheck className='h-3 w-3' />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className='text-xs text-[var(--color-mid-gray)]'>
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <div className='mt-3'>
                  <Stars rating={review.rating} />
                </div>

                {review.title && (
                  <p className='mt-3 font-medium text-[var(--color-primary)]'>{review.title}</p>
                )}
                <p className='mt-1 text-sm leading-relaxed text-[var(--color-dark-gray)]'>
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className='mt-6 flex flex-wrap items-center justify-between gap-3'>
            <button
              onClick={() => {
                if (!pagination?.hasPrevPage) return;
                const np = pagination.page - 1;
                setListLoading(true);
                fetchReviews(np);
              }}
              disabled={!pagination?.hasPrevPage}
              className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50'
            >
              Previous
            </button>
            <span className='text-sm text-[var(--color-mid-gray)]'>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => {
                if (!pagination?.hasNextPage) return;
                const np = pagination.page + 1;
                setListLoading(true);
                fetchReviews(np);
              }}
              disabled={!pagination?.hasNextPage}
              className='rounded-lg border border-[var(--color-light-gray)] bg-[var(--color-white)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}