import { treexplorer, treexplorerImageLabelNode } from "./treexplorer/index.js";

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

// let's use some synthetic data
// it is not necessary to use a class, but I find it more convenient
class TreeItem {
  constructor(children = null) {
    this.id = crypto.randomUUID();
    this.label = getRandomWord();
    this.children = children;
  }
}

function generateRandomTreeItem(maxDepth, p) {
  if (maxDepth <= 0 || Math.random() > p) {
    return new TreeItem();
  } else {
    const numChildren = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 5
    const children = Array.from({ length: numChildren }, () =>
      generateRandomTreeItem(maxDepth - 1, p)
    );
    return new TreeItem(children);
  }
}

function generateRandomTree(n = 5, depth = 10, p = 0.5) {
  return Array.from({ length: n }, () => generateRandomTreeItem(depth, p));
}

let treeRoots = generateRandomTree();

// build the Treexplorer object and append it the dom
const tx = treexplorer({
  roots: treeRoots,
  getId: (o) => o.id,
  getChildren: async (o) => o.children,
  getHTML: treexplorerImageLabelNode(
    (o) => o.label,
    (_) => "./favicon.png"
  ),
});
const container = document.querySelector(".treexplorer-container");
if (container) {
  container.appendChild(tx.HTML);
}

// reacting to selection change
const selectedLabelInfoDiv = document.querySelector(".selected-label");
tx.addSelectListener((o) => {
  selectedLabelInfoDiv.innerHTML = `
  Selected element is
   <b>${o.label}</b> <br>
   (<code>${o.id}</code>)
  `;
});

// collapsing/expanding all nodes
const collapseAllButton = document.getElementById("btn-collapse-all");
collapseAllButton.addEventListener("click", (_) => {
  tx.collapseAll().update();
});
const expandAllButton = document.getElementById("btn-expand-all");
expandAllButton.addEventListener("click", (_) => {
  tx.expandAll().update();
});

// toggling indentation width using a css class
const toggleIndentButton = document.getElementById("btn-indent-toggle");
toggleIndentButton.addEventListener("click", (_) => {
  container.classList.toggle("large-indent");
});

// unselecting current item
const unselectAllButton = document.getElementById("btn-unselect-all");
unselectAllButton.addEventListener("click", (_) => {
  tx.unselectAll();
});

// list of random words

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
        tx.setRoots(siblings).update();
      }
    }
  }
});

// changing an item text
const modifyTextButton = document.getElementById("btn-modify-text");
modifyTextButton.addEventListener("click", (_) => {
  const selected = tx.getSelectedNodeItem();
  if (selected != null) {
    selected.label = getRandomWord();
    tx.updateNode(selected.id);
  }
});

// using custom HTML
const customHTMLButton = document.getElementById("btn-custom-html");
customHTMLButton.addEventListener("click", (_) => {
  tx.setGetHTML((o) => {
    const div = document.createElement("div");
    div.innerHTML = `
    <b>${o.label}</b><code>${o.id.substring(0, 8)}</code>
    `;
    div.style.display = "flex";
    div.style.gap = "1rem";
    return div;
  }).update();
});

// changing an item text
const randomChildrenButton = document.getElementById("btn-make-random-tree");
randomChildrenButton.addEventListener("click", (_) => {
  treeRoots = generateRandomTree();
  tx.setRoots(treeRoots).update();
});
