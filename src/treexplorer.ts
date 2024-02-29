/**
 * @interface Treexplorer - Represents a tree explorer object for items of type A.
 * @extends HTMLDivElement
 */
export interface Treexplorer<A> extends HTMLDivElement {
  /**
   * Collapse all nodes in the tree.
   */
  collapseAll: () => void;
  /**
   * Add an event listener for when a node is selected
   * @param callback callback with the selected item object as argument
   */
  addSelectListener: (callback: (object: A) => void) => void;
}

/**
 * @template A - The type of items in the tree.
 * @typedef {Object} TreexplorerExtra<A>
 * @property {() => void} collapseAll
 * @property {(callback: (object: A) => void) => void} addSelectListener
 */

/**
 * @template A - The type of items in the tree.
 * @typedef {HTMLDivElement & TreexplorerExtra<A>} Treexplorer<A>
 */

/**
 * Build a Treexplorer object for items of type A.
 * @template A - The type of items in the tree.
 * @param {A} object - The root item of type A to use as the root of the tree.
 * @param {(object: A) => string} getText - Get the text label of an item.
 * @param {(object: A) => string} getIconSrc - Get the icon source 'src' for the image to use as an icon for an item.
 * @param {(object: A) => string} getId - Get the id of an item.
 * @param {(object: A) => Promise<A[] | null>} getChildren - Get the children of an item or null if it is a leaf item. Must be async.
 * @returns {Treexplorer<A>} A Treexplorer object for items of type A.
 */
export default function treexplorer<A>(
  object: A,
  getText: (obj: A) => string,
  getIconSrc: (obj: A) => string,
  getId: (obj: A) => string,
  getChildren: (obj: A) => Promise<A[] | null>
): Treexplorer<A> {
  let elements: TreexplorerNode<A>[] = [];

  let container = buildTreexplorerMainDiv<A>();

  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role
  container.role = "tree";
  container.ariaMultiSelectable = "false";

  function select(node: TreexplorerNode<A>) {
    if (selected != null) {
      selected.toggleSelect(false);
    }
    node.toggleSelect(true);
    selected = node;
    selectCallbacks.forEach((cb) => {
      cb(node.object);
    });
  }
  function focus(node: TreexplorerNode<A>) {
    node.focus();
    focused = node;
  }

  function click(node: TreexplorerNode<A>) {
    node.toggleExpand(!node.isExpanded);
    select(node);
    focus(node);
  }

  function keydown(node: TreexplorerNode<A>, event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (node.isExpanded && node.children.length > 0) {
        node.children[0].focus();
      } else {
        focusNext(node);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (node.index > 0) {
        focusLastOf(node.siblings[node.index - 1]);
      } else {
        if (node.parent != null) {
          node.parent.focus();
        }
      }
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (!node.isLeaf) {
        if (!node.isExpanded) {
          node.toggleExpand(true);
        } else {
          if (node.children.length > 0) {
            node.children[0].focus();
          }
        }
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (node.isExpanded) {
        node.toggleExpand(false);
      } else {
        if (node.parent != null) {
          node.parent.focus();
        }
      }
    } else if (event.key === "Enter") {
      select(node);
      if (!node.isLeaf) {
        node.toggleExpand(!node.isExpanded);
      }
    }
  }

  function focusNext(node: TreexplorerNode<A>) {
    if (node.index < node.siblings.length - 1) {
      node.siblings[node.index + 1].focus();
    } else {
      if (node.parent != null) {
        focusNext(node.parent);
      }
    }
  }

  function focusLastOf(node: TreexplorerNode<A>) {
    if (node.isExpanded && node.children.length > 0) {
      focusLastOf(node.children[node.children.length - 1]);
    } else {
      node.focus();
    }
  }

  let selected: TreexplorerNode<A> | null = null;
  let focused: TreexplorerNode<A> | null = null;

  getChildren(object).then((children) => {
    container.innerHTML = "";
    if (children != undefined) {
      children.forEach((child, index) => {
        const node = new TreexplorerNode(
          0,
          index,
          null,
          elements,
          child,
          getText,
          getIconSrc,
          getId,
          getChildren,
          click,
          keydown
        );
        elements.push(node);
        container.appendChild(node.html());
      });
    }
  });

  container.collapseAll = () => {
    elements.forEach((e) => e.collapseAll());
  };

  const selectCallbacks: ((object: A) => void)[] = [];
  container.addSelectListener = (cb) => {
    selectCallbacks.push(cb);
  };

  return container;
}

class TreexplorerNode<A> {
  #container: HTMLDivElement;
  #nodeDiv: HTMLDivElement;
  #expandedDiv: HTMLDivElement;
  #textDiv: HTMLDivElement;
  #iconImg: HTMLImageElement;
  #childrenDiv: HTMLDivElement;

  getText: (obj: A) => string;
  getIconSrc: (obj: A) => string;
  getId: (obj: A) => string;
  getChildren: (obj: A) => Promise<A[] | null>;
  click: (object: TreexplorerNode<A>) => void;
  keydown: (object: TreexplorerNode<A>, event: KeyboardEvent) => void;

  id: string;

  depth: number;
  index: number;

  parent: TreexplorerNode<A> | null;
  siblings: TreexplorerNode<A>[];
  children: TreexplorerNode<A>[];

  isExpanded: boolean;
  isLeaf: boolean;
  isSelected: boolean;

  object: A;

  constructor(
    depth: number,
    index: number,
    parent: TreexplorerNode<A> | null,
    siblings: TreexplorerNode<A>[],
    object: A,
    getText: (obj: A) => string,
    getIconSrc: (obj: A) => string,
    getId: (obj: A) => string,
    getChildren: (obj: A) => Promise<A[] | null>,
    click: (object: TreexplorerNode<A>) => void,
    keydown: (object: TreexplorerNode<A>, event: KeyboardEvent) => void
  ) {
    this.id = crypto.randomUUID();

    this.depth = depth;
    this.index = index;

    this.parent = parent;
    this.siblings = siblings;
    this.children = [];

    this.isLeaf = true;
    this.isExpanded = false;
    this.isSelected = false;

    this.object = object;

    this.getText = getText;
    this.getIconSrc = getIconSrc;
    this.getId = getId;
    this.getChildren = getChildren;
    this.click = click;
    this.keydown = keydown;

    this.#expandedDiv = buildExpandedSymbolDiv();

    const labelText = getText(object);
    this.#textDiv = buildNodeTextDiv(labelText);

    const iconSrc = getIconSrc(object);
    this.#iconImg = buildNodeIconImg(iconSrc);

    this.#nodeDiv = buildTreexplorerNode(
      this.id,
      labelText,
      depth,
      index,
      this.#expandedDiv,
      iconSrc ? this.#iconImg : null,
      this.#textDiv
    );

    this.#nodeDiv.addEventListener("click", () => click(this));
    this.#nodeDiv.addEventListener("keydown", (e) => keydown(this, e));

    this.#childrenDiv = buildChildrenContainerDiv(this.id);

    this.#container = buildNodeContainerDiv(depth);
    this.#container.appendChild(this.#nodeDiv);
    this.#container.appendChild(this.#childrenDiv);

    getChildren(object).then((children) => {
      this.isLeaf = children == undefined;
      if (children == undefined) {
        this.#expandedDiv.innerHTML = "&nbsp;";
      } else {
        const nChildren = `${children.length}`;
        this.#nodeDiv.ariaSetSize = nChildren;
        this.#container.style.setProperty("--n-children", nChildren);
      }
    });
  }

  focus() {
    this.#nodeDiv.focus();
  }

  toggleSelect(select: boolean) {
    this.#nodeDiv.classList.toggle("selected", select);
    this.isSelected = select;
    this.#nodeDiv.ariaSelected = select ? "true" : "false";
  }

  async toggleExpand(expand: boolean) {
    if (this.isLeaf) {
      return;
    }
    if (!expand) {
      this.#childrenDiv.innerHTML = "";
      this.isExpanded = false;
      this.#expandedDiv.innerHTML = "&#x25B8";
      this.#childrenDiv.style.display = "none";
      this.#nodeDiv.ariaExpanded = "false";
    } else {
      const children = await this.getChildren(this.object);
      if (children != null) {
        children.forEach((child, index) => {
          const node = this.#buildChildNode(child, index);
          this.children.push(node);
          this.#childrenDiv.appendChild(node.html());
        });
      }
      this.isExpanded = true;
      this.#expandedDiv.innerHTML = "&#x25BE";
      this.#childrenDiv.style.display = "grid";
      this.#nodeDiv.ariaExpanded = "true";
    }
  }

  collapseAll() {
    this.toggleExpand(false);
    if (!this.isLeaf) {
      this.children.forEach((child) => child.collapseAll());
    }
  }

  #buildChildNode(child: A, index: number): TreexplorerNode<A> {
    let childNode = this.children.find(
      (node) => this.getId(node.object) == this.getId(child)
    );
    if (childNode == undefined) {
      childNode = new TreexplorerNode(
        this.depth + 1,
        index,
        this,
        this.children,
        child,
        this.getText,
        this.getIconSrc,
        this.getId,
        this.getChildren,
        this.click,
        this.keydown
      );
    }
    return childNode;
  }

  html(): HTMLDivElement {
    return this.#container;
  }
}

function buildTreexplorerMainDiv<A>(): Treexplorer<A> {
  const div = document.createElement("div") as Treexplorer<A>;
  div.classList.add("treexplorer-main");
  return div;
}

function buildExpandedSymbolDiv(): HTMLDivElement {
  const div = document.createElement("div");
  div.classList.add("treexplorer-node-expanded");
  div.innerHTML = "&#x25B8";
  return div;
}

function buildNodeTextDiv(text: string): HTMLDivElement {
  const div = document.createElement("div");
  div.classList.add("treexplorer-node-text");
  div.textContent = text;
  return div;
}

function buildNodeIconImg(src: string): HTMLImageElement {
  const img = document.createElement("img");
  img.classList.add("treexplorer-node-img");
  img.src = src;
  return img;
}

function buildTreexplorerNode(
  id: string,
  text: string,
  depth: number,
  index: number,
  expandSymbolDiv: HTMLDivElement,
  iconImg: HTMLImageElement | null,
  labelTextDiv: HTMLDivElement
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.classList.add("treexplorer-node");
  const div = document.createElement("div");
  div.classList.add("treexplorer-node-internal");
  wrapper.appendChild(div);
  div.appendChild(expandSymbolDiv);
  if (iconImg != null) {
    div.appendChild(iconImg);
  }
  div.appendChild(labelTextDiv);
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Treeitem_Role
  // div.role = "treeitem";
  wrapper.tabIndex = 0;
  wrapper.setAttribute("aria-owns", id);
  div.ariaLabel = text;
  div.ariaLevel = `${depth + 1}`;
  div.ariaPosInSet = `${index + 1}`;
  return wrapper;
}

function buildChildrenContainerDiv(id: string): HTMLDivElement {
  const div = document.createElement("div");
  div.id = id;
  div.classList.add("treexplorer-node-children");
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role
  div.role = "group";
  div.style.display = "none";
  return div;
}

function buildNodeContainerDiv(depth: number): HTMLDivElement {
  const div = document.createElement("div");
  div.classList.add("treexplorer-node-container");
  div.style.setProperty("--depth", `${depth}`);
  return div;
}
