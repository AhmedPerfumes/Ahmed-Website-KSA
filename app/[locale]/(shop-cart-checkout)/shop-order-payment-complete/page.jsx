import Footer14 from "@/components/footers/Footer14";
import OrderPaymentCompleted from "@/components/shopCartandCheckout/OrderPaymentCompleted";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import React from "react";
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
          <section className="d-none d-lg-block" style={{ height: "100%" }}>
            <Footer14 />
          </section>
          <section className="d-sm-block d-md-none bg-dark pt-5  ">
          <div className="MobileFooter">
            <MobileFooter2/>
          </div>
          </section>
        </>
    );
  } catch (error) {
    console.error(error);
    return <>
        <main className="page-wrapper">
          <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Data Found</h2>
        </main>
        <section className="d-none d-lg-block" style={{ height: "100%" }}>
          <Footer14 />
        </section>
        <section className="d-sm-block d-md-none bg-dark pt-5  ">
          <div className="MobileFooter">
            <MobileFooter2/>
          </div>
        </section></>;
  }
}

export default ShopOrderPaymentComplete;
