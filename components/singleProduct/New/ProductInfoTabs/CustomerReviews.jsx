import { useTranslations, useLocale } from 'next-intl';
import he from 'he';
import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from '@mui/material/Skeleton';
import styles from './CustomerReviews.module.css';

// ====================================================================
//  HOOK: useHasMounted
// ====================================================================
const useHasMounted = () => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true); }, []);
    return hasMounted;
};

// ====================================================================
//  HELPER: StarRating (display only)
// ====================================================================
const StarRating = ({ rating, size = '1rem' }) => (
    <div className={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
            <span
                key={i}
                className={styles.starRatingItem}
                style={{ color: i <= rating ? '#C7944B' : '#D9D2CA', fontSize: size }}
            >★</span>
        ))}
    </div>
);

// ====================================================================
//  HELPER: StarPicker (interactive, premium)
// ====================================================================
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const StarPicker = ({ value, onChange, error }) => {
    const [hover, setHover] = useState(0);
    const active = hover || value;

    return (
        <div className={styles.starPickerWrapper}>
            <span className={styles.starPickerLabel}>Your Rating</span>
            <div className={styles.starPickerRow} role="group" aria-label="Select star rating">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={`${styles.starPickerItem} ${s <= active ? styles.starFilled : styles.starEmpty} ${s <= value ? styles.starActive : ''}`}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => onChange(s)}
                        aria-label={`${s} star${s > 1 ? 's' : ''}`}
                        aria-pressed={value === s}
                    >
                        {/* SVG star for crisp rendering */}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                ))}
            </div>
            <span className={styles.starRatingHint}>
                {active > 0 ? RATING_LABELS[active] : 'Tap a star to rate'}
            </span>
            {error && <span className={styles.starErrorText}>{error}</span>}
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewSummary (Top Section)
// ====================================================================
const ReviewSummary = ({ averageRating, reviewCount, distribution, onWriteClick, t, loading }) => (
    <div className={`row align-items-center pb-5 border-bottom ${styles.borderDarkSubtle}`}>
        {/* Left: Big Score */}
        <div className="col-md-3 text-center text-md-left mb-4 mb-md-0">
            {loading ? (
                <>
                    <Skeleton variant="text" width={80} height={60} className="mx-auto mx-md-0" />
                    <Skeleton variant="text" width={120} height={30} className="mx-auto mx-md-0" />
                    <Skeleton variant="text" width={140} height={20} className="mx-auto mx-md-0" />
                </>
            ) : (
                <>
                    <div className="display-4 font-weight-bold" style={{ color: '#1a1a1a', fontFamily: "inherit" }}>
                        {reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="mb-2"><StarRating rating={Math.round(averageRating)} size="1.2rem" /></div>
                    <div style={{ fontSize: '0.82rem', color: '#888', fontFamily: "inherit" }}>
                        {t('basedOn', { count: reviewCount })}
                    </div>
                </>
            )}
        </div>

        {/* Middle: Bars */}
        <div className="col-md-6 mb-4 mb-md-0 px-md-5">
            {loading ? (
                [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={20} className="mb-2" />)
            ) : (
                [5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                    return (
                        <div key={star} className="d-flex align-items-center mb-2" style={{ gap: '8px' }}>
                            <span style={{ width: '10px', fontSize: '0.78rem', color: '#555', fontFamily: "inherit", fontWeight: 600 }}>{star}</span>
                            <span style={{ color: '#C7944B', fontSize: '0.78rem', lineHeight: 1 }}>★</span>
                            <div className={`flex-grow-1 ${styles.progressThin}`}>
                                <div className={styles.progressBarGold} style={{ width: `${percent}%` }} />
                            </div>
                            <span style={{ width: '20px', fontSize: '0.78rem', color: '#888', textAlign: 'right', fontFamily: "inherit" }}>{count}</span>
                        </div>
                    );
                })
            )}
        </div>

        {/* Right: Button */}
        <div className="col-md-3 text-center text-md-right">
            {loading ? (
                <Skeleton variant="text" width={180} height={60} className="mx-auto" />
            ) : (
                <button className={styles.writeReviewBtn} onClick={onWriteClick}>
                    {t('writeReviewTitle')}
                </button>
            )}
        </div>
    </div>
);

// ====================================================================
//  COMPONENT: ReviewList
// ====================================================================
const ReviewList = ({ reviews, loading, t }) => {
    const hasMounted = useHasMounted();

    if (loading) return (
        <div className={`mt-4 ${styles.pxResponsiveList}`} style={{ height: '50vh', overflow: 'hidden' }}>
            {[1, 2, 3].map((i) => (
                <div key={i} className={`row py-4 border-top ${styles.borderDarkSubtle}`}>
                    <div className="col-md-3 mb-3 mb-md-0">
                        <Skeleton variant="text" width="70%" height={24} className="mb-1" />
                        <Skeleton variant="text" width="40%" height={20} />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <Skeleton variant="text" width={140} height={24} />
                            <Skeleton variant="text" width={80} height={20} />
                        </div>
                        <Skeleton variant="text" width="100%" height={20} className="mb-1" />
                        <Skeleton variant="text" width="85%" height={20} />
                    </div>
                </div>
            ))}
        </div>
    );

    if (!reviews || reviews.length === 0) return (
        <div className="text-center py-5" style={{ color: '#888', fontFamily: "inherit", fontSize: '0.9rem' }}>
            {t('beFirst')}
        </div>
    );

    return (
        <div className={`custom-scroll ${styles.reviewList} ${styles.customScroll} ${styles.pxResponsiveList}`}>
            {reviews.map((review) => (
                <div key={review.id} className={`row py-4 border-top ${styles.borderDarkSubtle}`}>
                    <div className="col-md-3 mb-3 mb-md-0">
                        <h6 className={`font-weight-bold mb-1 ${styles.reviewerName}`}>{review.customer_name}</h6>
                        <div className={styles.verifiedBadge}>
                            <span className={styles.checkmarkCircle}>✓</span> Verified Buyer
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                                <StarRating rating={review.star} size="0.9rem" />
                                <span className={`font-weight-bold small text-uppercase ${styles.reviewLabel}`}>
                                    {review.star === 5 ? 'Excellent' : review.star >= 4 ? 'Very Good' : review.star >= 3 ? 'Good' : 'Review'}
                                </span>
                            </div>
                            <small style={{ color: '#999', fontFamily: "inherit", fontSize: '0.75rem' }}>
                                {hasMounted ? new Date(review.created_at).toLocaleDateString() : ''}
                            </small>
                        </div>
                        <p style={{ lineHeight: '1.75', opacity: 0.85, fontFamily: "inherit", fontSize: '0.88rem', color: '#333', margin: 0 }}>
                            {review.comment}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewFormModal — Fully Revamped
// ====================================================================
const ReviewFormModal = ({ show, onClose, productId, onReviewSubmitted, t }) => {
    const [formData, setFormData] = useState({ rating: 0, name: '', email: '', phone: '', comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!show) return;
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const u = JSON.parse(atob(userStr));
                    setFormData(prev => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
                } catch (e) { }
            }
        }
    }, [show]);

    const handleAnonToggle = (e) => {
        setIsAnonymous(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, name: 'Anonymous' }));
        } else {
            const userStr = localStorage.getItem('user');
            let originalName = '';
            if (userStr) { try { originalName = JSON.parse(atob(userStr)).name; } catch (e) { } }
            setFormData(prev => ({ ...prev, name: originalName }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (formData.rating === 0) newErrors.rating = t('selectRatingAlert');
        if (!formData.name.trim()) newErrors.customer_name = ['Name is required'];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.customer_email = ['Email is required'];
        else if (!emailRegex.test(formData.email)) newErrors.customer_email = ['Please enter a valid email address'];
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        if (!formData.phone.trim()) newErrors.customer_phone = ['Mobile number is required for the coupon'];
        else if (formData.phone.length < 8 || !phoneRegex.test(formData.phone)) newErrors.customer_phone = ['Please enter a valid mobile number'];
        if (!formData.comment.trim()) newErrors.comment = ['Please write your review'];
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setErrors({});
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    product_id: productId,
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    star: formData.rating,
                    comment: formData.comment
                })
            });
            const result = await res.json();
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onReviewSubmitted();
                    onClose();
                    setSuccess(false);
                    setFormData(prev => ({ ...prev, comment: '', rating: 0 }));
                    setErrors({});
                }, 2200);
            } else {
                setErrors(result.errors || { form: result.message || 'Something went wrong.' });
            }
        } catch (err) {
            setErrors({ form: 'Network error. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
            setFormData(prev => ({ ...prev, comment: '', rating: 0 }));
            setErrors({});
        }
    };

    if (!show) return null;

    return (
        <div className={styles.modalBackdropCustom} onClick={handleBackdropClick}>
            <div className={styles.modalContentDark}>
                <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close">×</button>

                <div className={styles.modalBodyScrollable}>

                    {/* Header */}
                    <p className={styles.modalTitle}>{t('writeReviewTitle')}</p>
                    <p className={styles.modalSubtitle}>Your honest opinion helps others choose confidently.</p>

                    {success ? (
                        <div className={styles.successScreen}>
                            <div className={styles.successIcon}>✓</div>
                            <h4 style={{ color: '#1a1a1a', fontFamily: "inherit", fontWeight: 700, marginBottom: '0.5rem' }}>
                                {t('successMessage')}
                            </h4>
                            <p style={{ color: '#888', fontFamily: "inherit", fontSize: '0.85rem' }}>
                                Your <strong style={{ color: '#C7944B' }}>exclusive reward</strong> will be sent to your email upon approval.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>

                            {/* Guidelines */}
                            <div className={styles.rulesBox}>
                                <h6>Guidelines & Rewards</h6>
                                <ul>
                                    <li>Reviews must be <strong>relevant</strong> to this product — focus on the scent, longevity, and <strong>your experience.</strong></li>
                                    <li><strong>Log in</strong> to your account to autofill your details and ensure they match your profile.</li>
                                    <li>Upon admin approval, you will unlock a <strong>special surprise</strong> sent to your email.</li>
                                    <li><span className={styles.textGold}>Important:</span> The surprise is linked to your <strong>Mobile Number</strong> and sent via <strong>Email.</strong></li>
                                </ul>
                            </div>

                            {/* Star Picker */}
                            <StarPicker
                                value={formData.rating}
                                onChange={(s) => {
                                    setFormData({ ...formData, rating: s });
                                    setErrors(prev => ({ ...prev, rating: null }));
                                }}
                                error={errors.rating}
                            />

                            {/* Name + Phone */}
                            <div className={styles.formRow}>
                                <div>
                                    <label className={styles.formLabel}>{t('yourNameLabel')}</label>
                                    <input
                                        type="text"
                                        className={`${styles.formControlDark} ${errors.customer_name ? styles.isInvalid : ''}`}
                                        disabled={isAnonymous}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    {errors.customer_name && <div className={styles.textError}>{errors.customer_name[0]}</div>}
                                    {/* Anonymous toggle */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.65rem', gap: '8px' }}>
                                        <input type="checkbox" id="anonSwitch" className={styles.toggleCheckbox} onChange={handleAnonToggle} checked={isAnonymous} />
                                        <label htmlFor="anonSwitch" className={styles.toggleSwitch} />
                                        <label htmlFor="anonSwitch" className={styles.toggleLabelText}>Post Anonymously</label>
                                    </div>
                                </div>
                                <div>
                                    <label className={styles.formLabel}>
                                        Mobile Number&nbsp;
                                        <span className={styles.formLabelGold}>· Required for coupon</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={`${styles.formControlDark} ${errors.customer_phone ? styles.isInvalid : ''}`}
                                        placeholder="050 123 4567"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    {errors.customer_phone && <div className={styles.textError}>{errors.customer_phone[0]}</div>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    {t('yourEmailLabel')}&nbsp;
                                    <span className={styles.formLabelGold}>· Required for coupon</span>
                                </label>
                                <input
                                    type="email"
                                    className={`${styles.formControlDark} ${errors.customer_email ? styles.isInvalid : ''}`}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.customer_email && <div className={styles.textError}>{errors.customer_email[0]}</div>}
                            </div>

                            {/* Review text */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('yourReviewLabel')}</label>
                                <textarea
                                    className={`${styles.formControlDark} ${errors.comment ? styles.isInvalid : ''}`}
                                    rows="4"
                                    placeholder="Describe the scent, longevity, sillage..."
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                />
                                {errors.comment && <div className={styles.textError}>{errors.comment[0]}</div>}
                            </div>

                            {errors.form && (
                                <div style={{ background: '#fdf0f0', border: '1px solid #f5c6cb', color: '#721c24', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', fontFamily: "inherit", marginBottom: '1rem' }}>
                                    {errors.form}
                                </div>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                {isSubmitting ? t('submitting') : t('submit')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// ====================================================================
//  PARENT: CustomerReviews
// ====================================================================
const CustomerReviews = ({ product, reviews, loading, onReviewSubmitted }) => {
    const t = useTranslations('Reviews');
    const locale = useLocale();

    const cleanProductName = useMemo(() => {
        const nameToClean = locale === 'ar' ? product?.product_name_ar : product?.product_name;
        return nameToClean ? he.decode(nameToClean) : '';
    }, [product, locale]);

    const [showModal, setShowModal] = useState(false);

    const stats = useMemo(() => {
        const total = reviews?.length || 0;
        if (total === 0) return { avg: 0, dist: {} };
        const sum = reviews.reduce((acc, r) => acc + r.star, 0);
        const dist = {};
        reviews.forEach(r => { dist[Math.round(r.star)] = (dist[Math.round(r.star)] || 0) + 1; });
        return { avg: sum / total, dist };
    }, [reviews]);

    return (
        <section className={`${styles.bgDarkTheme} py-5`}>
            <div className="container">
                <ReviewSummary
                    averageRating={stats.avg}
                    reviewCount={reviews?.length || 0}
                    distribution={stats.dist}
                    onWriteClick={() => setShowModal(true)}
                    t={t}
                    loading={loading}
                />
                <ReviewList reviews={reviews} loading={loading} t={t} />
            </div>

            <ReviewFormModal
                show={showModal}
                onClose={() => setShowModal(false)}
                productId={product?.product_id}
                onReviewSubmitted={onReviewSubmitted}
                t={t}
            />
        </section>
    );
};

export default CustomerReviews;