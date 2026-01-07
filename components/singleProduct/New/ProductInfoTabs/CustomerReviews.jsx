import { useTranslations, useLocale } from 'next-intl';
import he from 'he';
import React, { useState, useEffect, useMemo } from 'react';

// ====================================================================
//  HELPER COMPONENT: StarRating (No changes needed here)
// ====================================================================
const StarRating = ({ rating }) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return <div className="review-rating">{stars}</div>;
};

// ====================================================================
//  CHILD COMPONENT #1: ReviewList
// ====================================================================
const ReviewList = ({ reviews, loading, averageRating, reviewCount }) => {
    // 1. Initialize translation hook
    const t = useTranslations('Reviews');

    if (loading) {
        // 2. Translate loading message
        return <p>{t('loading')}</p>;
    }

    return (
        <>
            {/* Summary stays fixed */}
            <div className="reviews-summary">
                <div className="average-rating">
                    {reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
                </div>
                <div>
                    <div className="rating-stars">
                        <StarRating rating={averageRating} />
                    </div>
                    <div className="total-reviews">
                        {/* 3. Translate text with pluralization */}
                        {t('basedOn', { count: reviewCount })}
                    </div>
                </div>
            </div>

            {/* Scrollable reviews */}
            <div className="reviews-scrollable">
                {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="review">
                            <p className="review-author">{review.customer_name}</p>
                            <StarRating rating={review.star} />
                            <p className="review-text">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div className="review">
                        <p className="review-text">
                            {/* 4. Translate "be first to review" message */}
                            {t('beFirst')}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

// ====================================================================
//  CHILD COMPONENT #2: ReviewForm
// ====================================================================
const ReviewForm = ({ productId, onReviewSubmitted }) => {
    // 5. Initialize translation hook
    const t = useTranslations('Reviews');

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            // 6. Translate alert message
            alert(t('selectRatingAlert'));
            return;
        }
        setIsSubmitting(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}api/reviews`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        product_id: productId,
                        customer_name: customerName,
                        customer_email: customerEmail,
                        star: rating,
                        comment: message,
                    }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                // 7. Translate success message
                setSuccessMessage(t('successMessage'));
                setRating(0);
                setMessage('');
                setCustomerName('');
                setCustomerEmail('');
                onReviewSubmitted(result);
            } else {
                setErrors(result.errors || { form: result.message });
            }
        } catch (err) {
            console.error(err);
            // 8. Translate network error message
            setErrors({ form: t('networkError') });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-form-container">
            <h3 className="review-author text-center mb-4 text-white" style={{ color: '#fff' }}>
                {/* 9. Translate form title */}
                {t('writeReviewTitle')}
            </h3>
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: successMessage ? 'none' : 'block' }}>
                <div className="form-group">
                    {/* 10. Translate labels, placeholders, and button text */}
                    <label>{t('yourRatingLabel')}</label>
                    <div className="interactive-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${(hoverRating || rating) >= star ? 'highlighted' : ''}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="customerName">{t('yourNameLabel')}</label>
                    <input id="customerName" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                    {errors.customer_name && (<small className="error-message">{errors.customer_name[0]}</small>)}
                </div>
                <div className="form-group">
                    <label htmlFor="customerEmail">{t('yourEmailLabel')}</label>
                    <input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                    {errors.customer_email && (<small className="error-message">{errors.customer_email[0]}</small>)}
                </div>
                <div className="form-group">
                    <label htmlFor="comment">{t('yourReviewLabel')}</label>
                    <textarea id="comment" value={message} onChange={(e) => setMessage(e.target.value)} rows="5" required placeholder={t('reviewPlaceholder')} />
                    {errors.comment && (<small className="error-message">{errors.comment[0]}</small>)}
                </div>
                {errors.form && (
                    <div className="error-message text-center mb-3" style={{ textAlign: 'center', marginBottom: '15px' }}>
                        {errors.form}
                    </div>
                )}
                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? t('submitting') : t('submit')}
                </button>
            </form>
        </div>
    );
};

// ====================================================================
//  PARENT COMPONENT: CustomerReviews
// ====================================================================
const CustomerReviews = ({ product }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    // 11. Initialize hooks in parent component
    const t = useTranslations('Reviews');
    const locale = useLocale();

    // 12. Create cleaned & translated product name
    const cleanProductName = useMemo(() => {
        const nameToClean = locale === 'ar' ? product?.product_name_ar : product?.product_name;
        if (nameToClean) {
            return he.decode(nameToClean);
        }
        return '';
    }, [product?.product_name, product?.product_name_ar, locale]);

    useEffect(() => {
        if (product && product.product_id) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/${product.product_id}/reviews`)
                .then((res) => res.json())
                .then((data) => {
                    setReviews(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch reviews', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [product]);

    const { averageRating, reviewCount } = useMemo(() => {
        const count = reviews.length;
        if (count === 0) return { averageRating: 0, reviewCount: 0 };
        const totalStars = reviews.reduce((sum, review) => sum + review.star, 0);
        return { averageRating: totalStars / count, reviewCount: count };
    }, [reviews]);

    const handleReviewSubmitted = (newReview) => {
        // console.log('Review submitted!', newReview);
    };

    return (
        <div className="reviews-container container">
            <h2 className="reviews-title text-white mb-4">
                {/* 13. Use translated title with dynamic name */}
                {t('reviewsFor', { name: cleanProductName })}
            </h2>
            <div className="row">
                <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                    <ReviewList
                        reviews={reviews}
                        loading={loading}
                        averageRating={averageRating}
                        reviewCount={reviewCount}
                    />
                </div>
                <div className="col-12 col-lg-6">
                    <ReviewForm
                        productId={product.product_id}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerReviews;