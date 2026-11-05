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
  const { cartProducts, addProductToCart } = useContextElement();
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const trackRef = useRef(null);
  const viewedRef = useRef("");

  const cartIds = useMemo(() => new Set(cartProducts.map((p) => p.product_id)), [cartProducts]);
  const cartCats = useMemo(
    () => [...new Set(cartProducts.filter((p) => !p.is_gift).map((p) => p.category_name).filter(Boolean))],
    [cartProducts]
  );
  const anchorKey = anchor ? `${anchor.product_id}` : "none";

  // Build the candidate pool when the drawer opens / the anchor changes
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const out = [];
      const seen = new Set();
      const push = (list) => {
        for (const p of list || []) {
          if (!p?.product_id || seen.has(p.product_id)) continue;
          seen.add(p.product_id);
          out.push(p);
        }
      };
      if (anchor) push(await fetchRelated(anchor));
      const best = await fetchBestSelling();
      const keys = Object.keys(best || {});
      for (const cat of cartCats) {
        const k = keys.find((x) => x.toUpperCase() === String(cat).toUpperCase());
        if (k) push(best[k]);
      }
      // Overall fallback: interleave every category so the mix stays varied
      const lists = keys.map((k) => (Array.isArray(best[k]) ? best[k] : []));
      for (let i = 0; i < 8; i++) push(lists.map((l) => l[i]).filter(Boolean));
      if (!cancelled) { setPool(out); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [isOpen, anchorKey, cartCats.join("|")]);

  const cards = useMemo(
    // Keep a just-added card on screen briefly so the "Added ✓" confirmation is visible
    // Products without an image are skipped — an empty card looks broken
    () => pool.filter((p) => (p.product_id === justAdded || !cartIds.has(p.product_id)) && Number(p.product_qty ?? 1) > 0 && productImageUrl(p)).slice(0, MAX_CARDS),
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
            const price = linePrice(p);
            const added = justAdded === p.product_id;
            const Wrap = href ? Link : "div";
            return (
              <article key={p.product_id} className="cdu-card">
                <Wrap {...(href ? { href } : {})} className="cdu-card__img">
                  {img ? <Image src={img} alt={name} fill sizes={compact ? "72px" : "160px"} style={{ objectFit: "cover" }} /> : <span className="cdu-card__ph" />}
                </Wrap>
                <div className="cdu-card__body">
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
      </div>
    </section>
  );
}
