import { buildEmptyNode, buildTreexplorerHTML } from "./node";
import type {
  Treexplorer,
  TXN,
  SelectListener,
  TreexplorerConfig,
} from "./types";

export function treexplorer<T>(config: TreexplorerConfig<T>): Treexplorer<T> {
  const _config: TreexplorerConfig<T> = { ...config };
  const _roots: TXN<T>[] = [];
  const _nodes: Map<string, TXN<T>> = new Map();

  let _selectedNode: TXN<T> | null = null;
  let _selectListeners: SelectListener<T>[] = [];

  function toggleSelect(node: TXN<T>, select?: boolean) {
    select = select === undefined ? !node.selected : select;
    if (node.selected != select) {
      if (_selectedNode) {
        _selectedNode.selected = false;
        updateTXN(_selectedNode);
      }
      node.selected = select;
      updateTXN(node);
    }
    if (select) {
      _selectedNode = node;
      _selectListeners.forEach((cb) => {
        cb(node.object);
      });
    }
  }

  function toggleExpanded(
    node: TXN<T>,
    expanded?: boolean,
    recursive?: boolean
  ): TXN<T> {
    let _expanded = !node.expanded;
    if (expanded != undefined) {
      _expanded = expanded;
    }
    node.expanded = _expanded;
    if (
      expanded != undefined &&
      expanded &&
      recursive != undefined &&
      recursive
    ) {
      // recursion only:
      // - if expanded is set and is true
      // - if recursive is set and is true
      const parent = node.family.parent;
      if (parent != null) {
        return toggleExpanded(parent, true, true);
      }
    }
    return node;
  }

  function buildTXN(object: T, parent: TXN<T> | null): TXN<T> {
    const id = _config.getId(object);
    const path = parent === null ? [] : [...parent.path, parent.id];
    const existingNode = _nodes.get(id);
    const node =
      existingNode != null
        ? existingNode
        : buildEmptyNode(id, path, object, parent, updateTXN, toggleSelect);
    _nodes.set(node.id, node);
    return node;
  }

  async function updateTXN(node: TXN<T>) {
    const activeElement = document.activeElement;

    // update indentation
    const depth = node.path.length;
    node.HTML.container.style.setProperty("--left-offset", `${depth * 1}`);
    node.HTML.item.ariaLevel = `${depth}`;
    // update html
    node.HTML.itemContent.innerHTML = "";
    node.HTML.itemContent.appendChild(_config.getHTML(node.object));
    // update children
    let childrenObjects = _config.getChildren(node.object);
    if (childrenObjects instanceof Promise) {
      childrenObjects = await childrenObjects;
    }
    if (childrenObjects == null) {
      node.family.children = null;
      node.HTML.arrow.innerHTML = "";
      node.HTML.children.style.display = "none";
    } else {
      node.family.children = [];
      node.family.children = childrenObjects.map((o) => buildTXN(o, node));
      node.HTML.children.innerHTML = "";
      for (const child of node.family.children) {
        node.HTML.children.appendChild(child.HTML.container);
        await updateTXN(child);
      }

      if (node.expanded) {
        // node.HTML.arrow.innerHTML = "&#x25BE";
        node.HTML.arrow.innerHTML = "&#11167;";
        node.HTML.children.style.display = "block";
      } else {
        // node.HTML.arrow.innerHTML = "&#x25B8";
        node.HTML.arrow.innerHTML = "&#11166;";
        node.HTML.children.style.display = "none";
      }
    }
    // updating siblings
    const siblings =
      node.family.parent === null ? _roots : node.family.parent.family.children;
    if (siblings != null) {
      const index = siblings.findIndex((n) => n.id === node.id);
      node.family.beforeSiblings = siblings.slice(0, index);
      node.family.afterSiblings = siblings.slice(index + 1);
      node.HTML.item.ariaPosInSet = `${index}`;
    }

    // update select
    node.HTML.item.classList.toggle("selected", node.selected);

    if (activeElement != null) {
      (activeElement as HTMLElement).focus();
    }
  }

  const tx: Treexplorer<T> = {
    HTML: buildTreexplorerHTML(),
    setRoots: (roots) => {
      _config.roots = roots;
      _roots.length = 0;
      tx.HTML.innerHTML = "";
      _config.roots.forEach((r) => {
        const node = buildTXN(r, null);
        _roots.push(node);
        tx.HTML.appendChild(node.HTML.container);
      });
      return tx;
    },
    setGetId(getId) {
      _config.getId = getId;
      return tx;
    },
    setGetHTML(getHTML) {
      _config.getHTML = getHTML;
      return tx;
    },
    setGetChildren(getChildren) {
      _config.getChildren = getChildren;
      return tx;
    },
    update() {
      _roots.forEach((r) => {
        updateTXN(r);
      });
      return tx;
    },
    updateNode(id) {
      if (_nodes.has(id)) {
        const node = _nodes.get(id);
        if (node != null) updateTXN(node);
      }
      return tx;
    },
    addSelectListener(onSelect) {
      _selectListeners = [..._selectListeners, onSelect];
      return tx;
    },
    removeSelectListener(onSelect) {
      _selectListeners = _selectListeners.filter((sl) => sl != onSelect);
      return tx;
    },
    collapseAll() {
      _nodes.forEach((n) => {
        n.expanded = false;
      });
      return tx;
    },
    expandAll() {
      _nodes.forEach((n) => {
        n.expanded = true;
      });
      return tx;
    },
    expandNode(id: string) {
      if (_nodes.has(id)) {
        const node = _nodes.get(id);
        if (node != null) {
          toggleExpanded(node, true, false);
        }
      }
      return tx;
    },
    makeNodeVisible(id: string) {
      if (_nodes.has(id)) {
        const node = _nodes.get(id);
        if (node != null) {
          const lastParentNode = toggleExpanded(node, true, true);
          updateTXN(lastParentNode).then((_) => {
            node.HTML.container.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          });
        }
      }
      return tx;
    },
    unselectAll() {
      if (_selectedNode) {
        toggleSelect(_selectedNode, false);
      }
      return tx;
    },
    setSelectedNodeItem(id) {
      if (_nodes.has(id)) {
        const node = _nodes.get(id);
        if (node != null) {
          toggleSelect(node, true);
          tx.makeNodeVisible(node.id);
        }
      }
      return tx;
    },
    getNodeItem(id) {
      const node = _nodes.get(id);
      if (node != null) return node.object;
      return null;
    },

    getSelectedNodeItem() {
      return _selectedNode === null ? null : _selectedNode.object;
    },
    getNodeItemFamily(id) {
      if (!_nodes.has(id)) {
        return null;
      }
      const node = _nodes.get(id);
      if (node == null) {
        return null;
      }
      const parent = node.family.parent;
      const prevSiblings = node.family.beforeSiblings;
      const nextSiblings = node.family.afterSiblings;
      const children = node.family.children;
      return {
        item: node.object,
        parent: parent == null ? null : parent.object,
        children: children == null ? null : children.map((c) => c.object),
        prevSiblings: prevSiblings.map((s) => s.object),
        nextSiblings: nextSiblings.map((s) => s.object),
      };
    },
  };
  tx.setGetId(_config.getId);
  tx.setGetChildren(_config.getChildren);
  tx.setGetHTML(_config.getHTML);
  tx.setRoots(_config.roots);
  tx.update();
  return tx;
}
