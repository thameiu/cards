import { useEffect, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeCellSize(width: number) {
  return clamp(width * 0.2, 180, 320);
}

export function useViewportMetrics() {
  const [metrics, setMetrics] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    cellSize: computeCellSize(window.innerWidth),
  }));

  useEffect(() => {
    const handleResize = () => {
      setMetrics({
        width: window.innerWidth,
        height: window.innerHeight,
        cellSize: computeCellSize(window.innerWidth),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return metrics;
}
