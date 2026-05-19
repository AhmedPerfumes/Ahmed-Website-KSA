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
    useEffect(() => {
        setHasMounted(true);
    }, []);
    return hasMounted;
};

// ====================================================================
//  HELPER: StarRating
// ====================================================================
const StarRating = ({ rating, size = '1rem' }) => {
    return (
        <div className={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className={styles.starRatingItem}
                    style={{ color: i <= rating ? '#C7944B' : '#444', fontSize: size }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewSummary (Top Section)
// ====================================================================
const ReviewSummary = ({ averageRating, reviewCount, distribution, onWriteClick, t, loading }) => {
    return (
        <div className={`row align-items-center pb-5 border-bottom ${styles.borderDarkSubtle}`}>
            {/* Left: Big Score */}
            <div className="col-md-3 text-center text-md-left mb-4 mb-md-0">
                {loading ? (
                    <>
                        <Skeleton variant="text" width={80} height={60} className="mx-auto mx-md-0 bg-white" />
                        <Skeleton variant="text" width={120} height={30} className="mx-auto mx-md-0 bg-white" />
                        <Skeleton variant="text" width={140} height={20} className="mx-auto mx-md-0 bg-white" />
                    </>
                ) : (
                    <>
                        <div className="display-4 font-weight-bold">{reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}</div>
                        <div className="mb-2"><StarRating rating={Math.round(averageRating)} size="1.2rem" /></div>
                        <div className="text-white">{t('basedOn', { count: reviewCount })}</div>
                    </>
                )}
            </div>

            {/* Middle: Bars */}
            <div className="col-md-6 mb-4 mb-md-0 px-md-5">
                {loading ? (
                    [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={20} className="bg-white mb-2" />)
                ) : (
                    [5, 4, 3, 2, 1].map((star) => {
                        const count = distribution[star] || 0;
                        const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                        return (
                            <div key={star} className="d-flex align-items-center mb-2">
                                <span className="small mr-3" style={{ width: '10px' }}>{star}</span>
                                <span className="small mr-3">★</span>
                                <div className={`flex-grow-1 ${styles.progressThin}`}>
                                    <div
                                        className={`h-100 ${styles.progressBarGold}`}
                                        style={{ width: `${percent}%`, borderRadius: '3px' }}
                                    ></div>
                                </div>
                                <span className="small ml-3" style={{ width: '20px', textAlign: 'right' }}>{count}</span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Right: Button */}
            <div className="col-md-3 text-center text-md-right">
                {loading ? (
                    <Skeleton variant="text" width={180} height={100} className="mx-auto mx-md-0 bg-white" />
                ) : (
                    <button
                        className="btn btn-outline-light px-4 py-3 text-uppercase font-weight-bold"
                        style={{ letterSpacing: '1px', borderRadius: '0' }}
                        onClick={onWriteClick}
                    >
                        {t('writeReviewTitle')}
                    </button>
                )}
            </div>
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewList (Bottom Section)
// ====================================================================
const ReviewList = ({ reviews, loading, t }) => {
    const hasMounted = useHasMounted();

    if (loading) return (
        <div className={`mt-4 ${styles.pxResponsiveList}`} style={{ height: '50vh', overflow: 'hidden' }}>
            {[1, 2, 3].map((i) => (
                <div key={i} className={`row py-4 border-top ${styles.borderDarkSubtle}`}>
                    <div className="col-md-3 mb-3 mb-md-0">
                        <Skeleton variant="text" width="70%" height={24} className="mb-1 bg-white" />
                        <Skeleton variant="text" width="40%" height={20} className='bg-white' />
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <Skeleton variant="text" width={140} height={24} className='bg-white' />
                            <Skeleton variant="text" width={80} height={20} className='bg-white' />
                        </div>
                        <div className="mt-2">
                            <Skeleton variant="text" width="100%" height={20} className="mb-1 bg-white" />
                            <Skeleton variant="text" width="90%" height={20} className="mb-1 bg-white" />
                            <Skeleton variant="text" width="60%" height={20} className='bg-white' />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (!reviews || reviews.length === 0) return <div className="text-center py-5">{t('beFirst')}</div>;

    return (
        <div className={`custom-scroll ${styles.reviewList} ${styles.customScroll} ${styles.pxResponsiveList}`}>
            {reviews.map((review) => (
                <div key={review.id} className={`row py-4 border-top ${styles.borderDarkSubtle}`}>
                    <div className="col-md-3 mb-3 mb-md-0">
                        <h6 className="font-weight-bold mb-1 text-white">{review.customer_name}</h6>
                        <div className={styles.verifiedBadge}>
                            <span className={styles.checkmarkCircle}>✓</span> Verified Buyer
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                                <StarRating rating={review.star} size="0.9rem" />
                                <span className="ml-3 font-weight-bold small text-uppercase text-white">
                                    {review.star === 5 ? 'Excellent' : 'Review'}
                                </span>
                            </div>
                            <small>
                                {hasMounted ? new Date(review.created_at).toLocaleDateString() : ''}
                            </small>
                        </div>
                        <p style={{ lineHeight: '1.7', opacity: 0.9 }}>{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewFormModal
// ====================================================================
const ReviewFormModal = ({ show, onClose, productId, onReviewSubmitted, t }) => {
    const [formData, setFormData] = useState({ rating: 0, name: '', email: '', phone: '', comment: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const u = JSON.parse(atob(userStr));
                    setFormData(prev => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
                } catch (e) { }
            }
        }
    }, [show]); // Refill when modal opens

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
        if (!formData.name.trim()) { newErrors.customer_name = ["Name is required"]; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.customer_email = ["Email is required"];
        } else if (!emailRegex.test(formData.email)) {
            newErrors.customer_email = ["Please enter a valid email address"];
        }
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
        if (!formData.phone.trim()) {
            newErrors.customer_phone = ["Mobile number is required for the coupon"];
        } else if (formData.phone.length < 8 || !phoneRegex.test(formData.phone)) {
            newErrors.customer_phone = ["Please enter a valid mobile number"];
        }
        if (!formData.comment.trim()) {
            newErrors.comment = ["Please write your review"];
        }
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
                }, 2000);
            } else {
                setErrors(result.errors || { form: result.message || 'Something went wrong.' });
            }
        } catch (err) {
            console.error(err);
            setErrors({ form: 'Network error. Please try again later.' });
        }
        finally { setIsSubmitting(false); }
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
                <button type="button" onClick={onClose} className={styles.closeButton}>&times;</button>

                <div className={styles.modalBodyScrollable}>
                    <h4 className={`text-center mb-4 ${styles.textGold}`} style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
                        {t('writeReviewTitle')}
                    </h4>

                    {success ? (
                        <div className="text-center py-5">
                            <h2 className={`${styles.textGold} mb-3`}>✓</h2>
                            <p>{t('successMessage')}</p>
                            <p className="small">Your <strong>exclusive reward</strong> will be sent to your email upon approval.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.rulesBox}>
                                <h6 className={`${styles.textGold} font-weight-bold small text-uppercase mb-2 text-center`}>Guidelines & Rewards</h6>
                                <ul className="text-white small mb-0 pl-3" style={{ lineHeight: 1.6 }}>
                                    <li className="mb-1">Reviews must be <strong>relevant</strong> to this product. Focus on the scent, longevity, projection and <strong>your experience.</strong></li>
                                    <li className="mb-1"><strong>Log in</strong> to your account to autofill your details and ensure they match your profile.</li>
                                    <li className="mb-1">Upon admin approval, you will unlock a <strong>special surprise</strong> sent to your email.</li>
                                    <li><span className={styles.textGold}>Important:</span> The surprise is strictly linked to your <strong>Mobile Number</strong> and sent to you via <strong>Email</strong>. Please enter it carefully.</li>
                                </ul>
                            </div>

                            <div className="text-center mb-4">
                                <div className="d-inline-block" style={{ fontSize: '2.5rem', cursor: 'pointer' }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s}
                                            className={`${styles.starInput} ${styles.starHover}`}
                                            style={{ color: s <= (hoverRating || formData.rating) ? '#C7944B' : '#444', padding: '0 8px' }}
                                            onMouseEnter={() => setHoverRating(s)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => {
                                                setFormData({ ...formData, rating: s });
                                                setErrors(prev => ({ ...prev, rating: null }));
                                            }}
                                        >★</span>
                                    ))}
                                </div>
                                <p className="small">{t('yourRatingLabel')}</p>
                                {errors.rating && <div className={`${styles.textError} font-weight-bold`}>{errors.rating}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="small text-uppercase">{t('yourNameLabel')}</label>
                                    <input
                                        type="text"
                                        className={`form-control ${styles.formControlDark} ${errors.customer_name ? styles.isInvalid : ''}`}
                                        disabled={isAnonymous}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />

                                    <div className="d-flex align-items-center mt-3">
                                        <input type="checkbox" id="anonSwitch" className={styles.toggleCheckbox} onChange={handleAnonToggle} checked={isAnonymous} />
                                        <label htmlFor="anonSwitch" className={styles.toggleSwitch}></label>
                                        <label htmlFor="anonSwitch" className={styles.toggleLabelText}>Post Anonymously</label>
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="small text-uppercase d-flex justify-content-between">
                                        <span>Mobile Number</span>
                                        <span className={styles.textGold} style={{ fontSize: '0.7rem' }}>Required for Coupon</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className={`form-control ${styles.formControlDark} ${errors.customer_phone ? styles.isInvalid : ''}`}
                                        placeholder="050 123 4567"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    {errors.customer_phone && <div className={styles.textError}>{errors.customer_phone[0]}</div>}
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="small text-uppercase d-flex justify-content-between">
                                    <span>{t('yourEmailLabel')}</span>
                                    <span className={styles.textGold} style={{ fontSize: '0.7rem' }}>Required for Coupon</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${styles.formControlDark} ${errors.customer_email ? styles.isInvalid : ''}`}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                {errors.customer_email && <div className={styles.textError}>{errors.customer_email[0]}</div>}
                            </div>

                            <div className="form-group mb-4">
                                <label className="small text-uppercase">{t('yourReviewLabel')}</label>
                                <textarea
                                    className={`form-control ${styles.formControlDark} ${errors.comment ? styles.isInvalid : ''}`}
                                    rows="4"
                                    value={formData.comment}
                                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                ></textarea>
                                {errors.comment && <div className={styles.textError}>{errors.comment[0]}</div>}
                            </div>

                            {errors.form && <div className="alert alert-danger text-center">{errors.form}</div>}

                            <button
                                type="submit"
                                className="btn btn-light btn-block font-weight-bold text-uppercase py-3"
                                disabled={isSubmitting}
                                style={{ letterSpacing: '1px' }}
                            >
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