import { treexplorer, treexplorerImageLabelNode } from "./treexplorer/index.js";

// ******************************************************************
// let's use some synthetic data
// it is not necessary to use a class, but I find it more convenient
class TreeItem {
  constructor(children = null) {
    this.id = crypto.randomUUID();
    this.label = getRandomWord();
    this.children = children;
  }
}

function getRandomWord() {
  // prettier-ignore
  const randomWords = [
    'Snuggle', 'Giggly', 'Bumblebee', 'Cheeky', 'Doodle', 'Noodle', 'Whimsical', 'Bubbly', 'Wacky', 
    'Zany', 'Quirky', 'Cozy', 'Chuckle', 'Wobble', 'Snicker', 'Jumble', 'Tickle', 'Mingle', 'Quirk',  
    'Guffaw', 'Gleeful', 'Jovial', 'Muffin', 'Dizzy', 'Puddle', 'Zippy', 'Topsy-turvy', 'Nifty', 'Fluffy',
    'Chortle', 'Gobsmacked', 'Noodleoodle', 'Higgledy-piggledy', 'Jibberwocky', 'Sassafras', 'Squabble',
    'Brouhaha', 'Shenanigans', 'Pickle', 'Zigzag', 'Dingleberry', 'Gobbledygook','Hullabaloo peekaboo',
    'Bamboozle', 'Razzle-dazzle', 'Snickersnee', 'Kaleidoscope', 'Penguin', 'Malarkey', 'Hullabaloo',
    'Rambunctious', 'Lollygag', 'Hobnob', 'Kookaburra', 'Bamboozlement', 'Ballyhoo', 'Gobbledygook', 'Peppy',
    'Rigmarole', 'Skedaddle', 'Willy-nilly', 'Gobbledygook', 'Shenanigans', 'Flimflam', 'Penguin jamboree', 
    'Jibber-jabber', 'Mumbo-jumbo', 'Wigwag', 'Discombobulate', 'Shenanigans', 'Gobbledygook', 'Brouhaha',
    'Brouhaha', 'Bamboozle', 'Razzle-dazzle', 'Snickersnee', 'Jigglypuff', 'Brouhaha', 'Gobbledygook', 
    'Lollygag', 'Sassafras', 'Brouhaha', 'Rambunctious', 'Shenanigans', 'Bamboozle', 'Razzle-dazzle',
    'Flibbertigibbet', 'Quizzicalicious', 'Snickersnee', 'Wiggle and giggle', 'Tickle pickle', 'Spectacular',
    'Bumblebee jamboree', 'Jolly holly folly', 'Zigzag shuffle', 'Quirky turkey', 'Silly dilly', 'Jolly',
    'Funky monkey', 'Higgledy-piggledy dandy', 'Whimsical wobble', 'Gobble gobble', 'Noodle poodle',
    'Snicker snacker', 'Wobble gobble', 'Chuckle shuffle', 'Jibber jabber', 'Mingle jingle', 'Zany nanny',
    'Cozy dozy', 'Bubbly wobbly', 'Gleeful mischief', 'Fluffy stuffy', 'Razzle dazzle', 'Gobbledygook',
    'Dizzy izzy', 'Pickle tickle', 'Squabble wobble', 'Brouhaha lala', 'Shenanigans galore'
  ];
  return randomWords[Math.floor(Math.random() * randomWords.length)];
}

function generateRandomTreeItem(maxDepth, ...probabilities) {
  const p = probabilities.length > 0 ? probabilities[0] : 0;
  if (maxDepth <= 0 || Math.random() > p) {
    return new TreeItem();
  } else {
    const remainingProbabilities = probabilities.slice(1);
    const numChildren = Math.floor(Math.random() * 4) + 2;
    const children = Array.from({ length: numChildren }, () =>
      generateRandomTreeItem(maxDepth - 1, ...remainingProbabilities)
    );
    return new TreeItem(children);
  }
}

function getAllTreeItems(treeItems) {
  return treeItems
    .map((item) => {
      if (item.children != null) {
        return [item, ...getAllTreeItems(item.children)];
      } else {
        return [item];
      }
    })
    .flat();
}

let treeRoots = Array.from({ length: 10 }, () =>
  generateRandomTreeItem(
    10,
    0.75,
    ...Array(4).fill(0.5),
    ...Array(3).fill(0.25)
  )
);

// ******************************************************************
// build the Treexplorer object and append it to the DOM
const tx = treexplorer({
  roots: treeRoots,
  getId: (o) => o.id,
  getChildren: (o) => o.children,
  getHTML: treexplorerImageLabelNode(
    (o) => o.label,
    (_) => "./favicon.png"
  ),
});
const container = document.querySelector(".treexplorer-container");
if (container) {
  container.appendChild(tx.HTML);
}

// ******************************************************************
// reacting to selection change
const selectedLabelInfoDiv = document.querySelector(".selected-label");
tx.addSelectListener((o) => {
  selectedLabelInfoDiv.innerHTML = `
  Selected element is
   <b>${o.label}</b> <br>
   (<code>${o.id}</code>)
  `;
});

// ******************************************************************
// collapsing/expanding nodes
const collapseAllButton = document.getElementById("btn-collapse-all");
collapseAllButton.addEventListener("click", (_) => {
  tx.collapseAll().update();
});
const expandAllButton = document.getElementById("btn-expand-all");
expandAllButton.addEventListener("click", (_) => {
  tx.expandAll().update();
});
const selectRandomLeafNodeButton = document.getElementById(
  "btn-select-random-leaf"
);
selectRandomLeafNodeButton.addEventListener("click", (_) => {
  const allLeafNodes = getAllTreeItems(treeRoots).filter(
    (n) => n.children == null
  );
  const randomNode =
    allLeafNodes[Math.floor(Math.random() * allLeafNodes.length)];
  tx.setSelectedNodeItem(randomNode.id).makeNodeVisible(randomNode.id);
});
const selectRandomContainerNodeButton = document.getElementById(
  "btn-select-random-container"
);
selectRandomContainerNodeButton.addEventListener("click", (_) => {
  const allContainerNodes = getAllTreeItems(treeRoots).filter(
    (n) => n.children != null
  );
  const randomNode =
    allContainerNodes[Math.floor(Math.random() * allContainerNodes.length)];
  tx.setSelectedNodeItem(randomNode.id).makeNodeVisible(randomNode.id);
});

// ******************************************************************
// toggling indentation width using a css class
const toggleIndentCheckbox = document.getElementById("btn-indent-toggle");
toggleIndentCheckbox.addEventListener("change", (_) => {
  container.classList.toggle("large-indent"); // see style.css file
});

// ******************************************************************
// unselecting current item
const unselectAllButton = document.getElementById("btn-unselect-all");
unselectAllButton.addEventListener("click", (_) => {
  tx.unselectAll();
});

// ******************************************************************
// unselecting current item
const toggleAutoCollapseSiblingsButton = document.getElementById(
  "btn-auto-collapse-siblings"
);
let autoCollapseSiblings = false;
toggleAutoCollapseSiblingsButton.addEventListener("click", (_) => {
  autoCollapseSiblings = !autoCollapseSiblings;
  tx.configure({ autoCollapseSiblings: autoCollapseSiblings }).update();
});

// ******************************************************************
// adding items
const insertChildButton = document.getElementById("btn-insert-child");
insertChildButton.addEventListener("click", (_) => {
  const selected = tx.getSelectedNodeItem();
  if (selected != null) {
    if (selected.children == null) {
      selected.children = [];
    }
    selected.children.push(new TreeItem());
    tx.updateNode(selected.id);
  }
});

// ******************************************************************
// removing items
const removeSelectedButton = document.getElementById("btn-remove-selected");
removeSelectedButton.addEventListener("click", (_) => {
  const selected = tx.getSelectedNodeItem();
  if (selected != null) {
    const itemFamily = tx.getNodeItemFamily(selected.id);
    if (itemFamily != null) {
      const siblings = [...itemFamily.prevSiblings, ...itemFamily.nextSiblings];
      if (itemFamily.parent != null) {
        itemFamily.parent.children = siblings;
        tx.updateNode(itemFamily.parent.id);
      } else {
        tx.configure({ roots: siblings }).update();
      }
    }
  }
});

// ******************************************************************
// changing an item text
const modifyTextButton = document.getElementById("btn-modify-text");
modifyTextButton.addEventListener("click", (_) => {
  const selected = tx.getSelectedNodeItem();
  if (selected != null) {
    selected.label = getRandomWord();
    tx.updateNode(selected.id);
  }
});

// ******************************************************************
// using custom HTML
const customHTMLButton = document.getElementById("btn-custom-html");
customHTMLButton.addEventListener("click", (_) => {
  tx.configure({
    getHTML: (o) => {
      const div = document.createElement("div");
      div.innerHTML = `
      <b>${o.label}</b><code>${o.id.substring(0, 8)}</code>
      `;
      div.style.display = "flex";
      div.style.gap = "1rem";
      div.style.padding = "1rem";
      return div;
    },
  }).update();
});

// ******************************************************************
// changing an item text
const randomChildrenButton = document.getElementById("btn-make-random-tree");
randomChildrenButton.addEventListener("click", (_) => {
  treeRoots = generateRandomTreeItem(10, 1, ...Array(9).fill(0.5)); // single root item
  tx.configure({
    roots: treeRoots,
    hideRoots: true, // hide roots
  });
  tx.update();
});
