/**
 * Difference between VirtualList and InfiniteList is, that VirtualList doesn't repeat its items infinitely; it just scroll from first model to last.
 * Also, if there are less models than items items would fill, then VirtualList will not fill whole size and will not scroll
 *
 * @class VirtualList
 * @extends DisplayObjectContainer
 * @param {App.ObjectPool} itemPool
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.VirtualList = function VirtualList(itemPool,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var item = itemPool.allocate(),
        itemSize = direction === App.Direction.X ? item.boundingBox.width : item.boundingBox.height;

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);

    this._model = null;
    this._itemPool = itemPool;
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = [];
    this._itemSize = itemSize;
    this._virtualX = 0;
    this._virtualY = 0;

    itemPool.release(item);
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
        itemX = 0,
        item = null;

    this._virtualX = position;

    for (;i<l;)
    {
        item = this._items[i++];
        itemX = item.x + positionDifference;
        moveToBeginning = itemX > this._width && positionDifference > 0;
        moveToEnd = itemX + this._itemSize < 0 && positionDifference < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(itemX / this._width);
            itemX += itemScreenIndex * l * this._itemSize;
            xIndex = Math.floor(itemX / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (xIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (xIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(this._model[modelIndex]);
            }
            else
            {
                itemX = item.x + positionDifference;
            }
        }

        item.x = itemX;
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
        itemY = 0,
        item = null;

    this._virtualY = position;

    for (;i<l;)
    {
        item = this._items[i++];
        itemY = item.y + positionDifference;
        moveToBeginning = itemY > this._height && positionDifference > 0;
        moveToEnd = itemY + this._itemSize < 0 && positionDifference < 0;

        if (moveToBeginning || moveToEnd)
        {
            itemScreenIndex = -Math.floor(itemY / this._height);
            itemY += itemScreenIndex * l * this._itemSize;
            yIndex = Math.floor(itemY / this._itemSize);

            if (virtualIndex >= 0) modelIndex = (yIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (yIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            if ((moveToEnd && modelIndex > maxEnd) || (moveToBeginning && modelIndex < maxBeginning))
            {
                item.setModel(this._model[modelIndex]);
            }
            else
            {
                itemY = item.y + positionDifference;
            }
        }

        item.y = itemY;
    }
};

/**
 * Reset scroll position
 */
App.VirtualList.prototype.reset = function reset()
{
    var Direction = App.Direction,
        position = 0,
        item = null,
        i = 0,
        l = this._items.length;

    if (this._direction === Direction.X)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.x = position;
            item.setModel(this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;i++)
        {
            item = this._items[i];
            item.y = position;
            item.setModel(this._model[i]);
            position = Math.round(position + this._itemSize);
        }
    }
};

/**
 * Update
 * @param {Array.<App.transaction>} model
 */
App.VirtualList.prototype.update = function update(model)
{
    this._model = model;

    var Direction = App.Direction,
        itemCount = Math.ceil(this._width / this._itemSize) + 1,
        listSize = this._model.length * this._itemSize,
        item = null,
        position = 0,
        l = this._items.length,
        i = 0;

    this.boundingBox.width = listSize;

    // Remove items
    for (;i<l;i++)
    {
        this._itemPool.release(this.removeChild(this._items[i]));
        this._items[i] = null;
    }
    this._items.length = 0;

    // And add items again, according to model
    if (this._direction === Direction.X)
    {
        if (itemCount > this._model.length) itemCount = this._model.length;

        for (i=0,l=itemCount;i<l;i++)
        {
            item = this._itemPool.allocate();
            item.x = position;
            item.setModel(this._model[i]);
            this._items.push(item);
            this.addChild(item);
            position = Math.round(position + this._itemSize);
        }
    }
    else if (this._direction === Direction.Y)
    {
        itemCount = Math.ceil(this._height / this._itemSize) + 1;
        this.boundingBox.width = this._width;
        this.boundingBox.height = listSize;

        if (itemCount > this._model.length) itemCount = this._model.length;

        for (i=0,l=itemCount;i<l;i++)
        {
            item = this._itemPool.allocate();
            item.y = position;
            item.setModel(this._model[i]);
            this._items.push(item);
            this.addChild(item);
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

        if (updatePosition) this.updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            item = this._items[i++];
            item.y = position;
            position = Math.round(position + this._itemSize);
        }

        if (updatePosition) this.updateY(this.y);
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
