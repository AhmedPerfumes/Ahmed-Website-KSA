"use client";
/**
 * CartDrawer — the site's only cart (the /shop-cart page now opens this drawer).
 *
 *  Header → free-shipping bar → items (scroll) → pinned "Complete your collection" strip → footer
 *  (subtotal, single Checkout CTA, payment icons).
 *
 *  Opens automatically when a NEW product line is added right after a `cart:added`
 *  event (PDP, listings, sticky ATC, bundles…) — quantity steppers elsewhere don't
 *  pop it open, and restoring a saved cart on page load doesn't either.
 *  Opens from the side matching the reading direction (right in EN, left in AR).
 */
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import he from "he";
import { useLocale, useTranslations } from "next-intl";
import BogoProgress, { loadPromotions, getBogoShortfalls } from "@/components/BogoProgress";
import { useContextElement } from "@/context/Context";
import { useMenu } from "../../context/MenuContext";
import { openCart } from "@/utlis/openCart";
import { linePrice, productImageUrl, productHref } from "@/utlis/cartPricing";
import CartUpsell from "@/components/cart/CartUpsell";

const isCheckoutPath = (p) => /\/shop-checkout|\/shop-order-complete|\/tamara-payment-redirect/.test(p || "");

export default function CartDrawer() {
  const { currency } = useMenu();
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("CartDrawer");
  const { cartProducts, setCartProducts, totalPrice, couponDataContext, freeShippingThreshold, isFreeShippingPromo, promotionsContext } = useContextElement();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [bogoWarn, setBogoWarn] = useState(null);
  const [itemErrors, setItemErrors] = useState({});   // product_id → message
  const [justAddedId, setJustAddedId] = useState(null);
  const [anchor, setAnchor] = useState(null);         // product the upsell is based on
  const lastAddEventRef = useRef(0);
  const prevIdsRef = useRef(null);

  /* ── open / close ───────────────────────────────────────────── */
  const closeCart = () => {
    document.getElementById("cartDrawerOverlay")?.classList.remove("page-overlay_visible");
    document.getElementById("cartDrawer")?.classList.remove("aside_visible");
  };

  // Track the visible state from the class (openCart() is called from many places)
  useEffect(() => {
    const el = document.getElementById("cartDrawer");
    if (!el) return;
    const sync = () => setIsOpen(el.classList.contains("aside_visible"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  // Lock page scroll + close on Escape while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [isOpen]);

  useEffect(() => { closeCart(); }, [pathname]);

  // /shop-cart (old cart page) redirects here with ?cart=open
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("cart") === "open") {
        url.searchParams.delete("cart");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : "") + url.hash);
        setTimeout(openCart, 150);
      }
    } catch { /* ignore */ }
  }, []);

  // Remember when an add-to-cart action happened
  useEffect(() => {
    const onAdded = (e) => { if ((e.detail?.qty ?? 1) > 0) lastAddEventRef.current = Date.now(); };
    window.addEventListener("cart:added", onAdded);
    return () => window.removeEventListener("cart:added", onAdded);
  }, []);

  // A new product line appeared → highlight it, base the upsell on it, open after an add action
  useEffect(() => {
    const ids = cartProducts.filter((p) => !p.is_gift).map((p) => p.product_id);
    const prev = prevIdsRef.current;
    prevIdsRef.current = ids;
    if (prev === null) {
      // first render / restored cart: anchor on the most recent item, don't open
      const last = cartProducts.filter((p) => !p.is_gift).slice(-1)[0];
      if (last) setAnchor(last);
      return;
    }
    const added = ids.find((id) => !prev.includes(id));
    if (added === undefined) {
      if (anchor && !ids.includes(anchor.product_id)) setAnchor(cartProducts.filter((p) => !p.is_gift).slice(-1)[0] || null);
      return;
    }
    const item = cartProducts.find((p) => p.product_id === added && !p.is_gift);
    if (item && !isOpen) setAnchor(item); // items added from inside the drawer keep the current slider
    setJustAddedId(added);
    setTimeout(() => setJustAddedId((cur) => (cur === added ? null : cur)), 2600);
    // Bring the newly added line into view (the bag may be scrolled / longer than the screen)
    setTimeout(() => {
      const body = document.querySelector("#cartDrawer .cd2-body");
      const row = body?.querySelector(`[data-pid="${CSS.escape(String(added))}"]`);
      if (!body || !row) return;
      const b = body.getBoundingClientRect();
      const r = row.getBoundingClientRect();
      if (r.top < b.top || r.bottom > b.bottom) {
        body.scrollTo({ top: body.scrollTop + (r.top - b.top) - (b.height - r.height) / 2, behavior: "smooth" });
      }
    }, 120);
    if (Date.now() - lastAddEventRef.current < 2000 && !isCheckoutPath(window.location.pathname)) openCart();
  }, [cartProducts]);

  /* ── quantity / remove ──────────────────────────────────────── */
  const limitFor = (elm) => {
    const stock = Number(elm.product_qty ?? Infinity);
    const max = Number(elm.maximum_order_quantity) > 0 ? Number(elm.maximum_order_quantity) : stock;
    return Math.min(stock, max);
  };

  const flashError = (id, msg) => {
    setItemErrors((e) => ({ ...e, [id]: msg }));
    setTimeout(() => setItemErrors((e) => { const n = { ...e }; delete n[id]; return n; }), 3000);
  };

  const setQuantity = (elm, quantity) => {
    const limit = limitFor(elm);
    if (quantity < 1) return;
    if (quantity > limit) {
      flashError(elm.product_id, quantity > Number(elm.product_qty ?? Infinity) ? t("stockExceeded") : t("maxAllowed", { max: limit }));
      return;
    }
    const items = cartProducts.map((item) => {
      if (item.product_id != elm.product_id) return item;
      if (!item.is_gift) return { ...item, quantity };
      // Linked gift follows the paid item's quantity (except "least expensive" rules)
      return item.selection_rule != "least_expensive" ? { ...item, quantity } : item;
    });
    setCartProducts(items);
  };

  const removeItem = (elm) => {
    try {
      window.AhmedTracker?.track?.("remove_from_cart", {
        product_id: (elm.product_id || elm.id)?.toString(),
        product_name: elm.product_name || elm.name || "",
        price: linePrice(elm, couponDataContext, promotionsContext).unit,
        quantity: Number(elm.quantity || 1),
      });
    } catch { /* ignore */ }
    setCartProducts((pre) => pre.filter((p) => p.product_id != elm.product_id));
  };

  /* ── derived ────────────────────────────────────────────────── */
  const sym = currency?.symbol ?? "";
  const itemCount = cartProducts.filter((p) => !p.is_gift).reduce((n, p) => n + Number(p.quantity || 0), 0);
  const remaining = isFreeShippingPromo ? 0 : Math.max(freeShippingThreshold - totalPrice, 0);
  const progress = isFreeShippingPromo ? 100 : Math.min((totalPrice / freeShippingThreshold) * 100, 100);
  const proceedToCheckout = () => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "cart_checkout_click", value: totalPrice, items_count: itemCount });
    } catch { /* ignore */ }
    closeCart();
    router.push(`/${locale}/shop-checkout`);
  };

  const goCheckout = async (e) => {
    e.preventDefault();
    const promos = await loadPromotions();
    const shortfalls = getBogoShortfalls(promos, cartProducts);
    if (shortfalls.length) {
      setBogoWarn(shortfalls[0]);
      return;
    }
    try { sessionStorage.removeItem("bogo_consent"); } catch { /* ignore */ }
    proceedToCheckout();
  };

  return (
    <>
      <div
        className="aside aside_right cd2"
        id="cartDrawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("yourBag")}
        aria-hidden={!isOpen}
        data-lenis-prevent
      >
        {/* ── Header ── */}
        <div className="cd2-header">
          <h3 className="cd2-header__title">
            {t("yourBag")}
            {itemCount > 0 && <span className="cd2-header__count">({itemCount})</span>}
          </h3>
          <button type="button" onClick={closeCart} className="cd2-close js-close-aside" aria-label={t("closeCart")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {cartProducts.length > 0 ? (
          <>
            {/* ── Free-shipping progress ── */}
            <div className="cd2-promos">
              <div className="cd2-ship">
                <p className="cd2-ship__text">
                  {remaining > 0
                    ? t.rich("addMore", { amount: `${remaining.toFixed(2)} ${sym}`, b: (c) => <strong>{c}</strong> })
                    : t.rich("qualifies", { b: (c) => <strong>{c}</strong> })}
                </p>
                <div className="cd2-ship__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                  <div className={`cd2-ship__fill${remaining <= 0 ? " is-done" : ""}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* ── Scrollable body: items + upsell ── */}
            <div className="cd2-body">
              <ul className="cd2-items">
                {cartProducts.map((elm) => {
                  const price = linePrice(elm, couponDataContext, promotionsContext);
                  const img = productImageUrl(elm);
                  const name = isAr && elm?.product_name_ar?.trim() ? elm.product_name_ar : he.decode(elm?.product_name || "");
                  const href = productHref(elm, locale);
                  const size = Array.isArray(elm.tags) ? elm.tags.filter((x) => typeof x === "string").join(" · ") : "";
                  const limit = limitFor(elm);
                  const hasFreeOffer = Number(elm.bogo_free_qty || 0) > 0 || Boolean(elm.is_gift);
                  const Wrap = href ? Link : "span";
                  const linkProps = href ? { href, onClick: closeCart } : {};
                  return (
                    <li key={`${elm.product_id}-${elm.is_gift ? "g" : "p"}`} data-pid={elm.is_gift ? undefined : elm.product_id} className={`cd2-item${justAddedId === elm.product_id && !elm.is_gift ? " is-new" : ""}`}>
                      <Wrap {...linkProps} className="cd2-item__img" style={{ position: "relative" }}>
                        {img ? <Image src={img} alt={name} width={84} height={104} style={{ objectFit: "cover" }} /> : <span className="cd2-item__ph" />}
                        {hasFreeOffer && (
                          <span
                            style={{
                              position: "absolute",
                              top: 9,
                              ...(isAr
                                ? { right: -20, transform: "rotate(45deg)" }
                                : { left: -20, transform: "rotate(-45deg)" }),
                              width: 68,
                              padding: "2px 0",
                              background: "#c62828",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 700,
                              lineHeight: 1.2,
                              letterSpacing: isAr ? 0 : "0.1em",
                              textAlign: "center",
                              textTransform: "uppercase",
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.22)",
                              pointerEvents: "none",
                              zIndex: 1,
                            }}
                          >
                            {isAr ? "مجاني" : "FREE"}
                          </span>
                        )}
                      </Wrap>

                      <div className="cd2-item__info">
                        <div className="cd2-item__top">
                          <Wrap {...linkProps} className="cd2-item__name">{name}</Wrap>
                          {!elm.is_gift && (
                            <button type="button" className="cd2-item__remove" onClick={() => removeItem(elm)} aria-label={t("removeItem")}>
                              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {size && <p className="cd2-item__meta">{size}</p>}

                        <div className="cd2-item__bottom">
                          {elm.is_gift ? (
                            <span className="cd2-item__gift">{t("freeGift")}</span>
                          ) : (
                            <div className="cd2-qty" role="group" aria-label={name}>
                              <button type="button" className="cd2-qty__btn" onClick={() => setQuantity(elm, elm.quantity - 1)} disabled={elm.quantity <= 1} aria-label={t("decrease")}>−</button>
                              <span className="cd2-qty__num" aria-live="polite">{elm.quantity}</span>
                              <button type="button" className="cd2-qty__btn" onClick={() => setQuantity(elm, elm.quantity + 1)} disabled={elm.quantity >= limit} aria-label={t("increase")}>+</button>
                            </div>
                          )}
                          <div className="cd2-item__price">
                            {elm.is_gift ? (
                              <span className="is-free">{t("free")}</span>
                            ) : (
                              <>
                                {(price.discounted || Number(elm.bogo_free_qty || 0) > 0) && (
                                  <s>{(price.base * elm.quantity).toFixed(2)}</s>
                                )}
                                <span className={price.discounted || Number(elm.bogo_free_qty || 0) > 0 ? "is-sale" : ""}>
                                  {(price.unit * Math.max(0, elm.quantity - Number(elm.bogo_free_qty || 0))).toFixed(2)} {sym}
                                </span>
                                {Number(elm.bogo_free_qty || 0) > 0 && (
                                  <span style={{ display: 'block', color: '#28a745', fontWeight: 'bold', fontSize: '11px' }}>
                                    🎁 {elm.bogo_free_qty} {isAr ? 'مجاني' : 'FREE'}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {itemErrors[elm.product_id] && <p className="cd2-item__error" role="alert">{itemErrors[elm.product_id]}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Buy X Get Y progress — directly above the upsell strip */}
            <BogoProgress compact className="cd2-bogo" />

            {/* Pinned above the footer so it never gets pushed out of view by a long bag */}
            <CartUpsell anchor={anchor} isOpen={isOpen} compact />

            {/* ── Sticky footer ── */}
            <div className="cd2-footer">
              <div className="cd2-total">
                <span>{t("subtotal")}</span>
                <strong>{totalPrice.toFixed(2)} {sym}</strong>
              </div>
              <p className="cd2-footer__note">{t("vatNote")}</p>
              <Link href={`/${locale}/shop-checkout`} className="cd2-checkout" onClick={goCheckout}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                {t("checkoutAmount", { amount: `${totalPrice.toFixed(2)} ${sym}` })}
              </Link>
            </div>
          </>
        ) : (
          /* ── Empty bag: best sellers instead of a blank screen ── */
          <div className="cd2-body cd2-body--empty">
            <div className="cd2-empty">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#c5a05a" strokeWidth="1.2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cd2-empty__title">{t("emptyTitle")}</p>
              <p className="cd2-empty__sub">{t("emptySub")}</p>
              <Link href={`/${locale}/shop`} className="cd2-checkout cd2-checkout--outline" onClick={closeCart}>
                {t("exploreCollection")}
              </Link>
            </div>
            <CartUpsell anchor={null} isOpen={isOpen} />
          </div>
        )}
      </div>

      <div id="cartDrawerOverlay" onClick={closeCart} className="page-overlay" />

      {bogoWarn && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setBogoWarn(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 15, 15, 0.55)",
            backdropFilter: "blur(3px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            dir={isAr ? "rtl" : "ltr"}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 14,
              borderTop: "3px solid #c62828",
              padding: "28px 24px 20px",
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.18)",
            }}
          >
            <h4 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 700, lineHeight: 1.3, color: "#c62828" }}>
              {isAr
                ? (bogoWarn.getQty > 1 ? "أنت تفوّت منتجاتك المجانية" : "أنت تفوّت منتجك المجاني")
                : (bogoWarn.getQty > 1 ? "You are missing your free items" : "You are missing your free item")}
            </h4>
            <p style={{ margin: "0 0 22px", fontSize: 14, lineHeight: 1.55, color: "#525252" }}>
              {isAr ? (
                <>
                  أضف <strong style={{ color: "#111" }}>{bogoWarn.need}</strong> {bogoWarn.need > 1 ? "منتجات" : "منتج"} إضافية لتحصل على{" "}
                  <strong style={{ color: "#c62828" }}>{bogoWarn.getQty} مجاناً</strong>
                  {(bogoWarn.promo.name_ar || bogoWarn.promo.name) ? ` (${bogoWarn.promo.name_ar?.trim() || bogoWarn.promo.name})` : ""}.
                </>
              ) : (
                <>
                  Add <strong style={{ color: "#111" }}>{bogoWarn.need} more item{bogoWarn.need > 1 ? "s" : ""}</strong> to unlock{" "}
                  <strong style={{ color: "#c62828" }}>{bogoWarn.getQty} FREE</strong>
                  {bogoWarn.promo.name ? ` — ${bogoWarn.promo.name}` : ""}.
                </>
              )}
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <Link
                href={`/${locale}/sale`}
                onClick={() => { setBogoWarn(null); closeCart(); }}
                style={{
                  textDecoration: "none",
                  display: "block",
                  padding: "13px 18px",
                  borderRadius: 8,
                  fontWeight: 600,
                  background: "#b8860b",
                  color: "#fff",
                }}
              >
                {isAr
                  ? (bogoWarn.getQty > 1 ? "احصل على منتجاتك المجانية" : "احصل على منتجك المجاني")
                  : (bogoWarn.getQty > 1 ? "Claim my free items" : "Claim my free item")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  try { sessionStorage.setItem("bogo_consent", "1"); } catch { /* ignore */ }
                  setBogoWarn(null);
                  proceedToCheckout();
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "#737373",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                {isAr ? "متابعة بدون العرض المجاني" : "Continue without free item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
