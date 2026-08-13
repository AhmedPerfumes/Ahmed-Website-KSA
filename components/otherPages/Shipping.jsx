import React from 'react'

function Shipping() {
  return (
    <div className='container mt-5 pt-5'>
      <h4>Shipping & Delivery</h4>
      <p>Effective: June 4, 2026</p>
      <h5 className='mt-5'>1.	Orders are processed within [1-3] business days after payment confirmation.</h5>
      <h5 className='mt-3'>2.	Delivery timelines may vary depending on the destination, public holidays, and weather conditions.</h5>
      <h5 className='mt-3'>3.	Customers are responsible for providing accurate shipping information including full address, contact number, and recipient details.</h5>
      <h5 className='mt-3'>4.	We are not responsible for delays, failed deliveries, or additional charges caused by incorrect or incomplete delivery information.</h5>
      <h5 className='mt-3'>5.	Delivery charges, if applicable, will be displayed during checkout before payment confirmation.</h5>
      <h5 className='mt-3'>6.	Once the order has been shipped, customers may receive tracking details through SMS, email, or WhatsApp.</h5>
      <h5 className='mt-3 mb-5 pb-5'>7.	Customers may cancel their order only if the order status is marked as "Not Shipped" . Once the order status changes to "Shipped" then cancellation cannot be guaranteed.</h5>
    </div>
  )
}

export default Shipping