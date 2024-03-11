export function treexplorerLabelNode<T>(
  getLabelText: (o: T) => string
): (o: T) => HTMLElement {
  return (o) => {
    const div = document.createElement("div");
    div.style.whiteSpace = "nowrap";
    div.textContent = getLabelText(o);
    return div;
  };
}

export function treexplorerImageLabelNode<T>(
  getLabelText: (o: T) => string,
  getImageSrc: (o: T) => string
): (o: T) => HTMLElement {
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
