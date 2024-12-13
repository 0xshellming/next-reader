import { elementScroll, VirtualizerOptions } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
import { PDFStore, usePDF } from "@/lib/internal";

const easeOutQuint = (t: number) => {
  return 1 - Math.pow(1 - t, 5);
};

export const useScrollFn = () => {
  const scrollingRef = useRef<number | null>(null);
  const viewportRef = usePDF((state) => state.viewportRef);
  const store = PDFStore.useContext();

  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback(
    (_offset, canSmooth, instance) => {
      const duration = 400;
      const start = viewportRef?.current?.scrollTop || 0;
      const startTime = (scrollingRef.current = Date.now());

      const zoom = store.getState().zoom;
      let offset = _offset * zoom;
      // if we are in auto scroll mode, then immediately scroll
      // to the offset and not display any animation. For example if scroll
      // immediately to a rescaled offset if zoom/scale has just been changed
      if (canSmooth.behavior === "auto") {
        elementScroll(offset, canSmooth, instance);
        return;
      }

      // if we are in smooth mode then we scroll auto using our ease out schedule
      const run = () => {
        if (scrollingRef.current !== startTime) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (offset - start) * progress;

        if (elapsed < duration) {
          elementScroll(interpolated, { behavior: "auto" }, instance);
          requestAnimationFrame(run);
        } else {
          elementScroll(interpolated, { behavior: "auto" }, instance);
        }
      };

      requestAnimationFrame(run);
    },
    [viewportRef],
  );
  return { scrollToFn };
};
