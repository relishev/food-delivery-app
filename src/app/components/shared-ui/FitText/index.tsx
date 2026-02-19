"use client";
import { useEffect, useRef, ReactNode, ElementType } from "react";
import { cn } from "@/app/shared/lib/utils";

interface FitTextProps {
  children: ReactNode;
  /** Minimum font size in px. Default: 8 */
  minSize?: number;
  className?: string;
  /** Semantic tag for the wrapper. Default: "span" (auto-becomes block) */
  as?: ElementType;
}

/**
 * Automatically scales font size to fit the parent container width.
 * Solves i18n text overflow when translations are longer than English.
 *
 * Usage:
 *   <FitText>{t("Index.delivery")}</FitText>
 *   <FitText as="h6" className="font-medium">{t("MainPage.heading")}</FitText>
 *
 * The outer element fills its parent's width (overflow: hidden).
 * The inner span gets font-size reduced if text overflows.
 * ResizeObserver re-runs on container resize (responsive-safe).
 */
export default function FitText({ children, minSize = 8, className, as: Tag = "span" }: FitTextProps) {
  const outerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const fit = () => {
      // Reset to inherited font size first to get correct measurement
      inner.style.fontSize = "";

      const containerW = outer.clientWidth;
      if (!containerW) return;

      const naturalSize = parseFloat(getComputedStyle(inner).fontSize);
      const textW = inner.scrollWidth;

      if (textW > containerW) {
        const scaled = (containerW / textW) * naturalSize;
        inner.style.fontSize = `${Math.max(scaled, minSize)}px`;
      }
    };

    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    fit();
    return () => ro.disconnect();
  }, [children, minSize]);

  return (
    <Tag
      // @ts-expect-error — ref type is narrowed at runtime
      ref={outerRef}
      className={cn("overflow-hidden", Tag === "span" && "block", className)}
    >
      <span ref={innerRef} className="whitespace-nowrap" suppressHydrationWarning>
        {children}
      </span>
    </Tag>
  );
}
