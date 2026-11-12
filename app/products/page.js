"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import "./Products.css";

const products = [
  {
    id: 1,
    name: "Classic Red Sneakers",
    category: "Shoes",
    price: 89,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80",
  },
  {
    id: 2,
    name: "Black Running Shoes",
    category: "Shoes",
    price: 99,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700&q=80",
  },
  {
    id: 3,
    name: "Premium Watch",
    category: "Accessories",
    price: 149,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
  },
  {
    id: 4,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80",
  },
];

export default function ProductsPage() {
  const [cartCount, setCartCount] = useState(0);
  const [category, setCategory] = useState("All");

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <>
      <Navbar />

      <main className="products-page">
        <section className="products-heading">
          <p className="products-subtitle">OUR COLLECTION</p>
          <h1>Explore Our Products</h1>
          <p>Discover products selected for your everyday lifestyle.</p>
          <span className="cart-count">Cart: {cartCount}</span>
        </section>

        <section className="products-container">
          <div className="products-filters">
            {["All", "Shoes", "Accessories", "Electronics"].map((item) => (
              <button
                key={item}
                className={category === item ? "active-filter" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="product-info">
                  <p>{product.category}</p>
                  <h2>{product.name}</h2>

                  <div className="product-bottom">
                    <strong>${product.price}</strong>

                    <button
                      onClick={() => setCartCount((count) => count + 1)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}