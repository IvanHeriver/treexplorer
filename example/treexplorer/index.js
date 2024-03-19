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

function buildEmptyNode(id, path, object, parent, registerNodeForUpdate, toggleSelect) {
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
    setupNodeListneners(node, registerNodeForUpdate, toggleSelect);
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
function setupNodeListneners(node, registerNodeForUpdate, toggleSelect) {
    node.HTML.item.addEventListener("pointerup", () => {
        node.expanded = !node.expanded;
        toggleSelect(node, true);
        registerNodeForUpdate(node);
    });
    node.HTML.item.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            focusPrevious(node);
        }
        else if (event.key === "ArrowDown") {
            event.preventDefault();
            focusNext(node);
        }
        else if (event.key === "ArrowRight") {
            event.preventDefault();
            if (node.family.children != null) {
                if (node.expanded) {
                    if (node.family.children.length > 0) {
                        const rightNode = node.family.children[0];
                        rightNode.HTML.item.focus();
                    }
                }
                else {
                    node.expanded = true;
                    registerNodeForUpdate(node);
                }
            }
        }
        else if (event.key === "ArrowLeft") {
            event.preventDefault();
            if (node.family.children != null && node.expanded) {
                node.expanded = false;
                registerNodeForUpdate(node);
            }
            else if (node.family.parent != null) {
                node.family.parent.HTML.item.focus();
            }
        }
        else if (event.key === "Enter") {
            node.expanded = !node.expanded;
            toggleSelect(node, true);
            registerNodeForUpdate(node);
        }
    });
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

function treexplorer(config) {
    const _config = Object.assign({}, config);
    const _roots = [];
    const _nodes = new Map();
    let _selectedNode = null;
    let _selectListeners = [];
    function toggleSelect(node, select) {
        select = select === undefined ? !node.selected : select;
        if (node.selected != select) {
            if (_selectedNode) {
                _selectedNode.selected = false;
                registerNodeForUpdate(_selectedNode);
            }
            node.selected = select;
            registerNodeForUpdate(node);
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
        if (expanded != undefined &&
            expanded &&
            recursive != undefined &&
            recursive) {
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
    function buildTXN(object, parent) {
        const id = _config.getId(object);
        const path = parent === null ? [] : [...parent.path, parent.id];
        const existingNode = _nodes.get(id);
        const node = existingNode != null
            ? existingNode
            : buildEmptyNode(id, path, object, parent, registerNodeForUpdate, toggleSelect);
        _nodes.set(node.id, node);
        return node;
    }
    const registeredUpdates = new Set();
    let registeredUpdateTimeOut;
    function registerNodeForUpdate(node) {
        registeredUpdates.add(node);
        updateRegisteredNodes();
    }
    function updateRegisteredNodes() {
        registeredUpdates.forEach((n) => {
            updateTXN(n);
        });
        registeredUpdates.clear();
        if (registeredUpdateTimeOut != null) {
            clearTimeout(registeredUpdateTimeOut);
        }
        registeredUpdateTimeOut = setTimeout(updateRegisteredNodes, 0);
    }
    function updateTXN(node) {
        return __awaiter(this, void 0, void 0, function* () {
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
                childrenObjects = yield childrenObjects;
            }
            if (childrenObjects == null) {
                node.family.children = null;
                node.HTML.arrow.innerHTML = "";
                node.HTML.children.style.display = "none";
            }
            else {
                node.family.children = [];
                node.family.children = childrenObjects.map((o) => buildTXN(o, node));
                node.HTML.children.innerHTML = "";
                for (const child of node.family.children) {
                    node.HTML.children.appendChild(child.HTML.container);
                    yield updateTXN(child);
                }
                if (node.expanded) {
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
        });
    }
    const tx = {
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
                registerNodeForUpdate(r);
            });
            return tx;
        },
        updateNode(id) {
            if (_nodes.has(id)) {
                const node = _nodes.get(id);
                if (node != null)
                    registerNodeForUpdate(node);
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
        makeNodeVisible(id) {
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
    tx.setGetId(_config.getId);
    tx.setGetChildren(_config.getChildren);
    tx.setGetHTML(_config.getHTML);
    tx.setRoots(_config.roots);
    tx.update();
    return tx;
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

export { treexplorer, treexplorerImageLabelNode, treexplorerLabelNode };
//# sourceMappingURL=index.js.map
