
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Your everyday shopping destination
          </div>

          <h1>
            Find What You Love.
            <span> Shop What You Need.</span>
          </h1>

          <p className="hero-description">
            Explore a world of amazing products, discover your
            favourites, and enjoy a shopping experience designed
            around you.
          </p>

          <div className="hero-buttons">
            <a href="/products" className="hero-primary-btn">
              Explore Products
              <span>→</span>
            </a>

            <a href="/categories" className="hero-secondary-btn">
              Browse Categories
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <strong>Quality</strong>
              <span>Products</span>
            </div>

            <div className="hero-trust-divider"></div>

            <div className="hero-trust-item">
              <strong>Easy</strong>
              <span>Shopping</span>
            </div>

            <div className="hero-trust-divider"></div>

            <div className="hero-trust-item">
              <strong>Secure</strong>
              <span>Checkout</span>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hero-visual">
          <div className="hero-visual-glow"></div>

          <div className="hero-circle hero-circle-one"></div>
          <div className="hero-circle hero-circle-two"></div>

          {/* Main shopping card */}
          <div className="hero-product-card">
            <div className="hero-product-top">
              <span className="hero-product-tag">TRENDING NOW</span>
              <span className="hero-product-heart">♡</span>
            </div>

            <div className="hero-product-art">
              <div className="hero-product-shadow"></div>

              <div className="hero-shopping-bag">
                <div className="hero-bag-handle"></div>
                <div className="hero-bag-logo">E</div>
              </div>

              <div className="hero-product-sparkle sparkle-one">✦</div>
              <div className="hero-product-sparkle sparkle-two">✧</div>
              <div className="hero-product-sparkle sparkle-three">✦</div>
            </div>

            <div className="hero-product-info">
              <div>
                <span className="hero-product-category">THE ECOM COLLECTION</span>
                <h3>Everyday Essentials</h3>
              </div>

              <span className="hero-product-arrow">↗</span>
            </div>
          </div>

          {/* Floating offer card */}
          <div className="hero-floating-card hero-offer-card">
            <div className="hero-floating-icon">%</div>
            <div>
              <strong>Special Offers</strong>
              <span>Discover great deals</span>
            </div>
          </div>

          {/* Floating delivery card */}
          <div className="hero-floating-card hero-delivery-card">
            <div className="hero-delivery-icon">✓</div>
            <div>
              <strong>Easy Shopping</strong>
              <span>Simple & convenient</span>
            </div>
          </div>
        </div>

      </div>

      <div className="hero-bottom-decoration"></div>
    </section>
  );
}
