
"use client";

import { useEffect, useRef, useState } from "react";
import "./Hero2.css";

const products = [
  {
    id: 1,
    name: "Premium Headphones",
    category: "Electronics",
    price: "$89.00",
    oldPrice: "$120.00",
    tag: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
  },
  {
    id: 2,
    name: "Classic Wrist Watch",
    category: "Accessories",
    price: "$115.00",
    oldPrice: "$150.00",
    tag: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
  },
  {
    id: 3,
    name: "Modern Sneakers",
    category: "Footwear",
    price: "$75.00",
    oldPrice: "$99.00",
    tag: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
  },
  {
    id: 4,
    name: "Minimal Backpack",
    category: "Lifestyle",
    price: "$64.00",
    oldPrice: "$85.00",
    tag: "TRENDING",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",
  },
];

export default function Hero2() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`hero2-section ${isVisible ? "hero2-visible" : ""}`}
      ref={sectionRef}
      id="products"
    >
      <div className="hero2-container">

        {/* SECTION HEADING */}
        <div className="hero2-heading">
          <div className="hero2-heading-content">
            <span className="hero2-eyebrow">
              DISCOVER OUR COLLECTION
            </span>

            <h2>
              Products you'll <span>love.</span>
            </h2>

            <p>
              Explore our handpicked collection of products.
              Find something special for your everyday life.
            </p>
          </div>

          <a href="/products" className="hero2-view-all">
            View All Products <span>↗</span>
          </a>
        </div>

        {/* PRODUCT CARDS */}
        <div className="hero2-products">

          {products.map((product, index) => (
            <article
              className="hero2-card"
              key={product.id}
              style={{ "--card-index": index }}
            >
              <div className="hero2-image-wrapper">

                <span className="hero2-product-tag">
                  {product.tag}
                </span>

                <button
                  className="hero2-wishlist"
                  type="button"
                  aria-label={`Add ${product.name} to wishlist`}
                  title="Wishlist"
                >
                  ♡
                </button>

                <div className="hero2-image-scroll">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>

                {/* IMAGE SCROLL PROGRESS */}
                <div className="hero2-image-progress">
                  <span></span>
                </div>

                <a
                  href="/products"
                  className="hero2-quick-view"
                  aria-label={`View ${product.name}`}
                >
                  Quick View <span>↗</span>
                </a>
              </div>

              {/* PRODUCT DETAILS */}
              <div className="hero2-product-info">
                <span className="hero2-category">
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                <div className="hero2-price">
                  <strong>{product.price}</strong>
                  <del>{product.oldPrice}</del>
                </div>
              </div>
            </article>
          ))}

        </div>

        {/* BOTTOM SCROLLBAR */}
        <div className="hero2-bottom">
          <div className="hero2-scroll-track">
            <span></span>
          </div>

          <span className="hero2-scroll-label">
            EXPLORE THE COLLECTION
          </span>
        </div>

      </div>
    </section>
  );
}
