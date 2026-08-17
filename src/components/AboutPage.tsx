import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { getImageSourceCandidates } from "../lib/imageSources";
import type { CardData } from "../types";
import { OptimizedImage } from "./OptimizedImage";

type GhostCard = {
  id: number;
  src: string;
  x: number;
  y: number;
  rotation: number;
};

type AboutPageProps = {
  cards: CardData[];
  totalCardCount: number;
};

type GhostImageProps = {
  ghostCard: GhostCard;
};

const GHOST_LONG_SIDE = 120;

function AboutGhostImage({ ghostCard }: GhostImageProps) {
  const [dimensions, setDimensions] = useState(() => ({
    width: GHOST_LONG_SIDE,
    height: GHOST_LONG_SIDE / 1.54,
  }));

  return (
    <OptimizedImage
      className="about-ghost-card"
      src={ghostCard.src}
      alt=""
      style={
        {
          "--ghost-x": `${ghostCard.x}px`,
          "--ghost-y": `${ghostCard.y}px`,
          "--ghost-rotation": `${ghostCard.rotation}deg`,
          "--ghost-width": `${dimensions.width}px`,
          "--ghost-height": `${dimensions.height}px`,
        } as CSSProperties
      }
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (!naturalWidth || !naturalHeight) {
          return;
        }

        if (naturalWidth >= naturalHeight) {
          setDimensions({
            width: GHOST_LONG_SIDE,
            height: (GHOST_LONG_SIDE * naturalHeight) / naturalWidth,
          });
          return;
        }

        setDimensions({
          width: (GHOST_LONG_SIDE * naturalWidth) / naturalHeight,
          height: GHOST_LONG_SIDE,
        });
      }}
    />
  );
}

export function AboutPage({ cards, totalCardCount }: AboutPageProps) {
  const [ghostCards, setGhostCards] = useState<GhostCard[]>([]);
  const [ghostBounds, setGhostBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const isCoarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const [isTrailEnabled, setIsTrailEnabled] = useState(!isCoarsePointer);
  const ghostIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const backAvailabilityRef = useRef(new Map<string, boolean>());
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

  useEffect(() => {
    const main = mainRef.current;
    if (!main) {
      return undefined;
    }

    const updateBounds = () => {
      const rect = main.getBoundingClientRect();
      setGhostBounds({
        left: rect.left,
        top: rect.top,
        width: Math.max(rect.width - 18, 0),
        height: rect.height,
      });
    };

    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(main);
    window.addEventListener("resize", updateBounds);
    updateBounds();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const verifyImageExists = async (src: string) => {
      const candidates = getImageSourceCandidates(src);

      for (const candidate of candidates) {
        const exists = await new Promise<boolean>((resolve) => {
          const image = new Image();
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = candidate;
        });

        if (exists) {
          return true;
        }
      }

      return false;
    };

    cards.forEach((card) => {
      if (!card.back || backAvailabilityRef.current.has(card.back)) {
        return;
      }

      verifyImageExists(card.back).then((exists) => {
        if (!cancelled) {
          backAvailabilityRef.current.set(card.back!, exists);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [cards]);

  const spawnGhostCard = (clientX: number, clientY: number) => {
    const bounds = ghostBounds;
    if (isCoarsePointer || !bounds) {
      return;
    }

    const now = performance.now();
    if (now - lastSpawnRef.current < 55) {
      return;
    }

    if (!cards.length) {
      return;
    }

    lastSpawnRef.current = now;
    const card = cards[Math.floor(Math.random() * cards.length)];
    const canUseBack = Boolean(card.back && backAvailabilityRef.current.get(card.back) === true);
    const src = Math.random() > 0.5 && canUseBack && card.back ? card.back : card.front;
    const id = ghostIdRef.current++;
    const rotation = 0;
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;

    setGhostCards((current) => [
      ...current,
      { id, src, x, y, rotation },
    ]);

    window.setTimeout(() => {
      setGhostCards((current) => current.filter((ghostCard) => ghostCard.id !== id));
    }, 1000);
  };

  return (
    <main
      ref={mainRef}
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

        if (isCoarsePointer && !pointerDownRef.current?.moved) {
          return;
        }
        spawnGhostCard(event.clientX, event.clientY);
      }}
      onPointerUp={() => {
        if (isCoarsePointer) {
          pointerDownRef.current = null;
          return;
        }

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
      <div
        className="about-ghost-layer"
        aria-hidden="true"
        style={
          ghostBounds
            ? ({
                left: `${ghostBounds.left}px`,
                top: `${ghostBounds.top}px`,
                width: `${ghostBounds.width}px`,
                height: `${ghostBounds.height}px`,
              } as CSSProperties)
            : undefined
        }
      >
        {ghostCards.map((ghostCard) => (
          <AboutGhostImage key={ghostCard.id} ghostCard={ghostCard} />
        ))}
      </div>
      <div className="about-hero" aria-hidden="true" />
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
          contains {totalCardCount} cards, scanned on both sides and then edited and properly
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
          on GitHub. FYI, I will NOT be coding an
          automation to crop and edit the cards correctly, so good luck.{" "}
          <OptimizedImage src="assets/myself.png" alt="" className="about-inline-self" />
        </p>
      </div>
    </main>
  );
}
