/**
 * Event type
 * @enum {string}
 * @return {{
 *      CHANGE_SCREEN:string,
 *      CHANGE_TRANSACTION:string,
 *      CHANGE_CATEGORY:string,
 *      CHANGE_SUB_CATEGORY:string,
 *      CREATE:string,
 *      CANCEL:string,
 *      CONFIRM:string,
 *      START:string,
 *      COMPLETE:string,
 *      UPDATE:string,
 *      PROGRESS:string,
 *      ERROR:string,
 *      CHANGE:string,
 *      LAYOUT_UPDATE:string,
 *      TICK:string,
 *      ADDED:string,
 *      REMOVED:string,
 *      RESIZE:string,
 *      MOUSE_ENTER:string,
 *      MOUSE_LEAVE:string,
 *      MOUSE_DOWN:string,
 *      MOUSE_UP:string,
 *      MOUSE_MOVE:string,
 *      CLICK:string,
 *      FOCUS:string,
 *      BLUR:string,
 *      KEY_PRESS:string,
 *      PASTE:string,
 *      TEXT_INPUT:string,
 *      INPUT:string}}
 */
App.EventType = {
    // Commands
    CHANGE_SCREEN:"CHANGE_SCREEN",
    CHANGE_TRANSACTION:"CHANGE_TRANSACTION",
    CHANGE_CATEGORY:"CHANGE_CATEGORY",
    CHANGE_SUB_CATEGORY:"CHANGE_SUB_CATEGORY",

    // App
    CREATE:"CREATE",
    CANCEL:"CANCEL",
    CONFIRM:"CONFIRM",
    START:"START",
    COMPLETE:"COMPLETE",
    UPDATE:"UPDATE",
    PROGRESS:"PROGRESS",
    ERROR:"ERROR",
    CHANGE:"change",
    LAYOUT_UPDATE:"LAYOUT_UPDATE",
    TICK:"TICK",

    // Collection
    ADDED:"ADDED",
    REMOVED:"REMOVED",

    // DOM
    RESIZE:"resize",
    MOUSE_ENTER:"mouseenter",
    MOUSE_LEAVE:"mouseleave",
    MOUSE_DOWN:"mousedown",
    MOUSE_UP:"mouseup",
    MOUSE_MOVE:"mousemove",
    CLICK:"click",
    FOCUS:"focus",
    BLUR:"blur",
    KEY_PRESS:"keypress",
    PASTE:"paste",
    TEXT_INPUT:"textInput",
    INPUT:"input"
};
