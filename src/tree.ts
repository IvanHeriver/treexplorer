import {
  buildEmptyNode,
  buildTreexplorerHTML,
  collapseOfFocusParent,
  expandOrFocusChild,
  focusNext,
  focusPrevious,
} from "./node";
import { treexplorerLabelNode } from "./treeNodes";
import type { TX, TXN, TXSelectListener, TXConfig, TXConfig_ } from "./types";

export function treexplorer<T>(config: TXConfig<T>): TX<T> {
  let _config: TXConfig_<T> = {
    getChildren: (_) => null,
    getHTML: treexplorerLabelNode((o: T) => _config.getId(o)),
    getIsInteractive: (_) => true,
    hideRoots: false,
    autoCollapseSiblings: false,
    ...config,
    roots: [],
  };
  let _roots: TXN<T>[] = [];
  const _nodes: Map<string, TXN<T>> = new Map();

  let _selectedNode: TXN<T> | null = null;
  let _selectListeners: TXSelectListener<T>[] = [];

  let _visibilityOffset: number = 0;

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
  ): TXN<T>[] {
    let _expanded = !node.expanded;
    if (expanded != undefined) {
      _expanded = expanded;
    }
    node.expanded = _expanded;
    if (_config.autoCollapseSiblings && node.expanded) {
      const siblings = [
        ...node.family.afterSiblings,
        ...node.family.beforeSiblings,
      ];
      siblings.forEach((n) => toggleExpanded(n, false, false));
      return [...siblings, node];
    }
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
    return [node];
  }

  function buildTXN(object: T, parent: TXN<T> | null): TXN<T> {
    const id = _config.getId(object);
    const path = parent === null ? [] : [...parent.path, parent.id];
    const existingNode = _nodes.get(id);
    const node =
      existingNode != null
        ? existingNode
        : buildEmptyNode(id, path, object, parent);
    _nodes.set(node.id, node);
    return node;
  }

  function updateMultipleTXN(nodes: TXN<T>[]) {
    const promises = nodes.map((n) => updateTXN(n));
    return Promise.all(promises);
  }

  async function updateTXN(node: TXN<T>) {
    const activeElement = document.activeElement;

    // update interactivity
    node.HTML.item.classList.toggle(
      "non-interactive",
      !_config.getIsInteractive(node.object)
    );
    if (_config.getIsInteractive(node.object)) {
      node.HTML.item.tabIndex = 1;
      node.HTML.item.addEventListener("click", handleItemClicked);
      node.HTML.item.addEventListener("keydown", handleItemKeyDown);
    } else {
      node.HTML.item.tabIndex = -1;
      node.HTML.item.removeEventListener("click", handleItemClicked);
      node.HTML.item.removeEventListener("keydown", handleItemKeyDown);
    }

    // update indentation
    const depth = node.path.length - _visibilityOffset;
    node.HTML.container.style.setProperty("--left-offset", `${depth * 1}`);
    node.HTML.item.ariaLevel = `${depth}`;

    // hide if depth is below zero
    if (depth < 0) {
      node.HTML.item.style.display = "none";
    } else {
      node.HTML.item.style.display = "grid";
    }

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
      node.HTML.children.innerHTML = "";
    } else {
      node.family.children = [];
      node.family.children = childrenObjects.map((o) => buildTXN(o, node));
      node.HTML.children.innerHTML = "";
      for (const child of node.family.children) {
        await updateTXN(child);
      }
      if (node.expanded) {
        for (const child of node.family.children) {
          node.HTML.children.appendChild(child.HTML.container);
        }
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

  function handleItemClicked(e: PointerEvent) {
    const targetElement = e.target as HTMLDivElement;
    const nodeElement = targetElement.closest(".treexplorer-node");
    if (nodeElement == null) {
      return;
    }
    const node = _nodes.get(nodeElement.id);
    if (node == null) {
      return;
    }
    toggleSelect(node, true);
    const nodes = toggleExpanded(node);
    updateMultipleTXN(nodes);
  }

  function handleItemKeyDown(e: KeyboardEvent) {
    const targetElement = e.target as HTMLDivElement;
    const nodeElement = targetElement.closest(".treexplorer-node");
    if (nodeElement == null) {
      return;
    }
    const node = _nodes.get(nodeElement.id);
    if (node == null) {
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusPrevious(node);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusNext(node);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (expandOrFocusChild(node)) {
        updateTXN(node);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (collapseOfFocusParent(node)) {
        updateTXN(node);
      }
    } else if (e.key === "Enter") {
      toggleSelect(node, true);
      const nodes = toggleExpanded(node);
      updateMultipleTXN(nodes);
    }
  }

  function setRoots() {
    _roots = [];
    tx.HTML.innerHTML = "";
    if (!Array.isArray(_config.roots)) {
      _config.roots = [_config.roots];
    }
    _config.roots.forEach((r) => {
      const node = buildTXN(r, null);
      _roots.push(node);
      _nodes.set(node.id, node);
      tx.HTML.appendChild(node.HTML.container);
    });
    setRootVisibility();
  }

  function setRootVisibility() {
    _visibilityOffset = _config.hideRoots ? 1 : 0;
    _nodes.forEach((n) => {
      if (n.path.length < _visibilityOffset) {
        n.expanded = true;
      }
    });
    return tx;
  }

  const tx: TX<T> = {
    HTML: buildTreexplorerHTML(),
    configure: (config) => {
      _config = { ..._config, ...config };
      if (config.roots != undefined) {
        _nodes.clear();
        setRoots();
      }
      if (config.hideRoots != undefined) {
        setRootVisibility();
      }
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
        if (n.path.length >= _visibilityOffset) {
          n.expanded = false;
        }
      });
      return tx;
    },
    expandAll() {
      _nodes.forEach((n) => {
        n.expanded = true;
      });
      return tx;
    },
    collapseNode(id: string) {
      if (_nodes.has(id)) {
        const node = _nodes.get(id);
        if (node != null) {
          toggleExpanded(node, false, false);
        }
      }
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
          const parentNode = node.family.parent;
          if (parentNode != null) {
            const lastParentNodes = toggleExpanded(parentNode, true, true);
            updateMultipleTXN(lastParentNodes).then((_) => {
              node.HTML.item.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
              });
            });
          } else {
            node.HTML.item.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
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
    getRootItems() {
      return _roots.map((r) => r.object);
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
  tx.configure(config);
  tx.update();
  return tx;
}
