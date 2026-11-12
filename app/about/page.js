
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./About.css";
import SnakeGame from "@/components/SnakeGame";

const values = [
  { number: "01", title: "Curated quality", description: "We focus on products that combine thoughtful design, everyday usefulness and lasting value.", symbol: "✳" },
  { number: "02", title: "Made for discovery", description: "Shopping should feel exciting. Explore collections and find something that feels like you.", symbol: "◈" },
  { number: "03", title: "Customer first", description: "A great shopping experience goes beyond the product. Every detail matters.", symbol: "↗" },
];

const stats = [
  { value: 100, suffix: "%", label: "Focused on quality" },
  { value: 24, suffix: "/7", label: "Always online" },
  { value: 3, suffix: "+", label: "Ways to discover" },
];

function Reveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add("is-visible");
        observer.unobserve(element);
      }
    }, { threshold: 0.12 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`about-reveal ${className}`}>{children}</div>;
}

function StatCounter({ value, suffix, label }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(value);
      return;
    }

    let frame;
    let startTime = null;

    const animate = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1400, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        frame = requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div className="about-stat" ref={ref}>
      <div className="about-stat-number">{count}<span>{suffix}</span></div>
      <p>{label}</p>
    </div>
  );
}

function InteractiveCard({ children, className = "" }) {
  const cardRef = useRef(null);

  const handleMove = (event) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(pointer: coarse)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty("--rotate-x", `${(0.5 - y / rect.height) * 10}deg`);
    card.style.setProperty("--rotate-y", `${(x / rect.width - 0.5) * 10}deg`);
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <div
      ref={cardRef}
      className={`about-tilt-card ${className}`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  );
}

function InteractiveLab() {
  const [activeObject, setActiveObject] = useState("");

  const handlePointerMove = (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    event.currentTarget.style.setProperty("--lab-x", String((x - 0.5) * 2));
    event.currentTarget.style.setProperty("--lab-y", String((y - 0.5) * 2));
  };

  const resetPointer = (event) => {
    event.currentTarget.style.setProperty("--lab-x", "0");
    event.currentTarget.style.setProperty("--lab-y", "0");
  };

  const objects = [
    { id: "cube", name: "THE CUBE", description: "A new perspective." },
    { id: "sphere", name: "THE ORBIT", description: "Always in motion." },
    { id: "crystal", name: "THE CRYSTAL", description: "Form meets function." },
  ];

  return (
    <section className="about-lab" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className="about-section-label">
        <span>02 — INTERACTIVE DIMENSION</span>
        <span>MOVE / CLICK / EXPLORE</span>
      </div>

      <Reveal className="about-lab-heading">
        <span>AN EXPERIMENT IN MOTION</span>
        <h2>Explore another<br /><span>dimension.</span></h2>
        <p>Don't just look around. Interact with the details. Move your pointer, select an object and watch it respond.</p>
      </Reveal>

      <div className="about-lab-stage">
        <div className="about-lab-grid" />
        <div className="about-lab-light" />

        {objects.map((object, index) => (
          <button
            type="button"
            key={object.id}
            className={`about-lab-card lab-card-${object.id} ${activeObject === object.id ? "is-active" : ""}`}
            onClick={() => setActiveObject(current => current === object.id ? "" : object.id)}
            aria-pressed={activeObject === object.id}
            aria-label={`Interact with ${object.name}`}
          >
            <div className={`lab-object lab-object-${object.id}`}>
              {object.id === "cube" && (
                <div className="lab-cube">
                  <span className="cube-face cube-front" />
                  <span className="cube-face cube-back" />
                  <span className="cube-face cube-right" />
                  <span className="cube-face cube-left" />
                  <span className="cube-face cube-top" />
                  <span className="cube-face cube-bottom" />
                </div>
              )}

              {object.id === "sphere" && (
                <div className="lab-sphere">
                  <div className="lab-sphere-inner" />
                  <div className="lab-sphere-ring" />
                </div>
              )}

              {object.id === "crystal" && (
                <div className="lab-crystal">
                  <div className="crystal-side crystal-one" />
                  <div className="crystal-side crystal-two" />
                  <div className="crystal-side crystal-three" />
                </div>
              )}
            </div>

            <div className="lab-object-caption">
              <span>0{index + 1} / INTERACTIVE OBJECT</span>
              <strong>{object.name}</strong>
              <small>{object.description}</small>
            </div>
          </button>
        ))}

        <div className="lab-center-label">
          <span>3D</span>
          <small>INTERACTIVE SPACE</small>
        </div>
      </div>

      <div className="about-lab-footer">
        <span>EXPERIMENT NO. 001</span>
        <span>
          {activeObject
            ? `${activeObject.toUpperCase()} SELECTED — CLICK AGAIN TO RESET`
            : "SELECT AN OBJECT TO INTERACT"}
        </span>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const cursorRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    const cursor = cursorRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) return;

    let animationFrame;

    const handlePointerMove = (event) => {
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        hero.style.setProperty("--pointer-x", `${x * 100}%`);
        hero.style.setProperty("--pointer-y", `${y * 100}%`);
        hero.style.setProperty("--move-x", `${(x - 0.5) * 28}px`);
        hero.style.setProperty("--move-y", `${(y - 0.5) * 28}px`);
      }

      if (cursor && event.pointerType === "mouse") {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        cursor.classList.add("is-visible");
      }
    };

    const handlePointerOut = (event) => {
      if (!event.relatedTarget) cursor?.classList.remove("is-visible");
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="about-progress" aria-hidden="true">
        <div style={{ width: `${scrollProgress}%` }} />
      </div>
      <div className="about-custom-cursor" ref={cursorRef} aria-hidden="true" />

      <main className="about-page">
        <section className="about-hero" ref={heroRef}>
          <div className="about-hero-grid" />
          <div className="about-hero-glow" />

          <div className="about-hero-content">
            <Reveal>
              <span className="about-eyebrow"><span className="about-live-dot" />MORE THAN JUST SHOPPING</span>
            </Reveal>
            <Reveal>
              <h1>We believe<br />good things<br /><span className="about-outline-text">stand out.</span></h1>
            </Reveal>
            <Reveal>
              <div className="about-hero-bottom">
                <p>A different way to discover products. Thoughtfully selected, beautifully presented and designed around you.</p>
                <a href="#our-story" className="about-scroll-link">EXPLORE OUR STORY <span>↓</span></a>
              </div>
            </Reveal>
          </div>

          <div className="about-orb-wrap" aria-hidden="true">
            <div className="about-orb">
              <div className="about-orb-ring ring-one" />
              <div className="about-orb-ring ring-two" />
              <div className="about-orb-ring ring-three" />
              <div className="about-orb-core"><span>DISCOVER</span><strong>∞</strong><span>MORE</span></div>
              <div className="about-orb-dot orb-dot-one" />
              <div className="about-orb-dot orb-dot-two" />
              <div className="about-orb-dot orb-dot-three" />
            </div>
          </div>

          <div className="about-hero-index"><span>01 / 05</span><span>SCROLL TO EXPLORE</span></div>
        </section>

        <section className="about-story" id="our-story">
          <div className="about-section-label"><span>01 — OUR STORY</span><span>THE IDEA BEHIND THE STORE</span></div>
          <div className="about-story-layout">
            <Reveal className="about-story-heading"><h2>Shopping should<br />feel like <span>discovery.</span></h2></Reveal>
            <Reveal className="about-story-copy">
              <p>We started with a simple idea: finding great products should be an experience, not just another transaction.</p>
              <p>Our goal is to bring together style, usefulness and thoughtful choices in one place. A space where exploring feels natural and every detail has a purpose.</p>
              <Link href="/products" className="about-text-link">EXPLORE OUR PRODUCTS <span>↗</span></Link>
            </Reveal>
          </div>
        </section>

        <section className="about-visual-section">
          <div className="about-visual-background">
            <div className="about-visual-circle circle-a" />
            <div className="about-visual-circle circle-b" />
            <div className="about-visual-circle circle-c" />
            <div className="about-visual-lines" />
          </div>
          <Reveal className="about-visual-text">
            <span>NOT JUST ANOTHER STORE</span>
            <h2>Different by<br /><span>design.</span></h2>
            <p>Explore. Discover. Make it yours.</p>
          </Reveal>
          <div className="about-visual-caption"><span>CREATED FOR THE CURIOUS</span><span>EST. 2026</span></div>
        </section>

        <InteractiveLab />

        <section className="about-values">
          <div className="about-section-label"><span>03 — WHAT MATTERS</span><span>OUR PRINCIPLES</span></div>
          <Reveal className="about-values-heading"><h2>The things<br /><span>we stand for.</span></h2></Reveal>
          <div className="about-values-grid">
            {values.map(item => (
              <Reveal key={item.number}>
                <InteractiveCard className="about-value-card">
                  <div className="about-card-top"><span>{item.number}</span><span className="about-value-symbol">{item.symbol}</span></div>
                  <div className="about-value-content"><h3>{item.title}</h3><p>{item.description}</p></div>
                  <div className="about-card-line" />
                </InteractiveCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="about-stats-section">
          <div className="about-section-label"><span>04 — BY THE NUMBERS</span><span>OUR MINDSET</span></div>
          <div className="about-stats-grid">
            {stats.map(stat => <Reveal key={stat.label}><StatCounter {...stat} /></Reveal>)}
          </div>
          <p className="about-stats-note">These are illustrative design figures, not verified store metrics.</p>
        </section>

        <section className="about-final">
          <div className="about-final-glow" />
          <Reveal className="about-final-content">
            <span>05 — YOUR NEXT DISCOVERY</span>
            <h2>Ready to find<br /><span>your thing?</span></h2>
            <p>Take a look around. Your next favourite product might be closer than you think.</p>
            <Link href="/products" className="about-final-button">EXPLORE THE COLLECTION <span>↗</span></Link>
          </Reveal>
          <div className="about-final-bottom"><span>GOOD THINGS ARE OUT THERE.</span><span>© 2026 — ALL RIGHTS RESERVED</span></div>
        </section>
        <SnakeGame />
      </main>
    </>
  );
  
}
