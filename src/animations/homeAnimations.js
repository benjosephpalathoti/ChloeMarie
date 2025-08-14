import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText     from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initHomeIntro() {
  // Split titles into lines
  const titles = document.querySelectorAll(".home-grid .title");
  const split  = new SplitText(titles, { type: "lines", linesClass: "line" });

  // Intro timeline
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(split.lines, {
    yPercent: 100,
    duration: 1.2,    // slide‑up in 1.2s
    stagger: 0.08     // 80ms between lines
  })
  .from(".home-grid .warning", {
    opacity: 0,
    y: 20,
    duration: 0.9,    // fade+rise in 0.9s
    delay: 0.15       // start 150ms after titles begin
  })
  .from(".home-grid .target", {
    clipPath: "inset(100% 0 0 0)",
    duration: 1.1,    // reveal over 1.1s
    stagger: 0.12     // 120ms between images
  });
}

export function initHomeParallax() {
  document.querySelectorAll(".home-grid .target").forEach((img) => {
    gsap.to(img, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
}

export function initFooterReveal() {
  gsap.to("footer", {
    y: 0,
    autoAlpha: 1,
    duration: 0.5,   // default fade time
    ease: "power2.out",
    scrollTrigger: {
      trigger: "footer",
      start: "top 90%"
    }
  });
}
