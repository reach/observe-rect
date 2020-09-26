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
){
	let state = observedNodes.get(node);

	return {
		observe(){
			if(state)
				state.callbacks.add(callback);
			else {
				observedNodes.set(node, state = {
					rect: {} as any,
					callbacks: new Set([callback]),
				});
		
				if(!active){
					active = true;
					checkForUpdates();
				}
			}
		},
		unobserve(){
			if(state){
				state.callbacks.delete(callback);
	
				if(!state.callbacks.size)
					observedNodes.delete(node);
	
				state = undefined;
	
				if(!observedNodes.size)
					active = false;
			}
		}
	}
}