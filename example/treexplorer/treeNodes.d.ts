export declare function treexplorerLabelNode<T>(getLabelText: (o: T) => string): (o: T) => HTMLElement;
export declare function treexplorerImageLabelNode<T>(getLabelText: (o: T) => string, getImageSrc: (o: T) => string): (o: T) => HTMLElement;
