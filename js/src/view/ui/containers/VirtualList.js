/**
 * Difference between VirtualList and InfiniteList is, that VirtualList doesn't repeat its items infinitely; it just scroll from first model to last.
 * Also, if there are less models than items items would fill, then VirtualList will not fill whole size and will not scroll
 *
 * @class VirtualList
 * @extends DisplayObjectContainer
 * @param {Array} model
 * @param {Function} itemClass
 * @param {Object} itemOptions
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.VirtualList = function VirtualList(model,itemClass,itemOptions,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var Direction = App.Direction,
        itemSize = direction === Direction.X ? itemOptions.width : itemOptions.height,
        itemCount = Math.ceil(width / itemSize) + 1,
        listSize = model.length * itemSize,
        modelLength = model.length - 1,
        item = null,
        index = 0,
        i = 0;

    this.boundingBox = new PIXI.Rectangle(0,0,listSize,height);

    if (direction === Direction.Y)
    {
        itemCount = Math.ceil(height / itemSize) + 1;
        this.boundingBox.width = width;
        this.boundingBox.height = listSize;
    }

    if (itemCount > model.length) itemCount = model.length;

    this._model = model;
    this._itemClass = itemClass;
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = new Array(itemCount);
    this._itemSize = itemSize;
    this._virtualX = 0;
    this._virtualY = 0;

    for (;i<itemCount;i++,index++)
    {
        if(index > modelLength) index = 0;
        item = new itemClass(index,model[index],itemOptions);

        this._items[i] = item;
        this.addChild(item);
    }

    this._updateLayout(false);
};

App.VirtualList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.VirtualList.prototype.constructor = App.VirtualList;

/**
 * Find and select item under point passed in
 * @param {InteractionData} pointerData
 */
App.VirtualList.prototype.getItemUnderPoint = function getItemUnderPoint(pointerData)
{
    var position = pointerData.getLocalPosition(this).x,
        Direction = App.Direction,
        i = 0,
        l = this._items.length,
        size = 0,
        itemPosition = 0,
        item = null;

    if (this._direction === Direction.X)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            itemPosition = item.x;
            size = item.boundingBox.width;
            if (itemPosition <= position && itemPosition + size >= position)
            {
                return item;
            }
        }
    }
    else if (this._direction === Direction.Y)
    {
        position = pointerData.getLocalPosition(this).y;

        for (;i<l;)
        {
            item = this._items[i++];
            itemPosition = item.y;
            size = item.boundingBox.height;
            if (itemPosition <= position && itemPosition + size >= position)
            {
                return item;
            }
        }
    }

    return null;
};

/**
 * Update X position
 * @param {number} position
 * @private
 */
App.VirtualList.prototype.updateX = function updateX(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        positionDifference = position - this._virtualX,
        virtualIndex = Math.floor(position / this._itemSize),
        itemScreenIndex = 0,
        xIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        maxEnd = l - 2,
        maxBeginning = modelLength - l,
        moveToEnd = false,
        moveToBeginning = false,
        x = 0,
        item = null;

    this._virtualX = position;

    for (;i<l;)
    {
        item = this._items[i++];
        x = item.x + positionDifference;
        moveToBeginning = x > this._width;
        moveToEnd = x + this._itemSize < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(x / this._width);
            x += itemScreenIndex * l * this._itemSize;
            xIndex = Math.floor(x / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (xIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (xIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(modelIndex,this._model[modelIndex]);
            }
            else
            {
                x = item.x + positionDifference;
            }
        }

        item.x = x;
    }
};

/**
 * Update Y position
 * @param {number} position
 * @private
 */
App.VirtualList.prototype.updateY = function updateY(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        positionDifference = position - this._virtualY,
        virtualIndex = Math.floor(position / this._itemSize),
        itemScreenIndex = 0,
        yIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        maxEnd = l - 2,
        maxBeginning = modelLength - l,
        moveToEnd = false,
        moveToBeginning = false,
        y = 0,
        item = null;

    this._virtualY = position;

    for (;i<l;)
    {
        item = this._items[i++];
        y = item.y + positionDifference;
        moveToBeginning = y > this._height;
        moveToEnd = y + this._itemSize < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(y / this._height);
            y += itemScreenIndex * l * this._itemSize;
            yIndex = Math.floor(y / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (yIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (yIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(modelIndex,this._model[modelIndex]);
            }
            else
            {
                y = item.y + positionDifference;
            }
        }

        item.y = y;
    }
};

/**
 * Reset scroll position
 */
App.VirtualList.prototype.reset = function reset()
{
    var i = 0,
        l = this._items.length,
        item = null,
        position = 0,
        Direction = App.Direction;

    if (this._direction === Direction.X)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.x = position;
            item.setModel(i,this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.y = position;
            item.setModel(i,this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 * @private
 */
App.VirtualList.prototype._updateLayout = function _updateLayout(updatePosition)
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
            position = Math.round(position + this._itemSize);
        }

//        if (updatePosition) this._updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + this._itemSize);
        }

//        if (updatePosition) this._updateY(this.y);
    }
};

/**
 * Return virtual property instead of real one
 *
 * @property x
 * @type Number
 */
Object.defineProperty(App.VirtualList.prototype,'x',{
    get: function() {
        return  this._virtualX;
    }
});

/**
 * Return virtual property instead of real one
 *
 * @property y
 * @type Number
 */
Object.defineProperty(App.VirtualList.prototype,'y',{
    get: function() {
        return  this._virtualY;
    }
});
