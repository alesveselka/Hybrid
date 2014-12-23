/**
 * @class TileList
 * @extends DisplayObjectContainer
 * @param {string} direction
 * @param {number} windowSize
 * @constructor
 */
App.TileList = function TileList(direction,windowSize)
{
    PIXI.DisplayObjectContainer.call(this);

    this._direction = direction;
    this._windowSize = windowSize;
    this._items = [];

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
};

App.TileList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.TileList.prototype.constructor = App.TileList;

/**
 * Add item
 * @param {DisplayObject} item
 * @param {boolean} [updateLayout=false]
 */
App.TileList.prototype.add = function add(item,updateLayout)
{
    this._items[this._items.length] = item;

    this.addChild(item);

    if (updateLayout) this.updateLayout();
};

/**
 * Update X position
 * @param {number} position
 */
App.TileList.prototype.updateX = function updateX(position)
{
    this.x = Math.round(position);

    var i = 0,
        l = this._items.length,
        width = 0,
        x = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        width = child.boundingBox.width;
        x = this.x + child.x;

        child.visible = x + width > 0 && x < this._windowSize;
    }
};

/**
 * Update Y position
 * @param {number} position
 */
App.TileList.prototype.updateY = function updateY(position)
{
    this.y = Math.round(position);

    var i = 0,
        l = this._items.length,
        height = 0,
        y = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        height = child.boundingBox.height;
        y = this.y + child.y;

        child.visible = y + height > 0 && y < this._windowSize;
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 */
App.TileList.prototype.updateLayout = function updateLayout(updatePosition)
{
    var i = 0,
        l = this._items.length,
        child = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            child = this._items[i++];
            child.x = position;
            position = Math.round(position + child.boundingBox.width);
        }

        this.boundingBox.width = position;
        this.boundingBox.height = child.boundingBox.height;

        if (updatePosition) this.updateY(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            child = this._items[i++];
            child.y = position;
            position = Math.round(position + child.boundingBox.height);
        }

        this.boundingBox.height = position;
        this.boundingBox.width = child.boundingBox.width;

        if (updatePosition) this.updateY(this.y);
    }
};

App.TileList.prototype.destroy = function destroy()
{
    //TODO implement
};
