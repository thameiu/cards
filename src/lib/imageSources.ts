export function getPreferredImageSource(src: string) {
  return src;
}

export function getFallbackImageSource(src: string) {
  return src;
}

export function getImageSourceCandidates(src: string) {
  const preferred = getPreferredImageSource(src);
  return preferred === src ? [src] : [preferred, src];
}
