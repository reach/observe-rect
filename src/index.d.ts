export interface RectObserver {
  observe(): void;
  unobserve(): void;
}

export default function(
  node: Element,
  cb: (rect: ReturnType<Element["getBoundingClientRect"]>) => void
): RectObserver;
