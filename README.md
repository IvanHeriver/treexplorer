# treexplorer

A simple tree view explorer for tree-like structured data.
In a few words:

- each item can be any HTML content you like. Defaults (text label, icon + text label) are provided if needed.
- it supports keybord navigation: tab, arrow keys and enter key
- it should properly support screenreaders but it hasn't been checked
- you can customize the appearance to match the context it is used in
- you can add listeners for when an item is selected
- you can update the tree any time your data changes

You can checkout an example at [https://ivanheriver.github.io/treexplorer/](https://ivanheriver.github.io/treexplorer/), which is the example located in the `example` folder of this repo.

# How to install

Install the library using npm:

```bash
npm install @ivanheriver/treexplorer
```

And then you can import the `treexplorer()` function:

```js
import { treexplorer } from "@ivanheriver/treexplorer";
```

You can also import default node HTML builders:

- `treexplorerLabelNode`: a simple text label
- `treexplorerImageLabelNode`: an image / icon followed by a text label

For example:

```js
import {
  treexplorer,
  treexplorerImageLabelNode,
} from "@ivanheriver/treexplorer";
```

# How to use

Checkout out the [demo](https://ivanheriver.github.io/treexplorer/) and associated code in the `example` folder for a full example.

The treexplorer function requires a config objects with the following structure:

```ts
type TXConfig<T> = {
  roots: T[] | T;
  getId: (o: T) => string;
  getChildren?: (o: T) => (T[] | null) | Promise<T[] | null>;
  getHTML?: (o: T) => HTMLElement;
  getIsInteractive?: (o: T) => boolean;
  hideRoots?: boolean;
  autoCollapseSiblings?: boolean;
};
```

where `T` is the type of a node in your data structure.
You need to be able to define at least:

- `roots`: either an array of `T` object or a single `T` object
- `getId`: given a node item of type `T` returns a unique identifier for this node

It is also often needed to define

- the `getChildren` function which given a node item of type `T` returns either `null` (if it is a leaf node) or an array of `T` objects. It can also be an async function.
- the `getHTML` function which given a node item of type `T`, returns and HTMLElement to use as the HTML content of the node.
  You can use one of the predefined `treexplorerLabelNode` or `treexplorerImageLabelNode` builder functions which both come with `treexplorer`.
  They require to define function to get the _label_ (and image _src_) given an item of type `T` much like `getId`, `getChildren` and `getHTML` functions.

Many examples on how to use the `treexplorer` are available in the file `example/test.js`.

Here is an example where each element of my tree data structured is supposed to have three components: `id`, `label` and `children`.

```js
import {
  treexplorer,
  treexplorerImageLabelNode,
} from "@ivanheriver/treexplorer";

const tx = treexplorer({
  roots: treeRoots,
  getId: (o) => o.id,
  getChildren: (o) => o.children,
  getHTML: (o) => {
    const div = document.createElement("div");
    div.innerHTML = `
    <b>${o.label}</b><code>${o.id.substring(0, 8)}</code>
    `;
    div.style.display = "flex";
    div.style.gap = "1rem";
    return div;
  },
});
const container = document.querySelector(".treexplorer-container");
if (container) {
  container.appendChild(tx.HTML);
}
```

# Customizing appearance

Chances are you'd like to modify the appearance of the tree view to match the context it used in.
Some CSS class can be used to modify the appearance:

- `.treexplorer-main`: only to set some CSS variable
  - `--indent`: indent size
  - `--children-line-width`: width of the line connecting children
  - `--arrow-div-width`: width of the arrow of parent nodes
- `.treexplorer-node`: styling of each node, including
  - `.treexplorer-node.selected` for selected nodes
  - `.treexplorer-node:hover` for the appearance on hover
  - `.treexplorer-node:focus` for the appearance when focused
- `.treexplorer-trunk-line`: to define the `color` of the vertical line connecting children

Here is an example:

```css
.treexplorer-main {
  --indent: 1rem;
}

.treexplorer-node {
  border-top: 0.25rem solid transparent;
  border-bottom: 0.25rem solid transparent;
  background-color: rgb(155, 137, 255, 0.1);
}

.treexplorer-node.selected {
  background-color: rgb(155, 137, 255);
}

.treexplorer-node:hover {
  background-color: rgb(155, 137, 255, 0.5);
}

.treexplorer-node:focus-within,
.treexplorer-node:focus {
  outline: none;
  border-top: 0.25rem solid white;
  border-bottom: 0.25rem solid white;
}

.treexplorer-trunk-line {
  color: lightblue;
}
```
