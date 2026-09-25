import { useEffect, useState } from "react";
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

export function Taskbar({ items, activeItemId, onFocusItem, onCloseItem }: TaskbarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <footer className="xp-taskbar">
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
      <time className="xp-taskbar-clock" dateTime={now.toISOString()}>
        {formatTime(now)}
      </time>
    </footer>
  );
}
