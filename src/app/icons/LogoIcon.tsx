import { FC, HTMLAttributes } from "react";
import Image from "next/image";

// Foody7 text logo: 1262x391 — ratio 0.3098
// F7 icon: square crop ~268x268 after transparent trim
const TEXT_RATIO = 391 / 1262;

interface LogoIconProps extends HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}

export const LogoIcon: FC<LogoIconProps> = ({ className, width = 130, ...props }) => {
  const textH = Math.round(width * TEXT_RATIO); // height of text logo
  const iconH = Math.round(textH * 1.1);        // F7 icon slightly taller (optical balance)
  const iconW = iconH;                           // F7 icon is square

  return (
    <div
      className={className}
      {...props}
      style={{ display: "inline-flex", alignItems: "center", gap: "8px", ...(props as any).style }}
    >
      {/* F7 icon — the badge mark */}
      <Image
        src="/foody7-icon.png"
        alt="F7"
        width={iconW}
        height={iconH}
        priority
        style={{ flexShrink: 0 }}
      />

      {/* Thin vertical divider — hidden on mobile */}
      <span
        className="hidden sm:block"
        style={{
          width: "1.5px",
          height: `${Math.round(textH * 0.75)}px`,
          background: "rgba(29,52,97,0.25)",
          borderRadius: "1px",
          flexShrink: 0,
        }}
      />

      {/* Foody7 full text logo — hidden on mobile */}
      <Image
        src="/foody7-logo.png"
        alt="Foody7"
        width={width}
        height={textH}
        priority
        className="hidden sm:block"
        style={{ flexShrink: 0 }}
      />
    </div>
  );
};
