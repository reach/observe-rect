let props = ["width", "height", "top", "right", "bottom", "left"];

let rectChanged = (a = {}, b = {}) => props.some(prop => a[prop] !== b[prop]);

export default (node, cb) => {
  let rect;
  let rafId;

  let observe = () => {
    let newRect = node.getBoundingClientRect();
    if (rectChanged(newRect, rect)) {
      rect = newRect;
      cb(rect);
    }
    rafId = requestAnimationFrame(observe);
  };

  let unobserve = () => {
    cancelAnimationFrame(rafId);
  };

  return { observe, unobserve };
};
