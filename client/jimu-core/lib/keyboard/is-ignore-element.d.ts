/**
 * If the element inner Keyboard component need to handle some keyboard event itself, the tag name should be added into this function to ignore the Keyboard component event listener,
 * otherwise, the Keyboard component may take over the keyboard event.
 * The tag name for web component will always different, should add them one by one.
 * eg: PageRender component has listened the command+keyv/ctrl+keyv event, your DOM inner PageRender will never listen the command+keyv/ctrl+keyv event unless you add it in the list below.
 * @param element
 * @returns
 */
declare const isIgnoreElement: (element: HTMLElement | Document) => boolean;
export default isIgnoreElement;
