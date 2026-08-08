import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cardList } from "../CardList";
import { OptimizedImage } from "./OptimizedImage";

type GhostCard = {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
};

export function AboutPage() {
  const [ghostCards, setGhostCards] = useState<GhostCard[]>([]);
  const [isTrailEnabled, setIsTrailEnabled] = useState(true);
  const ghostIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const pointerDownRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
    target: EventTarget | null;
  } | null>(null);

  useEffect(() => {
    const handlePointerUp = () => {
      pointerDownRef.current = null;
    };

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const spawnGhostCard = (clientX: number, clientY: number) => {
    const now = performance.now();
    if (now - lastSpawnRef.current < 55) {
      return;
    }

    lastSpawnRef.current = now;
    const card = cardList[Math.floor(Math.random() * cardList.length)];
    const src = Math.random() > 0.5 && card.back ? card.back : card.front;
    const id = ghostIdRef.current++;
    const rotation = (Math.random() - 0.5) * 26;

    setGhostCards((current) => [...current, { id, src, x: clientX, y: clientY, rotation }]);

    window.setTimeout(() => {
      setGhostCards((current) => current.filter((ghostCard) => ghostCard.id !== id));
    }, 1000);
  };

  return (
    <main
      className="about-page"
      onPointerDown={(event) => {
        pointerDownRef.current = {
          x: event.clientX,
          y: event.clientY,
          moved: false,
          target: event.target,
        };
      }}
      onPointerMove={(event) => {
        if (pointerDownRef.current) {
          const deltaX = event.clientX - pointerDownRef.current.x;
          const deltaY = event.clientY - pointerDownRef.current.y;
          if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            pointerDownRef.current.moved = true;
          }
        }

        if (!isTrailEnabled) {
          return;
        }
        spawnGhostCard(event.clientX, event.clientY);
      }}
      onPointerUp={() => {
        const pointerDown = pointerDownRef.current;
        if (!pointerDown) {
          return;
        }

        const target = pointerDown.target;
        const isLinkClick = target instanceof Element && Boolean(target.closest("a"));
        if (!pointerDown.moved && !isLinkClick) {
          setIsTrailEnabled((current) => !current);
        }
        pointerDownRef.current = null;
      }}
    >
      <div className="about-ghost-layer" aria-hidden="true">
        {ghostCards.map((ghostCard) => (
          <OptimizedImage
            key={ghostCard.id}
            className="about-ghost-card"
            src={ghostCard.src}
            alt=""
            style={
              {
                "--ghost-x": `${ghostCard.x}px`,
                "--ghost-y": `${ghostCard.y}px`,
                "--ghost-rotation": `${ghostCard.rotation}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="about-copy">
        <p>
          Hello,{" "}
          <span className="latex-frac" aria-label="mathieu over thameiu">
            <span className="latex-frac-num">thameiu</span>
            <span className="latex-frac-den">mathieu</span>
          </span>{" "}
          here.
        </p>
        <p>
          For several years, I’ve had a sort of passion for collecting cards. Not TCGs or other
          collectible cards, no. Random cards.
        </p>

        <p>
          Every new restaurant I go to, every artist pop-up I come across, every time I buy
          something and there’s a card or sticker inside the package, I keep it. At some point, my
          old wallet started to tear apart because of the sheer quantity of random cards I was
          carrying around, but that wasn’t really bothering me.
        </p>

        <p>
          To me, these cards are memories. They can represent simple moments or wonderful
          experiences, gifts from my loved ones, places I’ve visited, or random stores I barely
          remember.
        </p>
        <OptimizedImage src="assets/pileofcards.png" alt="" className="img-pile" fetchPriority="low" />
        <br />
        <br />
        <p>
          At some point, I began to wonder if there was anything I could actually do with these
          cards. I can’t really display them on a wall (that would require way too much glue in
          this economy) and I also don’t want to just store them in a binder. But I knew there was
          something creative I could do with them.
        </p>


        <p>
          Then I remembered I’ve been a computer science student for three years. The idea of a
          digital notebook came to me. So I created “Cards”, a digital binder that currently
          contains {cardList.length} cards, scanned on both sides and then edited and properly
          cropped so they can be displayed exactly as they look in real life.
        </p>

        <p>Coding wasn’t the longest part. Scanning and editing all the cards, however…</p>

        <p>
          Anyways, enjoy my digital card notebook, and check out my other projects on my{" "}
          <a
            className="about-link"
            href="https://mathieu-hernandez.fr"
            target="_blank"
            rel="noreferrer"
          >
            portfolio
            <OptimizedImage
              className="about-link-badge"
              src="/assets/thameiu_88x31.webp"
              alt=""
              aria-hidden="true"
            />
          </a>{" "}
          if you want.
        </p>

        <p>
          This project is open-source. If you want to create your own binder, you can clone the{" "}
          <a
            className="about-link"
            href="https://github.com/thameiu/cards"
            target="_blank"
            rel="noreferrer"
          >
            repo
          </a>{" "}
          on GitHub. FYI, I will NOT scan your cards for you, and I will not be coding an
          automation for this, so good luck.
        </p>
      </div>
    </main>
  );
}
