/**
 * @class LinkedList
 * @constructor
 */
App.LinkedList = function LinkedList()
{
    this._head = null;
    this._lastItem = null;
    this._length = 0;
};

App.LinkedList.prototype.constructor = App.LinkedList;

/**
 * @method push Add item to the end of a list
 * @param {{previous:Object,next:Object}} item
 */
App.LinkedList.prototype.push = function push(item)
{
    if (this._lastItem)
    {
        item.previous = this._lastItem;
        this._lastItem.next = item;
        this._lastItem = item;
    }
    else
    {
        this._head = item;
        this._lastItem = item;
    }

    this._length++;
};

/**
 * @method pop Removes last item from a list
 */
App.LinkedList.prototype.pop = function pop()
{
    if (this._lastItem)
    {
        var previous = this._lastItem.previous;
        if (previous) previous.next = null;

        this._lastItem.previous = null;
        this._lastItem.next = null;

        this._lastItem = previous;

        this._length--;
    }
};

/**
 * @method length Returns length of the list
 * @returns {number}
 */
App.LinkedList.prototype.length = function length()
{
    return this._length;
};