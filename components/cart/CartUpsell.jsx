"use client";
/**
 * CartUpsell — "Complete your collection" slider inside the cart drawer.
 *
 * Picks (in order, de-duplicated, never items already in the bag or out of stock):
 *   1. related products of the anchor item (last added)  — api/products → related_prods
 *   2. best sellers from the categories in the bag       — api/getBestSelling
 *   3. best sellers overall (fallback, and for an empty bag)
 *
 * Native scroll-snap slider (light, touch-friendly, RTL-safe); arrows on pointer devices.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import { useContextElement } from "@/context/Context";
import { useMenu } from "@/context/MenuContext";
import { fetchBestSelling } from "@/utlis/productsCache";
import { linePrice, productImageUrl, productHref } from "@/utlis/cartPricing";
import { loadPromotions } from "@/components/BogoProgress";

const MAX_CARDS = 10;
const relatedCache = new Map(); // anchor key → related products (per tab)

async function fetchRelated(anchor) {
  const key = `${anchor.category_name}|${anchor.subcategory_name}|${anchor.product_name}`;
  if (relatedCache.has(key)) return relatedCache.get(key);
  const p = fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category: (anchor.category_name || "").toUpperCase(),
      subCategory: (anchor.subcategory_name || anchor.subcategory?.subcategory_name || anchor.category_name || "").toUpperCase(),
      product: (anchor.product_name || "").toUpperCase(),
    }),
  })
    .then((r) => r.json())
    .then((d) => (Array.isArray(d?.related_prods) ? d.related_prods : []))
    .catch(() => []);
  relatedCache.set(key, p);
  return p;
}

export default function CartUpsell({ anchor, isOpen, compact = false }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("CartDrawer");
  const { currency } = useMenu();
  const { cartProducts, addProductToCart, couponDataContext, promotionsContext } = useContextElement();
  const [pool, setPool] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const trackRef = useRef(null);
  const viewedRef = useRef("");

  const cartIds = useMemo(() => new Set(cartProducts.map((p) => String(p.product_id))), [cartProducts]);
  const cartCats = useMemo(
    () => [...new Set(cartProducts.filter((p) => !p.is_gift).map((p) => p.category_name).filter(Boolean))],
    [cartProducts]
  );
  const anchorKey = anchor ? `${anchor.product_id}` : "none";

  // Map product_id → active BOGO promotion for O(1) label lookup
  const promoByProductId = useMemo(() => {
    const map = new Map();
    const list = promos.length ? promos : (promotionsContext || []);
    for (const promo of list) {
      for (const bp of promo.buy_products || []) {
        const id = String(bp.product_id);
        if (!map.has(id)) map.set(id, promo);
      }
    }
    return map;
  }, [promos, promotionsContext]);

  // Build the candidate pool when the drawer opens / the anchor changes
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [activePromos, related, best] = await Promise.all([
        loadPromotions(),
        anchor ? fetchRelated(anchor) : Promise.resolve([]),
        fetchBestSelling(),
      ]);

      // Build lookup of full product records (related + best sellers) to enrich BOGO items
      // with category/subcategory/Arabic name/discount metadata when available
      const fullById = new Map();
      const indexFull = (list) => {
        for (const p of list || []) {
          if (p?.product_id && !fullById.has(String(p.product_id))) {
            fullById.set(String(p.product_id), p);
          }
        }
      };
      indexFull(related);
      const keys = Object.keys(best || {});
      for (const k of keys) indexFull(best[k]);

      const out = [];
      const seen = new Set();
      const push = (list) => {
        for (const p of list || []) {
          if (!p?.product_id) continue;
          const id = String(p.product_id);
          if (seen.has(id)) continue;
          seen.add(id);
          const full = fullById.get(id);
          out.push(full ? { ...p, ...full } : p);
        }
      };

      // 1. Active BOGO products first — prioritize campaigns already touched by the bag
      if (activePromos?.length) {
        const touched = [];
        const others = [];
        for (const promo of activePromos) {
          const hasInCart = (promo.buy_products || []).some((bp) => cartIds.has(String(bp.product_id)));
          (hasInCart ? touched : others).push(promo);
        }
        for (const promo of [...touched, ...others]) {
          push(promo.buy_products);
        }
      }

      // 2. Related products of anchor
      push(related);

      // 3. Best sellers from categories in the bag
      for (const cat of cartCats) {
        const k = keys.find((x) => x.toUpperCase() === String(cat).toUpperCase());
        if (k) push(best[k]);
      }

      // 4. Overall fallback: interleave every category so the mix stays varied
      const lists = keys.map((k) => (Array.isArray(best[k]) ? best[k] : []));
      for (let i = 0; i < 8; i++) push(lists.map((l) => l[i]).filter(Boolean));

      if (!cancelled) {
        setPromos(activePromos || []);
        setPool(out);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, anchorKey, cartCats.join("|")]);

  const cards = useMemo(
    // Keep a just-added card on screen briefly so the "Added ✓" confirmation is visible
    // Products without an image are skipped — an empty card looks broken
    () => pool.filter((p) => (p.product_id === justAdded || !cartIds.has(String(p.product_id))) && Number(p.product_qty ?? 1) > 0 && productImageUrl(p)).slice(0, MAX_CARDS),
    [pool, cartIds, justAdded]
  );

  // One impression event per drawer open + anchor
  useEffect(() => {
    if (!isOpen || !cards.length) return;
    const sig = `${anchorKey}:${cards.length}`;
    if (viewedRef.current === sig) return;
    viewedRef.current = sig;
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cart_upsell_view", items: cards.map((p) => String(p.product_id)) });
      window.AhmedTracker?.track?.("cart_upsell_view", { anchor_id: anchor?.product_id ?? null, product_ids: cards.map((p) => String(p.product_id)) });
    } catch { /* ignore */ }
  }, [isOpen, cards, anchorKey]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".cdu-card");
    const step = (card?.offsetWidth || 160) + 12;
    // In RTL the visual "next" direction is to the left
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: (rtl ? -1 : 1) * dir * step, behavior: "smooth" });
  };

  const add = (p) => {
    addProductToCart({
      ...p,
      _silent: true,
      quantity: 1,
      category_name: p.category_name || "",
      subcategory_name: p.subcategory_name || p.subcategory?.subcategory_name || p.category_name || "",
    });
    setJustAdded(p.product_id);
    setTimeout(() => setJustAdded(null), 1600);
    try {
      const price = linePrice(p).unit;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cart_upsell_add", ecommerce: { currency: "SAR", value: price, items: [{ item_id: String(p.product_id), item_name: p.product_name, price, quantity: 1 }] } });
      window.AhmedTracker?.track?.("cart_upsell_add", { product_id: String(p.product_id), product_name: p.product_name, price, anchor_id: anchor?.product_id ?? null });
    } catch { /* ignore */ }
  };

  if (!loading && !cards.length) return null;

  return (
    <section className={`cdu${compact ? " cdu--compact" : ""}`} aria-label={anchor ? t("upsellTitle") : t("upsellTitleEmpty")}>
      <div className="cdu__head">
        <h4 className="cdu__title">{anchor ? t("upsellTitle") : t("upsellTitleEmpty")}</h4>
        <div className="cdu__nav">
          <button type="button" className="cdu__arrow cdu__arrow--prev" onClick={() => scrollByCard(-1)} aria-label={t("prev")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button type="button" className="cdu__arrow cdu__arrow--next" onClick={() => scrollByCard(1)} aria-label={t("next")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      <div className="cdu__track" ref={trackRef}>
        {loading && !cards.length
          ? [0, 1, 2].map((i) => <div key={i} className="cdu-card cdu-card--skeleton" aria-hidden="true" />)
          : cards.map((p) => {
            const name = isAr && p.product_name_ar?.trim() ? p.product_name_ar : he.decode(p.product_name || "");
            const img = productImageUrl(p);
            const href = productHref(p, locale);
            const activePromos = promos.length ? promos : (promotionsContext || []);
            const price = linePrice(p, couponDataContext, activePromos);
            const bogoPromo = promoByProductId.get(String(p.product_id));
            const pctOff = price.discounted && price.base > 0
              ? Math.round(((price.base - price.unit) / price.base) * 100)
              : 0;
            const promoBadge = bogoPromo
              ? {
                label: isAr
                  ? `اشترِ ${Number(bogoPromo.buy_quantity) - 1 || 1} + ${Number(bogoPromo.get_quantity) || 1} مجاناً`
                  : `BUY ${Number(bogoPromo.buy_quantity) - 1 || 1} GET ${Number(bogoPromo.get_quantity) || 1} FREE`,
                isBogo: true,
              }
              : price.discounted
                ? {
                  label: isAr
                    ? (pctOff > 0 ? `خصم ${pctOff}%` : "عرض خاص")
                    : (pctOff > 0 ? `${pctOff}% OFF` : "OFFER"),
                  isBogo: false,
                }
                : null;
            const added = justAdded === p.product_id;
            const Wrap = href ? Link : "div";
            return (
              <article key={p.product_id} className="cdu-card">
                <Wrap {...(href ? { href } : {})} className="cdu-card__img">
                  {img ? <Image src={img} alt={name} fill sizes={compact ? "72px" : "160px"} style={{ objectFit: "cover" }} /> : <span className="cdu-card__ph" />}
                </Wrap>
                <div className="cdu-card__body">
                  {promoBadge && (
                    <span
                      style={{
                        display: "inline-block",
                        alignSelf: "flex-start",
                        margin: compact ? "0 0 3px" : "0.5rem 0.6rem 0",
                        padding: "2px 6px",
                        borderRadius: 2,
                        fontSize: 9.5,
                        fontWeight: 700,
                        lineHeight: 1.25,
                        letterSpacing: isAr ? 0 : "0.08em",
                        textTransform: "uppercase",
                        ...(promoBadge.isBogo
                          ? { background: "#c62828", color: "#fff" }
                          : { background: "#fbf8f1", color: "#8a6318", border: "1px solid #e6d7b8" }),
                      }}
                    >
                      {promoBadge.label}
                    </span>
                  )}
                  <Wrap {...(href ? { href } : {})} className="cdu-card__name" title={name}>{name}</Wrap>
                  <div className="cdu-card__price">
                    <span className={price.discounted ? "is-sale" : ""}>{price.unit.toFixed(2)} {currency?.symbol}</span>
                    {price.discounted && <s>{price.base.toFixed(2)}</s>}
                  </div>
                  <button
                    type="button"
                    className={`cdu-card__add${added ? " is-added" : ""}`}
                    onClick={() => add(p)}
                    disabled={added}
                    aria-label={t("addAria", { name })}
                  >
                    {added ? (
                      <>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                        {t("added")}
                      </>
                    ) : (
                      <>+ {t("add")}</>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        {!loading && cards.length > 0 && (
          <Link
            href={`/${locale}/sale`}
            className="cdu-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: compact ? "10px 14px" : "16px 12px",
              minWidth: compact ? 132 : undefined,
              textAlign: "center",
              textDecoration: "none",
              background: "#fbf8f1",
              borderColor: "#e6d7b8",
              color: "#7c5e22",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #a88339",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7c5e22",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={isAr ? { transform: "scaleX(-1)" } : undefined}
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: isAr ? 0 : "0.1em",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {isAr ? "تسوق العروض" : "Shop All Sale"}
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
