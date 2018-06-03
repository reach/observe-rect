let props = ["width", "height", "top", "right", "bottom", "left"];

let rectChanged = (a = {}, b = {}) => props.some(prop => a[prop] !== b[prop]);

let observedNodes = new Map();
let rafId;

let run = () => {
  const changedStates = []

  observedNodes.forEach((state, node) => {
    let newRect = node.getBoundingClientRect();
    if (rectChanged(newRect, state.rect)) {
      state.rect = newRect;
      changedStates.push(state);
    }
  });

  changedStates.forEach(state => {
    state.callbacks.forEach(cb => cb(state.rect));
  });

  rafId = requestAnimationFrame(run);
};

export default (node, cb) => {
  return {
    observe() {
      let wasEmpty = observedNodes.size === 0;
      if (observedNodes.has(node)) {
        observedNodes.get(node).callbacks.push(cb);
      } else {
        observedNodes.set(node, {
          rect: undefined,
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
