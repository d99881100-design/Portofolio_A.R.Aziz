import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import styles from "./not-found.module.css";

type FloatingImage = {
  src: string;
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  duration: string;
  delay: string;
  opacity: number;
  variant: "one" | "two" | "three" | "four";
};

const floatingImages: FloatingImage[] = [
  {
    src: "/images/floating/image1.jpg",
    size: "110px",
    top: "7%",
    left: "8%",
    duration: "10s",
    delay: "-2s",
    opacity: 0.76,
    variant: "one",
  },
  {
    src: "/images/floating/image2.png",
    size: "140px",
    top: "18%",
    right: "9%",
    duration: "12s",
    delay: "-4s",
    opacity: 0.68,
    variant: "two",
  },
  {
    src: "/images/floating/image3.jpg",
    size: "118px",
    bottom: "18%",
    left: "16%",
    duration: "8s",
    delay: "-1s",
    opacity: 0.7,
    variant: "three",
  },
  {
    src: "/images/floating/image4.jpg",
    size: "128px",
    bottom: "12%",
    right: "13%",
    duration: "11s",
    delay: "-6s",
    opacity: 0.62,
    variant: "four",
  },
];

function FloatingDecor() {
  return (
    <div className={styles.floating} aria-hidden="true">
      {floatingImages.map((item) => (
        <div
          key={item.src}
          className={`${styles.float} ${styles[item.variant]}`}
          style={{
            width: item.size,
            height: item.size,
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            opacity: item.opacity,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          <div className={styles.floatFrame}>
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 768px) 26vw, 12vw"
              className={styles.floatImage}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <main className={styles.shell} aria-labelledby="not-found-title">
      <FloatingDecor />

      <div className="not-found-panel" role="status" aria-live="polite">
        <div className="not-found-glow" aria-hidden="true" />
        <div className="not-found-grid" aria-hidden="true" />

        <div className="not-found-content">
          <div className="not-found-meta" aria-label="404 status metadata">
            <span className="not-found-badge">ERROR 404</span>
            <span className="not-found-divider" aria-hidden="true" />
            <span className="not-found-badge soft">PORTFOLIO / SYSTEM</span>
          </div>

          <span className="not-found-number" aria-label="Error 404">
            404
          </span>

          <div className="not-found-header">
            <h1 id="not-found-title" className="not-found-title">
              Page Not Found
            </h1>
          </div>

          <p className="not-found-text">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="not-found-actions">
            <Link href="/" className="not-found-link primary">
              <ArrowLeft size={16} aria-hidden="true" />
              back to home
            </Link>

            <Link href="/projects" className="not-found-link secondary">
              visit my projects
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
