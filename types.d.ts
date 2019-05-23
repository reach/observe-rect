export interface RectObject {
    width: number,
    height: number,
    top: number,
    right: number,
    bottom: number,
    left: number
}

export interface ObservedObject {
    observe(): void;

    unobserve(): void;
}

export default function observeRect<T extends HTMLElement>(node: T, callback: (rect: RectObject) => void): ObservedObject;