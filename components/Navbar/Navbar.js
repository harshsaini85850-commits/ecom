"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./Navbar.css";
import PikachuCharacter from "./Pikachu/PikachuCharacter";

export default function Navbar() {
  const navbarRef = useRef(null);
  const characterRef = useRef(null);
  const wakeTimerRef = useRef(null);

  const positionRef = useRef({ x: 105, y: 2 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 105, y: 2 });

  const lastTimeRef = useRef(0);
  const lastPointerXRef = useRef(null);
  const facingRef = useRef(1);
  const pointerInsideRef = useRef(false);

  const [mode, setMode] = useState("sleeping");
  const [isActive, setIsActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Detect mobile screen size.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 650px)");

    const update = () => {
      setIsMobile(media.matches);

      if (!media.matches) {
        setMobileMenuOpen(false);
      }
    };

    update();
    media.addEventListener?.("change", update);

    return () => media.removeEventListener?.("change", update);
  }, []);

  // Get character dimensions.
  const size = () =>
    window.innerWidth <= 650
      ? { width: 62, height: 56 }
      : { width: 76, height: 62 };

  // Apply character position.
  const applyPosition = useCallback((x, y, facing) => {
    if (!characterRef.current) return;

    characterRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${facing})`;
  }, []);

  // Keep Pikachu inside navbar boundaries.
  const clampTarget = useCallback((x, y) => {
    const rect = navbarRef.current?.getBoundingClientRect();

    if (!rect) return { x, y };

    const { width, height } = size();

    return {
      x: Math.max(0, Math.min(x, rect.width - width)),
      y: Math.max(0, Math.min(y, rect.height - height)),
    };
  }, []);

  // Fetch cart count and listen for cart changes.
  useEffect(() => {
    let cancelled = false;

    const loadCartCount = async () => {
      try {
        const response = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) setCartCount(0);
          return;
        }

        const data = await response.json();
        const items = data.cart?.items || data.items || [];

        const totalItems = items.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        if (!cancelled) {
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Cart count error:", error);
      }
    };

    const handleCartUpdate = () => {
      loadCartCount();
    };

    loadCartCount();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  // Pikachu movement physics.
  useEffect(() => {
    if (mode !== "running" || !isActive) return;

    let frame;

    const animate = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.04);

      lastTimeRef.current = time;

      const p = positionRef.current;
      const v = velocityRef.current;
      const t = targetRef.current;

      const stiffness = 17;
      const damping = 7;

      v.x += ((t.x - p.x) * stiffness - v.x * damping) * dt;
      v.y += ((t.y - p.y) * stiffness - v.y * damping) * dt;

      const speed = Math.hypot(v.x, v.y);
      const maxSpeed = 360;

      if (speed > maxSpeed) {
        v.x = (v.x / speed) * maxSpeed;
        v.y = (v.y / speed) * maxSpeed;
      }

      p.x += v.x * dt;
      p.y += v.y * dt;

      // Stop small residual movements.
      if (
        Math.abs(t.x - p.x) < 0.5 &&
        Math.abs(t.y - p.y) < 0.5 &&
        Math.hypot(v.x, v.y) < 5
      ) {
        p.x = t.x;
        p.y = t.y;
        v.x = 0;
        v.y = 0;
      }

      const actualSpeed = Math.hypot(v.x, v.y);

      if (Math.abs(v.x) > 2) {
        facingRef.current = v.x > 0 ? 1 : -1;
      }

      applyPosition(p.x, p.y, facingRef.current);

      if (characterRef.current) {
        const duration = Math.max(
          0.16,
          Math.min(0.65, 0.65 - actualSpeed / 700),
        );

        characterRef.current.style.setProperty(
          "--stride-duration",
          `${duration}s`,
        );

        characterRef.current.classList.toggle("pika-moving", actualSpeed > 12);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      lastTimeRef.current = 0;
    };
  }, [mode, isActive, applyPosition]);

  // Pikachu follows the cursor.
  const handlePointerMove = (event) => {
    if (event.pointerType === "touch" || mode !== "running") return;

    const rect = navbarRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (lastPointerXRef.current !== null) {
      const delta = x - lastPointerXRef.current;

      if (Math.abs(delta) > 1) {
        facingRef.current = delta > 0 ? 1 : -1;
      }
    }

    lastPointerXRef.current = x;

    const { width, height } = size();
    const behind = facingRef.current * 42;

    targetRef.current = clampTarget(x - width / 2 - behind, y - height / 2);
  };

  // Cursor enters navbar.
  const handlePointerEnter = (event) => {
    pointerInsideRef.current = true;

    if (mode === "running") {
      setIsActive(true);
      handlePointerMove(event);
    }
  };

  // Cursor leaves navbar.
  // Pikachu smoothly returns to its starting position.
  const handlePointerLeave = () => {
    pointerInsideRef.current = false;
    lastPointerXRef.current = null;

    if (mode !== "running") return;

    setIsActive(true);
    targetRef.current = clampTarget(105, 2);
  };

  // Wake up or sleep Pikachu.
  const toggleSleep = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isMobile) {
      setMobileMenuOpen((open) => !open);
      return;
    }

    window.clearTimeout(wakeTimerRef.current);

    if (mode === "sleeping") {
      velocityRef.current = { x: 0, y: 0 };
      setMode("waking");

      wakeTimerRef.current = window.setTimeout(() => {
        setMode("running");
        setIsActive(true);

        if (!pointerInsideRef.current) {
          targetRef.current = clampTarget(105, 2);
        }
      }, 1000);
    } else if (mode === "running") {
      velocityRef.current = { x: 0, y: 0 };
      targetRef.current = { ...positionRef.current };

      setMode("sleeping");
      setIsActive(true);
    }
  };

  // Keep Pikachu inside navbar after resizing.
  useEffect(() => {
    const resize = () => {
      const p = clampTarget(positionRef.current.x, positionRef.current.y);

      positionRef.current = p;
      targetRef.current = p;

      applyPosition(p.x, p.y, facingRef.current);
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [clampTarget, applyPosition]);

  // Clean up wake timer.
  useEffect(() => {
    return () => window.clearTimeout(wakeTimerRef.current);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="navbar"
      ref={navbarRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="navbar-background" />

      {/* Pikachu character */}
      <button
        ref={characterRef}
        type="button"
        className={`pikachu-container ${
          isActive || mode !== "running" ? "pikachu-active" : ""
        }`}
        onClick={toggleSleep}
        aria-label={
          isMobile
            ? mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
            : mode === "sleeping"
              ? "Wake up Pikachu"
              : "Put Pikachu to sleep"
        }
        aria-expanded={isMobile ? mobileMenuOpen : undefined}
        aria-controls="main-navigation"
        title={
          isMobile
            ? "Tap Pikachu to open the menu"
            : mode === "sleeping"
              ? "Click to wake Pikachu"
              : "Click to sleep"
        }
      >
        <span className={`pikachu-scene pika-${mode}`}>
          <PikachuCharacter />
        </span>

        {mode === "sleeping" && (
          <span className="pikachu-sleep-z" aria-hidden="true">
            <span>Z</span>
            <span>Z</span>
            <span>z</span>
          </span>
        )}
      </button>

      {/* Logo */}
      <Link href="/" className="navbar-logo">
        Ecom<span>Store</span>
      </Link>

      {/* Navigation links */}
      <nav
        className={`navbar-links ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
        id="main-navigation"
        aria-label="Main navigation"
      >
        <Link href="/" onClick={closeMobileMenu}>
          Home
        </Link>

        <Link href="/products" onClick={closeMobileMenu}>
          Products
        </Link>

        <Link href="/categories" onClick={closeMobileMenu}>
          Categories
        </Link>

        <Link href="/about" onClick={closeMobileMenu}>
          About
        </Link>

        <Link href="/contact" className="navbar-cta" onClick={closeMobileMenu}>
          Shop Now
        </Link>

        <Link
          href="/signup"
          className="navbar-cta navbar-signup"
          onClick={closeMobileMenu}
        >
          Sign Up
        </Link>
      </nav>

      {/* Shopping cart */}
      <Link
        href="/cart"
        className="navbar-cart"
        aria-label={`Shopping cart with ${cartCount} items`}
      >
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {cartCount > 0 && (
          <span className="cart-count">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
    </header>
  );
}
