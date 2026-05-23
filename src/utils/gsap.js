import gsap from "gsap";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const fadeUp = (targets, options = {}) => {
  if (!targets) return null;
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
    return null;
  }
  return gsap.from(targets, {
    y: options.y ?? 32,
    opacity: 0,
    scale: options.scale ?? 1,
    duration: options.duration ?? 0.75,
    ease: options.ease ?? "power3.out",
    stagger: options.stagger ?? 0,
    delay: options.delay ?? 0,
    ...options,
  });
};

export const fadeIn = (targets, options = {}) => {
  if (!targets) return null;
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1 });
    return null;
  }
  return gsap.from(targets, {
    opacity: 0,
    duration: options.duration ?? 0.5,
    ease: "power2.out",
    ...options,
  });
};

export const scaleIn = (targets, options = {}) => {
  if (!targets) return null;
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, scale: 1 });
    return null;
  }
  return gsap.from(targets, {
    scale: 0.92,
    opacity: 0,
    duration: options.duration ?? 0.6,
    ease: "back.out(1.4)",
    ...options,
  });
};
