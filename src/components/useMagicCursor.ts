import { useEffect } from "react";

export const useMagicCursor = () => {
  useEffect(() => {
    const cursor = document.getElementById("magic-cursor");
    const cursorText = document.getElementById("magic-cursor-text");

    if (!cursor || !cursorText) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrameId = 0;

    const setCursorPosition = (x: number, y: number) => {
      const offset = 24;
      cursor.style.transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
    };

    const animateCursor = () => {
      const dragDelay = 0.16;
      currentX += (targetX - currentX) * dragDelay;
      currentY += (targetY - currentY) * dragDelay;

      setCursorPosition(currentX, currentY);
      animationFrameId = window.requestAnimationFrame(animateCursor);
    };

    animationFrameId = window.requestAnimationFrame(animateCursor);

    const moveCursor = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      targetX = mouseX;
      targetY = mouseY;

      if (mouseX > window.innerWidth - cursorText.clientWidth) {
        cursorText.style.left = -cursorText.clientWidth + "px";
      } else {
        cursorText.style.left = "50px";
      }

      if (mouseY > window.innerHeight - cursorText.clientHeight) {
        cursorText.style.top = -cursorText.clientHeight + "px";
      } else {
        cursorText.style.top = "50px";
      }
    };

    const updateTitle = (
      titleText: string | null,
      previewUrl?: string | null
    ) => {
      const isImage =
        !!previewUrl &&
        /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(previewUrl);

      if (isImage && previewUrl) {
        cursorText.style.opacity = "1";
        cursorText.style.transform = "scale(1)";
        cursorText.style.backgroundImage = `url(${previewUrl})`;
        cursorText.classList.add("image-view");
        cursorText.innerHTML = "";
      } else if (titleText) {
        cursorText.style.opacity = "1";
        cursorText.style.transform = "scale(1)";
        cursorText.style.backgroundImage = "none";
        cursorText.classList.remove("image-view");
        cursorText.innerHTML = titleText;
      } else {
        cursorText.style.opacity = "0";
        cursorText.style.transform = "scale(0.85)";
        cursorText.style.backgroundImage = "none";
        cursorText.classList.remove("image-view");
      }
    };

    const handleHoverEnter = (el: HTMLElement) => {
      cursor.classList.add("scale-110");
      const preview = el.getAttribute("data-preview");
      updateTitle(el.getAttribute("data-title"), preview);
    };

    const handleHoverLeave = () => {
      cursor.classList.remove("scale-110");
      updateTitle(null);
    };

    const disableInvert = () => {
      cursor.classList.add("magic-cursor--no-invert");
    };

    const enableInvert = () => {
      cursor.classList.remove("magic-cursor--no-invert");
    };

    window.addEventListener("mousemove", moveCursor);

    const hoverables = Array.from(
      document.querySelectorAll<HTMLElement>("a, button, .hover-state")
    );

    const hoverHandlers = hoverables.map((el) => {
      const onEnter = () => handleHoverEnter(el);
      const onLeave = () => handleHoverLeave();
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return { el, onEnter, onLeave };
    });

    const noInvertTargets = Array.from(
      document.querySelectorAll<HTMLElement>("img, video, canvas, .cursor-no-invert")
    );

    const noInvertHandlers = noInvertTargets.map((el) => {
      el.addEventListener("mouseenter", disableInvert);
      el.addEventListener("mouseleave", enableInvert);
      return el;
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.cancelAnimationFrame(animationFrameId);

      hoverHandlers.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });

      noInvertHandlers.forEach((el) => {
        el.removeEventListener("mouseenter", disableInvert);
        el.removeEventListener("mouseleave", enableInvert);
      });
    };
  }, []);
};
