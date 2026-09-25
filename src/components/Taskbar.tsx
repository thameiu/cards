import { useEffect, useRef, useState } from "react";
import type { CardData } from "../types";

type TaskbarItem = {
  id: number;
  card: CardData;
  zIndex: number;
};

type TaskbarProps = {
  items: TaskbarItem[];
  activeItemId: number | null;
  onFocusItem: (id: number) => void;
  onCloseItem: (id: number) => void;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TaskbarGrip() {
  return (
    <span className="xp-taskbar-grip" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

export function Taskbar({ items, activeItemId, onFocusItem, onCloseItem }: TaskbarProps) {
  const [now, setNow] = useState(() => new Date());
  const [isStartOpen, setIsStartOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isStartOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!startMenuRef.current?.contains(event.target as Node)) {
        setIsStartOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsStartOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStartOpen]);

  return (
    <footer className="xp-taskbar">
      <div ref={startMenuRef} className={`xp-start${isStartOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="xp-start-button"
          onClick={() => setIsStartOpen((isOpen) => !isOpen)}
          aria-expanded={isStartOpen}
          aria-controls="xp-start-menu"
        >
          <img className="xp-start-button-icon" src="/assets/start.png" alt="" aria-hidden="true" />
          <span>start</span>
        </button>

        <section id="xp-start-menu" className="xp-start-menu" aria-hidden={!isStartOpen}>
          <header className="xp-start-menu-header">
            <span className="xp-start-avatar-frame">
              <img src="/assets/filou.png" alt="" aria-hidden="true" />
            </span>
            <span className="xp-start-menu-title">thameiu</span>
          </header>
          <div className="xp-start-menu-body">
            <a
              className="xp-start-menu-item"
              href="https://rgbast.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/assets/RGBAST_start.png" alt="" aria-hidden="true" />
              <span>RGBAST</span>
            </a>
          </div>
          <div className="xp-start-menu-footer" aria-hidden="true" />
        </section>
      </div>
      <TaskbarGrip />
      <div className="xp-taskbar-apps" aria-label="Open cards">
        {items.map((item) => (
          <div key={item.id} className="xp-taskbar-item">
            <button
              type="button"
              className={`xp-taskbar-app${item.id === activeItemId ? " is-active" : ""}`}
              onClick={() => onFocusItem(item.id)}
              title={item.card.label}
              aria-pressed={item.id === activeItemId}
            >
              <img
                className="xp-taskbar-app-icon"
                src="/favicon_app.ico"
                alt=""
                aria-hidden="true"
                width="16"
                height="16"
              />
              <span className="xp-taskbar-app-label">{item.card.label}</span>
            </button>
            <button
              type="button"
              className="xp-taskbar-close"
              onClick={() => onCloseItem(item.id)}
              aria-label={`Close ${item.card.label}`}
              title={`Close ${item.card.label}`}
            >
              <span className="window-close-icon" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <TaskbarGrip />
      <time className="xp-taskbar-clock" dateTime={now.toISOString()}>
        {formatTime(now)}
      </time>
    </footer>
  );
}
