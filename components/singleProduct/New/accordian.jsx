"use client";

import React, { useMemo, useState } from "react";
import "./accordian.css";
import { useMenu } from "@/context/MenuContext";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { renderPrice } from "@/utlis/priceRenderer";
import Link from "next/link";
import he from "he";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


// In your ProductAccordion.js file

const CollectionSummary = ({ product, currency }) => {
    const { totalValue, savings, savingsPercent } = useMemo(() => {
        if (!product.is_collection || !product.collection_items?.length > 0) {
            return { totalValue: 0, savings: 0, savingsPercent: 0 };
        }

        // Helper function to get an item's final price (original or discounted)
        const getFinalPrice = (item) => {
            const now = new Date();
            // Check if a valid, active discount exists
            if (item.discount && new Date(item.discount.start_date) <= now && new Date(item.discount.end_date) >= now) {
                const { discount_type, value, final_price } = item.discount;
                if (discount_type === 'percent') {
                    return parseFloat(item.price) - (parseFloat(item.price) * value / 100);
                }
                if (discount_type === 'amount' && final_price) {
                    return parseFloat(final_price);
                }
            }
            // Fallback to sale_price if it exists
            if (item.sale_price) {
                return parseFloat(item.sale_price);
            }
            // Otherwise, return the original price
            return parseFloat(item.price);
        };

        // Calculate the total value by summing the FINAL price of each individual item
        const total = product.collection_items.reduce((acc, item) => {
            if (item.child_product_id) {
                return acc + getFinalPrice(item);
            }
            return acc;
        }, 0);

        // Get the FINAL price of the bundle itself
        const bundlePrice = getFinalPrice(product);

        const savedAmount = total - bundlePrice;
        const percent = total > 0 ? Math.round((savedAmount / total) * 100) : 0;

        return { totalValue: total, savings: savedAmount, savingsPercent: percent };
    }, [product]);

    // This component will only render something if there are actual savings.
    if (savings <= 0) {
        return null;
    }

    return (
        <div className="collection-summary">
            <div className="summary-row">
                <span>Total Individual Value:</span>
                <span className="total-value"><s>{currency?.symbol}{totalValue.toFixed(2)}</s></span>
            </div>
            <div className="summary-row">
                <span>Collection Price:</span>
                <span className="collection-price">{renderPrice(product, currency)}</span>
            </div>
            <hr className="summary-divider" />
            <div className="summary-row savings">
                <span>You Save:</span>
                <div className="savings-badge">
                    <span>{renderPrice({ price: savings.toFixed(2) }, currency)}</span>
                    <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                        ({savingsPercent}%)
                    </span>
                </div>

            </div>
        </div>
    );
};

const AccordionItem = ({ title, id, defaultOpen = false, children }) => {
    return (
        <div className="accordion-item">
            <h2 className="accordion-header" id={`heading${id}`}>
                <button
                    className={`accordion-button fw-semibold accordion-btn-custom ${
                        !defaultOpen && "collapsed"
                    }`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${id}`}
                    aria-expanded={defaultOpen}
                    aria-controls={`collapse${id}`}
                >
                    {title}
                </button>
            </h2>
            <div
                id={`collapse${id}`}
                className={`accordion-collapse collapse ${
                    defaultOpen && "show"
                }`}
                aria-labelledby={`heading${id}`}
                data-bs-parent="#productAccordion"
            >
                <div className="accordion-body">{children}</div>
            </div>
        </div>
    );
};

// const howToApplyContent = {
//     "Care Essentials": {
//         "Hair mist": {
//             text: [
//                 "For a refreshing and long-lasting scent, spray the hair mist lightly onto your hair, holding the bottle 20–25 cm away. Focus on the mid-lengths and ends to avoid scalp contact.",
//                 "Apply on clean, dry hair or after styling. Avoid rubbing or brushing immediately after spraying to maintain the fragrance’s delicate notes.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//         "Body gel": {
//             text: [
//                 "Apply a small amount of body gel evenly onto clean skin. Massage gently until fully absorbed to nourish the skin and enhance the fragrance experience.",
//                 "For optimal results, use after showering or moisturizing. Avoid applying on irritated or broken skin to preserve both skin health and fragrance quality.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
//     "hair-mist": {
//         "hair-mist": {
//             text: [
//                 "For a refreshing and long-lasting scent, spray the hair mist lightly onto your hair, holding the bottle 20–25 cm away. Focus on the mid-lengths and ends to avoid scalp contact.",
//                 "Apply on clean, dry hair or after styling. Avoid rubbing or brushing immediately after spraying to maintain the fragrance’s delicate notes.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
//     gel: {
//         "body-gel": {
//             text: [
//                 "Apply a small amount of body gel evenly onto clean skin. Massage gently until fully absorbed to nourish the skin and enhance the fragrance experience.",
//                 "For optimal results, use after showering or moisturizing. Avoid applying on irritated or broken skin to preserve both skin health and fragrance quality.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },

//     "concentrated-parfum": {
//         "concentrated-oil": {
//             text: [
//                 "Apply a small drop of concentrated oil directly to pulse points — such as wrists, neck, and behind the ears. These naturally warm areas help diffuse and enhance the fragrance.",
//                 "Avoid rubbing after application, as it can break down the delicate top notes. A single drop is enough for a long-lasting and captivating scent.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//         "dehn-al-oud": {
//             text: [
//                 "Dab a small amount of Dehn Al Oud oil on your pulse points — wrists, neck, and behind the ears. Let it absorb naturally to enjoy a rich and luxurious aroma.",
//                 "Avoid rubbing, as it can alter the fragrance. Use sparingly for a long-lasting effect that develops throughout the day.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
//     dakhoon: {
//         bakhoor: {
//             text: [
//                 "Place a piece of bakhoor on a hot charcoal or electric incense burner. Let the smoke fill your space for a rich and inviting fragrance experience.",
//                 "Avoid leaving the charcoal unattended. For best results, use in a well-ventilated area and keep out of reach of children.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-2.png",
//         },
//         "oud-maattar": {
//             text: [
//                 "Apply a small amount of Oud Ma’Attar on clothing or use in a diffuser. Pulse points can also be gently dabbed for a personal long-lasting aroma.",
//                 "Use sparingly to avoid overpowering. Let the fragrance evolve naturally for a rich and sophisticated scent.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-2.png",
//         },
//         "air-freshener": {
//             text: [
//                 "Spray the air freshener evenly around the room from a distance of 30 cm. Focus on corners, curtains, and soft furnishings to distribute the fragrance effectively.",
//                 "For a longer-lasting effect, repeat the application periodically and avoid spraying directly onto delicate surfaces that may be sensitive to moisture.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
//     "online-exclusive": {
//         "online-exclusive": {
//             text: [
//                 "For the most captivating and long-lasting experience, apply the perfume directly to your pulse points — wrists, neck, and behind the ears.",
//                 "Spray after moisturizing to help lock in the scent. Avoid rubbing the fragrance after application to preserve the delicate top notes.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
//     perfumes: {
//         "oriental-fragrance": {
//             text: [
//                 "Apply lightly on pulse points — wrists, neck, and behind ears. This helps the warm, rich notes evolve naturally throughout the day.",
//                 "For best results, apply after moisturizing and avoid rubbing. A few spritzes are enough for a long-lasting, captivating scent.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//         "occidental-fragrance": {
//             text: [
//                 "Spray the perfume on pulse points — wrists, neck, and behind the ears — to allow the fragrance to develop naturally.",
//                 "Avoid rubbing after application to preserve the delicate top notes. Apply after moisturizing for a longer-lasting scent.",
//             ],
//             imgSrc: "/assets/images/musk-roses-test/perfume-1.png",
//         },
//     },
// };
// const getUsageInfo = (product) => {
//     if (!product || !product.category || !howToApplyContent[product.category]) {
//         return null; // No valid category found
//     }

//     const categoryData = howToApplyContent[product.category];
//     // Find content by subcategory, or find the first/only entry if no subcategory matches
//     const content = categoryData[product.subcategory] || Object.values(categoryData)[0];

//     return content || null;
// };

const ProductAccordion = ({ product }) => {
    const locale = useLocale();
    const { currency } = useMenu();
    const t = useTranslations("ProductDetails");
    const { shippingServiceCharges } = useMenu();
    const [showLoader, setShowLoader] = useState(false);

    const getUsageInfo = (product) => {
        // Use the product's fragrance type as a key, e.g., 'hair_mist', 'bakhoor'
        const key = product?.fragrance_type || "default";

        try {
            // Use t.raw() to get the object from your JSON file
            const content = t.raw(`howToApply.${key}`);
            // Ensure the object has the properties we expect
            if (content && content.text && content.imgSrc) {
                return content;
            }
        } catch (error) {
            // If the specific key (e.g., 'howToApply.dehn_al_oud') doesn't exist, fall back to the default
            return t.raw("howToApply.default");
        }
        // Final fallback
        return t.raw("howToApply.default");
    };

    // const fragranceTypeMap = {
    //     // Personal Fragrance (By Concentration)
    //     parfum: "Extrait de Parfum / Parfum",
    //     edp: "Eau de Parfum (EDP)",
    //     edt: "Eau de Toilette (EDT)",
    //     edc: "Eau de Cologne (EDC)",
    //     // Personal Fragrance (By Form)
    //     concentrated_oil: "Concentrated Oil",
    //     dehn_al_oud: "Dehn al Oud",
    //     hair_mist: "Hair Mist",
    //     body_gel: "Body Gel",
    //     // Home & Traditional Fragrance
    //     bakhoor: "Bakhoor",
    //     oud_maattar: "Oud Maattar",
    //     air_freshener: "Air Freshener",
    //     // General Categories
    //     occidental_fragrance: "Occidental Fragrance",
    //     oriental_fragrance: "Oriental Fragrance",
    //     // Other
    //     other: "Other",
    // };
    // const dispenserTypeMap = {
    //     spray: "Spray / Atomizer (for Perfumes, Mists)",
    //     pump: "Pump (for Gels, Lotions)",
    //     roll_on: "Roll-on / Rollerball (for Oils)",
    //     dabber_stick: "Dabber / Stick Applicator (for Oils)",
    //     solid_incense: "Solid / Incense (for Bakhoor, Maattar)",
    //     jar: "Jar / Pot (for Gels, Bakhoor)",
    //     tube: "Tube (for Gels)",
    //     reed_diffuser: "Reed Diffuser (for Air Fresheners)",
    //     dropper: "Dropper",
    //     other: "Other",
    // };
    
    // Logic to calculate collection savings

    const { totalValue, savings, savingsPercent } = useMemo(() => {
        if (!product.is_collection || !product.collection_items?.length > 0) {
            return { totalValue: 0, savings: 0, savingsPercent: 0 };
        }
        const total = product.collection_items.reduce((acc, item) => {
            if (item.child_product_id && item.price) {
                return acc + parseFloat(item.price);
            }
            return acc;
        }, 0);
        const bundlePrice = parseFloat(product.price);
        const savedAmount = total - bundlePrice;
        const percent = total > 0 ? Math.round((savedAmount / total) * 100) : 0;
        
        return { totalValue: total, savings: savedAmount, savingsPercent: percent };
    }, [product]);
    
    const productOverviewData = [
        {
            head: t("overview.sizeVolume"),
            text: product?.tags?.join(", "),
            icon: "/assets/svg/measuring-glass.svg",
        },
        {
            head: t("overview.fragranceType"),
            text: product?.fragrance_type
                ? t(`fragranceTypes.${product.fragrance_type}`)
                : null,
            icon: "/assets/svg/perfume.svg",
        },
        {
            head: t("overview.fragranceCategory"),
            text: product?.fragrance_category,
            icon: "/assets/svg/label.svg",
        },
        {
            head: t("overview.dispenserType"),
            text: product?.dispenser_type
                ? t(`dispenserTypes.${product.dispenser_type}`)
                : null,
            icon: "/assets/svg/spray.svg",
        },
    ].filter((item) => item.text);

    const onlyTopNoteExists = !product.heart_note && !product.base_note;
    const notesData = [];
    ["top", "heart", "base"].forEach((noteType) => {
        const noteKey = locale === "ar" ? `${noteType}_note_ar` : `${noteType}_note`;
        if (product[noteKey]) {
            let typeLabel = "";
            if (noteType === "top") {
                typeLabel = onlyTopNoteExists
                    ? t("notesAccords")
                    : t("topNotes");
            } else {
                typeLabel = t(`${noteType}Notes`);
            }
            notesData.push({
                id: noteType,
                type: typeLabel,
                description: product[noteKey],
                description_long:
                    product[
                        locale === "ar"
                            ? `${noteType}_note_description_ar`
                            : `${noteType}_note_description`
                    ],
                image: `${process.env.NEXT_PUBLIC_API_URL}storage/${
                    product[`${noteType}_note_image`]
                }`,
            });
        }
    });

    const fragranceSummaryData = [
        {
            head: t("summary.olfactoryFamily"),
            text: product?.olfactory_family,
            icon: "/assets/svg/perfume-channel-national-culture-paris.svg",
        },
        {
            head: t("summary.sillage"),
            text: product?.sillage,
            icon: "/assets/svg/snowy-wind.svg",
        },
    ].filter((item) => item.text);

    const keyHighlightsData = [
        {
            head: t("highlights.longevity"),
            text: product?.longevity,
            icon: "/assets/svg/time-alarm-timer.svg",
        },
        {
            head: t("highlights.occasion"),
            text: product?.occasion,
            icon: "/assets/svg/moon-full-moon.svg",
        },
        {
            head: t("highlights.other"),
            text: product?.additional_details,
            icon: "/assets/svg/diamond.svg",
        },
    ].filter((item) => item.text);

    const deliveryInfoData = [
        {
            head: t("delivery.shipping"),
            text: t("delivery.shippingText", { price: shippingServiceCharges[3]?.price }),
            icon: "/assets/svg/package.svg",
        },
        {
            head: t("delivery.payment"),
            text: t("delivery.paymentText"),
            icon: "/assets/svg/globe-showing-europe-africa.svg",
        },
        {
            head: t("delivery.track"),
            text: t("delivery.trackText"),
            icon: "/assets/svg/placeholder-pin.svg",
        },
        {
            head: t("delivery.expectedDelivery"),
            text: t("delivery.expectedDeliveryText"),
            icon: "/assets/svg/delivery.svg",
        },
    ].filter((item) => item.text);

    const usageInfo = getUsageInfo(product);
    // console.log(usageInfo)

    return (
        <div className="accordion" id="productAccordion">

        {product.is_collection == 1 && product.collection_items?.length > 0 && (
        <AccordionItem title={t('accordion.whatIsIncluded')} id="Zero" defaultOpen={true}>
            <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            className="collection-swiper"
            // 2 on one “page”
            slidesPerView={2}
            slidesPerGroup={2}
            spaceBetween={16}
            autoplay={{
                delay: 2000,
                disableOnInteraction: true,
            }}
            speed={1000}
            pagination={{ clickable: true }}
            breakpoints={{
                0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
                640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
            }}
            // Support RTL for Arabic automatically
            dir={locale === "ar" ? "rtl" : "ltr"}
            
            >
            {product.collection_items.map((item, idx) => {
                const isProduct = item.child_product_id;
                const itemName = isProduct ? (locale === 'ar' ? he.decode(item.name_ar) : he.decode(item.name)) : item.custom_item_name;
                const itemImage = isProduct && item.images ? JSON.parse(item.images)[0] : null;
                const itemSlug = (item.slug || (item.name && item.name.toLowerCase().replace(/ /g, '-')));

                const cardContent = (
                <>
                    <div className="collection-card-image-wrapper">
                    {isProduct && itemImage ? (
                        <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${itemImage}`}
                        alt={itemName || ""}
                        className="collection-card-image"
                        height={150}
                        width={150}
                        />
                    ) : (
                        <div className="collection-card-image-wrapper">
                        <Image
                            src="/assets/images/general_product.png"
                            alt={itemName || ""}
                            className="collection-card-image"
                            height={150}
                            width={150}
                        />
                        </div>
                    )}
                    </div>
                    <div className="collection-card-details">
                    <div className="collection-card-name">{itemName}</div>
                    <div className="collection-card-quantity">
                        {isProduct ? renderPrice(item, currency) : `Quantity: ${item.quantity}`}
                    </div>
                    </div>
                </>
                );

                return (
                <SwiperSlide key={idx}>
                    {isProduct ? (
                    // <Link
                    //     href={`/shop/${item.category}/${item.subcategory}/${itemSlug}`}
                    //     className="collection-card product-link"
                    //     onClick={() => setShowLoader(true)}
                    // >
                    // </Link>
                    <div className="collection-card product-link"> {cardContent} </div>
                    ) : (
                    <div className="collection-card">{cardContent}</div>
                    )}
                </SwiperSlide>
                );
            })}
            </Swiper>

            <CollectionSummary product={product} currency={currency} />
        </AccordionItem>
        )}


            {/* --- Fragrance Profile --- */}
            {(notesData?.length > 0 || fragranceSummaryData?.length > 0) && (
                <AccordionItem
                    title={t("accordion.fragranceProfile")}
                    id="Two"
                    defaultOpen={true}
                >
                    {/* Conditionally render the Scent Journey only if notesData exists */}
                    {notesData?.length > 0 && (
                        <div className="notes-journey-container">
                            {notesData.map((note) => (
                                <div className="note-item" key={note.id}>
                                    <Image
                                        height={500}
                                        width={500}
                                        src={note.image}
                                        alt={note.type}
                                        className="note-item-image"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                    <div className="note-item-text">
                                        <h6 className="note-item-title">
                                            {note.type}
                                        </h6>
                                        <p className="note-item-desc">
                                            {note.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Conditionally render the divider only if both sections have content */}
                    {notesData?.length > 0 &&
                        fragranceSummaryData?.length > 0 && (
                            <hr className="section-divider" />
                        )}

                    {/* Conditionally render the highlights only if fragranceSummaryData exists */}
                    {fragranceSummaryData?.length > 0 && (
                        <div className="highlights-list">
                            {fragranceSummaryData.map((item, idx) => (
                                <div className="highlight-item" key={idx}>
                                    <Image
                                        src={item.icon}
                                        alt=""
                                        className="highlight-icon"
                                        height={500}
                                        width={500}
                                    />
                                    <div className="highlight-text">
                                        <h6 className="highlight-title">
                                            {item.head}
                                        </h6>
                                        <p className="highlight-desc">
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AccordionItem>
            )}

            {/* --- Product Overview --- */}
            {productOverviewData && productOverviewData.length > 0 && (
                <AccordionItem title={t("accordion.productOverview")} id="One">
                    <div className="row g-4">
                        {productOverviewData.map((item, idx) => (
                            <div
                                className="col-12 col-md-6"
                                style={{ maxWidth: "50%" }}
                                key={idx}
                            >
                                <div className="highlight-grid-item">
                                    <Image
                                        src={item.icon}
                                        alt=""
                                        className="highlight-icon"
                                        height={500}
                                        width={500}
                                    />
                                    <div className="highlight-text">
                                        <h6 className="highlight-title">
                                            {item.head}
                                        </h6>
                                        <p className="highlight-desc">
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionItem>
            )}

            {/* --- Key Highlights --- */}
            {keyHighlightsData && keyHighlightsData.length > 0 && (
                <AccordionItem title={t("accordion.keyHighlights")} id="Three">
                    <div className="highlights-list">
                        {keyHighlightsData.map((item, idx) => (
                            <div className="highlight-item" key={idx}>
                                <Image
                                    src={item.icon}
                                    alt=""
                                    className="highlight-icon"
                                    height={500}
                                    width={500}
                                />
                                <div className="highlight-text">
                                    <h6 className="highlight-title">
                                        {item.head}
                                    </h6>
                                    <p className="highlight-desc">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionItem>
            )}

            {/* --- Usage & Application --- */}
            {usageInfo && !['gift-sets', 'collections'].includes(product.category) && (
                <AccordionItem
                    title={t("accordion.usageApplication")}
                    id="Four"
                >
                    <div className="usage-guide">
                        {/* The instructional image is now the hero element, placed at the top */}
                        <Image
                            src={usageInfo.imgSrc}
                            alt={`How to apply ${usageInfo.title || "product"}`}
                            className="usage-image"
                            height={500}
                            width={500}
                        />

                        <div className="usage-text">
                            {/* The title now introduces the steps below the image */}
                            <h4>{t("usage.howToApply")}</h4>
                            <ol className="usage-steps">
                                {usageInfo.text.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                            {product?.how_to_use && (
                                <div className="usage-summary">
                                    <h4>{t("usage.summary")}</h4>
                                    <p>{product.how_to_use}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </AccordionItem>
            )}

            {/* --- Crafted with Intention (Now conditional) --- */}
            {product?.story && (
                <AccordionItem
                    title={t("accordion.craftedWithIntention")}
                    id="Five"
                >
                    <div className="story-content">
                        <blockquote>{product?.story}</blockquote>
                    </div>
                </AccordionItem>
            )}

            {/* --- Delivery Information --- */}
            <AccordionItem title={t("accordion.deliveryInformation")} id="Six">
                {/* MODIFIED: Also changed to a Bootstrap row for consistency */}
                <div className="row g-3">
                    {deliveryInfoData.map((item, idx) => (
                        <div
                            className="col-12 col-md-6"
                            style={{ maxWidth: "50%" }}
                            key={idx}
                        >
                            <div className="highlight-grid-item">
                                <Image
                                    src={item.icon}
                                    alt=""
                                    className="highlight-icon"
                                    height={500}
                                    width={500}
                                />
                                <div className="highlight-text">
                                    <h6 className="highlight-title">
                                        {item.head}
                                    </h6>
                                    <p className="highlight-desc">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionItem>
            {showLoader && (
                <div className="loader-overlay">
                    <div className="loader-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default ProductAccordion;
