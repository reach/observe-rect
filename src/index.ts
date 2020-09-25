type RectProps = {
	rect: DOMRect;
	callbacks: Function[];
};

let COMPARE_KEYS = [
	"bottom", "height", "left", "right", "top", "width"
] as const;

let observedNodes = new Map<Element, RectProps>();
let active: boolean;

function checkForUpdates(){
	if(active){
		observedNodes.forEach(assertDidUpdate);
		window.requestAnimationFrame(checkForUpdates);
	}
};

function assertDidUpdate(state: RectProps, node: Element){
	let newRect = node.getBoundingClientRect();

	for(const key of COMPARE_KEYS)
		if(newRect[key] !== state.rect[key]){
			state.rect = newRect;
			state.callbacks.forEach(cb => cb(state.rect))
			break;
		}
}

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
					rect: {} as any,
					callbacks: [cb],
				});
			}
			if (wasEmpty) {
				active = true;
				checkForUpdates();
			}
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
				if (!observedNodes.size)
					active = false;
			}
		},
	};
}