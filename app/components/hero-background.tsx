// hero-background.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./hero-background.module.css";

const images = [
  "/images/hero-1.jpg",
  "/images/b2.jpg",
  "/images/b3.jpg",
  "/images/b4.jpg",
];

export default function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      {images.map((src, i) => (
        <div key={src} className={styles.slide} style={{ opacity: i === index ? 1 : 0 }}>
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={styles.image}
          />
        </div>
      ))}

      <div className={styles.brandWash} />
      <div className={styles.legibilityFade} />
    </div>
  );
}