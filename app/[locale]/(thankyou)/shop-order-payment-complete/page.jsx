import Footer14 from "@/components/footers/Footer14";
import OrderPaymentCompleted from "@/components/shopCartandCheckout/OrderPaymentCompleted";
import React from "react";
import { getTranslations } from "next-intl/server";
import { headers } from 'next/headers';

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};

function getRequestOrigin() {
  const headersList = headers();
  const host = headersList.get('host') || process.env.NEXT_PUBLIC_DEFAULT_ORIGIN; 
  const protocol = headersList.get('x-forwarded-proto') || 'https'; 

  return `${protocol}://${host}`;
}

async function getOrderDetails(order_id) {
  const origin = getRequestOrigin();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/orderDetails`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': origin,
    },
    body: JSON.stringify({
      order_number: order_id
    }),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const ShopOrderPaymentComplete = async ({ searchParams  }) => {
  const { q } = searchParams;
  
  try {
    const data = await getOrderDetails(q && atob(q));
    
      return data && (
        <>
          <main className="page-wrapper">
            <div className="mb-4 pb-4"></div>
            <section className="shop-checkout container">
              {/* Removed the static <h2> here because the OrderPaymentCompleted component handles it dynamically now */}
              <OrderPaymentCompleted orderDetails={ data } initialOrderCode={q && atob(q)} />
            </section>
          </main>
          <Footer14 />
        </>
    );
  } catch (error) {
    console.error(error);
    const t = await getTranslations("OrderComplete");
    return <>
        <main className="page-wrapper">
          <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">{t("noData")}</h2>
        </main>
        <Footer14 /></>;
  }
}

export default ShopOrderPaymentComplete;
