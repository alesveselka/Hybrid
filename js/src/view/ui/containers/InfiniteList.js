/**
 * @class InfiniteList
 * @extends DisplayObjectContainer
 * @param {Array.<number>} model
 * @param {Function} itemClass
 * @param {string} direction
 * @param {number} windowSize
 * @param {number} pixelRatio
 * @constructor
 */
App.InfiniteList = function InfiniteList(model,itemClass,direction,windowSize,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var colorSample = new itemClass(model[0],pixelRatio),
        itemSize = colorSample.boundingBox.width,
        itemCount = Math.ceil(windowSize / itemSize),
        size = Math.round(50 * pixelRatio),
        Direction = App.Direction,
        padding = Math.round((size - itemSize) / 2),
        positionProperty = direction === Direction.X ? "y" : "x",
        i = 0;

    this.boundingBox = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL).allocate();
    if (direction === Direction.X)
    {
        this.boundingBox.width = windowSize;
        this.boundingBox.height = size;
    }
    else if (direction === Direction.Y)
    {
        this.boundingBox.width = size;
        this.boundingBox.height = windowSize;
    }

    this._model = model;
    this._itemClass = itemClass;//TODO use pool instead of classes?
    this._direction = direction;
    this._windowSize = windowSize;
    this._pixelRatio = pixelRatio;
    this._items = new Array(itemCount);
    this._virtualPosition = 0;
    this._itemSize = itemSize;
    this._modelIndex = 0;
    this._enabled = false;

    for (;i<itemCount;i++)
    {
        if (i > 0) colorSample = new itemClass(model[i],pixelRatio);

        this._items[i] = colorSample;
        colorSample[positionProperty] = padding;
        this.addChild(colorSample);
    }

    this._updateLayout(false);
};

App.InfiniteList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.InfiniteList.prototype.constructor = App.InfiniteList;

/**
 * Enable
 */
App.InfiniteList.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this.interactive = true;

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.InfiniteList.prototype.disable = function disable()
{
    this.interactive = false;

    this._enabled = false;
};

/**
 * Update X position
 * @param {number} position
 */
App.InfiniteList.prototype.updateX = function updateX(position)
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
App.InfiniteList.prototype.updateY = function updateY(position)
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
App.InfiniteList.prototype._updateLayout = function _updateLayout(updatePosition)
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

        if (updatePosition) this.updateY(this.y);
    }
};

App.InfiniteList.prototype.destroy = function destroy()
{
    //TODO implement
};
