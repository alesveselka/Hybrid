/**
 * @class InfiniteList
 * @extends DisplayObjectContainer
 * @param {Array} model
 * @param {Function} itemClass
 * @param {string} direction
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.InfiniteList = function InfiniteList(model,itemClass,direction,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var Direction = App.Direction,
        item = new itemClass(0,model[0],pixelRatio),
        itemSize = direction === Direction.X ? item.boundingBox.width : item.boundingBox.height,
        itemCount = direction === Direction.X ? Math.ceil(width / itemSize) + 1 : Math.ceil(height / itemSize) + 1,
        modelLength = model.length - 1,
        index = 0,
        i = 0;

    this.boundingBox = new PIXI.Rectangle(0,0,width,height);
    this.hitArea = this.boundingBox;

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._model = model;
    this._itemClass = itemClass;//TODO use pool instead of classes?
    this._direction = direction;
    this._width = width;
    this._height = height;
    this._pixelRatio = pixelRatio;
    this._items = new Array(itemCount);
    this._itemSize = itemSize;
    this._selectedModelIndex = -1;

    this._enabled = false;
    this._state = null;
    this._mouseData = null;
    this._virtualPosition = 0;
    this._oldMousePosition = 0.0;
    this._speed = 0.0;
    this._offset = 0.0;
    this._friction = 0.9;

    for (;i<itemCount;i++,index++)
    {
        if(index > modelLength) index = 0;
        if (i > 0) item = new itemClass(index,model[index],pixelRatio);

        this._items[i] = item;
        this.addChild(item);
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
        this._enabled = true;

        this._registerEventListeners();

        this.interactive = true;
    }
};

/**
 * Disable
 */
App.InfiniteList.prototype.disable = function disable()
{
    this.interactive = false;

    this._unRegisterEventListeners();

    this._enabled = false;
};

/**
 * Find and select item under position passed in
 * @param {number} position
 */
App.InfiniteList.prototype.selectItemByPosition = function selectItemByPosition(position)
{
    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        itemProperty = this._direction === App.Direction.X ? "x" : "y",
        item = null,
        itemPosition = 0;

    this._selectedModelIndex = -1;

    for (;i<l;)
    {
        item = this._items[i++];
        itemPosition = item[itemProperty];

        if (itemPosition <= position && itemPosition + itemSize > position)
        {
            this._selectedModelIndex = item.getModelIndex();
            break;
        }
    }

    for (i=0;i<l;) this._items[i++].select(this._selectedModelIndex);
};

/**
 * Cancel scroll
 */
App.InfiniteList.prototype.cancelScroll = function cancelScroll()
{
    this._speed = 0.0;
    this._state = null;
};

/**
 * Register event listeners
 * @private
 */
App.InfiniteList.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = this._onPointerDown;
        this.touchend = this._onPointerUp;
        this.touchendoutside = this._onPointerUp;
    }
    else
    {
        this.mousedown = this._onPointerDown;
        this.mouseup = this._onPointerUp;
        this.mouseupoutside = this._onPointerUp;
    }

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * UnRegister event listeners
 * @private
 */
App.InfiniteList.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = null;
        this.touchend = null;
        this.touchendoutside = null;
    }
    else
    {
        this.mousedown = null;
        this.mouseup = null;
        this.mouseupoutside = null;
    }
};

/**
 * REF Tick handler
 * @private
 */
App.InfiniteList.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;

    if (this._state === InteractiveState.DRAGGING) this._drag(App.Direction);
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.Direction);
};

/**
 * On pointer down
 * @param {InteractionData} data
 * @private
 */
App.InfiniteList.prototype._onPointerDown = function _onPointerDown(data)
{
    this._mouseData = data;

    var mousePosition = this._mouseData.getLocalPosition(this.stage).x;
    if (this._direction === App.Direction.Y) mousePosition = this._mouseData.getLocalPosition(this.stage).y;

    this._offset = mousePosition - this._virtualPosition;
    this._speed = 0.0;

    this._state = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 * @param {InteractionData} data
 * @private
 */
App.InfiniteList.prototype._onPointerUp = function _onPointerUp(data)
{
    this._state = App.InteractiveState.SCROLLING;

    this._mouseData = null;
};

/**
 * Perform drag operation
 * @param {{X:string,Y:string}} Direction
 * @private
 */
App.InfiniteList.prototype._drag = function _drag(Direction)
{
    if (this.stage)
    {
        if (this._direction === Direction.X)
        {
            var mousePosition = this._mouseData.getLocalPosition(this.stage).x;

            if (mousePosition <= -10000) return;

            this._updateX(mousePosition - this._offset);
        }
        else if (this._direction === Direction.Y)
        {
            mousePosition = this._mouseData.getLocalPosition(this.stage).y;

            if (mousePosition <= -10000) return;

            this._updateY(mousePosition - this._offset);
        }

        this._speed = mousePosition - this._oldMousePosition;
        this._oldMousePosition = mousePosition;
    }
};

/**
 * Perform scroll operation
 *
 * @param {{X:string,Y:string}} Direction
 * @private
 */
App.InfiniteList.prototype._scroll = function _scroll(Direction)
{
    if (this._direction === Direction.X) this._updateX(this._virtualPosition + this._speed);
    else if (this._direction === Direction.Y) this._updateY(this._virtualPosition + this._speed);

    // If the speed is very low, stop it.
    if (Math.abs(this._speed) < 0.1)
    {
        this._speed = 0.0;
        this._state = null;
    }
    else
    {
        this._speed *= this._friction;
    }
};

/**
 * Update X position
 * @param {number} position
 * @private
 */
App.InfiniteList.prototype._updateX = function _updateX(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        width = this._width,
        positionDifference = position - this._virtualPosition,
        itemScreenIndex = 0,
        virtualIndex = Math.floor(position / itemSize),
        xIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        x = 0,
        item = null;

    this._virtualPosition = position;

    for (;i<l;)
    {
        item = this._items[i++];
        x = item.x + positionDifference;

        if (x + itemSize < 0 || x > width)
        {
            itemScreenIndex = -Math.floor(x / width);
            x += itemScreenIndex * l * itemSize;
            xIndex = Math.floor(x / itemSize);

            if (virtualIndex >= 0) modelIndex = (xIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (xIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            item.setModel(modelIndex,this._model[modelIndex],this._selectedModelIndex);
        }

        item.x = x;
    }
};

/**
 * Update Y position
 * @param {number} position
 * @private
 */
App.InfiniteList.prototype._updateY = function _updateY(position)
{
    position = Math.round(position);

    var i = 0,
        l = this._items.length,
        itemSize = this._itemSize,
        height = this._height,
        positionDifference = position - this._virtualPosition,
        itemScreenIndex = 0,
        virtualIndex = Math.floor(position / itemSize),
        yIndex = 0,
        modelIndex = 0,
        modelLength = this._model.length,
        y = 0,
        item = null;

    this._virtualPosition = position;

    for (;i<l;)
    {
        item = this._items[i++];
        y = item.y + positionDifference;

        if (y + itemSize < 0 || y > height)
        {
            itemScreenIndex = -Math.floor(y / height);
            y += itemScreenIndex * l * itemSize;
            yIndex = Math.floor(y / itemSize);

            if (virtualIndex >= 0) modelIndex = (yIndex - (virtualIndex % modelLength)) % modelLength;
            else modelIndex = (yIndex - virtualIndex) % modelLength;
            if (modelIndex < 0) modelIndex = modelLength + modelIndex;
            else if (modelIndex >= modelLength) modelIndex = modelLength - 1;

            item.setModel(modelIndex,this._model[modelIndex],this._selectedModelIndex);
        }

        item.y = y;
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 * @private
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

        if (updatePosition) this._updateX(this.x);
    }
    else if (this._direction === Direction.Y)
    {
        for (;i<l;)
        {
            child = this._items[i++];
            child.y = position;
            position = Math.round(position + child.boundingBox.height);
        }

        if (updatePosition) this._updateY(this.y);
    }
};

/**
 * Test if position passed in falls within this list boundaries
 * @param {number} position
 * @returns {boolean}
 */
App.InfiniteList.prototype.hitTest = function hitTest(position)
{
    return position >= this.y && position < this.y + this.boundingBox.height;
};
