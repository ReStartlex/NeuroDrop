"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Lightweight scroll-reveal: fades + lifts children into place once they enter
 * the viewport. Uses IntersectionObserver and a CSS class controlled by
 * data-reveal in globals.css. Honours prefers-reduced-motion automatically.
 */
type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export function Reveal({ children, delay = 0, className, id, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Skip animation entirely — render visible immediately without waiting
      // for the observer. Direct setState in effect is intentional here
      // (one-time setup based on a media query that never changes within a
      // page's lifetime).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time init from prefers-reduced-motion
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.setTimeout(() => setVisible(true), delay);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  const Tag = as as unknown as React.ElementType;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      id={id}
      data-reveal={visible ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </Tag>
  );
}
