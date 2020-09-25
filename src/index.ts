type RectProps = {
	rect: DOMRect;
	callbacks: Set<Function>;
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
	callback: (rect: DOMRect) => void
) {
	return {
		observe() {
			let wasEmpty = observedNodes.size === 0;
			if (observedNodes.has(node)) {
				observedNodes.get(node)!.callbacks.add(callback);
			} else {
				observedNodes.set(node, {
					rect: {} as any,
					callbacks: new Set([callback]),
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
				state.callbacks.delete(callback);

				// Remove the node reference
				if (!state.callbacks.size)
					observedNodes.delete(node);

				// Stop the loop
				if (!observedNodes.size)
					active = false;
			}
		},
	};
}