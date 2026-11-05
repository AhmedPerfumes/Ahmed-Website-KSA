import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useContextElement } from '@/context/Context';
import { useMenu } from '@/context/MenuContext';
import he from 'he';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperOptions = {
  autoplay: false,
  slidesPerView: 6,
  slidesPerGroup: 4,
  effect: "none",
  modules: [Pagination, Navigation],
  pagination: {
    el: ".products-pagination",
    type: "bullets",
    clickable: true,
  },
  navigation: {
    nextEl: ".ssn11",
    prevEl: ".ssp11",
  },
  breakpoints: {
    320: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
    768: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
    992: {
      slidesPerView: 4,
      slidesPerGroup: 4,
    },
  },
};

const BOGOFeature = () => {
  const { cartProducts, setCartProducts, setPromotionsContext } = useContextElement();
  const { currency } = useMenu();
  const sym = currency?.symbol || "SAR";
  const [selectedGifts, setSelectedGifts] = useState({});
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const latestCartRef = useRef(cartProducts);

  // Keep latestCartRef in sync for cleanup
  useEffect(() => {
    latestCartRef.current = cartProducts;
  }, [cartProducts]);

  // ✅ Cleanup on unmount: remove BOGO flags and restore original discounts
  useEffect(() => {
    return () => {
      const currentCart = latestCartRef.current;
      if (!currentCart?.length) return;

      const hasBOGOChanges = currentCart.some(
        (item) => item.bogo_free_qty || item._original_discount || (item.is_gift && item.type === 'bogo')
      );
      if (!hasBOGOChanges) return;

      // Remove old-style BOGO gifts and FOC gifts AND restore BOGO flags
      const cleanedCart = currentCart
        .filter((item) => !item.is_gift) // Remove all gift items on checkout unmount
        .map((item) => {
          if (item.bogo_free_qty || item._original_discount || item.bogo_campaign) {
            const { bogo_free_qty, bogo_campaign, _original_discount, ...rest } = item;
            return {
              ...rest,
              discount: _original_discount || rest.discount,
            };
          }
          return item;
        });

      // console.log('000 Cleanup on unmount: removing BOGO flags, restoring discounts');
      setCartProducts(cleanedCart);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ On mount: clean up any old-style BOGO gift items from previous sessions
  useEffect(() => {
    if (!cartProducts?.length) return;
    const hasOldBOGOGifts = cartProducts.some(
      (item) => item.is_gift && item.type === 'bogo'
    );
    if (hasOldBOGOGifts) {
      const cleaned = cartProducts.filter(
        (item) => !(item.is_gift && item.type === 'bogo')
      );
      // console.log('000 Cleaned old-style BOGO gift items from cart');
      setCartProducts(cleaned);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Fetch BOGO promotion rules
  useEffect(() => {
    const fetchBogoRules = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/bogoProducts`);
        if (!response.ok) throw new Error('Failed to fetch bogoProducts');
        const data = await response.json();
        const validPromotions = (data.bogoProducts || []).filter(
          (promo) => promo.campaign && promo.buy_products
        ).map(promo => ({
          ...promo,
          free_products: promo.free_products && promo.free_products.length > 0
            ? promo.free_products
            : promo.buy_products
        }));
        setPromotions(validPromotions);
        setPromotionsContext(validPromotions);
      } catch (error) {
        setPromotions([]);
        setPromotionsContext([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBogoRules();
  }, [setPromotionsContext]);

  // ✅ Clean non-special products ONCE after promotions load
  useEffect(() => {
    if (loading || !promotions.length || !cartProducts?.length) return;

    const updated = cartProducts.map((item) => {
      const isBogo = promotions.some((promo) =>
        [...promo.buy_products, ...(promo.free_products || [])].some(
          (b) => b.product_id === item.product_id
        )
      );
      const isDiscount = item.discount != null;

      if (isBogo || isDiscount) {
        return item; // keep coupon
      }

      // Remove coupon only for normal products
      const { is_coupon, ...rest } = item;
      return rest;
    });

    const hasChanged = JSON.stringify(cartProducts) !== JSON.stringify(updated);
    if (hasChanged) {
      setCartProducts(updated);
    }
  }, [promotions, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════════
  // ✅ MAIN BOGO PROCESSING — "bogo_free_qty" approach
  //    Instead of adding separate gift items, we flag the cheapest
  //    qualifying product with bogo_free_qty. The price calculation
  //    in Context.jsx uses (qty - bogo_free_qty) as the paid quantity.
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loading || !promotions.length) return;

    const timer = setTimeout(() => {
      let updatedCart = cartProducts.map((item) => ({ ...item }));
      let cartChanged = false;

      promotions.forEach((promo) => {
        const { buy_quantity, get_quantity, selection_rule, buy_products, free_products, campaign } = promo;
        if (!campaign) return;

        // Find all qualifying product indices for this campaign
        const qualifyingIndices = [];
        updatedCart.forEach((item, idx) => {
          if (!item.is_gift && buy_products.some((b) => b.product_id === item.product_id)) {
            qualifyingIndices.push(idx);
          }
        });

        const qualifyingProducts = qualifyingIndices.map((idx) => updatedCart[idx]);
        const totalQuantity = qualifyingProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const giftSets = Math.floor(totalQuantity / buy_quantity);
        const giftsAllowed = giftSets * get_quantity;

        // console.log(`000 Campaign ${campaign}: totalQty=${totalQuantity}, buyQty=${buy_quantity}, giftsAllowed=${giftsAllowed}`);

        // ─── BOGO DOESN'T QUALIFY ────────────────────────────────────
        if (giftsAllowed === 0) {
          qualifyingIndices.forEach((idx) => {
            const item = updatedCart[idx];
            if (item.bogo_campaign === campaign && (item.bogo_free_qty || item._original_discount)) {
              // console.log(`000 Removing BOGO from ${item.product_id} (no longer qualifies)`);
              const { bogo_free_qty, bogo_campaign, _original_discount, ...rest } = item;
              updatedCart[idx] = {
                ...rest,
                discount: _original_discount || rest.discount,
              };
              cartChanged = true;
            }
          });
          return;
        }

        // ─── BOGO QUALIFIES ──────────────────────────────────────────

        // Get candidate products (those in the free_products list AND in cart)
        const candidateIndices = qualifyingIndices.filter((idx) =>
          free_products.some((fp) => fp.product_id === updatedCart[idx].product_id)
        );
        const candidateProducts = candidateIndices.map((idx) => updatedCart[idx]);

        if (candidateProducts.length === 0) return;

        // Check prices for auto vs user-select decision
        const prices = candidateProducts.map((p) => Number(p.price) || 0);
        const uniquePrices = new Set(prices);
        const allPricesEqual = uniquePrices.size === 1 && candidateProducts.length > 1;

        // ─── Determine DESIRED free state ────────────────────────────
        let desiredFree = []; // [{ product_id, free_qty }]

        if (!allPricesEqual && selection_rule !== 'customer_select') {
          // AUTO-SELECT: cheapest product(s) get free
          const sortedCandidates = [...candidateIndices]
            .map((idx) => ({
              idx,
              product_id: updatedCart[idx].product_id,
              price: Number(updatedCart[idx].price) || 0,
              qty: updatedCart[idx].quantity || 0,
            }))
            .sort((a, b) => a.price - b.price);

          let remaining = giftsAllowed;
          for (const candidate of sortedCandidates) {
            if (remaining <= 0) break;
            // Give as many free units as possible from this (cheapest) candidate
            // before moving to the next more-expensive candidate.
            const freeQty = Math.min(candidate.qty, remaining);
            if (freeQty > 0) {
              desiredFree.push({ product_id: candidate.product_id, free_qty: freeQty });
              remaining -= freeQty;
            }
          }
        } else {
          // SAME PRICE or CUSTOMER_SELECT — use user selection
          const selected = selectedGifts[campaign] || [];
          if (selected.length > 0) {
            let remaining = giftsAllowed;
            for (const sel of selected) {
              if (remaining <= 0) break;
              const product = qualifyingProducts.find((p) => p.product_id === sel.product_id);
              if (product) {
                const freeQty = Math.min(sel.quantity || get_quantity, product.quantity, remaining);
                if (freeQty > 0) {
                  desiredFree.push({ product_id: product.product_id, free_qty: freeQty });
                  remaining -= freeQty;
                }
              }
            }
          }
          // If no selection yet, desiredFree stays empty — wait for user
        }

        // ─── Apply desired state to cart ─────────────────────────────
        // When BOGO is active (desiredFree has items), ALL qualifying products
        // in this campaign have their discounts removed — not just the free one.
        const bogoIsActive = desiredFree.length > 0;

        qualifyingIndices.forEach((idx) => {
          const item = updatedCart[idx];
          const desired = desiredFree.find((d) => d.product_id === item.product_id);
          const desiredFreeQty = desired?.free_qty || 0;
          const currentFreeQty = (item.bogo_campaign === campaign ? item.bogo_free_qty : 0) || 0;

          if (bogoIsActive) {
            // ── BOGO is active: remove discount from ALL qualifying products ──
            const needsDiscountRemoval = item.discount != null && !item._original_discount;
            const needsFreeQtyUpdate = desiredFreeQty !== currentFreeQty || item.bogo_campaign !== campaign;

            if (needsDiscountRemoval || needsFreeQtyUpdate) {
              // console.log(`000 BOGO active: updating product ${item.product_id} (freeQty=${desiredFreeQty}, removeDiscount=${needsDiscountRemoval})`);
              updatedCart[idx] = {
                ...item,
                bogo_campaign: campaign,
                _original_discount: item._original_discount || item.discount,
                discount: null,
                ...(desiredFreeQty > 0 ? { bogo_free_qty: desiredFreeQty } : {}),
              };
              // Remove bogo_free_qty if it was set but shouldn't be
              if (desiredFreeQty === 0 && updatedCart[idx].bogo_free_qty) {
                delete updatedCart[idx].bogo_free_qty;
              }
              cartChanged = true;
            }
          } else if (item.bogo_campaign === campaign) {
            // ── BOGO not active (no selection yet or cleared): restore ──
            if (currentFreeQty > 0 || item._original_discount) {
              // console.log(`000 BOGO inactive: restoring product ${item.product_id}`);
              const { bogo_free_qty, bogo_campaign, _original_discount, ...rest } = item;
              updatedCart[idx] = {
                ...rest,
                discount: _original_discount || rest.discount,
              };
              cartChanged = true;
            }
          }
        });
      });

      if (cartChanged) {
        // console.log('000 Updating cart with BOGO changes');
        setCartProducts(updatedCart);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [cartProducts, promotions, loading, selectedGifts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════════════
  // ✅ HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleGiftSelection = (campaign, product, quantity, selection_rule, giftsAllowed) => {
    if (!campaign || !product?.product_id) return;

    const parsedQuantity = Math.max(1, parseInt(quantity) || 1);

    setSelectedGifts((prev) => {
      const currentSelected = prev[campaign] || [];

      if (selection_rule === 'customer_select') {
        const currentCount = currentSelected.reduce((sum, g) => sum + (g.quantity || 0), 0);

        if (currentCount >= giftsAllowed && !currentSelected.some((g) => g.product_id === product.product_id)) {
          // Replace: clear previous and set new one
          return {
            ...prev,
            [campaign]: [{ product_id: product.product_id, quantity: parsedQuantity }],
          };
        } else {
          // Add or update
          return {
            ...prev,
            [campaign]: [
              ...currentSelected.filter((g) => g.product_id !== product.product_id),
              { product_id: product.product_id, quantity: parsedQuantity },
            ].filter((g) => g.quantity > 0),
          };
        }
      } else {
        // least_expensive with same price — replace selection
        return {
          ...prev,
          [campaign]: [{ product_id: product.product_id, quantity: parsedQuantity }],
        };
      }
    });
  };

  const handleQuantityChange = (campaign, product, newQuantity) => {
    const parsedQuantity = Math.max(0, parseInt(newQuantity) || 0);

    if (parsedQuantity === 0) {
      // Remove selection
      setSelectedGifts((prev) => ({
        ...prev,
        [campaign]: (prev[campaign] || []).filter((g) => g.product_id !== product.product_id),
      }));
      return;
    }

    // Validate against giftsAllowed
    const promo = promotions.find((p) => p.campaign === campaign);
    if (!promo) return;

    const eligibleProducts = cartProducts.filter(
      (item) => !item.is_gift && promo.buy_products.some((b) => b.product_id === item.product_id)
    );
    const totalQuantity = eligibleProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const giftSets = Math.floor(totalQuantity / promo.buy_quantity);
    const giftsAllowed = giftSets * promo.get_quantity;

    const otherSelected = (selectedGifts[campaign] || [])
      .filter((g) => g.product_id !== product.product_id)
      .reduce((sum, g) => sum + (g.quantity || 0), 0);

    if (parsedQuantity + otherSelected > giftsAllowed) return;

    setSelectedGifts((prev) => ({
      ...prev,
      [campaign]: [
        ...(prev[campaign] || []).filter((g) => g.product_id !== product.product_id),
        { product_id: product.product_id, quantity: parsedQuantity },
      ].filter((g) => g.quantity > 0),
    }));
  };

  // ═══════════════════════════════════════════════════════════════════
  // ✅ RENDER
  // ═══════════════════════════════════════════════════════════════════

  if (loading) return null;

  return (
    <div className="">
      {promotions.map((promo) => {
        const { campaign, name, selection_rule, free_products, buy_products, buy_quantity, get_quantity } = promo;
        if (!campaign) return null;

        // Calculate eligibility
        const eligibleProducts = cartProducts.filter((item) => !item.is_gift && buy_products.some((b) => b.product_id === item.product_id));
        const totalQuantity = eligibleProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const giftSets = Math.floor(totalQuantity / buy_quantity);
        const giftsAllowed = giftSets * get_quantity;

        if (giftsAllowed <= 0) return null;

        // Check if a free product is already set for this campaign
        const freeProduct = eligibleProducts.find(
          (item) => item.bogo_campaign === campaign && item.bogo_free_qty > 0
        );
        // console.log(freeProduct, "freeeeeeeeeeeeeeeeee");

        // Get candidate products from free_products that are in the cart
        const purchasedProductIds = eligibleProducts.map((p) => p.product_id);
        const candidateGifts = free_products.filter((fp) =>
          purchasedProductIds.includes(fp.product_id)
        );
        const prices = candidateGifts.map((p) => Number(p.price) || 0);
        const allPricesEqual = candidateGifts.length > 1 && new Set(prices).size === 1;

        // Show selection UI for same-price or customer_select
        const needsSelection = (
          (selection_rule === 'customer_select' || (selection_rule === 'least_expensive' && allPricesEqual))
          && giftsAllowed > 0
        );

        if (needsSelection) {
          return (
            <div key={campaign} className="mb-6">
              <h4 className="font-bold mb-4">
                <span
                  className="t-subtitle"
                  style={{
                    color: '#000000',
                    fontSize: '18px',
                    lineHeight: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  {freeProduct
                    ? `Your ${name} offer has been applied!`
                    : `Select your free gift for ${name} (Choose ${giftsAllowed} item${giftsAllowed > 1 ? 's' : ''})`
                  }
                </span>
              </h4>
              <Swiper
                {...swiperOptions}
                className="swiper-container js-swiper-slider"
                data-settings=""
              >
                {candidateGifts.map((product) => {
                  const cartItem = eligibleProducts.find(
                    (item) => String(item.product_id) === String(product.product_id)
                  );
                  const isSelected = cartItem?.bogo_campaign === campaign && cartItem?.bogo_free_qty > 0;

                  return (
                    <SwiperSlide key={product.product_id} className="swiper-slide product-card">
                      <div className="pc__img-wrapper">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}storage/${product.image}`}
                          alt={he.decode(product.product_name)}
                          width="330"
                          height="400"
                          className="pc__img"
                          loading="lazy"
                        />
                        {isSelected && selection_rule === 'customer_select' ? (
                          <div className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside flex items-center mt-2 space-x-2">
                            <span className="text-gray-700 font-medium">Selected (Qty):</span>
                            <input
                              id={`quantity-${product.product_id}`}
                              type="number"
                              min="1"
                              max={giftsAllowed}
                              value={cartItem?.bogo_free_qty || 1}
                              onChange={(e) => handleQuantityChange(campaign, product, e.target.value)}
                              className="w-16 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label={`Quantity for ${he.decode(product.product_name)}`}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleGiftSelection(
                                campaign,
                                product,
                                selection_rule === 'customer_select' ? 1 : parseInt(giftsAllowed),
                                selection_rule,
                                giftsAllowed
                              )
                            }
                            className={`pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside ${isSelected ? 'bg-gray-400' : 'bg-blue-500'
                              }`}
                            aria-label={`${isSelected ? 'Already selected' : 'Select'} ${he.decode(product.product_name)} as free gift`}
                            disabled={isSelected}
                          >
                            {isSelected ? '✓ FREE' : 'Select as Free'}
                          </button>
                        )}
                      </div>
                      <div className="pc__info position-relative">
                        <h3 className="pc__title">{he.decode(product.product_name)}</h3>
                        <p className="pc__category">{isSelected ? 'FREE!' : `${sym} ${Number(product.price).toFixed(2)}`}</p>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          );
        } else if (freeProduct) {
          // Auto-selected (cheapest) — show confirmation
          return (
            <div key={campaign} className="mb-6">
              <h4 className="font-bold mb-4">
                <span
                  className="t-subtitle"
                  style={{
                    color: '#000000',
                    fontSize: '18px',
                    lineHeight: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  🎉 Your {name} offer has been applied! {he.decode(freeProduct.product_name || '')} is FREE.
                </span>
              </h4>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default BOGOFeature;