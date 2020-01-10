let props: (keyof DOMRect)[] = [
  'bottom',
  'height',
  'left',
  'right',
  'top',
  'width'
];

let rectChanged = (a: DOMRect = {} as DOMRect, b: DOMRect = {} as DOMRect) =>
  props.some(prop => a[prop] !== b[prop]);

let observedNodes = new Map<HTMLElement, RectProps>();
let rafId: number;

let run = () => {
  observedNodes.forEach(state => {
    if (state.hasRectChanged) {
      state.callbacks.forEach(cb => cb(state.rect));
      state.hasRectChanged = false;
    }
  });

  window.setTimeout(() => {
    observedNodes.forEach((state, node) => {
      let newRect = node.getBoundingClientRect();
      if (rectChanged(newRect, state.rect)) {
        state.hasRectChanged = true;
        state.rect = newRect;
      }
    });
  }, 0);

  rafId = window.requestAnimationFrame(run);
};

export default (node: HTMLElement, cb: Function) => {
  return {
    observe() {
      let wasEmpty = observedNodes.size === 0;
      if (observedNodes.has(node)) {
        observedNodes.get(node)!.callbacks.push(cb);
      } else {
        observedNodes.set(node, {
          rect: undefined,
          hasRectChanged: false,
          callbacks: [cb]
        });
      }
      if (wasEmpty) run();
    },

    unobserve() {
      let state = observedNodes.get(node);
      if (state) {
        // Remove the callback
        const index = state.callbacks.indexOf(cb);
        if (index >= 0) state.callbacks.splice(index, 1);

        // Remove the node reference
        if (!state.callbacks.length) observedNodes.delete(node);

        // Stop the loop
        if (!observedNodes.size) cancelAnimationFrame(rafId);
      }
    }
  };
};

export type PartialRect = Partial<DOMRect>;

export type RectProps = {
  rect: DOMRect | undefined;
  hasRectChanged: boolean;
  callbacks: Function[];
};
