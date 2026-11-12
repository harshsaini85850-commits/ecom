"use client";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand and description */}
        <div className="footer-main">
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              Ecom<span>Store</span>
            </a>

            <p>
              Discover products you'll love. Shop smarter, find your favourites,
              and enjoy a better shopping experience with EcomStore.
            </p>

            <div className="footer-socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
              >
                X
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div className="footer-column">
            <h3>Shop</h3>
            <a href="/products">All Products</a>
            <a href="/categories">Categories</a>
            <a href="/products?sort=newest">New Arrivals</a>
            <a href="/products?sort=popular">Popular Products</a>
          </div>

          {/* Company links */}
          <div className="footer-column">
            <h3>Company</h3>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/blog">Our Blog</a>
            <a href="/careers">Careers</a>
          </div>

          {/* Customer support */}
          <div className="footer-column">
            <h3>Customer Support</h3>
            <a href="/help">Help Center</a>
            <a href="/shipping">Shipping Information</a>
            <a href="/returns">Returns & Refunds</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div>
            <h3>Stay in the loop</h3>
            <p>Get updates about new products and special offers.</p>
          </div>

          <form
            className="newsletter-form"
            onSubmit={(event) => {
              event.preventDefault();
              alert("Newsletter functionality will be connected later.");
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
              required
            />

            <button type="submit">Subscribe</button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p>© {currentYear} EcomStore. All rights reserved.</p>

          <div className="footer-bottom-links">
            <a href="/terms">Terms & Conditions</a>
            <a href="/privacy">Privacy</a>
          </div>

          <p className="footer-made">Made for better shopping.</p>
        </div>
      </div>
    </footer>
  );
}
