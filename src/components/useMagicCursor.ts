import { useEffect } from "react";

const parseRgb = (rgb: string): [number, number, number] | null => {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const isTransparent = (colorValue: string) => {
  if (colorValue === "transparent") return true;
  const alphaMatch = colorValue.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/i);
  return !!alphaMatch && Number(alphaMatch[1]) === 0;
};

const getBackgroundLumaAtPoint = (x: number, y: number): number => {
  let element = document.elementFromPoint(x, y) as HTMLElement | null;

  if (!element) {
    return 0;
  }

  while (element) {
    const style = window.getComputedStyle(element);
    const color = style.backgroundColor;

    if (color && !isTransparent(color)) {
      const rgb = parseRgb(color);
      if (rgb) {
        const [r, g, b] = rgb;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
    }

    element = element.parentElement;
  }

  const bodyColor = window.getComputedStyle(document.body).backgroundColor;
  const bodyRgb = parseRgb(bodyColor);
  if (bodyRgb) {
    const [r, g, b] = bodyRgb;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  return 0;
};

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

    const updateCursorTheme = (x: number, y: number) => {
      const luma = getBackgroundLumaAtPoint(x, y);
      const isLightBackground = luma >= 140;

      cursor.classList.toggle("magic-cursor--dark", isLightBackground);
      cursor.classList.toggle("magic-cursor--light", !isLightBackground);
    };

    const animateCursor = () => {
      const dragDelay = 0.16;
      currentX += (targetX - currentX) * dragDelay;
      currentY += (targetY - currentY) * dragDelay;

      setCursorPosition(currentX, currentY);
      updateCursorTheme(currentX, currentY);
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

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.cancelAnimationFrame(animationFrameId);

      hoverHandlers.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);
};
