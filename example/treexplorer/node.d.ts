import type { TXN, TXN_HTML } from "./types";
export declare function buildEmptyNode<T>(id: string, path: string[], object: T, parent: TXN<T> | null, updateTXN: (node: TXN<T>) => void, toggleSelect: (node: TXN<T>, select: boolean) => void): TXN<T>;
export declare function buildTreexplorerHTML(): HTMLElement;
export declare function buildTXN_HTML<T>(id: string): TXN_HTML;
