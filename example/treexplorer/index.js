/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function buildEmptyNode(id, path, object, parent) {
    const node = {
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
    return node;
}
function buildTreexplorerHTML() {
    const div = document.createElement("div");
    div.classList.add("treexplorer-main");
    div.role = "tree";
    div.ariaMultiSelectable = "false";
    div.style.setProperty("--indent-2", "var(--indent, 1rem)");
    div.style.setProperty("--arrow-div-width-2", "var(--arrow-div-width, 1.5rem)");
    div.style.setProperty("--children-line-width-2", "var(--children-line-width, 1px)");
    div.style.height = "100%";
    div.style.overflow = "auto";
    div.style.display = "grid";
    div.style.alignContent = "start";
    return div;
}
function buildTXN_HTML(id) {
    // main container
    const nodeContainer = document.createElement("div");
    nodeContainer.style.userSelect = "none";
    // item (stylizable)
    const item = document.createElement("div");
    item.id = id;
    item.classList.add("treexplorer-node");
    item.style.cursor = "pointer";
    item.style.display = "grid";
    item.style.gridTemplateColumns = "var(--arrow-div-width-2) auto";
    item.style.paddingLeft = "calc(var(--left-offset) * var(--indent-2))";
    item.role = "treeitem";
    item.setAttribute("aria-owns", `children_${id}`);
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
    children.id = `children_${id}`;
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
function expandOrFocusChild(node) {
    if (node.family.children != null) {
        if (node.expanded) {
            if (node.family.children.length > 0) {
                const rightNode = node.family.children[0];
                rightNode.HTML.item.focus();
            }
        }
        else {
            node.expanded = true;
            return true;
        }
    }
    return false;
}
function collapseOfFocusParent(node) {
    if (node.family.children != null && node.expanded) {
        node.expanded = false;
        return true;
    }
    else if (node.family.parent != null) {
        node.family.parent.HTML.item.focus();
    }
    return false;
}
function focusLast(node) {
    if (node.expanded &&
        node.family.children != null &&
        node.family.children.length > 0) {
        const lastChild = node.family.children[node.family.children.length - 1];
        focusLast(lastChild);
    }
    else {
        node.HTML.item.focus();
    }
}
function focusPrevious(node) {
    if (node.family.beforeSiblings.length > 0) {
        const previousNode = node.family.beforeSiblings[node.family.beforeSiblings.length - 1];
        focusLast(previousNode);
    }
    else {
        if (node.family.parent != null) {
            node.family.parent.HTML.item.focus();
        }
    }
}
function focusNext(node) {
    if (node.expanded &&
        node.family.children != null &&
        node.family.children.length > 0) {
        node.family.children[0].HTML.item.focus();
    }
    else if (node.family.afterSiblings.length > 0) {
        const nextNode = node.family.afterSiblings[0];
        nextNode.HTML.item.focus();
    }
    else {
        if (node.family.parent != null &&
            node.family.parent.family.afterSiblings.length > 0) {
            node.family.parent.family.afterSiblings[0].HTML.item.focus();
        }
    }
}

function treexplorerLabelNode(getLabelText) {
    return (o) => {
        const div = document.createElement("div");
        div.style.whiteSpace = "nowrap";
        div.textContent = getLabelText(o);
        return div;
    };
}
function treexplorerImageLabelNode(getLabelText, getImageSrc) {
    return (o) => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.gap = "0.5em";
        const img = document.createElement("img");
        img.src = getImageSrc(o);
        const txt = document.createElement("span");
        txt.style.whiteSpace = "nowrap";
        txt.textContent = getLabelText(o);
        div.appendChild(img);
        div.appendChild(txt);
        return div;
    };
}

function treexplorer(config) {
    let _config = Object.assign(Object.assign({ getChildren: (_) => null, getHTML: treexplorerLabelNode((o) => _config.getId(o)), getIsInteractive: (_) => true, hideRoots: false, autoCollapseSiblings: false }, config), { roots: [] });
    let _roots = [];
    const _nodes = new Map();
    let _selectedNode = null;
    let _selectListeners = [];
    let _visibilityOffset = 0;
    const _nodesToUpdate = new Set();
    function registerNodesForUpdate(...nodes) {
        nodes.forEach((n) => _nodesToUpdate.add(n));
    }
    function updateNodesToUpdates() {
        const nodesToUpdate = [..._nodesToUpdate.values()];
        _nodesToUpdate.clear();
        return updateMultipleTXN(nodesToUpdate, false);
    }
    function toggleSelect(node, select) {
        select = select === undefined ? !node.selected : select;
        if (node.selected != select) {
            if (_selectedNode) {
                _selectedNode.selected = false;
                registerNodesForUpdate(_selectedNode);
                _nodesToUpdate.add(_selectedNode);
            }
            node.selected = select;
            registerNodesForUpdate(node);
        }
        if (select) {
            _selectedNode = node;
            _selectListeners.forEach((cb) => {
                cb(node.object);
            });
        }
    }
    function toggleExpanded(node, expanded, recursive) {
        let _expanded = !node.expanded;
        if (expanded != undefined) {
            _expanded = expanded;
        }
        node.expanded = _expanded;
        registerNodesForUpdate(node);
        if (_config.autoCollapseSiblings && node.expanded) {
            const siblings = [
                ...node.family.afterSiblings,
                ...node.family.beforeSiblings,
            ];
            siblings.forEach((n) => toggleExpanded(n, false, false));
            registerNodesForUpdate(...siblings);
        }
        if (expanded != undefined &&
            expanded &&
            recursive != undefined &&
            recursive) {
            // recursion only:
            // - if expanded is set and is true
            // - if recursive is set and is true
            const parent = node.family.parent;
            if (parent != null) {
                toggleExpanded(parent, true, true);
            }
        }
    }
    function buildTXN(object, parent) {
        const id = _config.getId(object);
        const path = parent === null ? [] : [...parent.path, parent.id];
        const existingNode = _nodes.get(id);
        const node = existingNode != null
            ? existingNode
            : buildEmptyNode(id, path, object, parent);
        _nodes.set(node.id, node);
        return node;
    }
    function updateMultipleTXN(nodes, recursive = true) {
        const promises = nodes.map((n) => updateTXN(n, recursive));
        return Promise.all(promises);
    }
    function updateTXN(node_1) {
        return __awaiter(this, arguments, void 0, function* (node, recursive = true) {
            const activeElement = document.activeElement;
            // update interactivity
            node.HTML.item.classList.toggle("non-interactive", !_config.getIsInteractive(node.object));
            if (_config.getIsInteractive(node.object)) {
                node.HTML.item.tabIndex = 1;
                node.HTML.item.addEventListener("click", handleItemClicked);
                node.HTML.item.addEventListener("keydown", handleItemKeyDown);
            }
            else {
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
            }
            else {
                node.HTML.item.style.display = "grid";
            }
            // update html
            node.HTML.itemContent.innerHTML = "";
            node.HTML.itemContent.appendChild(_config.getHTML(node.object));
            // update children
            let childrenObjects = _config.getChildren(node.object);
            if (childrenObjects instanceof Promise) {
                childrenObjects = yield childrenObjects;
            }
            if (childrenObjects == null) {
                node.family.children = null;
                node.HTML.arrow.innerHTML = "";
                node.HTML.children.style.display = "none";
                node.HTML.children.innerHTML = "";
            }
            else {
                node.family.children = [];
                if (node.expanded || recursive) {
                    node.family.children = childrenObjects.map((o) => buildTXN(o, node));
                    node.HTML.children.innerHTML = "";
                    for (const child of node.family.children) {
                        yield updateTXN(child, recursive);
                    }
                }
                if (node.expanded) {
                    for (const child of node.family.children) {
                        node.HTML.children.appendChild(child.HTML.container);
                    }
                    // node.HTML.arrow.innerHTML = "&#x25BE";
                    node.HTML.arrow.innerHTML = "&#11167;";
                    node.HTML.children.style.display = "block";
                }
                else {
                    // node.HTML.arrow.innerHTML = "&#x25B8";
                    node.HTML.arrow.innerHTML = "&#11166;";
                    node.HTML.children.style.display = "none";
                }
            }
            // updating siblings
            const siblings = node.family.parent === null ? _roots : node.family.parent.family.children;
            if (siblings != null) {
                const index = siblings.findIndex((n) => n.id === node.id);
                node.family.beforeSiblings = siblings.slice(0, index);
                node.family.afterSiblings = siblings.slice(index + 1);
                node.HTML.item.ariaPosInSet = `${index}`;
            }
            // update select
            node.HTML.item.classList.toggle("selected", node.selected);
            if (activeElement != null) {
                activeElement.focus();
            }
        });
    }
    function handleItemClicked(e) {
        const targetElement = e.target;
        const nodeElement = targetElement.closest(".treexplorer-node");
        if (nodeElement == null) {
            return;
        }
        const node = _nodes.get(nodeElement.id);
        if (node == null) {
            return;
        }
        toggleSelect(node, true);
        toggleExpanded(node);
        updateNodesToUpdates();
    }
    function handleItemKeyDown(e) {
        const targetElement = e.target;
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
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            focusNext(node);
        }
        else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (expandOrFocusChild(node)) {
                updateTXN(node, false);
            }
        }
        else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (collapseOfFocusParent(node)) {
                updateTXN(node, false);
            }
        }
        else if (e.key === "Enter") {
            toggleSelect(node, true);
            toggleExpanded(node);
            updateNodesToUpdates();
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
    const tx = {
        HTML: buildTreexplorerHTML(),
        configure: (config) => {
            _config = Object.assign(Object.assign({}, _config), config);
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
                if (node != null)
                    updateTXN(node);
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
        collapseNode(id) {
            if (_nodes.has(id)) {
                const node = _nodes.get(id);
                if (node != null) {
                    toggleExpanded(node, false, false);
                }
            }
            return tx;
        },
        expandNode(id) {
            if (_nodes.has(id)) {
                const node = _nodes.get(id);
                if (node != null) {
                    toggleExpanded(node, true, false);
                }
            }
            return tx;
        },
        makeNodeVisible(id) {
            if (_nodes.has(id)) {
                const node = _nodes.get(id);
                if (node != null) {
                    const parentNode = node.family.parent;
                    if (parentNode != null) {
                        toggleExpanded(parentNode, true, true);
                        updateNodesToUpdates().then((_) => {
                            node.HTML.item.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                                inline: "nearest",
                            });
                        });
                    }
                    else {
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
                updateNodesToUpdates();
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
            if (node != null)
                return node.object;
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

export { treexplorer, treexplorerImageLabelNode, treexplorerLabelNode };
