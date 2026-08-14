import { useEffect, useMemo, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { getFallbackImageSource, getPreferredImageSource } from "../lib/imageSources";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

export function OptimizedImage({ src, onError, ...props }: OptimizedImageProps) {
  const preferredSrc = useMemo(() => getPreferredImageSource(src), [src]);
  const fallbackSrc = useMemo(() => getFallbackImageSource(src), [src]);
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
  }, [preferredSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      draggable={false}
      onDragStart={(event) => {
        event.preventDefault();
        props.onDragStart?.(event);
      }}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }
        onError?.(event);
      }}
    />
  );
}
