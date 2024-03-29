import type { TXN, TXN_HTML } from "./types";
export declare function buildEmptyNode<T>(id: string, path: string[], object: T, parent: TXN<T> | null): TXN<T>;
export declare function buildTreexplorerHTML(): HTMLElement;
export declare function buildTXN_HTML(id: string): TXN_HTML;
export declare function expandOrFocusChild<T>(node: TXN<T>): boolean;
export declare function collapseOfFocusParent<T>(node: TXN<T>): boolean;
export declare function focusPrevious<T>(node: TXN<T>): void;
export declare function focusNext<T>(node: TXN<T>): void;
