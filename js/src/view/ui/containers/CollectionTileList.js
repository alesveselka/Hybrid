App.CollectionTileList = function CollectionTileList(collection,itemPool,layout,direction/*windowSize*/)
{
    PIXI.DisplayObjectContainer.call(this);
    //TODO just pass in collection and construct on the fly?
    this.width = 0;
    this.height = 0;

    this._direction = direction;
    //this._windowSize = windowSize;
    this._windowSize = layout.height;
//    this._children = [];
//    this._childrenLayout = [];
    this._lastY = 0;
    this._topVisibleChildIndex = 0;

    this._collection = collection;
    this._itemPool = itemPool;
    this._rectanglePool = App.ModelLocator.getProxy(App.ModelName.RECTANGLE_POOL);

    this._layout = layout;
    this._childHeight = Math.round(50 * this._layout.pixelRatio);

    var i = 0,
        l = this._collection.length(),
        item = this._itemPool.allocate(),
        childSize = item.init(this._collection.getItemAt(0),layout).boundingBox.height,
        childLayout = null,
        y = 0;

    this._children = new Array(l);
    this._childrenLayout = new Array(l);

    for (;i<l;i++)
    {
        childLayout = this._rectanglePool.allocate();
        this._childrenLayout[i] = childLayout;

        //TODO also implement X
        childLayout.y = i * childSize;
        childLayout.height = childSize;
        console.log(childLayout.y);
//        y = Math.round(y + bounds.height);
    }

    this._updateTiles();
};

App.CollectionTileList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CollectionTileList.prototype.constructor = App.CollectionTileList;

App.CollectionTileList.prototype.add = function add(child)
{
    this._children[this._children.length] = child;
    this._childrenLayout[this._childrenLayout.length] = this._rectanglePool.allocate();

    //TODO do not add if outside of screen
    this.addChild(child);

    this._updateLayout();//TODO postpone and update just once?
};

App.CollectionTileList.prototype.update = function update(position)
{
    this._lastY = this.y;//TODO also do X

    var Direction = App.Direction;
    if (this._direction === Direction.X) this.x = Math.round(position);
    else if (this._direction === Direction.Y) this.y = Math.round(position);

    this._updateTiles(); //TODO do not perform this if its bigger than screen and don't scroll
};

App.CollectionTileList.prototype._updateTiles = function _updateTiles()
{
    var i = 0,
        l = this._childrenLayout.length,
        height = 0,
        y = 0,
        child = null,
        childLayout = null;

    //TODO also implement for X
    for (;i<l;i++)
    {
        child = this._children[i];
        childLayout = this._childrenLayout[i];
        height = childLayout.height;
        y = this.y + childLayout.y;

        if (y > 0 && y < this._windowSize-height)
        {
            //console.log("child ",child);
            if (!child)
            {
                child = this._itemPool.allocate();
                child.init(this._collection.getItemAt(i),this._layout);
                child.y = childLayout.y;
                this._children[i] = child;
            }
            if (!this.contains(child)) this.addChild(child);
//            child.visible = true;
        }
        else
        {
            if (child)
            {
                if (this.contains(child)) this.removeChild(child);
                this._itemPool.release(child);
                child.reset();
                this._children[i] = null;
            }

            //TODO release
//            child.visible = false;
        }
    }

    this.height = 1500;

    //TODO also utilize POOL, for memory conservation?
    //TODO test performance with 1000+ and consider to use '_setTopVisibleChild' (and also include children withing 'change' distance)
};

//TODO rename
App.CollectionTileList.prototype._setTopVisibleChild = function _setTopVisibleChild(change)
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

App.CollectionTileList.prototype._updateLayout = function _updateLayout()
{
    console.log("_updateLayout");
//    this.width = 0;
//    this.height = 0;

    var i = 0,
        l = this._collection.length(),
        child = null,
        bounds = null,
        childLayout = null,
        y = 0;

    for (;i<l;i++)
    {
        child = this._children[i];
        childLayout = this._childrenLayout[i];

        //TODO also implement X
        child.y = y;

        bounds = child.boundingBox;
        childLayout.y = child.y;
        childLayout.width = bounds.width;
        childLayout.height = bounds.height;

        y = Math.round(y + bounds.height);
    }

//    this.width = bounds.width;
//    this.width = this._layout.width;
//    this.height = y;
//    this.height = this._children.length * this._childHeight;
};
