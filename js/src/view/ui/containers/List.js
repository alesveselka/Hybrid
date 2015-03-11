/**
 * @class List
 * @extends DisplayObjectContainer
 * @param {string} direction
 * @constructor
 */
App.List = function List(direction)
{
    PIXI.DisplayObjectContainer.call(this);

    this.boundingBox = new App.Rectangle();

    this._direction = direction;
    this._items = [];
};

App.List.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.List.prototype.constructor = App.List;

/**
 * Add item
 * @param {DisplayObject} item
 * @param {boolean} [updateLayout=false]
 * @returns {DisplayObject} returns item added
 */
App.List.prototype.add = function add(item,updateLayout)
{
    this._items[this._items.length] = item;

    this.addChild(item);

    if (updateLayout) this.updateLayout();

    return item;
};

/**
 * Remove item passed in
 * @param {DisplayObject} item
 */
App.List.prototype.remove = function remove(item)
{
    this.removeItemAt(this._items.indexOf(item));
};

/**
 * Remove item at index passed in
 * @param {number} index
 */
App.List.prototype.removeItemAt = function removeItemAt(index)
{
    var item = this._items.splice(index,1)[0];

    this.removeChild(item);

    return item;
};

/**
 * Return
 * @param {number} index
 */
App.List.prototype.getItemAt = function getItemAt(index)
{
    return this._items[index];
};

/**
 * Update layout
 */
App.List.prototype.updateLayout = function updateLayout()
{
    var i = 0,
        l = this._items.length,
        item = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.x = position;
            position = Math.round(position + item.boundingBox.width);
        }

        this.boundingBox.width = position;
        this.boundingBox.height = item.boundingBox.height;
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + item.boundingBox.height);
        }

        this.boundingBox.height = position;
        this.boundingBox.width = item.boundingBox.width;
    }
};

/**
 * Find and return item under point passed in
 * @param {InteractionData} data PointerData to get the position from
 */
App.List.prototype.getItemUnderPoint = function getItemUnderPoint(data)
{
    var position = data.getLocalPosition(this).x,
        boundsProperty = "width",
        itemPosition = 0,
        itemProperty = "x",
        item = null,
        i = 0,
        l = this._items.length;

    if (this._direction === App.Direction.Y)
    {
        position = data.getLocalPosition(this).y;
        itemProperty = "y";
        boundsProperty = "height";
    }

    for (;i<l;)
    {
        item = this._items[i++];
        itemPosition = item[itemProperty];
        if (itemPosition <= position && itemPosition + item.boundingBox[boundsProperty] >= position)
        {
            return item;
        }
    }

    return null;
};

/**
 * Test if position passed in falls within this list boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.List.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};

/**
 * @property length
 * @type number
 */
Object.defineProperty(App.List.prototype,'length',{
    get:function()
    {
        return this._items.length;
    }
});
