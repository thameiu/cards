type CursorPoint = {
  x: number;
  y: number;
};

type CursorState = CursorPoint & {
  touchActive: boolean;
};

let cursor: CursorPoint = {
  x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
  y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
};
let touchActive = false;

let initialized = false;

export function ensureCursorTracking() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  window.addEventListener("pointermove", (event) => {
    cursor = { x: event.clientX, y: event.clientY };
    if (event.pointerType === "touch") {
      touchActive = true;
    }
  });
  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      cursor = { x: event.clientX, y: event.clientY };
      touchActive = true;
    }
  });
  const resetTouch = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      touchActive = false;
    }
  };
  window.addEventListener("pointerup", resetTouch);
  window.addEventListener("pointercancel", resetTouch);
}

export function getCursorState(): CursorState {
  return {
    ...cursor,
    touchActive,
  };
}
