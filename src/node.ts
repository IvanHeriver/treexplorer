import type { TXN, TXN_HTML } from "./types";

export function buildEmptyNode<T>(
  id: string,
  path: string[],
  object: T,
  parent: TXN<T> | null,
  registerNodeForUpdate: (node: TXN<T>) => void,
  toggleSelect: (node: TXN<T>, select: boolean) => void
): TXN<T> {
  const node: TXN<T> = {
    id,
    path,
    object,
    HTML: buildTXN_HTML(id),
    family: {
      parent,
      children: null,
      beforeSiblings: [],
      afterSiblings: [],
    },
    expanded: false,
    selected: false,
  };
  setupNodeListneners(node, registerNodeForUpdate, toggleSelect);
  return node;
}

export function buildTreexplorerHTML(): HTMLElement {
  const div = document.createElement("div");
  div.classList.add("treexplorer-main");
  div.role = "tree";
  div.ariaMultiSelectable = "false";
  div.style.setProperty("--indent-2", "var(--indent, 1rem)");
  div.style.setProperty(
    "--arrow-div-width-2",
    "var(--arrow-div-width, 1.5rem)"
  );
  div.style.setProperty(
    "--children-line-width-2",
    "var(--children-line-width, 1px)"
  );
  div.style.height = "100%";
  div.style.overflow = "auto";
  div.style.display = "grid";
  div.style.alignContent = "start";
  return div;
}

export function buildTXN_HTML<T>(id: string): TXN_HTML {
  const indentSize = 2;
  const childrenLineWidthPx = 2;

  // main container
  const nodeContainer = document.createElement("div");
  nodeContainer.style.userSelect = "none";

  // item (stylizable)
  const item = document.createElement("div");
  item.classList.add("treexplorer-node");
  item.tabIndex = 1;
  item.style.cursor = "pointer";
  item.style.display = "grid";
  item.style.gridTemplateColumns = "var(--arrow-div-width-2) auto";
  item.style.paddingLeft = "calc(var(--left-offset) * var(--indent-2))";
  item.role = "treeitem";
  item.setAttribute("aria-owns", id);
  // item.ariaLabel = "" // don't know how to make that generic

  // item content (customizable)
  const itemContent = document.createElement("div");

  // arrow
  const arrow = document.createElement("div");
  arrow.style.display = "flex";
  arrow.style.alignItems = "center";
  arrow.style.justifyContent = "center";

  // children container
  const childrenContainer = document.createElement("div");
  childrenContainer.style.position = "relative";
  childrenContainer.style.display = "grid";
  childrenContainer.style.gridTemplateColumns = "1fr";

  // children
  const children = document.createElement("div");
  children.id = id;
  children.role = "group";

  // children line

  const childrenLine = document.createElement("div");
  childrenLine.classList.add("treexplorer-trunk-line");
  childrenLine.style.backgroundColor = "currentColor";
  childrenLine.style.zIndex = "1";
  childrenLine.style.position = "absolute";
  childrenLine.style.top = "0";
  childrenLine.style.left = `calc(
    var(--left-offset)  * var(--indent-2) +
    var(--arrow-div-width-2) / 2 -
    var(--children-line-width-2) / 2)`;
  childrenLine.style.width = `var(--children-line-width-2)`;
  childrenLine.style.bottom = "0";

  // hierarchy
  nodeContainer.appendChild(item);
  nodeContainer.appendChild(childrenContainer);
  item.appendChild(arrow);
  item.appendChild(itemContent);
  childrenContainer.appendChild(childrenLine);
  childrenContainer.appendChild(children);
  return {
    container: nodeContainer,
    arrow: arrow,
    item: item,
    itemContent: itemContent,
    children: children,
  };
}

function setupNodeListneners<T>(
  node: TXN<T>,
  registerNodeForUpdate: (node: TXN<T>) => void,
  toggleSelect: (node: TXN<T>, select: boolean) => void
) {
  node.HTML.item.addEventListener("pointerup", () => {
    node.expanded = !node.expanded;
    toggleSelect(node, true);
    registerNodeForUpdate(node);
  });
  node.HTML.item.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusPrevious(node);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusNext(node);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (node.family.children != null) {
        if (node.expanded) {
          if (node.family.children.length > 0) {
            const rightNode = node.family.children[0];
            rightNode.HTML.item.focus();
          }
        } else {
          node.expanded = true;
          registerNodeForUpdate(node);
        }
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (node.family.children != null && node.expanded) {
        node.expanded = false;
        registerNodeForUpdate(node);
      } else if (node.family.parent != null) {
        node.family.parent.HTML.item.focus();
      }
    } else if (event.key === "Enter") {
      node.expanded = !node.expanded;
      toggleSelect(node, true);
      registerNodeForUpdate(node);
    }
  });
}

function focusLast<T>(node: TXN<T>) {
  if (
    node.expanded &&
    node.family.children != null &&
    node.family.children.length > 0
  ) {
    const lastChild = node.family.children[node.family.children.length - 1];
    focusLast(lastChild);
  } else {
    node.HTML.item.focus();
  }
}
function focusPrevious<T>(node: TXN<T>) {
  if (node.family.beforeSiblings.length > 0) {
    const previousNode =
      node.family.beforeSiblings[node.family.beforeSiblings.length - 1];
    focusLast(previousNode);
  } else {
    if (node.family.parent != null) {
      node.family.parent.HTML.item.focus();
    }
  }
}
function focusNext<T>(node: TXN<T>) {
  if (
    node.expanded &&
    node.family.children != null &&
    node.family.children.length > 0
  ) {
    node.family.children[0].HTML.item.focus();
  } else if (node.family.afterSiblings.length > 0) {
    const nextNode = node.family.afterSiblings[0];
    nextNode.HTML.item.focus();
  } else {
    if (
      node.family.parent != null &&
      node.family.parent.family.afterSiblings.length > 0
    ) {
      node.family.parent.family.afterSiblings[0].HTML.item.focus();
    }
  }
}
