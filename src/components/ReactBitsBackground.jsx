/**
 * Site background using React Bits Aurora (JS-CSS)
 * Installed via: npx shadcn@latest add @react-bits/Aurora-JS-CSS
 * @see https://www.reactbits.dev/get-started/installation
 */
import Aurora from "@/components/Aurora/Aurora";
import { prefersReducedMotion } from "../utils/gsap";

const THEMES = {
  default: {
    colorStops: ["#7c3aed", "#22d3ee", "#8b5cf6"],
    amplitude: 1.2,
    blend: 0.55,
    speed: 0.9,
  },
  auth: {
    colorStops: ["#6d28d9", "#e879f9", "#7c3aed"],
    amplitude: 1.05,
    blend: 0.5,
    speed: 0.75,
  },
  dashboard: {
    colorStops: ["#0891b2", "#7c3aed", "#34d399"],
    amplitude: 1.0,
    blend: 0.48,
    speed: 0.7,
  },
};

export default function ReactBitsBackground({ variant = "default" }) {
  const theme = THEMES[variant] || THEMES.default;
  const reduced = prefersReducedMotion();

  if (reduced) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[#030712]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-slate-950 to-cyan-950/30" />
        <div className="absolute inset-0 bg-vignette" />
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#030712]/80" />
      <div className="absolute inset-0">
        <Aurora
          colorStops={theme.colorStops}
          amplitude={theme.amplitude}
          blend={theme.blend}
          speed={theme.speed}
        />
      </div>
      <div className="absolute inset-0 bg-grid opacity-[0.2]" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
