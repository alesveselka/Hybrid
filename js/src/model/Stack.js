/**
 * @class Stack
 * @constructor
 */
App.Stack = function Stack()
{
    this._source = [];
    this._top = 0;
};

/**
 * Push item into stack
 * @param {*} item
 */
App.Stack.prototype.push = function push(item)
{
    this._source[this._top++] = item;
};

/**
 * Remove item from top of the stack
 * @returns {*}
 */
App.Stack.prototype.pop = function pop()
{
    var item = this._source[this._top-1];

    if (item) this._source[--this._top] = null;

    return item;
};

/**
 * Peek what on top of the stack
 * @returns {*}
 */
App.Stack.prototype.peek = function peek(index)
{
    if (!index) index = 1;

    return this._source[this._top-index];
};

/**
 * Return size of the stack
 * @returns {number}
 */
App.Stack.prototype.length = function length()
{
    return this._top;
};

/**
 * Clear stack
 */
App.Stack.prototype.clear = function clear()
{
    this._top = 0;
};
