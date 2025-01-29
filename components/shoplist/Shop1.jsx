"use client";
import { products51 } from "@/data/products/fashion";
import { Swiper, SwiperSlide } from "swiper/react";
import Star from "../common/Star";
import ColorSelection from "../common/ColorSelection";
import { Navigation } from "swiper/modules";
import Pagination1 from "../common/Pagination1";
import { useEffect, useState, useRef } from "react";
import BreadCumb from "./BreadCumb";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
const itemPerRow = [2, 3, 4];
import Image from "next/image";
import { openModalShopFilter } from "@/utlis/aside";
import {
  menuCategories,
  sortingOptions,
} from "@/data/products/productCategories";
import he from 'he';
import Slider from "rc-slider";

import {useLocale} from 'next-intl';
import { useMenu } from '@/context/MenuContext';

export default function Shop1({ search }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const [selectedColView, setSelectedColView] = useState(3);

  const { addProductToCart, isAddedToCartProducts } = useContextElement();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Pagination state
  const limit = 6; // Number of items per page
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const offset = 2500;
  const [sortOption, setSortOption] = useState('popularity');
  const [price, setPrice] = useState([500, 0]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isDDActive, setIsDDActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetchData = async (page) => {
      setLoading(true);
      // console.log(`${process.env.NEXT_PUBLIC_API_URL}api/allProducts?page=${page}&limit=${limit}&search=${search?.split('-').join(' ')}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/allProducts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: page,
          limit: limit,
          search: search ? search.split('-').join(' ') : '',
        }),
      });
      const newData = await response.json();
      const { data, total, to } = newData;
      if (data.length === 0) {
        setHasMore(false);
      }
      // console.log('Data', data);
      // setProducts((prevData) => [...prevData, ...data]); // Append new data
      setProducts((prevData) => {
        // console.log('Products', ...prevData);
        return sortItems([...prevData, ...data], sortOption)
      });

      const filtered = data.filter(product => {
        // console.log(product.price,'>=',price[0],'&&',product.price,'<=',price[1]);
        return product.price <= price[0] && product.price >= price[1]
      });
      // console.log('filteredData', filtered);

      setFilteredProducts((prevDataa) => {
        // console.log('FilteredProducts', ...prevData);
        return sortItems([...prevDataa, ...filtered], sortOption)
      });
      setTotalPages(total);
      setCurrentPage(to);
      setLoading(false);
    };

    fetchData(page);
  }, [page, limit]); // Fetch data on page change

useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop + offset < document.documentElement.offsetHeight || loading || !hasMore) return;
    setPage((prevPage) => prevPage + 1); // Load next page
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [loading]); // Clean up on component unmount

useEffect(() => {
  const handleClickOutside = (event) => {
    // Check if the click is outside the referenced element
    if (ref.current && !ref.current.contains(event.target)) {
      setIsDDActive(false);
    }
  };

  // Add event listener to document
  document.addEventListener("click", handleClickOutside);

  // Clean up the event listener on component unmount
  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);

  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, ' ').trim();

    return cleanedStr;
  }

  const isSubcategory = (category, subcategory) => {
    let subcat = "";
    if (subcategory != null) {
      return subcat =
        removeSpecialCharactersAndAmp(subcategory.subcategory_name)
          .split(" ")
          .join("-")
          .toLowerCase();
    } else {
      if (removeSpecialCharactersAndAmp(category) == "gift-sets") {
        console.log("gift-sets");
        return subcat = "gift-sets";
      } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
        console.log("hair-mist");
        return subcat = "hair-mist";
      } else {
        console.log("extrait-de-parfum");
        return subcat = "extrait-de-parfum";
      }
    }
  }

   // Sorting function
   const sortItems = (items, option) => {
    // console.log(items, option);
    switch (option) {
      case 'popularity':
        return [...items].sort((a, b) => b.sales - a.sales);
      case 'date':
        return [...items].sort((a, b) => b.product_id - a.product_id);
      case 'price':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      default:
        return items;
    }
  };

  const handleSortChange = (event) => {
    // setLoading(true);
    setSortOption(event.target.value);
    setProducts(sortItems(products, event.target.value));
    setFilteredProducts(sortItems(filteredProducts, event.target.value));
    // setLoading(false);
  };

  const handleFilterChange = (value) => {
    // console.log(value);
    setPrice(value);

    const filtered = products.filter(product => 
      product.price >= value[0] && product.price <= value[1]
    );
    setFilteredProducts(filtered);
  };

  const discPrice = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(2)}{ currency.symbol }</span></>;
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(2)}{ currency.symbol }</span></>;
    } else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  return (
    <>
      <section className="full-width_padding">
        <div
          className="full-width_border border-2"
          style={{ borderColor: "#eeeeee" }}
        >
          <div className="shop-banner position-relative">
            <div
              className="background-img"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <Image
                loading="lazy"
                src="/assets/images/shop/multiple-products-banner.jpg"
                width="1759"
                height="420"
                alt="Pattern"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>

            {/* <div className="shop-banner__content container position-absolute start-50 top-50 translate-middle">
              <h2 className="stroke-text h1 smooth-16 text-uppercase fw-bold mb-3 mb-xl-4 mb-xl-5">
                Shop
              </h2>
              <ul className="d-flex flex-wrap list-unstyled text-uppercase h6">
                {menuCategories.map((elm, i) => (
                  <li key={i} className="me-3 me-xl-4 pe-1">
                    <a
                      onClick={() => setCurrentCategory(elm)}
                      className={`menu-link menu-link_us-s ${
                        currentCategory == elm ? "menu-link_active" : ""
                      }`}
                    >
                      {elm}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
            {/* <!-- /.shop-banner__content --> */}
          </div>
          {/* <!-- /.shop-banner position-relative --> */}
        </div>
        {/* <!-- /.full-width_border --> */}
      </section>
      <div className="mb-4 pb-lg-3"></div>
      <section className="shop-main container">
        <div className="d-flex justify-content-between mb-4 pb-md-2">
          <div className="breadcrumb mb-0 d-none d-md-block flex-grow-1">
            <BreadCumb category={null} subcategory={null}/>
          </div>

          <div className="shop-acs d-flex align-items-center justify-content-between justify-content-md-end flex-grow-1">
            <select
              className="shop-acs__select form-select w-auto border-0 py-0 order-1 order-md-0"
              aria-label="Sort Items"
              name="total-number"
              value={sortOption}
              onChange={handleSortChange}
            >
              {sortingOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* <div className="shop-asc__seprator mx-3 bg-light d-none d-md-block order-md-0"></div>

            <div className="col-size align-items-center order-1 d-none d-lg-flex">
              <span className="text-uppercase fw-medium me-2">View</span>
              {itemPerRow.map((elm, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColView(elm)}
                  className={`btn-link fw-medium me-2 js-cols-size ${
                    selectedColView == elm ? "btn-link_active" : ""
                  } `}
                >
                  {elm}
                </button>
              ))}
            </div> */}
            {/* <!-- /.col-size --> */}

            {/* <div className="shop-asc__seprator mx-3 bg-light d-none d-lg-block order-md-1"></div> */}

            
            {/* <div
            id="accordion-filter-price"
            className="accordion-collapse collapse show border-0"
            aria-labelledby="accordion-heading-price"
            data-bs-parent="#price-filters"
          >
            
          </div> */}
            {/* <!-- /.col-size d-flex align-items-center ms-auto ms-md-3 --> */}
          <div
            ref={ref}
            className={`position-relative hover-container d-none d-lg-block  px-1 ${
              isDDActive ? "js-content_visible" : ""
            }`}
          >
            <div
              onClick={() => setIsDDActive((pre) => !pre)}
              className="js-hover__open"
            >
              <span className="multi-select__actor fw-medium text-uppercase js-no-update">
                Price
              </span>
            </div>
            <div className="filters-container js-hidden-content mt-2">
                <Slider
                  range
                  formatLabel={() => ``}
                  max={500}
                  min={0}
                  defaultValue={price}
                  onChange={(value) => handleFilterChange(value)}
                  id="slider"
                />
                <div className="price-range__info d-flex align-items-center mt-2">
                  <div className="me-auto">
                    <span className="text-secondary">Min Price: </span>
                    <span className="price-range__max">{price[0]}{ currency.symbol }</span>
                  </div>
                  <div>
                    <span className="text-secondary">Max Price: </span>
                    <span className="price-range__min">{price[1]}{ currency.symbol }</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
          {/* <!-- /.shop-acs --> */}
        </div>
        {/* <!-- /.d-flex justify-content-between --> */}

        <div
          className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}
          id="products-grid"
        >
          {filteredProducts?.map((elm, i) => (
            <div key={i} className="product-card-wrapper">
              <div className="product-card mb-3 mb-md-4 mb-xxl-5">
                <div className="pc__img-wrapper">
                  <Swiper
                    className="swiper swiper-container swiper-initialized swiper-horizontal swiper-backface-hidden background-img js-swiper-slider"
                    slidesPerView={1}
                    modules={[Navigation]}
                    navigation={{
                      prevEl: ".prev" + i,
                      nextEl: ".next" + i,
                    }}
                  >
                    {/* {elm?.images && JSON.parse(elm.images).map((image, ind) => ( */}
                      <SwiperSlide key={i} className="swiper-slide">
                        <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                          {elm?.images &&
                          // JSON.parse(elm.images).map((image, ind) => (
                              <>
                                {JSON.parse(elm.images)[0] && <Image
                                  loading="lazy"
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                                  width="330"
                                  height="400"
                                  alt="img"
                                  className="pc__img"
                                />
                                }

                                {JSON.parse(elm.images)[1] && <Image
                                  loading="lazy"
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                                  width="330"
                                  height="400"
                                  alt="img"
                                  className="pc__img pc__img-second"
                                />
                                }
                              </>
                          // ))
                          }
                        </Link>
                        {elm?.label_name && (
                          <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            { elm?.label_name }
                          </div>
                        )}
                        {elm.product_qty <= 0 ? (
                          <div style={{ backgroundColor: '#dc3545' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            Out Of Stock
                          </div>
                        ) : (
                          elm.discount && (
                            <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                              Sale {elm.discount.value}%
                            </div>
                          )
                        )}
                      </SwiperSlide>
                    {/* ))} */}

                    <span
                      className={`cursor-pointer pc__img-prev ${"prev" + i} `}
                    >
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_prev_sm" />
                      </svg>
                    </span>
                    <span
                      className={`cursor-pointer pc__img-next ${"next" + i} `}
                    >
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_next_sm" />
                      </svg>
                    </span>
                  </Swiper>
                  {
                    isAddedToCartProducts(elm?.product_id) ? 
                    elm.product_qty > 0 && <button
                        className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                        title="Already Added"
                      >
                      Already Added
                    </button> : elm.product_qty > 0 && <button
                      className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                      onClick={() => addProductToCart({...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name})}
                      title="Add to Cart"
                    >
                      Add To Cart
                    </button>
                  }
                  {/* {elm.product_qty > 0 && <button
                    className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                    onClick={() => addProductToCart(elm)}
                    title={
                      isAddedToCartProducts(elm.product_id)
                        ? "Already Added"
                        : "Add to Cart"
                    }
                  >
                    {isAddedToCartProducts(elm.product_id)
                      ? "Already Added"
                      : "Add To Cart"}
                  </button>} */}
                </div>

                <div className="pc__info position-relative">
                  <p className="pc__category">{elm.category_name}</p>
                  <h6 className="pc__title">
                    <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>{elm?.product_name && he.decode(elm?.product_name)}</Link>
                  </h6>
                  <div className="product-card__price d-flex">
                    {/* {elm.price ? (
                      <>
                        {" "}
                        <span className="money price price-old">
                          ${elm.price}
                        </span>
                        <span className="money price price-sale">
                          ${elm.price}
                        </span>
                      </>
                    ) : ( */}
                      { discPrice(elm) }
                    {/* )} */}
                  </div>
                  {/* {elm.colors && (
                    <div className="d-flex align-items-center mt-1">
                      {" "}
                      <ColorSelection />{" "}
                    </div>
                  )}
                  {elm.reviews && (
                    <div className="product-card__review d-flex align-items-center">
                      <div className="reviews-group d-flex">
                        <Star stars={elm.rating} />
                      </div>
                      <span className="reviews-note text-lowercase text-secondary ms-1">
                        {elm.reviews}
                      </span>
                    </div>
                  )} */}

                  {/* <button
                    className={`pc__btn-wl position-absolute top-0 end-0 bg-transparent border-0 js-add-wishlist ${
                      isAddedtoWishlist(elm.product_id) ? "active" : ""
                    }`}
                    onClick={() => toggleWishlist(elm.product_id)}
                    title="Add To Wishlist"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <use href="#icon_heart" />
                    </svg>
                  </button> */}
                </div>
                {elm.discont && (
                  <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                    <div className="pc-labels__right ms-auto">
                      <span className="pc-label pc-label_sale d-block text-white">
                        -{elm.discont}%
                      </span>
                    </div>
                  </div>
                )}
                {elm.isNew && (
                  <div className="pc-labels position-absolute top-0 start-0 w-100 d-flex justify-content-between">
                    <div className="pc-labels__left">
                      <span className="pc-label pc-label_new d-block bg-white">
                        NEW
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* <!-- /.products-grid row --> */}
        {/* {loading && <p>Loading...</p>} */}
        {!loading && <p className="mb-5 text-center fw-medium">SHOWING {currentPage ? currentPage : filteredProducts.length} {currentPage ? 'of': 'of'} {totalPages} items</p>}
        {loading && <Pagination1 />}

        {/* <div className="text-center">
          <Link className="btn-link btn-link_lg text-uppercase fw-medium" href="#">
            Show More
          </Link>
        </div> */}
      </section>
    </>
  );
}
