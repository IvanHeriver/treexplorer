# treexplorer

A simple tree view explorer for tree-like structured data.
In a few words:

- each item is a text label with an optional leading icon and it can have children items
- it supports keybord navigation: tab, arrow keys and enter key
- it should properly support screenreaders but it hasn't been checked
- you can customize the appearance to match the context it is used in
- you can add listeners for when an item is selected

# How to install

## using npm

Install the library using npm:

```bash
npm install @ivanheriver/treexplorer
```

And then you can import the `treexplorer()` function

```js
import treexplorer from "@ivanheriver/treexplorer";
```

You also need to link the CSS file in your HTML head:

```html
<link
  rel="stylesheet"
  href="../node_modules/@ivanheriver/treexplorer/style.css"
/>
```

## manual

You can download the `dist` folder and use the `bundle.min.js` using an import statement and `style.css` files located inside by linking it in your HTML file.

# How to use

Make sure you somehow import the css file in your HTML.

Using npm you can import the treexplorer function:

```js
import treexplorer from "@ivanheriver/treexplorer";
```

or import it manually (say you put it in a `lib/treexplorer` folder)

```js
import treexplorer from "./lib/treexplorer/bundle.min.js";
```

The function must be fed an array of object, hereafter called `item`.
For any `item` (including any nested item with item), you need to be able to define the next four functions:

- `getLabel(item)` which return a string to display for the item
- `getIconSrc(item)` which return a string to use in the image icon to display for the item
- `getId(item)` which return a unique id for the item
- `async getChildren(item)` which returns null if it is a leaf item or an array if items (the array can be empty). This method must be async.

A basic usage of the library is illustrated below.

```js
const data = {
  children: [
    { label: "label" },
    { label: "item with children", children: [{ label: "a child" }] },
  ],
};

const tx = treexplorer(
  data,
  (item) => item.label,
  (item) => (item.children != null ? "./favicon.png" : ""),
  (item) => item.label,
  async (item) => (item.children ? item.children : null)
);

const container = document.querySelector(".container");
if (container) {
  container.appendChild(tx);
}

tx.addSelectListener((item) => {
  console.log(item);
});
```

A more complete example can be found in the `example` folder of this repo.

# customize appearance:

## overwrite CSS rules

You can overwrite the appearance by oiverwritting of some classes.
In particular the `treexplorer-node` class should be modified to match the context it is used in:

```css
.treexplorer-node {
  background-color: rgb(255, 137, 137, 0.1);
}
.treexplorer-node:hover {
  background-color: rgb(255, 137, 137, 0.5);
}
.treexplorer-node.selected {
  background-color: rgb(255, 137, 137);
}
.treexplorer-node:focus {
  outline: 1px solid black;
  outline-offset: -1px;
}
```

## set custom CSS properties

You can set custom CSS variable to customize the appareance.
It can be done either on the Treexplorer object (example below) or on a container object (either in js or in your HTML).

```js
const tx = treexplorer(...);
tx.style.setProperty("--indent-size", "1rem");
tx.style.setProperty("--gap-block", "0px");
tx.style.setProperty("--gap-inline", "0.25rem");
tx.style.setProperty("--padding", "0.25rem");
tx.style.setProperty("--trunk-color", "rgb(181, 198, 211)");
tx.style.setProperty("--trunk-width", "1px");
```
