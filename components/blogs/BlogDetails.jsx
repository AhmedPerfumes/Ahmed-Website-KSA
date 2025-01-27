import React from "react";
import ReviewForm from "./ReviewForm";
import Reviews from "./Reviews";
import Image from "next/image";

export default function BlogDetails({ blog }) {
  return (
    <section className="blog-page blog-single container">
      {Object.keys(blog).length > 0 ? <><div className="mw-930">
        <h2 className="page-title">{blog.title}</h2>
        <div className="blog-single__item-meta">
          {/* <span className="blog-single__item-meta__author">By Admin</span> */}
          <span className="blog-single__item-meta__date">{new Date(blog.created_at).toLocaleDateString()}</span>
          <span className="blog-single__item-meta__category">{blog.category_name }</span>
        </div>
      </div>
      <div className="blog-single__item-content">
        <p>
          <Image
            loading="lazy"
            className="w-100 h-auto d-block"
            src={blog.image ? `${process.env.NEXT_PUBLIC_API_URL}storage/${blog.image}` : '/assets/images/blog/blog-1.jpg'}
            width="1410"
            height="550"
            alt="image"
          />
        </p>
        <div className="mw-930">
          <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
        </div>
      </div></> : <h2 className="h4 text-center text-uppercase mb-4 pb-xl-2 mb-xl-4">No Blog Found</h2>}
    </section>
  );
}
