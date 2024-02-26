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

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var _TreexplorerNode_instances, _a, _TreexplorerNode_container, _TreexplorerNode_nodeDiv, _TreexplorerNode_expandedDiv, _TreexplorerNode_textDiv, _TreexplorerNode_iconImg, _TreexplorerNode_childrenDiv, _TreexplorerNode_buildChildNode;
/**
 * @template A - The type of items in the tree.
 * @typedef {Object} TreexplorerExtra<A>
 * @property {() => void} collapseAll
 * @property {(callback: (object: A) => void) => void} addSelectListener
 */
/**
 *  @template A - The type of items in the tree.
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
function treexplorer(object, getText, getIconSrc, getId, getChildren) {
    let elements = [];
    let container = buildTreexplorerMainDiv();
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role
    container.role = "tree";
    container.ariaMultiSelectable = "false";
    function select(node) {
        if (selected != null) {
            selected.toggleSelect(false);
        }
        node.toggleSelect(true);
        selected = node;
        selectCallbacks.forEach((cb) => {
            cb(node.object);
        });
    }
    function focus(node) {
        node.focus();
    }
    function click(node) {
        node.toggleExpand(!node.isExpanded);
        select(node);
        focus(node);
    }
    function keydown(node, event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (node.isExpanded && node.children.length > 0) {
                node.children[0].focus();
            }
            else {
                focusNext(node);
            }
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (node.index > 0) {
                focusLastOf(node.siblings[node.index - 1]);
            }
            else {
                if (node.parent != null) {
                    node.parent.focus();
                }
            }
        }
        else if (event.key === "ArrowRight") {
            event.preventDefault();
            if (!node.isLeaf) {
                if (!node.isExpanded) {
                    node.toggleExpand(true);
                }
                else {
                    if (node.children.length > 0) {
                        node.children[0].focus();
                    }
                }
            }
        }
        else if (event.key === "ArrowLeft") {
            event.preventDefault();
            if (node.isExpanded) {
                node.toggleExpand(false);
            }
            else {
                if (node.parent != null) {
                    node.parent.focus();
                }
            }
        }
        else if (event.key === "Enter") {
            select(node);
            if (!node.isLeaf) {
                node.toggleExpand(!node.isExpanded);
            }
        }
    }
    function focusNext(node) {
        if (node.index < node.siblings.length - 1) {
            node.siblings[node.index + 1].focus();
        }
        else {
            if (node.parent != null) {
                focusNext(node.parent);
            }
        }
    }
    function focusLastOf(node) {
        if (node.isExpanded && node.children.length > 0) {
            focusLastOf(node.children[node.children.length - 1]);
        }
        else {
            node.focus();
        }
    }
    let selected = null;
    getChildren(object).then((children) => {
        container.innerHTML = "";
        if (children != undefined) {
            children.forEach((child, index) => {
                const node = new TreexplorerNode(0, index, null, elements, child, getText, getIconSrc, getId, getChildren, click, keydown);
                elements.push(node);
                container.appendChild(node.html());
            });
        }
    });
    container.collapseAll = () => {
        elements.forEach((e) => e.collapseAll());
    };
    const selectCallbacks = [];
    container.addSelectListener = (cb) => {
        selectCallbacks.push(cb);
    };
    return container;
}
class TreexplorerNode {
    constructor(depth, index, parent, siblings, object, getText, getIconSrc, getId, getChildren, click, keydown) {
        _TreexplorerNode_instances.add(this);
        _TreexplorerNode_container.set(this, void 0);
        _TreexplorerNode_nodeDiv.set(this, void 0);
        _TreexplorerNode_expandedDiv.set(this, void 0);
        _TreexplorerNode_textDiv.set(this, void 0);
        _TreexplorerNode_iconImg.set(this, void 0);
        _TreexplorerNode_childrenDiv.set(this, void 0);
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
        __classPrivateFieldSet(this, _TreexplorerNode_expandedDiv, buildExpandedSymbolDiv(), "f");
        const labelText = getText(object);
        __classPrivateFieldSet(this, _TreexplorerNode_textDiv, buildNodeTextDiv(labelText), "f");
        const iconSrc = getIconSrc(object);
        __classPrivateFieldSet(this, _TreexplorerNode_iconImg, buildNodeIconImg(iconSrc), "f");
        __classPrivateFieldSet(this, _TreexplorerNode_nodeDiv, buildTreexplorerNode(this.id, labelText, depth, index, __classPrivateFieldGet(this, _TreexplorerNode_expandedDiv, "f"), iconSrc ? __classPrivateFieldGet(this, _TreexplorerNode_iconImg, "f") : null, __classPrivateFieldGet(this, _TreexplorerNode_textDiv, "f")), "f");
        __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").addEventListener("click", () => click(this));
        __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").addEventListener("keydown", (e) => keydown(this, e));
        __classPrivateFieldSet(this, _TreexplorerNode_childrenDiv, buildChildrenContainerDiv(this.id), "f");
        __classPrivateFieldSet(this, _TreexplorerNode_container, buildNodeContainerDiv(depth), "f");
        __classPrivateFieldGet(this, _TreexplorerNode_container, "f").appendChild(__classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f"));
        __classPrivateFieldGet(this, _TreexplorerNode_container, "f").appendChild(__classPrivateFieldGet(this, _TreexplorerNode_childrenDiv, "f"));
        getChildren(object).then((children) => {
            this.isLeaf = children == undefined;
            if (children == undefined) {
                __classPrivateFieldGet(this, _TreexplorerNode_expandedDiv, "f").innerHTML = "&nbsp;";
            }
            else {
                const nChildren = `${children.length}`;
                __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").ariaSetSize = nChildren;
                __classPrivateFieldGet(this, _TreexplorerNode_container, "f").style.setProperty("--n-children", nChildren);
            }
        });
    }
    focus() {
        __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").focus();
    }
    toggleSelect(select) {
        __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").classList.toggle("selected", select);
        this.isSelected = select;
        __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").ariaSelected = select ? "true" : "false";
    }
    toggleExpand(expand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isLeaf) {
                return;
            }
            if (!expand) {
                __classPrivateFieldGet(this, _TreexplorerNode_childrenDiv, "f").innerHTML = "";
                this.isExpanded = false;
                __classPrivateFieldGet(this, _TreexplorerNode_expandedDiv, "f").innerHTML = "&#x25B8";
                __classPrivateFieldGet(this, _TreexplorerNode_childrenDiv, "f").style.display = "none";
                __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").ariaExpanded = "false";
            }
            else {
                const children = yield this.getChildren(this.object);
                if (children != null) {
                    children.forEach((child, index) => {
                        const node = __classPrivateFieldGet(this, _TreexplorerNode_instances, "m", _TreexplorerNode_buildChildNode).call(this, child, index);
                        this.children.push(node);
                        __classPrivateFieldGet(this, _TreexplorerNode_childrenDiv, "f").appendChild(node.html());
                    });
                }
                this.isExpanded = true;
                __classPrivateFieldGet(this, _TreexplorerNode_expandedDiv, "f").innerHTML = "&#x25BE";
                __classPrivateFieldGet(this, _TreexplorerNode_childrenDiv, "f").style.display = "grid";
                __classPrivateFieldGet(this, _TreexplorerNode_nodeDiv, "f").ariaExpanded = "true";
            }
        });
    }
    collapseAll() {
        this.toggleExpand(false);
        if (!this.isLeaf) {
            this.children.forEach((child) => child.collapseAll());
        }
    }
    html() {
        return __classPrivateFieldGet(this, _TreexplorerNode_container, "f");
    }
}
_a = TreexplorerNode, _TreexplorerNode_container = new WeakMap(), _TreexplorerNode_nodeDiv = new WeakMap(), _TreexplorerNode_expandedDiv = new WeakMap(), _TreexplorerNode_textDiv = new WeakMap(), _TreexplorerNode_iconImg = new WeakMap(), _TreexplorerNode_childrenDiv = new WeakMap(), _TreexplorerNode_instances = new WeakSet(), _TreexplorerNode_buildChildNode = function _TreexplorerNode_buildChildNode(child, index) {
    let childNode = this.children.find((node) => this.getId(node.object) == this.getId(child));
    if (childNode == undefined) {
        childNode = new _a(this.depth + 1, index, this, this.children, child, this.getText, this.getIconSrc, this.getId, this.getChildren, this.click, this.keydown);
    }
    return childNode;
};
function buildTreexplorerMainDiv() {
    const div = document.createElement("div");
    div.classList.add("treexplorer-main");
    return div;
}
function buildExpandedSymbolDiv() {
    const div = document.createElement("div");
    div.classList.add("treexplorer-node-expanded");
    div.innerHTML = "&#x25B8";
    return div;
}
function buildNodeTextDiv(text) {
    const div = document.createElement("div");
    div.classList.add("treexplorer-node-text");
    div.textContent = text;
    return div;
}
function buildNodeIconImg(src) {
    const img = document.createElement("img");
    img.classList.add("treexplorer-node-img");
    img.src = src;
    return img;
}
function buildTreexplorerNode(id, text, depth, index, expandSymbolDiv, iconImg, labelTextDiv) {
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
function buildChildrenContainerDiv(id) {
    const div = document.createElement("div");
    div.id = id;
    div.classList.add("treexplorer-node-children");
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role
    div.role = "group";
    div.style.display = "none";
    return div;
}
function buildNodeContainerDiv(depth) {
    const div = document.createElement("div");
    div.classList.add("treexplorer-node-container");
    div.style.setProperty("--depth", `${depth}`);
    return div;
}

export { treexplorer as default };
