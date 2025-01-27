import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
import OrderPaymentCompleted from "@/components/shopCartandCheckout/OrderPaymentCompleted";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import React from "react";

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: "https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png",
  },
};

async function getOrderDetails(order_id) {
  console.log(`${process.env.NEXT_PUBLIC_API_URL}api/orderDetails`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_number: order_id
    })
  });
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/orderDetails`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_number: order_id
    }),
    // cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

const ShopOrderPaymentComplete = async ({ searchParams  }) => {
  const { q } = searchParams;
  console.log(q);
  try {
    const data = await getOrderDetails(q && atob(q));
    console.log(data);
      return data && (
        <>
          <Header14 />
          <main className="page-wrapper">
            <div className="mb-4 pb-4"></div>
            <section className="shop-checkout container">
              <h2 className="page-title">{data.payment_status != 'failed' ? 'ORDER RECEIVED' : 'ORDER FAILED'}</h2>
              <OrderPaymentCompleted orderDetails={ data }/>
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
    return <><Header14 />
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
