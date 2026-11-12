
"use client";

import { useEffect, useRef } from "react";
import "./Hero3.css";

const products = [
  {
    id: 1,
    name: "Classic Sneakers",
    category: "Everyday Collection",
    price: "$89",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=90",
    color: "#e9d8ce",
  },
  {
    id: 2,
    name: "Urban Backpack",
    category: "Travel Essentials",
    price: "$120",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=90",
    color: "#d9e2dc",
  },
  {
    id: 3,
    name: "Minimal Watch",
    category: "Premium Accessories",
    price: "$159",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=90",
    color: "#e5dfd2",
  },
  {
    id: 4,
    name: "Modern Headphones",
    category: "Audio Collection",
    price: "$199",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=90",
    color: "#d9dce5",
  },
  {
    id: 5,
    name: "Everyday Sneakers",
    category: "Street Collection",
    price: "$110",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=90",
    color: "#e8d9d0",
  },
];

export default function Hero3() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track) return;

    let animationFrame;

    const updateAnimation = () => {
      const sectionRect = section.getBoundingClientRect();
      const scrollDistance = section.offsetHeight - viewport.offsetHeight;

      const progress =
        scrollDistance > 0
          ? Math.min(
              1,
              Math.max(0, -sectionRect.top / scrollDistance)
            )
          : 0;

      const maxTranslate = Math.max(
        0,
        track.scrollWidth - viewport.clientWidth
      );

      track.style.transform = `translate3d(${
        -progress * maxTranslate
      }px, 0, 0)`;

      const viewportCenter = viewport.getBoundingClientRect().left +
        viewport.clientWidth / 2;

      cardsRef.current.forEach((card) => {
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;

        const distance = Math.abs(viewportCenter - cardCenter);
        const normalizedDistance = Math.min(
          distance / (viewport.clientWidth * 0.55),
          1
        );

        const scale = 1 - normalizedDistance * 0.23;
        const rotateY =
          (cardCenter - viewportCenter) /
          viewport.clientWidth *
          -24;

        card.style.transform = `
          perspective(1000px)
          rotateY(${rotateY}deg)
          scale(${scale})
        `;

        card.style.opacity = `${1 - normalizedDistance * 0.35}`;
        card.style.zIndex = `${Math.round(
          (1 - normalizedDistance) * 10
        )}`;
      });
    };

    const requestUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateAnimation);
    };

    updateAnimation();

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section className="hero3-section" ref={sectionRef}>
      <div className="hero3-sticky" ref={viewportRef}>
        <div className="hero3-heading">
          <span className="hero3-eyebrow">
            THE NEW COLLECTION
          </span>

          <h2>
            Designed to
            <span> stand out.</span>
          </h2>

          <p>
            Explore our collection from every angle.
            Scroll to discover something different.
          </p>
        </div>

        <div className="hero3-products-window">
          <div className="hero3-track" ref={trackRef}>
            {products.map((product, index) => (
              <article
                className="hero3-product"
                key={product.id}
                ref={(element) => {
                  cardsRef.current[index] = element;
                }}
              >
                <div
                  className="hero3-product-image"
                  style={{ backgroundColor: product.color }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />

                  <span className="hero3-product-number">
                    0{product.id}
                  </span>
                </div>

                <div className="hero3-product-info">
                  <div>
                    <span className="hero3-category">
                      {product.category}
                    </span>
                    <h3>{product.name}</h3>
                  </div>

                  <span className="hero3-price">
                    {product.price}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hero3-bottom">
          <span>SCROLL TO EXPLORE</span>
          <div className="hero3-scroll-line">
            <span />
          </div>
          <span>01 — 05</span>
        </div>
      </div>
    </section>
  );
}
