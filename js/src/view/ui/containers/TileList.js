App.TileList = function TileList(direction,layout/*windowSize*/)
{
    PIXI.DisplayObjectContainer.call(this);
    //TODO just pass in collection and construct on the fly?
    this.width = 0;
    this.height = 0;

    this._direction = direction;
    //this._windowSize = windowSize;
    this._windowSize = layout.height;
    this._children = [];
    this._lastY = 0;
    this._topVisibleChildIndex = 0;

    this._layout = layout;
    this._childHeight = Math.round(50 * this._layout.pixelRatio);
};

App.TileList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.TileList.prototype.constructor = App.TileList;

App.TileList.prototype.add = function add(child)
{
    this._children[this._children.length] = child;
//    this._children.length = this._children.length + 1;

    //TODO do not add if outside of screen
    this.addChild(child);

    this._updateSize();//TODO postpone and update just once?
};

App.TileList.prototype.update = function update(position)
{
    this._lastY = this.y;//TODO also do X

    var Direction = App.Direction;
    if (this._direction === Direction.X) this.x = Math.round(position);
    else if (this._direction === Direction.Y) this.y = Math.round(position);

    this._updateTiles();
};

App.TileList.prototype._updateTiles = function _updateTiles()
{
    var i = 0,
        l = this._children.length,
        height = 0,
        y = 0,
        child = null/*,
        start = window.performance.now();*/

    //TODO also implement for X
    for (;i<l;)
    {
        child = this._children[i++];
        height = child.boundingBox.height;
        y = this.y + child.y;

        if (y + height > 0 && y < this._windowSize)
        {
            if (!this.contains(child)) this.addChild(child);
//            child.visible = true;
        }
        else
        {
            if (this.contains(child)) this.removeChild(child);
//            child.visible = false;
        }
    }

    //TODO also utilize POOL, for memory conservation?
    //TODO test performance with 1000+ and consider to use '_setTopVisibleChild' (and also include children withing 'change' distance)
};

//TODO rename
App.TileList.prototype._setTopVisibleChild = function _setTopVisibleChild(change)
{
    var i = this._topVisibleChildIndex;
    var child = this._children[i];

    if (change < 0)
    {
        while(child)
        {
            if (this.y + child.y > 0)
            {
                this._topVisibleChildIndex = i;
                return;
            }

            child = this._children[++i];
        }
    }
    else
    {
        while(child)
        {
            if (this.y + child.y < 0)
            {
                this._topVisibleChildIndex = i;
                return;
            }

            child = this._children[--i];
        }
    }
};

App.TileList.prototype._updateSize = function _updateSize()
{
    this.width = 0;
    this.height = 0;

    var i = 0,
        l = this._children.length,
        child = null,
        bounds = null,
        y = 0;

    for (;i<l;i++)
    {
        child = this._children[i];
        bounds = child.boundingBox;

        //TODO also implement X
        child.y = y;

        y = Math.round(y + bounds.height);
    }

    this.width = bounds.width;
//    this.width = this._layout.width;
    this.height = y;
//    this.height = this._children.length * this._childHeight;
};
