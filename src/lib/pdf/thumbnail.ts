import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

import { useDPR, useVisibility } from "../viewport";
import { cancellable } from "./utils";
import { usePDF } from "../internal";

export const useThumbnail = (
  pageNumber: number,
  options: {
    maxWidth?: number;
    maxHeight?: number;
  } = {},
) => {
  const pageProxy = usePDF((state) => state.getPdfPageProxy(pageNumber));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dpr = useDPR();
  const { visible } = useVisibility({ elementRef: canvasRef });
  const debouncedVisible = useDebounce(visible, 100);

  const { maxHeight, maxWidth } = Object.assign(
    {
      maxHeight: 800,
      maxWidth: 400,
    },
    options,
  );

  useEffect(() => {
    const { cancel } = cancellable(
      (async () => {
        //TODO: opitimize this for thumbnails add virtualization too
        if (!canvasRef.current) {
          return;
        }

        const page = pageProxy;
        const viewport = page.getViewport({ scale: 1 });

        const smallestScale = Math.min(
          maxWidth / viewport.width,
          maxHeight / viewport.height,
        );

        const scale = smallestScale * (debouncedVisible ? dpr : 0.5);

        const viewportScaled = page.getViewport({ scale });

        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.width = viewportScaled.width;
        canvas.height = viewportScaled.height;

        const renderingTask = page.render({
          canvasContext: canvasRef.current.getContext("2d")!,
          viewport: viewportScaled,
        });

        void renderingTask.promise;
      })(),
    );

    return () => {
      cancel();
    };
  }, [pageNumber, pageProxy, debouncedVisible]);

  return {
    canvasRef,
  };
};
