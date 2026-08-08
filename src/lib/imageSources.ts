function splitExtension(src: string) {
  const match = src.match(/^(.*)\.(png|jpe?g|webp)$/i);
  if (!match) {
    return null;
  }

  return {
    base: match[1],
    extension: match[2].toLowerCase(),
  };
}

export function getPreferredImageSource(src: string) {
  const parts = splitExtension(src);
  if (!parts) {
    return src;
  }

  if (parts.extension === "webp") {
    return src;
  }

  return `${parts.base}.webp`;
}

export function getFallbackImageSource(src: string) {
  return src;
}

export function getImageSourceCandidates(src: string) {
  const preferred = getPreferredImageSource(src);
  return preferred === src ? [src] : [preferred, src];
}
