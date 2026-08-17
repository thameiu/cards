import { useEffect, useMemo, useState } from "react";
import { CARD_TAGS } from "../lib/cardTags";

type InitialLoaderProps = {
  progress: number;
};

export function InitialLoader({ progress }: InitialLoaderProps) {
  const loadingMessages = useMemo(
    () => [...CARD_TAGS.map((tag) => `loading ${tag.label} cards`), "loading infinity matrix system"],
    []
  );
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadingMessages]);

  const filledCells = progress <= 0 ? 0 : Math.min(10, Math.ceil(progress * 10));

  return (
    <div className="initial-loader-screen">
      <div className="loader initial-loader" aria-hidden="true">
        <div className="loader-popup initial-loader-popup">
          <div className="loader-body initial-loader-body">
            <p className="loader-label initial-loader-label">
              <span className="loader-text">{loadingMessages[messageIndex]}</span>
              <span className="loader-dots">
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
              </span>
            </p>
            <div className="initial-loader-bar">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`initial-loader-cell${index < filledCells ? " is-filled" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
