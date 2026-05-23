import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { fadeUp, prefersReducedMotion } from "../utils/gsap";

/** Animate children on mount with stagger */
export function useStaggerReveal(selector = "[data-animate]", deps = []) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      fadeUp(targets, { stagger: 0.1, y: 24 });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

/** Page-level enter animation */
export function usePageEnter(deps = []) {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.65,
        ease: "power3.out",
      });
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return pageRef;
}

/** Auth card slide-up */
export function useAuthCard() {
  const cardRef = useRef(null);
  const backRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      if (backRef.current) {
        gsap.from(backRef.current, {
          opacity: 0,
          x: -12,
          duration: 0.4,
          ease: "power2.out",
        });
      }
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          opacity: 0,
          y: 48,
          scale: 0.96,
          duration: 0.85,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return { cardRef, backRef };
}

/** Animate result box when it appears */
export function useRevealOnChange(value, selector) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!value || !ref.current) return;
    const target = selector
      ? ref.current.querySelector(selector)
      : ref.current;
    if (!target) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(target, { opacity: 1, y: 0, scale: 1 });
        return;
      }
      gsap.from(target, {
        opacity: 0,
        y: 20,
        scale: 0.97,
        duration: 0.55,
        ease: "back.out(1.5)",
      });
    }, ref);

    return () => ctx.revert();
  }, [value, selector]);

  return ref;
}

/** Tab content switch */
export function useTabContent(activeTab, deps = []) {
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ...deps]);

  return contentRef;
}
