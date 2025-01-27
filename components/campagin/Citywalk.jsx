import React from 'react'
import Hero from '../homes/home-2/Hero'
import Image from 'next/image'
import Link from 'next/link'
import ContactForm from '../otherPages/Contact/ContactForm'

function CityWalk() {
  return (
    <div>
       <div className="container-fluid p-0 pt-2">
        <Image
          loading="lazy"
          className="w-100 h-auto d-none d-lg-block"
          src="/assets/images/home/demo5/city-walk.jpg"
          alt="image"
          width={1500}
          height={550}
        />
      </div>
      <div className="container-fluid p-0 pt-2">
        <Image
          loading="lazy"
          className="w-100 h-auto d-lg-none"
          src="/assets/images/home/demo5/mobile-city.jpg"
          alt="image"
          width={1500}
          height={550}
        />
      </div>
        <ContactForm/>
        
    </div>
  )
}

export default CityWalk