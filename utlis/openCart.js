export const openCart = () => {
  document
    .getElementById("cartDrawerOverlay")
    ?.classList.add("page-overlay_visible");
  document
    .getElementById("cartDrawer")
    ?.classList.add("aside_visible");

  if (typeof window !== "undefined" && window.AhmedTracker) {
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem("cartList")) || [];
    } catch (e) {}

    const total = items.reduce((acc, item) => {
      const price = parseFloat(item.sale_price || item.price || 0);
      const qty = Number(item.quantity || 1);
      return acc + price * qty;
    }, 0);

    window.AhmedTracker.track("view_cart", {
      total: parseFloat(total.toFixed(2)),
      items_count: items.length,
      items: items.map((item) => ({
        product_id: (item.product_id || item.id)?.toString(),
        product_name: item.title || item.name || item.product_name || "",
        price: parseFloat(item.sale_price || item.price || 0),
        quantity: Number(item.quantity || 1),
      })),
    });
  }
};