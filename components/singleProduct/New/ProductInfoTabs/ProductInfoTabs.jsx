"use client";

import { useState, useEffect } from "react";
// 1. Import the useTranslations hook
import { useTranslations } from "next-intl";
import ProductDescription from "./ProductDescription";
import CustomerReviews from "./CustomerReviews";
import './ProductDescription.css';

const ProductInfoTabs = ({ product, category, subcategory }) => {
    // 2. Initialize the translation function
    const t = useTranslations('ProductDetails');

    const hasFragranceNotes = product && (
        (product.top_note && product.top_note_image) ||
        (product.heart_note && product.heart_note_image) ||
        (product.base_note && product.base_note_image)
    );

    const [activeTab, setActiveTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const fetchReviews = () => {
        if (product && product.product_id) {
            setReviewsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/${product.product_id}/reviews`)
                .then(res => res.json())
                .then(data => { setReviews(data); setReviewsLoading(false); })
                .catch(e => { console.error(e); setReviewsLoading(false); });
        }
    };

    useEffect(() => { fetchReviews(); }, [product?.product_id]);

    useEffect(() => {
        if (hasFragranceNotes) {
            setActiveTab('timeline');
        } else {
            setActiveTab('reviews');
        }
    }, [product, hasFragranceNotes]);

    if (!product) {
        return (
            <div style={{ padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center', background: '#111', color: 'white', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* 3. Use the t() function for the loading message */}
                {t('loadingProductInfo')}
            </div>
        )
    }

    const fullProductData = { ...product, category, subcategory };

    return (
        <>
            <div className="product-tabs-container container" style={{ padding: '0px 0px clamp(50px, 8vw, 100px) 0px', fontFamily: "'Kanit-Regular', sans-serif" }} >
                <div className="tab-headers">

                    {hasFragranceNotes && (
                        <button
                            className={`tab-header ${activeTab === 'timeline' ? 'active' : ''}`}
                            onClick={() => setActiveTab('timeline')}
                        >
                            {/* 4. Use the t() function for the tab title */}
                            {t('fragranceTimelineTab')}
                        </button>
                    )}

                    <button
                        className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        {/* 5. Use the t() function for the tab title */}
                        {t('customerReviewsTab')}
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'timeline' && <ProductDescription product={fullProductData} />}
                    {activeTab === 'reviews' && (
                        <CustomerReviews
                            product={fullProductData}
                            reviews={reviews}
                            loading={reviewsLoading}
                            onReviewSubmitted={fetchReviews}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductInfoTabs;