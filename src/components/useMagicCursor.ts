import { useEffect } from "react";

export const useMagicCursor = () => {
  useEffect(() => {
    const cursor = document.getElementById("magic-cursor");
    const cursorText = document.getElementById("magic-cursor-text");

    if (!cursor || !cursorText) return;

    const moveCursor = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const offset = 24; // half of 3rem to center the circle
      cursor.style.transform = `translate3d(${mouseX - offset}px, ${
        mouseY - offset
      }px, 0)`;

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
      if (!cursorText) return;
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

    window.addEventListener("mousemove", moveCursor);

    const hoverables = document.querySelectorAll<HTMLElement>("a, button, .hover-state");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("scale-110");
        const preview = el.getAttribute("data-preview");
        updateTitle(el.getAttribute("data-title"), preview);
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("scale-110");
        updateTitle(null);
      });
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      hoverables.forEach((el) => {
        el.replaceWith(el.cloneNode(true));
      });
    };
  }, []);
};

