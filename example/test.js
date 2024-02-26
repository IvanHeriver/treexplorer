import treexplorer from "./treexplorer/bundle.js";

// it is not necessary to use a class, but I find it more convenient
class TreeItem {
  constructor(label, children = null) {
    this.label = label;
    this.children = children;
  }
}
const data = new TreeItem("", [
  new TreeItem("FirstItem"),
  new TreeItem("Second item"),
  new TreeItem("Third item"),
  new TreeItem("Fourth item", [
    new TreeItem("A sub item"),
    new TreeItem("A second sub item"),
    new TreeItem("A sub item which has children", [
      new TreeItem("First child"),
      new TreeItem("Second child", [
        new TreeItem("blabla"),
        new TreeItem("blablabla"),
        new TreeItem(
          "blablabla very long text that should make the item label wrap or overflow with scroll"
        ),
      ]),
    ]),
    new TreeItem("Another sub item"),
  ]),
  new TreeItem("Fith item"),
  new TreeItem("Another item", [
    new TreeItem("a child"),
    new TreeItem("another child"),
  ]),
  new TreeItem("And a last item"),
]);

const treex = treexplorer(
  data,
  (item) => item.label,
  (item) => (item.children != null ? "./favicon.png" : ""),
  (item) => item.label,
  async (item) => (item.children ? item.children : null)
);
const container = document.querySelector(".container");
if (container) {
  container.appendChild(treex);
}

const collapseAllBtn = document.getElementById("btn-collapse-all");
if (collapseAllBtn) {
  collapseAllBtn.addEventListener("click", (_) => {
    treex.collapseAll();
  });
}

let small = true;
const indentToggleBtn = document.getElementById("btn-indent-toggle");
if (indentToggleBtn) {
  indentToggleBtn.addEventListener("click", (_) => {
    treex.style.setProperty("--indent-size", small ? "5rem" : "1rem");
    small = !small;
  });
}

container.style.setProperty("--gap-block", "0.5rem");

const selectedLabelDiv = document.querySelector(".selected-label");
treex.addSelectListener((item) => {
  selectedLabelDiv.innerHTML = `Selected item is <code>${item.label}</code>`;
});
