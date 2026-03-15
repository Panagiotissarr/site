import { useEffect } from "react";

type RgbaColor = { r: number; g: number; b: number; a: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const parseColor = (color: string): RgbaColor | null => {
  const normalized = color.trim().toLowerCase();
  if (normalized === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const hexMatch = normalized.match(
    /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
  );
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a =
        hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return { r, g, b, a: clamp(a, 0, 1) };
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a =
      hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a: clamp(a, 0, 1) };
  }

  const rgbMatch = normalized.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(/[,/ ]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length < 3) return null;

    const toChannel = (value: string) => {
      if (value.endsWith("%")) {
        return clamp(
          Math.round((parseFloat(value) / 100) * 255),
          0,
          255
        );
      }
      return clamp(parseFloat(value), 0, 255);
    };

    const r = toChannel(parts[0]);
    const g = toChannel(parts[1]);
    const b = toChannel(parts[2]);
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith("%")
        ? clamp(parseFloat(parts[3]) / 100, 0, 1)
        : clamp(parseFloat(parts[3]), 0, 1);
    }
    return { r, g, b, a };
  }

  return null;
};

const compositeColors = (foreground: RgbaColor, background: RgbaColor) => {
  const alpha = foreground.a + background.a * (1 - foreground.a);
  if (alpha <= 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const r =
    (foreground.r * foreground.a +
      background.r * background.a * (1 - foreground.a)) /
    alpha;
  const g =
    (foreground.g * foreground.a +
      background.g * background.a * (1 - foreground.a)) /
    alpha;
  const b =
    (foreground.b * foreground.a +
      background.b * background.a * (1 - foreground.a)) /
    alpha;
  return { r, g, b, a: alpha };
};

const getBackgroundColorAtPoint = (
  x: number,
  y: number,
  startElement?: HTMLElement | null
): RgbaColor => {
  let element =
    startElement ?? (document.elementFromPoint(x, y) as HTMLElement | null);

  if (!element) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const layers: RgbaColor[] = [];

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const color = parseColor(style.backgroundColor);

    if (color && color.a > 0) {
      layers.push(color);
      if (color.a >= 0.98) break;
    }

    element = element.parentElement;
  }

  const bodyColor =
    parseColor(window.getComputedStyle(document.body).backgroundColor) ?? {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    };

  let composite = bodyColor;
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    composite = compositeColors(layers[i], composite);
  }

  return composite;
};

const getColorLuma = (color: RgbaColor) =>
  0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;

export const useMagicCursor = () => {
  useEffect(() => {
    const cursor = document.getElementById("magic-cursor");
    const cursorBwLayer = document.getElementById("magic-cursor-bw-layer");
    const cursorText = document.getElementById("magic-cursor-text");

    if (!cursor || !cursorText) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrameId = 0;

    const setCursorPosition = (x: number, y: number) => {
      const offset = 24;
      const transform = `translate3d(${x - offset}px, ${y - offset}px, 0)`;
      cursor.style.transform = transform;
      if (cursorBwLayer) cursorBwLayer.style.transform = transform;
    };

    const darkTarget = { r: 7, g: 7, b: 8 };
    const lightTarget = { r: 255, g: 255, b: 255 };
    const channelTolerance = 10;
    const colorDark = "#111111";
    const colorLight = "#ffffff";
    const textThreshold = 140;
    let lastColor = colorLight;
    let lastShadow = "rgba(255, 255, 255, 0.35)";

    const isNearColor = (color: RgbaColor, target: RgbaColor) =>
      Math.abs(color.r - target.r) <= channelTolerance &&
      Math.abs(color.g - target.g) <= channelTolerance &&
      Math.abs(color.b - target.b) <= channelTolerance;

    const isTextLike = (el: HTMLElement) => {
      if (el.classList.contains("material-symbols-rounded")) return true;
      const text = el.textContent?.trim();
      return !!text && text.length > 0;
    };

    const getTextColorAtPoint = (x: number, y: number) => {
      const stack = document.elementsFromPoint(x, y) as HTMLElement[];
      for (const el of stack) {
        if (
          el.id === "magic-cursor" ||
          el.id === "magic-cursor-text" ||
          window.getComputedStyle(el).pointerEvents === "none"
        ) {
          continue;
        }
        if (!isTextLike(el)) continue;

        const walker = document.createTreeWalker(
          el,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) =>
              node.textContent && node.textContent.trim().length > 0
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT
          }
        );

        let nodeCount = 0;
        let current = walker.nextNode();
        while (current && nodeCount < 200) {
          const range = document.createRange();
          range.selectNodeContents(current);
          const rects = range.getClientRects();
          for (const rect of Array.from(rects)) {
            if (
              x >= rect.left &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom
            ) {
              const parent = current.parentElement;
              if (!parent) continue;
              const color = parseColor(window.getComputedStyle(parent).color);
              if (color && color.a > 0.1) return color;
            }
          }
          nodeCount += 1;
          current = walker.nextNode();
        }
      }
      return null;
    };

    const getCursorHintAtPoint = (x: number, y: number) => {
      const stack = document.elementsFromPoint(x, y) as HTMLElement[];
      for (const el of stack) {
        if (
          el.id === "magic-cursor" ||
          el.id === "magic-cursor-text" ||
          window.getComputedStyle(el).pointerEvents === "none"
        ) {
          continue;
        }

        const hinted =
          el.getAttribute("data-cursor") ??
          el.closest("[data-cursor]")?.getAttribute("data-cursor");
        if (hinted === "dark" || hinted === "light") return hinted;

        if (el instanceof HTMLIFrameElement) {
          const iframeColor = parseColor(
            window.getComputedStyle(el).backgroundColor
          );
          if (iframeColor && iframeColor.a > 0.1) {
            return getColorLuma(iframeColor) >= textThreshold ? "dark" : "light";
          }
        }
      }
      return null;
    };

    const updateCursorTheme = (x: number, y: number) => {
      const textColor = getTextColorAtPoint(x, y);
      if (textColor) {
        const isLightText = getColorLuma(textColor) >= textThreshold;
        const color = isLightText ? colorDark : colorLight;
        const shadow = isLightText
          ? "rgba(0, 0, 0, 0.35)"
          : "rgba(255, 255, 255, 0.35)";
        lastColor = color;
        lastShadow = shadow;
        cursor.style.setProperty("--cursor-color", color);
        cursor.style.setProperty("--cursor-shadow", shadow);
        cursor.classList.toggle("magic-cursor--dark", isLightText);
        cursor.classList.toggle("magic-cursor--light", !isLightText);
        return;
      }

      const hint = getCursorHintAtPoint(x, y);
      if (hint) {
        const color = hint === "dark" ? colorDark : colorLight;
        const shadow =
          hint === "dark"
            ? "rgba(0, 0, 0, 0.35)"
            : "rgba(255, 255, 255, 0.35)";
        lastColor = color;
        lastShadow = shadow;
        cursor.style.setProperty("--cursor-color", color);
        cursor.style.setProperty("--cursor-shadow", shadow);
        cursor.classList.toggle("magic-cursor--dark", hint === "dark");
        cursor.classList.toggle("magic-cursor--light", hint !== "dark");
        return;
      }

      const topElement =
        (document.elementFromPoint(x, y) as HTMLElement | null) ?? null;
      const backgroundColor = getBackgroundColorAtPoint(x, y, topElement);
      const isDarkBg = isNearColor(backgroundColor, darkTarget);
      const isLightBg = isNearColor(backgroundColor, lightTarget);

      if (!isDarkBg && !isLightBg) {
        cursor.style.setProperty("--cursor-color", lastColor);
        cursor.style.setProperty("--cursor-shadow", lastShadow);
        return;
      }

      const color = isDarkBg ? colorLight : colorDark;
      const shadow = isDarkBg
        ? "rgba(255, 255, 255, 0.35)"
        : "rgba(0, 0, 0, 0.35)";

      lastColor = color;
      lastShadow = shadow;
      cursor.style.setProperty("--cursor-color", color);
      cursor.style.setProperty("--cursor-shadow", shadow);
      cursor.classList.toggle("magic-cursor--dark", !isDarkBg);
      cursor.classList.toggle("magic-cursor--light", isDarkBg);
    };

    const textOffset = 40;
    const padding = 8;

    const animateCursor = () => {
      const dragDelay = 0.16;
      currentX += (targetX - currentX) * dragDelay;
      currentY += (targetY - currentY) * dragDelay;

      setCursorPosition(currentX, currentY);
      updateCursorTheme(currentX, currentY);

      const w = cursorText.clientWidth;
      const h = cursorText.clientHeight;
      const maxX = window.innerWidth - w - padding;
      const maxY = window.innerHeight - h - padding;

      let nextX = currentX + textOffset;
      let nextY = currentY + textOffset;
      if (nextX + w > window.innerWidth - padding) {
        nextX = currentX - w - textOffset;
      }
      if (nextY + h > window.innerHeight - padding) {
        nextY = currentY - h - textOffset;
      }
      nextX = Math.max(padding, Math.min(nextX, maxX));
      nextY = Math.max(padding, Math.min(nextY, maxY));

      cursorText.style.left = nextX + "px";
      cursorText.style.top = nextY + "px";

      animationFrameId = window.requestAnimationFrame(animateCursor);
    };

    animationFrameId = window.requestAnimationFrame(animateCursor);

    const moveCursor = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
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

    const getHoverable = (target: EventTarget | null): HTMLElement | null => {
      const el = target as HTMLElement | null;
      if (!el || !el.closest) return null;
      return el.closest<HTMLElement>("a, button, .hover-state") ?? null;
    };

    let currentHoverable: HTMLElement | null = null;

    const handleDocMouseOver = (e: MouseEvent) => {
      const hoverable = getHoverable(e.target);
      if (hoverable && hoverable !== currentHoverable) {
        currentHoverable = hoverable;
        handleHoverEnter(hoverable);
      }
    };

    const handleDocMouseOut = (e: MouseEvent) => {
      const hoverable = getHoverable(e.relatedTarget);
      if (!hoverable || hoverable !== currentHoverable) {
        currentHoverable = null;
        handleHoverLeave();
      }
    };

    document.addEventListener("mouseover", handleDocMouseOver);
    document.addEventListener("mouseout", handleDocMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleDocMouseOver);
      document.removeEventListener("mouseout", handleDocMouseOut);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
};
