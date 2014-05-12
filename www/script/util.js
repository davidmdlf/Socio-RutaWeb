/* 
 * Utilities library.
 * 
 * @author David Miguel de la Fuente.
 */

/*
 * Replace all the occurrences of an element in a string to other given element.
 * 
 * @param text 
 *              text to search ocurrences within.
 * @param pattern 
 *              text to be searched.
 * @param replace
 *              character or string to replace each ocurrence with.
 * 
 * @return el texto con las ocurrencias reemplazadas.
 */
function replaceAll(text, pattern, replace) {
    while (text.toString().indexOf(pattern) !== - 1)
        text = text.toString().replace(pattern, replace);
    return text;
}
/*
 * Remove every child inside a DOM element.
 * @param element
 *              DOM element to remove its children.
 */
function removeAllChilds(element) {
    while (element.childElementCount != 0) {
        element.removeChild(element.firstChild);
    }
}
