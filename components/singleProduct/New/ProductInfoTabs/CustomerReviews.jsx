import { useTranslations, useLocale } from 'next-intl';
import he from 'he';
import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from '@mui/material/Skeleton';

// ====================================================================
//  INTERNAL STYLES (Dark Theme + Gold Accents)
// ====================================================================
const Styles = () => (
    <style>{`
        .bg-dark-theme { background-color: #121212; color: #fff; }
        .text-gold { color: #C7944B; }
        .border-gold { border-color: #C7944B !important; }
        .border-dark-subtle { border-color: rgba(255,255,255,0.1) !important; }
        
        /* Progress Bars */
        .progress-thin { height: 6px; background-color: rgba(255,255,255,0.1); border-radius: 3px; }
        .progress-bar-gold { background-color: #C7944B; }

        /* Form Inputs in Dark Mode */
        .form-control-dark {
            background-color: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            border-radius: 4px;
        }
        .form-control-dark:focus {
            background-color: rgba(255,255,255,0.05);
            border-color: #C7944B;
            color: #fff;
            box-shadow: 0 0 0 0.2rem rgba(199, 148, 75, 0.25);
        }
        .form-control-dark::placeholder { color: #666; }
        .form-control-dark:disabled { background-color: rgba(255,255,255,0.05); color: #888; }
        .form-control-dark.is-invalid { border-color: #ff6b6b; }

        /* Error Text */
        .text-error { color: #ff6b6b; font-size: 0.85rem; margin-top: 5px; }

        /* Verified Badge */
        .verified-badge {
            font-size: 0.75rem;
            color: #ccc;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .checkmark-circle {
            background: #fff;
            color: #000;
            border-radius: 50%;
            width: 14px;
            height: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }

        /* Modal Overrides */
        .modal-backdrop-custom {
            background-color: rgba(0,0,0,0.85);
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 2040;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-content-dark {
            background-color: #1a1a1a;
            border: 1px solid #333;
            color: #fff;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            max-height: 90vh;
            display: flex;
            flex-direction: column;
        }
        .modal-body-scrollable {
            overflow-y: auto;       /* Enable vertical scroll */
            max-height: 100%;       /* Fill remaining space */
            /* Custom scrollbar for the modal body */
            scrollbar-width: thin;
            scrollbar-color: #C7944B rgba(255, 255, 255, 0.05);
        }
        /* Scrollbar styles for modal body */
        .modal-body-scrollable::-webkit-scrollbar { width: 6px; }
        .modal-body-scrollable::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .modal-body-scrollable::-webkit-scrollbar-thumb { background-color: #C7944B; border-radius: 3px; }

        /* Star Animation */
        .star-hover:hover { transform: scale(1.2); }
        .star-input { transition: transform 0.2s, color 0.2s; }

        /* Responsive List Padding */
        .px-responsive-list { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        @media (min-width: 992px) {
            .px-responsive-list { padding-left: 6rem !important; padding-right: 6rem !important; }
        }

        /* Custom Scrollbar */
        .custom-scroll { scrollbar-width: thin; scrollbar-color: #C7944B rgba(255, 255, 255, 0.05); }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #C7944B; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #e0b46a; }

        /* Toggles */
        .toggle-checkbox { display: none; }
        .toggle-switch {
            position: relative; width: 36px; height: 18px; background-color: #333; border-radius: 20px;
            cursor: pointer; transition: background-color 0.3s ease; display: inline-block; vertical-align: middle;
        }
        .toggle-switch::after {
            content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
            background-color: #fff; border-radius: 50%; transition: transform 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .toggle-checkbox:checked + .toggle-switch { background-color: #C7944B; }
        .toggle-checkbox:checked + .toggle-switch::after { transform: translateX(18px); }
        .toggle-label-text { margin-left: 10px; font-size: 0.8rem; color: #888; cursor: pointer; vertical-align: middle; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.3s; }
        .toggle-checkbox:checked ~ .toggle-label-text { color: #fff; }
    `}</style>
);

// ====================================================================
//  HELPER: StarRating
// ====================================================================
const StarRating = ({ rating, size = '1rem' }) => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} style={{ color: i <= rating ? '#C7944B' : '#444', fontSize: size, marginRight: '4px' }}>★</span>
        );
    }
    return <div className="d-inline-block">{stars}</div>;
};

// ====================================================================
//  COMPONENT: ReviewSummary (Top Section)
// ====================================================================
const ReviewSummary = ({ averageRating, reviewCount, distribution, onWriteClick, t, loading }) => {
    return (
        <div className="row align-items-center pb-5 border-bottom border-dark-subtle">
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
                    [1, 2, 3].map((i) => <Skeleton key={i} height={20} className="bg-white mb-2" />)
                ) : (
                    [5, 4, 3, 2, 1].map((star) => {
                        const count = distribution[star] || 0;
                        const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                        return (
                            <div key={star} className="d-flex align-items-center mb-2">
                                <span className="small mr-3" style={{ width: '10px' }}>{star}</span>
                                <span className="small mr-3">★</span>
                                <div className="flex-grow-1 progress-thin">
                                    <div className="h-100 progress-bar-gold" style={{ width: `${percent}%`, borderRadius: '3px' }}></div>
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
                    <>
                        <Skeleton variant="text" width={180} height={100} className="mx-auto mx-md-0 bg-white" />
                    </>
                ) : (
                    <>
                        <button
                            className="btn btn-outline-light px-4 py-3 text-uppercase font-weight-bold"
                            style={{ letterSpacing: '1px', borderRadius: '0' }}
                            onClick={onWriteClick}
                        >
                            {t('writeReviewTitle')}
                        </button>
                    </>
                )}
                
            </div>
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewList (Bottom Section)
// ====================================================================
const ReviewList = ({ reviews, loading, t }) => {
    if (loading) return (
        <div className="review-list px-responsive-list mt-4" style={{ height: '50vh', overflow: 'hidden' }}>
            {[1, 2, 3].map((i) => (
                <div key={i} className="row py-4 border-top border-dark-subtle">
                    {/* Left Column: Name & Verified Badge */}
                    <div className="col-md-3 mb-3 mb-md-0">
                        {/* Name Skeleton */}
                        <Skeleton variant="text" width="70%" height={24} className="mb-1 bg-white" />
                        {/* Verified Badge Skeleton */}
                        <Skeleton variant="text" width="40%" height={20} className='bg-white'/>
                    </div>

                    {/* Right Column: Stars, Date, & Comment */}
                    <div className="col-md-9">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            {/* Stars & Label Skeleton */}
                            <Skeleton variant="text" width={140} height={24} className='bg-white' />
                            {/* Date Skeleton */}
                            <Skeleton variant="text" width={80} height={20} className='bg-white' />
                        </div>
                        
                        {/* Comment Body Skeleton (Simulating 3 lines) */}
                        <div className="mt-2">
                            <Skeleton variant="text" width="100%" height={20} className="mb-1 bg-whitev" />
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
        <div
            className="review-list custom-scroll px-responsive-list"
            style={{ height: '50vh', overflowY: 'auto', scrollbarWidth: 'thin' }}
        >
            {reviews.map((review) => (
                <div key={review.id} className="row py-4 border-top border-dark-subtle">
                    <div className="col-md-3 mb-3 mb-md-0">
                        <h6 className="font-weight-bold mb-1 text-white">{review.customer_name}</h6>
                        <div className="verified-badge">
                            <span className="checkmark-circle">✓</span> Verified Buyer
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
                            <small>{new Date(review.created_at).toLocaleDateString()}</small>
                        </div>
                        <p style={{ lineHeight: '1.7', opacity: 0.9 }}>{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ====================================================================
//  COMPONENT: ReviewFormModal (Bootstrap Modal)
// ====================================================================
const ReviewFormModal = ({ show, onClose, productId, onReviewSubmitted, t }) => {
    const [formData, setFormData] = useState({ rating: 0, name: '', email: '', phone: '', comment: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [errors, setErrors] = useState({});

    // Auto-fill
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
    }, []);

    // Handle Anonymous Toggle
    const handleAnonToggle = (e) => {
        setIsAnonymous(e.target.checked);
        if (e.target.checked) {
            setFormData(prev => ({ ...prev, name: 'Anonymous' }));
        } else {
            const userStr = localStorage.getItem('user');
            let originalName = '';
            if (userStr) { try { originalName = JSON.parse(atob(userStr)).name; } catch(e){} }
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
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; // Allows +123..., 050..., etc.
        if (!formData.phone.trim()) {
            newErrors.customer_phone = ["Mobile number is required for the coupon"];
        } else if (formData.phone.length < 8 || !phoneRegex.test(formData.phone)) {
            newErrors.customer_phone = ["Please enter a valid mobile number"];
        }
        if (!formData.comment.trim()) {
            newErrors.comment = ["Please write your review"];
        }
        // Add more validations if needed (e.g. email regex), though HTML5 required handles basics
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
                body: JSON.stringify({ product_id: productId, customer_name: formData.name, customer_email: formData.email, customer_phone: formData.phone, star: formData.rating, comment: formData.comment})
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
                // Handle Backend Errors
                setErrors(result.errors || { form: result.message || 'Something went wrong.' });
            }
        } catch (err) { 
            console.error(err);
            setErrors({ form: 'Network error. Please try again later.' });
        }
        finally { setIsSubmitting(false); }
    };

    // Click Outside Handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
            setFormData(prev => ({ ...prev, comment: '', rating: 0 })); 
            setErrors({});
        }
    };

    if (!show) return null;

    return (
        <div className="modal-backdrop-custom fade show" onClick={handleBackdropClick}>
            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ width: '90%', maxWidth: '800px' }}>
                <div className="modal-content modal-content-dark position-relative">
                    
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="position-absolute"
                        style={{ top: '15px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', lineHeight: 1, zIndex: 10, cursor:'pointer' }}
                    >
                        &times;
                    </button>

                    <div className="modal-body modal-body-scrollable p-4 p-md-5">
                        <h4 className="text-gold text-uppercase text-center mb-4" style={{ letterSpacing: '2px' }}>{t('writeReviewTitle')}</h4>

                        {success ? (
                            <div className="text-center py-5">
                                <h2 className="text-gold mb-3">✓</h2>
                                <p>{t('successMessage')}</p>
                                <p className="small">Your <strong>exclusive reward</strong> will be sent to your email upon approval.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Rules Box */}
                                <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(199, 148, 75, 0.08)', border: '1px dashed #C7944B', borderRadius: '4px' }}>
                                    <h6 className="text-gold font-weight-bold small text-uppercase mb-2 text-center">Guidelines & Rewards</h6>
                                    <ul className="text-white small mb-0 pl-3" style={{ lineHeight: 1.6 }}>
                                        <li className="mb-1">Reviews must be <strong>relevant</strong> to this product. Focus on the scent, longevity, projection and <strong>your experience.</strong></li>
                                        <li className="mb-1"><strong>Log in</strong> to your account to autofill your details and ensure they match your profile.</li>
                                        <li className="mb-1">Upon admin approval, you will unlock a <strong>special surprise</strong> sent to your email.</li>
                                        <li><span className="text-gold">Important:</span> The surprise is strictly linked to your <strong>Mobile Number</strong> and sent to you via <strong>Email</strong>. Please enter it carefully.</li>
                                    </ul>
                                </div>

                                {/* Stars */}
                                <div className="text-center mb-4">
                                    <div className="d-inline-block" style={{ fontSize: '2.5rem', cursor: 'pointer' }}>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s}
                                                className="star-input star-hover"
                                                style={{ color: s <= (hoverRating || formData.rating) ? '#C7944B' : '#444', padding: '0 8px' }}
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => {
                                                    setFormData({ ...formData, rating: s });
                                                    setErrors(prev => ({...prev, rating: null})); // Clear rating error on selection
                                                }}
                                            >★</span>
                                        ))}
                                    </div>
                                    <p className="small">{t('yourRatingLabel')}</p>
                                    
                                    {/* Rating Error Message */}
                                    {errors.rating && <div className="text-error font-weight-bold">{errors.rating}</div>}
                                </div>

                                <div className="form-row">
                                    <div className="mb-3">
                                        <label className="small text-uppercase">{t('yourNameLabel')}</label>
                                        <input type="text" className={`form-control form-control-dark ${errors.customer_name ? 'is-invalid' : ''}`} disabled={isAnonymous}
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        
                                        <div className="d-flex align-items-center mt-3">
                                            <input type="checkbox" id="anonSwitch" className="toggle-checkbox" onChange={handleAnonToggle} checked={isAnonymous} />
                                            <label htmlFor="anonSwitch" className="toggle-switch"></label>
                                            <label htmlFor="anonSwitch" className="toggle-label-text">Post Anonymously</label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small text-uppercase d-flex justify-content-between">
                                            <span>Mobile Number</span>
                                            <span className="text-gold" style={{fontSize: '0.7rem'}}>Required for Coupon</span>
                                        </label>
                                        <input type="tel" className={`form-control form-control-dark ${errors.customer_phone ? 'is-invalid' : ''}`} placeholder="050 123 4567"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        {errors.customer_phone && <div className="text-error">{errors.customer_phone[0]}</div>}
                                    </div>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="small text-uppercase d-flex justify-content-between">
                                        <span>{t('yourEmailLabel')}</span>
                                        <span className="text-gold" style={{fontSize: '0.7rem'}}>Required for Coupon</span>
                                        </label>
                                    <input type="text" className={`form-control form-control-dark ${errors.customer_email ? 'is-invalid' : ''}`}
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    {errors.customer_email && <div className="text-error">{errors.customer_email[0]}</div>}
                                </div>

                                <div className="form-group mb-4">
                                    <label className="small text-uppercase">{t('yourReviewLabel')}</label>
                                    <textarea className={`form-control form-control-dark ${errors.comment ? 'is-invalid' : ''}`} rows="4"
                                        value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })}></textarea>
                                    {errors.comment && <div className="text-error">{errors.comment[0]}</div>}
                                </div>
                                
                                {/* General Form Error */}
                                {errors.form && <div className="alert alert-danger text-center">{errors.form}</div>}

                                <button type="submit" className="btn btn-light btn-block font-weight-bold text-uppercase py-3" disabled={isSubmitting} style={{ letterSpacing: '1px' }}>
                                    {isSubmitting ? t('submitting') : t('submit')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ====================================================================
//  PARENT: CustomerReviews
// ====================================================================
const CustomerReviews = ({ product }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const t = useTranslations('Reviews');
    const locale = useLocale();

    const cleanProductName = useMemo(() => {
        const nameToClean = locale === 'ar' ? product?.product_name_ar : product?.product_name;
        return nameToClean ? he.decode(nameToClean) : '';
    }, [product, locale]);

    const fetchReviews = () => {
        if (product && product.product_id) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/${product.product_id}/reviews`)
                .then(res => res.json())
                .then(data => { setReviews(data); setLoading(false); })
                .catch(e => { console.error(e); setLoading(false); });
        }
    };

    useEffect(() => { fetchReviews(); }, [product]);

    // Stats Logic
    const stats = useMemo(() => {
        const total = reviews.length;
        if (total === 0) return { avg: 0, dist: {} };
        const sum = reviews.reduce((acc, r) => acc + r.star, 0);
        const dist = {};
        reviews.forEach(r => { dist[Math.round(r.star)] = (dist[Math.round(r.star)] || 0) + 1; });
        return { avg: sum / total, dist };
    }, [reviews]);

    return (
        <section className="bg-dark-theme py-5">
            <Styles />
            <div className="container">
                <ReviewSummary
                    averageRating={stats.avg}
                    reviewCount={reviews.length}
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
                onReviewSubmitted={fetchReviews}
                t={t}
            />
        </section>
    );
};

export default CustomerReviews;