import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useContextElement } from '@/context/Context';
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
  const { cartProducts, setCartProducts, addProductToCart, removeGiftFromCart, setPromotionsContext } = useContextElement();
  const [addedGifts, setAddedGifts] = useState([]);
  const [selectedGifts, setSelectedGifts] = useState({});
  const prevCartRef = useRef([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading ] = useState(true);
  const lastAddedGiftRef = useRef(null);

  useEffect(() => {
    const fetchBogoRules = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/bogoProducts`);
        if (!response.ok) throw new Error('Failed to fetch bogoProducts');
        const data = await response.json();
        // console.log('000 API Response:', JSON.stringify(data, null, 2));
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
        // console.error('Error fetching bogoProducts:', error);
        setPromotions([]);
        setPromotionsContext([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBogoRules();
  }, [setPromotionsContext]);

  // ✅ Step 2: Clean non-special products ONCE after promotions load
  useEffect(() => {
    if (loading || !promotions.length || !cartProducts?.length) return;

    const updated = cartProducts.map((item) => {
      const isBogo = promotions.some((promo) =>
        [...promo.buy_products, ...(promo.free_products || [])].some(
          (b) => b.product_id === item.product_id
        )
      );
      const isDiscount = item.discount > 0;
      // const isSalePrice = item.sale_price > 0;

      // if (isBogo || isDiscount || isSalePrice) {
      if (isBogo || isDiscount) {
        return item; // keep coupon
      }

      // 🚫 Remove coupon only for normal products
      const { is_coupon, ...rest } = item;
      return rest;
    });

    const hasChanged = JSON.stringify(cartProducts) !== JSON.stringify(updated);
    if (hasChanged) {
      setCartProducts(updated);
    }
  }, [promotions, loading]); // 🔥 no cartProducts here

  useEffect(() => {
    if (loading) return;

    const prevCart = prevCartRef.current;

    const hasCartChanged = () => {
      if (prevCart.length !== cartProducts.length) return true;
      return cartProducts.some((item, i) => {
        return (
          item.product_id !== prevCart[i]?.product_id ||
          item.quantity !== prevCart[i]?.quantity ||
          item.is_gift !== prevCart[i]?.is_gift
        );
      });
    };

    if (!hasCartChanged()) {
      // console.log('000 Cart unchanged, skipping gift logic');
      return;
    }

    // console.log('000 Processing gifts for cart:', JSON.stringify(cartProducts, null, 2));

    const timer = setTimeout(() => {
      const newGiftsToAdd = [];

      promotions.forEach((promo) => {
        const { buy_quantity, get_quantity, selection_rule, buy_products, free_products, campaign, name } = promo;

        if (!campaign) {
          // console.warn(`000 Skipping promotion with undefined campaign:`, promo);
          return;
        }

        // console.log(`000 Processing campaign ${campaign}:`);

        const eligibleProducts = cartProducts.filter(
          (item) =>
            item.discount === null &&
            !item.is_gift &&
            buy_products.some((b) => b.product_id === item.product_id)
        );

        // console.log(`000 Eligible products:`, JSON.stringify(eligibleProducts, null, 2));

        const totalQuantity = eligibleProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const giftSets = Math.floor(totalQuantity / buy_quantity);
        const giftsAllowed = giftSets * get_quantity;

        // console.log(`000 Total quantity: ${totalQuantity}, Gift sets: ${giftSets}, Gifts allowed: ${giftsAllowed}`);

        const currentGifts = cartProducts.filter(
          (p) => p.is_gift && p.campaign === campaign
        );
        // console.log(`111 Current gifts:`, JSON.stringify(currentGifts, null, 2));

        if (selection_rule === 'least_expensive') {
          if (giftsAllowed === 0) {
            currentGifts.forEach((gift) => {
              // console.log(`000 Removing gift for campaign ${campaign} due to insufficient quantity:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
            });
            return;
          }

          currentGifts.forEach((gift) => {
            const isValidGift = free_products.some((fp) => fp.product_id === gift.product_id);
            const currentGiftQuantity = currentGifts.reduce((sum, g) => sum + (g.quantity || 0), 0);
            if (!isValidGift || currentGiftQuantity > giftsAllowed) {
              // console.log(`000 Removing invalid/excess gift for campaign ${campaign}:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
            } else {
              newGiftsToAdd.push({
                product_id: gift.product_id,
                quantity: gift.quantity,
                campaign,
              });
            }
          });

          const purchasedProductIds = eligibleProducts.map((p) => p.product_id);
          const candidateGifts = free_products.filter((fp) =>
            purchasedProductIds.includes(fp.product_id)
          );
          // console.log(`000 Candidate gifts:`, JSON.stringify(candidateGifts, null, 2));

          if (candidateGifts.length === 0) {
            // console.log(`000 No candidate gifts for campaign ${campaign}`);
            return;
          }

          let remainingGifts = giftsAllowed - newGiftsToAdd
            .filter((g) => g.campaign === campaign)
            .reduce((sum, g) => sum + (g.quantity || 0), 0);
          // console.log(`000 Remaining gifts: ${remainingGifts}`);

          if (remainingGifts <= 0) return;

          const prices = candidateGifts.map((gift) => Number(gift.price) || 0);
          const allPricesEqual = candidateGifts.length > 1 && new Set(prices).size === 1;
          // console.log(`111 All prices equal: ${allPricesEqual}, Prices:`, prices);

          if (allPricesEqual && candidateGifts.length > 1) {
            const selected = selectedGifts[campaign] || [];
            // console.log(`111 Selected gifts for ${campaign}:`, JSON.stringify(selected, null, 2));
            let totalSelected = selected.reduce((sum, gift) => sum + (gift.quantity || 0), 0);
            if (totalSelected > giftsAllowed) {
              // console.log(`000 Warning: Total selected gifts (${totalSelected}) exceeds giftsAllowed (${giftsAllowed})`);
              return;
            }
            selected.forEach((gift) => {
              if (remainingGifts <= 0) return;
              const bogoGift = candidateGifts.find((fp) => fp.product_id === gift.product_id);
              if (bogoGift) {
                const purchasedProduct = eligibleProducts.find((p) => p.product_id === bogoGift.product_id);
                const giftQuantity = Math.min(
                  gift.quantity || 0,
                  remainingGifts,
                  purchasedProduct?.quantity || 0
                );
                if (giftQuantity > 0) {
                  // console.log(`000 Adding selected gift for ${campaign}:`, {
                  //   product_id: bogoGift.product_id,
                  //   quantity: giftQuantity,
                  // });
                  addProductToCart({
                    ...bogoGift,
                    is_gift: true,
                    discount: null,
                    coupon: [],
                    type: 'bogo',
                    price: '0',
                    quantity: giftQuantity,
                    campaign,
                    selection_rule: 'least_expensive',
                  });
                  newGiftsToAdd.push({
                    product_id: bogoGift.product_id,
                    quantity: giftQuantity,
                    campaign,
                  });
                  remainingGifts -= giftQuantity;
                }
              }
            });
          } else if (new Set(purchasedProductIds).size === 1) {
            const bogoGift = candidateGifts[0];
            const purchasedProduct = eligibleProducts.find((p) => p.product_id === bogoGift.product_id);
            if (purchasedProduct) {
              const giftQuantity = Math.min(get_quantity, remainingGifts, purchasedProduct.quantity);
              if (giftQuantity > 0 && !currentGifts.some((g) => g.product_id === bogoGift.product_id)) {
                // console.log(`000 Adding gift for ${campaign}:`, {
                //   product_id: bogoGift.product_id,
                //   quantity: giftQuantity,
                // });
                addProductToCart({
                  ...bogoGift,
                  is_gift: true,
                  discount: null,
                  coupon: [],
                  type: 'bogo',
                  price: '0',
                  quantity: giftQuantity,
                  campaign,
                  selection_rule: 'least_expensive',
                });
                newGiftsToAdd.push({
                  product_id: bogoGift.product_id,
                  quantity: giftQuantity,
                  campaign,
                });
                remainingGifts -= giftQuantity;
              }
            }
          } else {
            const bogoGift = candidateGifts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))[0];
            const purchasedProduct = eligibleProducts.find((p) => p.product_id === bogoGift.product_id);
            if (purchasedProduct) {
              const giftQuantity = get_quantity;
              const giftExists = newGiftsToAdd.some(
                (g) => g.product_id === bogoGift.product_id && g.campaign === campaign
              ) || currentGifts.some(
                (g) => g.product_id === bogoGift.product_id && g.campaign === campaign
              );
              if (giftQuantity > 0 && !giftExists) {
                // console.log(`000 Adding gift for ${campaign} (cheapest product):`, {
                //   product_id: bogoGift.product_id,
                //   quantity: giftQuantity,
                // });
                addProductToCart({
                  ...bogoGift,
                  is_gift: true,
                  discount: null,
                  coupon: [],
                  type: 'bogo',
                  price: '0',
                  quantity: giftQuantity,
                  campaign,
                  selection_rule: 'least_expensive',
                });
                newGiftsToAdd.push({
                  product_id: bogoGift.product_id,
                  quantity: giftQuantity,
                  campaign,
                });
                remainingGifts -= giftQuantity;
              }
            }
          }
        } else if (selection_rule === 'auto_add') {
          if (giftsAllowed === 0) {
            currentGifts.forEach((gift) => {
              // console.log(`000 Removing gift for campaign ${campaign} due to insufficient quantity:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
            });
            return;
          }
          currentGifts.forEach((gift) => {
            const isValidGift = free_products.some((fp) => fp.product_id === gift.product_id);
            if (!isValidGift || currentGifts.reduce((sum, g) => sum + (g.quantity || 0), 0) > giftsAllowed) {
              // console.log(`000 Removing gift for campaign ${campaign}:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
            } else {
              newGiftsToAdd.push({
                product_id: gift.product_id,
                quantity: gift.quantity,
                campaign,
              });
            }
          });
          let remainingGifts = giftsAllowed - newGiftsToAdd
            .filter((g) => g.campaign === campaign)
            .reduce((sum, g) => sum + (g.quantity || 0), 0);
          if (remainingGifts <= 0) return;
          const availableGifts = free_products.filter(
            (fp) => !currentGifts.some((g) => g.product_id === fp.product_id)
          );
          availableGifts.some((bogoGift) => {
            if (remainingGifts <= 0) return true;
            const giftQuantity = Math.min(get_quantity, remainingGifts);
            // console.log(`000 Adding gift for ${campaign}:`, { product_id: bogoGift.product_id, quantity: giftQuantity });
            addProductToCart({
              ...bogoGift,
              is_gift: true,
              price: '0',
              quantity: giftQuantity,
              campaign,
              selection_rule: 'auto_add',
            });
            newGiftsToAdd.push({
              product_id: bogoGift.product_id,
              quantity: giftQuantity,
              campaign,
            });
            remainingGifts -= giftQuantity;
            return remainingGifts <= 0;
          });
        } else if (selection_rule === 'same_product') {
          if (giftsAllowed === 0) {
            currentGifts.forEach((gift) => {
              removeGiftFromCart(gift.product_id, campaign);
            });
            return;
          }

          // ──────────────────────────────────────────────────────────────
          // Step 1: Validate + clean up existing gifts
          // ──────────────────────────────────────────────────────────────
          currentGifts.forEach((gift) => {
            const isValidGift = free_products.some((fp) => fp.product_id === gift.product_id);
            const matchingBought = eligibleProducts.find((p) => p.product_id === gift.product_id);
            const totalGiftQty = currentGifts.reduce((sum, g) => sum + (g.quantity || 0), 0);

            if (
              !isValidGift ||
              (matchingBought && matchingBought.quantity < gift.quantity) ||
              totalGiftQty > giftsAllowed
            ) {
              removeGiftFromCart(gift.product_id, campaign);
            } else {
              newGiftsToAdd.push({
                product_id: gift.product_id,
                quantity: gift.quantity,
                campaign,
              });
            }
          });

          // ──────────────────────────────────────────────────────────────
          // Step 2: Calculate remaining slots
          // ──────────────────────────────────────────────────────────────
          let remainingGifts = giftsAllowed - newGiftsToAdd
            .filter((g) => g.campaign === campaign)
            .reduce((sum, g) => sum + (g.quantity || 0), 0);

          if (remainingGifts <= 0) return;

          // ──────────────────────────────────────────────────────────────
          // Step 3: Add missing gifts
          //     → Prefer SAME product
          //     → If not available → take ANY from free_products
          // ──────────────────────────────────────────────────────────────
        eligibleProducts.forEach((product) => {
          if (remainingGifts <= 0) return;

          // Skip if this product already has a gift assigned
          const alreadyGifted = currentGifts.some((g) => g.product_id === product.product_id) ||
                              newGiftsToAdd.some((g) => g.product_id === product.product_id);
          if (alreadyGifted) return;

          let selectedFreeProduct = null;

          // Priority 1: Try to give the SAME product
          const sameProductFree = free_products.find((fp) => fp.product_id === product.product_id);
          if (sameProductFree) {
            selectedFreeProduct = sameProductFree;
          }
          // Priority 2: If same product not in free_products → pick any unused one
          else {
            selectedFreeProduct = free_products.find((fp) =>
              !currentGifts.some((g) => g.product_id === fp.product_id) &&
              !newGiftsToAdd.some((g) => g.product_id === fp.product_id)
            );

            // Fallback: if no unused, take first one (you can change this logic)
            if (!selectedFreeProduct && free_products.length > 0) {
              selectedFreeProduct = free_products[0];
            }
          }

          if (selectedFreeProduct) {
            const giftQuantity = Math.min(
              product.quantity,           // don't give more than bought
              remainingGifts,             // don't exceed remaining slots
              get_quantity || 1           // respect promotion rule
            );

            if (giftQuantity > 0) {
              addProductToCart({
                ...selectedFreeProduct,
                is_gift: true,
                price: '0',
                quantity: giftQuantity,
                campaign,
                selection_rule: 'same_product',
              });

              newGiftsToAdd.push({
                product_id: selectedFreeProduct.product_id,
                quantity: giftQuantity,
                campaign,
              });

              remainingGifts -= giftQuantity;
            }
          }
        });
        } else if (selection_rule === 'customer_select') {
          if (giftsAllowed === 0) {
            currentGifts.forEach((gift) => {
              // console.log(`000 Removing gift for campaign ${campaign} due to insufficient quantity:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
              setSelectedGifts((prev) => ({
                ...prev,
                [campaign]: (prev[campaign] || []).filter((g) => g.product_id !== gift.product_id),
              }));
            });
            return;
          }
          currentGifts.forEach((gift) => {
            if (lastAddedGiftRef.current && 
                gift.product_id === lastAddedGiftRef.current.product_id && 
                gift.campaign === lastAddedGiftRef.current.campaign) {
              // console.log(`Skipping validation for newly added gift:`, gift.product_id);
              newGiftsToAdd.push({
                product_id: gift.product_id,
                quantity: gift.quantity,
                campaign,
              });
              return;
            }

            const matchingProduct = eligibleProducts.find((p) => p.product_id === gift.product_id);
            const isValidGift = free_products.some((fp) => fp.product_id === gift.product_id);
            const currentGiftQuantity = currentGifts.reduce((sum, g) => sum + (g.quantity || 0), 0);
            // console.log('Validating gift:', {
            //   product_id: gift.product_id,
            //   isValidGift,
            //   matchingProduct: matchingProduct ? matchingProduct.quantity : null,
            //   currentGiftQuantity,
            //   giftsAllowed,
            //   timestamp: new Date().toISOString()
            // });

            if (!isValidGift || currentGiftQuantity > giftsAllowed || (matchingProduct && matchingProduct.quantity < gift.quantity)) {
              // console.log(`Removing gift for campaign ${campaign}:`, gift.product_id);
              removeGiftFromCart(gift.product_id, campaign);
              setSelectedGifts((prev) => ({
                ...prev,
                [campaign]: (prev[campaign] || []).filter((g) => g.product_id !== gift.product_id),
              }));
            } else {
              newGiftsToAdd.push({
                product_id: gift.product_id,
                quantity: gift.quantity,
                campaign,
              });
            }
          });

          let remainingGifts = giftsAllowed - newGiftsToAdd
            .filter((g) => g.campaign === campaign)
            .reduce((sum, g) => sum + (g.quantity || 0), 0);

          // console.log('Remaining gifts after validation:', { remainingGifts, timestamp: new Date().toISOString() });

          if (remainingGifts <= 0) return;

          const selected = selectedGifts[campaign] || [];
          selected.forEach((gift) => {
            if (remainingGifts <= 0) return;
            const bogoGift = free_products.find((fp) => fp.product_id === gift.product_id);
            if (bogoGift) {
              const giftExists = newGiftsToAdd.some(
                (g) => g.product_id === bogoGift.product_id && g.campaign === campaign
              ) || currentGifts.some(
                (g) => g.product_id === bogoGift.product_id && g.campaign === campaign
              );
              if (giftExists) {
                // console.log(`Skipping duplicate gift for ${campaign}:`, gift.product_id);
                return;
              }
              const purchasedProduct = eligibleProducts.find((p) => p.product_id === bogoGift.product_id);
              const giftQuantity = Math.min(gift.quantity || 0, remainingGifts, purchasedProduct?.quantity || Infinity);
              if (giftQuantity > 0) {
                // console.log(`Adding selected gift for ${campaign}:`, { product_id: bogoGift.product_id, quantity: giftQuantity });
                addProductToCart({
                  ...bogoGift,
                  is_gift: true,
                  discount: null,
                  coupon: [],
                  price: '0',
                  quantity: giftQuantity,
                  campaign,
                  selection_rule: 'customer_select',
                });
                newGiftsToAdd.push({
                  product_id: bogoGift.product_id,
                  quantity: giftQuantity,
                  campaign,
                });
                remainingGifts -= giftQuantity;
              }
            }
          });
        }
      });

      // console.log('000 New gifts to add:', JSON.stringify(newGiftsToAdd, null, 2));

      if (JSON.stringify(newGiftsToAdd) !== JSON.stringify(addedGifts)) {
        setAddedGifts(newGiftsToAdd);
        prevCartRef.current = cartProducts.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity || 0,
          is_gift: p.is_gift || false,
        }));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [cartProducts, promotions, loading]);

  const handleGiftSelection = (campaign, product, quantity, selection_rule, giftsAllowed) => {
    try {
      // console.log('222 handleGiftSelection called:', {
      //   campaign,
      //   product,
      //   quantity,
      //   selection_rule,
      //   giftsAllowed,
      //   selectedGifts,
      //   timestamp: new Date().toISOString()
      // });

      if (!campaign) {
        // console.error('222 Campaign is undefined');
        return;
      }
      const parsedQuantity = Math.max(0, parseInt(quantity) || 0);
      if (parsedQuantity === 0 || !product.product_id) {
        // console.warn(`222 Invalid gift selection: product_id=${product.product_id}, quantity=${parsedQuantity}`);
        return;
      }

      if (selection_rule === 'least_expensive') {
        // console.log('222 Calling removeGiftFromCart for least_expensive:', { campaign, timestamp: new Date().toISOString() });
        try {
          removeGiftFromCart(null, campaign);
          // console.log('222 removeGiftFromCart succeeded for least_expensive:', { campaign });
        } catch (error) {
          // console.error('222 removeGiftFromCart failed for least_expensive:', error, { campaign });
        }
      }

      // console.log(`222 Handling gift selection for ${campaign}: product_id=${product.product_id}, quantity=${parsedQuantity}`);

      setSelectedGifts((prev) => {
        let updatedCampaignGifts = prev[campaign] || [];

        if (selection_rule === 'least_expensive') {
          updatedCampaignGifts = [{ product_id: product.product_id, quantity: parsedQuantity }].filter(
            (g) => g.quantity > 0
          );
        } else if (selection_rule === 'customer_select') {
          const currentSelectedCount = updatedCampaignGifts.reduce((sum, g) => sum + (g.quantity || 0), 0);
          const getQuantity = parseInt(giftsAllowed) || 1;

          // console.log('222 customer_select:', {
          //   currentSelectedCount,
          //   getQuantity,
          //   isAlreadySelected: updatedCampaignGifts.some((g) => g.product_id === product.product_id),
          //   newProductId: product.product_id,
          //   timestamp: new Date().toISOString()
          // });

          if (currentSelectedCount >= getQuantity && !updatedCampaignGifts.some((g) => g.product_id === product.product_id)) {
            // console.log('222 Exceeding get_quantity, clearing previous gifts and adding new one:', product.product_id);
            try {
              removeGiftFromCart(null, campaign);
              // console.log('222 removeGiftFromCart succeeded for customer_select:', { campaign });
            } catch (error) {
              // console.error('222 removeGiftFromCart failed for customer_select:', error, { campaign });
            }
            updatedCampaignGifts = [{ product_id: product.product_id, quantity: parsedQuantity }].filter(
              (g) => g.quantity > 0
            );
          } else {
            // console.log('222 Adding or updating gift:', product.product_id);
            updatedCampaignGifts = [
              ...updatedCampaignGifts.filter((g) => g.product_id !== product.product_id),
              { product_id: product.product_id, quantity: parsedQuantity },
            ].filter((g) => g.quantity > 0);
          }
        }

        const updatedGifts = {
          ...prev,
          [campaign]: updatedCampaignGifts,
        };
        // console.log('222 Updated selectedGifts:', updatedGifts, { timestamp: new Date().toISOString() });
        return updatedGifts;
      });

      // console.log('222 Calling addProductToCart:', {
      //   product_id: product.product_id,
      //   quantity: parsedQuantity,
      //   campaign,
      //   timestamp: new Date().toISOString()
      // });
      try {
        addProductToCart({ ...product, is_gift: true, "discount": null, "coupon": [], price: '0', quantity: parsedQuantity, campaign, type: 'bogo', selection_rule });
        // console.log('222 addProductToCart succeeded for:', product.product_id, { timestamp: new Date().toISOString() });
        lastAddedGiftRef.current = { product_id: product.product_id, campaign };
      } catch (error) {
        // console.error('222 addProductToCart failed:', error, { product_id: product.product_id, campaign, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      // console.error('222 handleGiftSelection failed:', error, {
      //   campaign,
      //   product_id: product.product_id,
      //   timestamp: new Date().toISOString()
      // });
    }
  };

  const handleQuantityChange = (campaign, product, newQuantity) => {
    const parsedQuantity = Math.max(0, parseInt(newQuantity) || 0);
    // console.log('handleQuantityChange called:', {
    //   campaign,
    //   product_id: product.product_id,
    //   newQuantity: parsedQuantity,
    //   timestamp: new Date().toISOString()
    // });

    if (parsedQuantity === 0) {
      // console.log(`Removing gift due to zero quantity for campaign ${campaign}:`, product.product_id);
      removeGiftFromCart(product.product_id, campaign);
      setSelectedGifts((prev) => ({
        ...prev,
        [campaign]: (prev[campaign] || []).filter((g) => g.product_id !== product.product_id),
      }));
      return;
    }

    const eligibleProducts = cartProducts.filter(
      (item) =>
        item.discount === null &&
        !item.is_gift &&
        promotions.find((p) => p.campaign === campaign)?.buy_products.some((b) => b.product_id === item.product_id)
    );
    const totalQuantity = eligibleProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const promo = promotions.find((p) => p.campaign === campaign);
    if (!promo) {
      // console.error(`No promotion found for campaign ${campaign}`);
      return;
    }
    const giftSets = Math.floor(totalQuantity / promo.buy_quantity);
    const giftsAllowed = giftSets * promo.get_quantity;
    const currentGifts = cartProducts.filter((p) => p.is_gift && p.campaign === campaign);
    const otherGiftsQuantity = currentGifts
      .filter((g) => g.product_id !== product.product_id)
      .reduce((sum, g) => sum + (g.quantity || 0), 0);
    
    if (parsedQuantity + otherGiftsQuantity > giftsAllowed) {
      // console.log(`Quantity ${parsedQuantity} exceeds allowed gifts (${giftsAllowed}) for campaign ${campaign}`);
      return;
    }

    // console.log(`Updating quantity for ${campaign}:`, { product_id: product.product_id, quantity: parsedQuantity });
    setSelectedGifts((prev) => {
      const updatedCampaignGifts = [
        ...prev[campaign].filter((g) => g.product_id !== product.product_id),
        { product_id: product.product_id, quantity: parsedQuantity },
      ].filter((g) => g.quantity > 0);
      return {
        ...prev,
        [campaign]: updatedCampaignGifts,
      };
    });

    try {
      removeGiftFromCart(product.product_id, campaign);
      addProductToCart({
        ...product,
        is_gift: true,
        price: '0',
        quantity: parsedQuantity,
        campaign,
        selection_rule: 'customer_select',
      });
      lastAddedGiftRef.current = { product_id: product.product_id, campaign };
      // console.log(`Quantity updated successfully for ${product.product_id}`);
    } catch (error) {
      // console.error(`Failed to update quantity for ${product.product_id}:`, error);
    }
  };

  if (loading) return null;

  const giftsByCampaign = addedGifts.reduce((acc, gift) => {
    if (!gift.campaign) return acc;
    acc[gift.campaign] = acc[gift.campaign] || [];
    const match = promotions
      .flatMap((p) => p.free_products)
      .find((fp) => fp.product_id === gift.product_id);
    if (match) {
      acc[gift.campaign].push({ ...match, quantity: gift.quantity });
    }
    return acc;
  }, {});
  // console.log('000 Gifts by campaign:', JSON.stringify(giftsByCampaign, null, 2));

  return (
    <div className="my-4 px-4">
      {promotions.map((promo) => {
        const { campaign, name, selection_rule, free_products, buy_quantity, get_quantity } = promo;
        if (!campaign) {
          // console.warn('Skipping rendering for undefined campaign:', promo);
          return null;
        }

        const gifts = giftsByCampaign[campaign] || [];
        const eligibleProducts = cartProducts.filter(
          (item) =>
            item.discount === null &&
            !item.is_gift &&
            promo.buy_products.some((b) => b.product_id === item.product_id)
        );
        const totalQuantity = eligibleProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const giftSets = Math.floor(totalQuantity / buy_quantity);
        const giftsAllowed = giftSets * get_quantity;
        // console.log(`000 Rendering campaign ${campaign}: giftsAllowed=${giftsAllowed}, gifts=`, JSON.stringify(gifts, null, 2));

        const purchasedProductIds = eligibleProducts.map((p) => p.product_id);
        let candidateGifts = [];
        if (giftsAllowed > 0 && selection_rule === 'least_expensive') {
          candidateGifts = free_products.filter((fp) =>
            purchasedProductIds.includes(fp.product_id)
          );
        } else if (giftsAllowed > 0 && selection_rule === 'customer_select') {
          candidateGifts = free_products;
        }
        const prices = candidateGifts.map((gift) => Number(gift.price) || 0);
        const allPricesEqual = candidateGifts.length > 1 && new Set(prices).size === 1;
        // console.log('11111', selection_rule, allPricesEqual, giftsAllowed, candidateGifts);

        if ((selection_rule === 'customer_select' || (selection_rule === 'least_expensive' && allPricesEqual)) && giftsAllowed > 0) {
          // console.log(`000 Rendering selection UI for ${campaign}`);
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
                  Select your free gifts for {name} (Choose {giftsAllowed} items)
                </span>
              </h4>
              <Swiper
                {...swiperOptions}
                className="swiper-container js-swiper-slider"
                data-settings=""
              >
                {candidateGifts.map((product) => {
                  const isSelected = cartProducts.some(
                    (cartItem) =>
                      cartItem.is_gift &&
                      cartItem.campaign === campaign &&
                      String(cartItem.product_id) === String(product.product_id) &&
                      cartItem.quantity > 0
                  );
                  const selectedGift = cartProducts.find(
                    (cartItem) =>
                      cartItem.is_gift &&
                      cartItem.campaign === campaign &&
                      String(cartItem.product_id) === String(product.product_id)
                  );
                  const currentQuantity = selectedGift?.quantity || 1;

                  // console.log('Rendering gift:', {
                  //   product_id: product.product_id,
                  //   campaign,
                  //   isSelected,
                  //   currentQuantity,
                  //   selectedGifts: JSON.stringify(selectedGifts[campaign], null, 2),
                  //   cartProducts: JSON.stringify(cartProducts, null, 2),
                  //   timestamp: new Date().toISOString()
                  // });

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
                            <span className="text-gray-700 font-medium">Already Selected (Quantity):</span>
                            <input
                              id={`quantity-${product.product_id}`}
                              type="number"
                              min="1"
                              max={giftsAllowed}
                              value={currentQuantity}
                              onChange={(e) => handleQuantityChange(campaign, product, e.target.value)}
                              className="w-16 p-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label={`Quantity for ${he.decode(product.product_name)}`}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              // console.log('Button clicked for:', {
                              //   product,
                              //   campaign,
                              //   selection_rule,
                              //   giftsAllowed,
                              //   selectedGifts,
                              //   timestamp: new Date().toISOString()
                              // });
                              handleGiftSelection(
                                campaign,
                                product,
                                selection_rule === 'customer_select' ? 1 : parseInt(giftsAllowed),
                                selection_rule,
                                giftsAllowed
                              );
                            }}
                            className={`pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside ${
                              isSelected ? 'bg-gray-400' : 'bg-blue-500'
                            }`}
                            aria-label={`${isSelected ? 'Already selected' : 'Select'} ${he.decode(product.product_name)} as free gift`}
                            disabled={isSelected}
                          >
                            {isSelected ? 'Already Selected' : 'Select Gift'}
                          </button>
                        )}
                      </div>
                      <div className="pc__info position-relative">
                        <h3 className="pc__title">{he.decode(product.product_name)}</h3>
                        <p className="pc__category">Free!</p>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          );
        } else if (gifts.length > 0) {
          // console.log(`000 Rendering gift display for ${campaign}`);
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
                  Your {name} offer has been applied to the cart!
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