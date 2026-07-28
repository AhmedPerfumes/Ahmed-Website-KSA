"use client";
/**
 * YouMayAlsoLike.jsx  — Premium bottom-sheet modal for cart page
 * Section A: related_prods of last added cart product (hidden if none)
 * Section B: Top-5 best sellers from that product category
 */

import { useEffect, useRef, useState } from "react";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchBestSelling } from "@/utlis/productsCache";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useLocale } from "next-intl";
import he from "he";

const SESSION_KEY = "ymal_shown";

const slugify = (str) =>
  (str || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const getImg = (p) => {
  try {
    const arr = JSON.parse(p.images || "[]");
    return arr[0] ? `${process.env.NEXT_PUBLIC_API_URL}storage/${arr[0]}` : null;
  } catch {
    return p.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${p.image}` : null;
  }
};

/* ── Inline CSS ──────────────────────────────────────────────────────── */
const css = `
/* Overlay */
.ymal-overlay {
  position: fixed; inset: 0;
  background: rgba(8,6,4,0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 9950;
  display: flex; align-items: flex-end; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.35s ease;
}
.ymal-overlay.ymal-open { opacity: 1; pointer-events: auto; }

/* Sheet */
.ymal-sheet {
  width: 100%; max-width: 1100px;
  max-height: 85svh;
  background: #0f0d0a;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; flex-direction: column;
  border-top: 1px solid rgba(197,166,100,0.18);
  box-shadow: 0 -32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(197,166,100,0.06);
}
.ymal-overlay.ymal-open .ymal-sheet { transform: translateY(0); }

/* Handle */
.ymal-handle-wrap {
  flex-shrink: 0;
  display: flex; justify-content: center;
  padding: 14px 0 0;
}
.ymal-handle {
  width: 44px; height: 4px;
  background: rgba(197,166,100,0.25);
  border-radius: 2px;
}

/* Header */
.ymal-header {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ymal-header-left { display: flex; flex-direction: column; gap: 4px; }
.ymal-eyebrow {
  font-size: 0.58rem; font-weight: 700;
  letter-spacing: 0.28em; text-transform: uppercase;
  color: #b8973e;
}
.ymal-title {
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  font-weight: 300; letter-spacing: 0.05em;
  color: #f5f0e8; margin: 0;
}
.ymal-title em { font-style: italic; color: #d4b86a; }
.ymal-close {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  cursor: pointer; color: rgba(255,255,255,0.55); font-size: 0.85rem;
  transition: background 0.18s, color 0.18s, transform 0.2s;
  flex-shrink: 0;
}
.ymal-close:hover {
  background: rgba(197,166,100,0.12);
  color: #d4b86a;
  transform: rotate(90deg);
}

/* Body */
.ymal-body {
  flex: 1; overflow-y: auto;
  padding: 20px 28px 36px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(197,166,100,0.2) transparent;
}
.ymal-body::-webkit-scrollbar { width: 4px; }
.ymal-body::-webkit-scrollbar-thumb { background: rgba(197,166,100,0.2); border-radius: 2px; }

/* Section */
.ymal-section { margin-bottom: 32px; }
.ymal-section:last-child { margin-bottom: 0; }
.ymal-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.ymal-section-label {
  font-size: 0.58rem; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(197,166,100,0.8);
  white-space: nowrap;
}
.ymal-section-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(197,166,100,0.2), transparent);
}

/* Card */
.ymal-card {
  background: #1a1610;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.22s, box-shadow 0.22s;
  display: flex; flex-direction: column; height: 100%;
}
.ymal-card:hover {
  border-color: rgba(197,166,100,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

/* Card image */
.ymal-card__img-link {
  display: block;
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: #111;
}
.ymal-card__img-link img { object-fit: cover; transition: transform 0.5s ease; }
.ymal-card:hover .ymal-card__img-link img { transform: scale(1.06); }

/* Discount badge */
.ymal-card__badge {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, #b8973e, #d4b86a);
  color: #0f0d0a;
  font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 100px;
  z-index: 2;
}

/* Card info */
.ymal-card__info {
  padding: 12px 12px 14px;
  flex: 1; display: flex; flex-direction: column; gap: 6px;
}
.ymal-card__sub {
  font-size: 0.62rem; color: rgba(197,166,100,0.65);
  letter-spacing: 0.08em; text-transform: uppercase;
}
.ymal-card__name {
  font-size: 0.88rem; font-weight: 500;
  color: #f0ece4; line-height: 1.3;
  text-decoration: none; display: block;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.ymal-card__name:hover { color: #d4b86a; }
.ymal-card__prices { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.ymal-card__price-new { font-size: 0.9rem; font-weight: 700; color: #d4b86a; }
.ymal-card__price-old { font-size: 0.75rem; color: rgba(255,255,255,0.3); text-decoration: line-through; }
.ymal-card__price-reg { font-size: 0.88rem; color: rgba(255,255,255,0.7); }

/* ATC button */
.ymal-card__atc {
  margin-top: auto;
  width: 100%;
  padding: 9px 10px;
  background: transparent;
  border: 1px solid rgba(197,166,100,0.3);
  color: #d4b86a;
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ymal-card__atc:hover {
  background: rgba(197,166,100,0.12);
  border-color: rgba(197,166,100,0.6);
}
.ymal-card__atc--added {
  background: rgba(197,166,100,0.08);
  border-color: rgba(197,166,100,0.4);
  color: rgba(197,166,100,0.7);
}

/* Swiper overrides */
.ymal-swiper {
  width: 100%; padding-bottom: 2px !important; overflow: visible !important;
}
.ymal-swiper .swiper-button-next,
.ymal-swiper .swiper-button-prev {
  color: #d4b86a;
  background: rgba(15,13,10,0.8);
  border: 1px solid rgba(197,166,100,0.2);
  width: 34px !important; height: 34px !important;
  border-radius: 50%;
  top: -34px !important;
}
.ymal-swiper .swiper-button-prev { right: 42px !important; left: auto !important; }
.ymal-swiper .swiper-button-next { right: 0 !important; }
.ymal-swiper .swiper-button-next::after,
.ymal-swiper .swiper-button-prev::after { font-size: 0.75rem !important; }
.ymal-swiper .swiper-button-disabled { opacity: 0.25 !important; }

/* Loader */
.ymal-loader {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 180px; gap: 14px;
}
.ymal-loader__ring {
  width: 36px; height: 36px;
  border: 2px solid rgba(197,166,100,0.15);
  border-top-color: #b8973e;
  border-radius: 50%;
  animation: ymal-spin 0.8s linear infinite;
}
@keyframes ymal-spin { to { transform: rotate(360deg); } }
.ymal-loader__text { font-size: 0.78rem; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; }

/* Responsive */
@media (max-width: 640px) {
  .ymal-header { padding: 14px 16px 10px; }
  .ymal-body { padding: 16px 16px 28px; }
  .ymal-sheet { border-radius: 20px 20px 0 0; }
  .ymal-swiper .swiper-button-next,
  .ymal-swiper .swiper-button-prev { display: none !important; }
}
`;

/* ── Component ───────────────────────────────────────────────────────── */
export default function YouMayAlsoLike() {
  const locale = useLocale();
  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  const { currency } = useMenu();

  const overlayRef = useRef(null);
  const [related, setRelated]   = useState([]);
  const [bestSell, setBestSell] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [lastProduct, setLastProduct] = useState(null);

  /* Read last-added product from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const stored = localStorage.getItem("ahmed_last_cart_item");
    if (!stored) return;
    try { setLastProduct(JSON.parse(stored)); } catch { /* ignore */ }
  }, []);

  /* Fetch once we know the last product */
  useEffect(() => {
    if (!lastProduct) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { category = "", subcategory = "", name = "" } = lastProduct;

      let relatedProds = [];
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: category.toUpperCase(),
            subCategory: subcategory.toUpperCase(),
            product: name.toUpperCase(),
          }),
        });
        const d = await res.json();
        relatedProds = Array.isArray(d?.related_prods) ? d.related_prods.slice(0, 8) : [];
      } catch { /* ignore */ }

      let best = [];
      try {
        const all = await fetchBestSelling();
        const key = Object.keys(all).find(k => k.toUpperCase() === category.toUpperCase());
        best = key ? (all[key] || []).slice(0, 5) : [];
      } catch { /* ignore */ }

      if (!cancelled) {
        setRelated(relatedProds);
        setBestSell(best);
        setLoading(false);
        if (relatedProds.length > 0 || best.length > 0) {
          sessionStorage.setItem(SESSION_KEY, "1");
          setTimeout(() => setOpen(true), 800);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [lastProduct]);

  const close = () => setOpen(false);
  const onOverlay = (e) => { if (e.target === overlayRef.current) close(); };

  /* Price renderer */
  const renderPrice = (elm) => {
    const now = Date.now();
    if (elm?.discount) {
      const s  = new Date(elm.discount.start_date).getTime();
      const e2 = new Date(elm.discount.end_date).getTime();
      if (now >= s && now <= e2) {
        const sale = elm.discount.discount_type === "percent"
          ? (elm.price - elm.price * elm.discount.value / 100).toFixed(2)
          : Number(elm.discount.final_price ?? elm.price - elm.discount.value).toFixed(2);
        return (
          <div className="ymal-card__prices">
            <span className="ymal-card__price-new">{sale} {currency?.symbol}</span>
            <span className="ymal-card__price-old">{elm.price} {currency?.symbol}</span>
          </div>
        );
      }
    }
    if (elm?.sale_price && +elm.sale_price > 0 && +elm.sale_price < +elm.price) {
      return (
        <div className="ymal-card__prices">
          <span className="ymal-card__price-new">{(+elm.sale_price).toFixed(2)} {currency?.symbol}</span>
          <span className="ymal-card__price-old">{elm.price} {currency?.symbol}</span>
        </div>
      );
    }
    return <div className="ymal-card__prices"><span className="ymal-card__price-reg">{elm?.price} {currency?.symbol}</span></div>;
  };

  const getDiscountBadge = (elm) => {
    const now = Date.now();
    if (!elm?.discount) return null;
    const s  = new Date(elm.discount.start_date).getTime();
    const e2 = new Date(elm.discount.end_date).getTime();
    if (now < s || now > e2) return null;
    return elm.discount.discount_type === "percent"
      ? `${elm.discount.value}% OFF`
      : `SALE`;
  };

  /* Product card */
  const ProductCard = ({ elm, categorySlug, subcategorySlug }) => {
    const img    = getImg(elm);
    const name   = he.decode(elm.product_name || elm.name || "");
    const slug   = slugify(name);
    const href   = `/${locale}/shop/${categorySlug}/${subcategorySlug}/${slug}`;
    const inCart = isAddedToCartProducts(elm.product_id);
    const badge  = getDiscountBadge(elm);

    const handleATC = () => {
      addProductToCart({ ...elm, _silent: true });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:added", {
          detail: { name, image: img || "", qty: 1, category: elm.category_name, subcategory: elm.subcategory?.subcategory_name || "" },
        }));
      }
    };

    return (
      <div className="ymal-card">
        <Link href={href} className="ymal-card__img-link" onClick={close}>
          {badge && <span className="ymal-card__badge">{badge}</span>}
          {img ? (
            <Image src={img} alt={name} fill sizes="240px" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ background: "#1a1610", width: "100%", height: "100%" }} />
          )}
        </Link>
        <div className="ymal-card__info">
          {elm.subcategory?.subcategory_name && (
            <span className="ymal-card__sub">{elm.subcategory.subcategory_name}</span>
          )}
          <Link href={href} className="ymal-card__name" onClick={close}>{name}</Link>
          {renderPrice(elm)}
          <button
            className={`ymal-card__atc${inCart ? " ymal-card__atc--added" : ""}`}
            type="button"
            onClick={handleATC}
          >
            {inCart ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Added
              </>
            ) : "Add to Cart"}
          </button>
        </div>
      </div>
    );
  };

  const swiperOpts = {
    modules: [Navigation],
    spaceBetween: 14,
    navigation: true,
    className: "ymal-swiper",
    breakpoints: {
      0:   { slidesPerView: 2.2, spaceBetween: 10 },
      480: { slidesPerView: 3.2, spaceBetween: 12 },
      768: { slidesPerView: 4,   spaceBetween: 14 },
      1024:{ slidesPerView: 5,   spaceBetween: 14 },
    },
  };

  if (!lastProduct) return null;

  return (
    <>
      <style>{css}</style>
      <div
        className={`ymal-overlay${open ? " ymal-open" : ""}`}
        ref={overlayRef}
        onClick={onOverlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ymal-heading"
      >
        <div className="ymal-sheet">

          {/* Handle */}
          <div className="ymal-handle-wrap" aria-hidden="true">
            <div className="ymal-handle" />
          </div>

          {/* Header */}
          <div className="ymal-header">
            <div className="ymal-header-left">
              <span className="ymal-eyebrow">Curated for you</span>
              <h2 className="ymal-title" id="ymal-heading">
                You May Also <em>Like</em>
              </h2>
            </div>
            <button className="ymal-close" onClick={close} aria-label="Close" type="button">
              &#x2715;
            </button>
          </div>

          {/* Body */}
          <div className="ymal-body">
            {loading ? (
              <div className="ymal-loader">
                <div className="ymal-loader__ring" />
                <p className="ymal-loader__text">Finding recommendations…</p>
              </div>
            ) : (
              <>
                {/* A — Related products */}
                {related.length > 0 && (
                  <div className="ymal-section">
                    <div className="ymal-section-head">
                      <span className="ymal-section-label">Pairs well with {lastProduct.name}</span>
                      <div className="ymal-section-line" />
                    </div>
                    <Swiper {...swiperOpts}>
                      {related.map((p, i) => (
                        <SwiperSlide key={i}>
                          <ProductCard
                            elm={p}
                            categorySlug={slugify(p.category_name)}
                            subcategorySlug={slugify(p.subcategory?.subcategory_name || "")}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {/* B — Best sellers from category */}
                {bestSell.length > 0 && (
                  <div className="ymal-section">
                    <div className="ymal-section-head">
                      <span className="ymal-section-label">Best sellers in {lastProduct.category}</span>
                      <div className="ymal-section-line" />
                    </div>
                    <Swiper {...swiperOpts}>
                      {bestSell.map((p, i) => (
                        <SwiperSlide key={i}>
                          <ProductCard
                            elm={p}
                            categorySlug={slugify(p.category_name || lastProduct.category)}
                            subcategorySlug={slugify(p.subcategory?.subcategory_name || "")}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {related.length === 0 && bestSell.length === 0 && (
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem", textAlign: "center", marginTop: "40px" }}>
                    No recommendations available.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}