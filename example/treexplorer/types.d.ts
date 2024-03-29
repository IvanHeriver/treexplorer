export type TXSelectListener<T> = (o: T) => void;
export type TXItemFamily<T> = {
    item: T;
    parent: T | null;
    prevSiblings: T[];
    nextSiblings: T[];
    children: T[] | null;
};
export type TX<T> = {
    HTML: HTMLElement;
    setRoots: (roots: T[] | T) => TX<T>;
    setGetId: (getId: (o: T) => string) => TX<T>;
    setGetHTML: (getHTML: (o: T) => HTMLElement) => TX<T>;
    setGetChildren: (getChildren: (o: T) => (T[] | null) | Promise<T[] | null>) => TX<T>;
    addSelectListener: (onSelect: TXSelectListener<T>) => TX<T>;
    removeSelectListener: (onSelect: TXSelectListener<T>) => TX<T>;
    update: () => TX<T>;
    updateNode: (id: string) => TX<T>;
    collapseAll: () => TX<T>;
    expandAll: () => TX<T>;
    collapseNode: (id: string) => TX<T>;
    expandNode: (id: string) => TX<T>;
    makeNodeVisible: (id: string) => TX<T>;
    unselectAll: () => TX<T>;
    setSelectedNodeItem: (id: string) => TX<T>;
    toggleRootsVisibility: (visible: boolean) => TX<T>;
    getRootItems: () => T[];
    getNodeItem: (id: string) => T | null;
    getNodeItemFamily: (id: string) => null | TXItemFamily<T>;
    getSelectedNodeItem: () => T | null;
};
export type TXConfig<T> = {
    roots: T[] | T;
    getId: (o: T) => string;
    getChildren?: (o: T) => (T[] | null) | Promise<T[] | null>;
    getHTML?: (o: T) => HTMLElement;
    getIsInteractive?: (o: T) => boolean;
    hideRoots?: boolean;
};
export type TXConfig_<T> = {
    roots: T[] | T;
    getId: (o: T) => string;
    getChildren: (o: T) => (T[] | null) | Promise<T[] | null>;
    getHTML: (o: T) => HTMLElement;
    getIsInteractive: (o: T) => boolean;
    hideRoots: boolean;
};
export type TXN<T> = {
    id: string;
    path: string[];
    object: T;
    HTML: TXN_HTML;
    family: TXN_family<T>;
    expanded: boolean;
    selected: boolean;
};
export type TXN_family<T> = {
    parent: TXN<T> | null;
    children: TXN<T>[] | null;
    beforeSiblings: TXN<T>[];
    afterSiblings: TXN<T>[];
};
export type TXN_HTML = {
    container: HTMLElement;
    arrow: HTMLElement;
    item: HTMLElement;
    itemContent: HTMLElement;
    children: HTMLElement;
};
