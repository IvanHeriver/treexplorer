export type SelectListener<T> = (o: T) => void;
export type ItemFamily<T> = {
  item: T;
  parent: T | null;
  prevSiblings: T[];
  nextSiblings: T[];
  children: T[] | null;
};

export type Treexplorer<T> = {
  HTML: HTMLElement;
  setRoots: (roots: T[] | T) => Treexplorer<T>;
  setGetId: (getId: (o: T) => string) => Treexplorer<T>;
  setGetHTML: (getHTML: (o: T) => HTMLElement) => Treexplorer<T>;
  setGetChildren: (
    getChildren: (o: T) => (T[] | null) | Promise<T[] | null>
  ) => Treexplorer<T>;
  addSelectListener: (onSelect: SelectListener<T>) => Treexplorer<T>;
  removeSelectListener: (onSelect: SelectListener<T>) => Treexplorer<T>;
  update: () => Treexplorer<T>;
  updateNode: (id: string) => Treexplorer<T>;
  collapseAll: () => Treexplorer<T>;
  expandAll: () => Treexplorer<T>;
  expandNode: (id: string) => Treexplorer<T>;
  makeNodeVisible: (id: string) => Treexplorer<T>;
  unselectAll: () => Treexplorer<T>;
  setSelectedNodeItem: (id: string) => Treexplorer<T>;
  getNodeItem: (id: string) => T | null;
  getNodeItemFamily: (id: string) => null | ItemFamily<T>;
  getSelectedNodeItem: () => T | null;
};

export type TreexplorerConfig<T> = {
  roots: T[] | T;
  getId: (o: T) => string;
  getChildren?: (o: T) => (T[] | null) | Promise<T[] | null>;
  getHTML?: (o: T) => HTMLElement;
  getIsInteractive?: (o: T) => boolean;
};

export type TreexplorerConfig_<T> = {
  roots: T[] | T;
  getId: (o: T) => string;
  getChildren: (o: T) => (T[] | null) | Promise<T[] | null>;
  getHTML: (o: T) => HTMLElement;
  getIsInteractive: (o: T) => boolean;
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
