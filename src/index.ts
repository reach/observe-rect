let COMPARE_KEYS = [
	"bottom", "height", "left", "right", "top", "width"
] as const;

let observedNodes = new Map<Element, RectProps>();
let rafId: number;

let run = () => {
	observedNodes.forEach((state, node) => {
		let newRect = node.getBoundingClientRect();

		for(const key of COMPARE_KEYS)
			if(newRect[key] !== (state.rect || {})[key]){
				state.rect = newRect;
				state.callbacks.forEach(cb => cb(state.rect))
				break;
			}
	});

	rafId = window.requestAnimationFrame(run);
};

export default function observeRect(
	node: Element,
	cb: (rect: DOMRect) => void
) {
	return {
		observe() {
			let wasEmpty = observedNodes.size === 0;
			if (observedNodes.has(node)) {
				observedNodes.get(node)!.callbacks.push(cb);
			} else {
				observedNodes.set(node, {
					rect: undefined,
					hasRectChanged: false,
					callbacks: [cb],
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
		},
	};
}

export type PartialRect = Partial<DOMRect>;

export type RectProps = {
	rect: DOMRect | undefined;
	hasRectChanged: boolean;
	callbacks: Function[];
};
