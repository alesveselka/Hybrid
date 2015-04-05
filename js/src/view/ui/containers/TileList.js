/**
 * @class TileList
 * @extends List
 * @param {string} direction
 * @param {number} windowSize
 * @constructor
 */
App.TileList = function TileList(direction,windowSize)
{
    App.List.call(this,direction);

    this._windowSize = windowSize;
};

App.TileList.prototype = Object.create(App.List.prototype);

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
        childX = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        width = child.boundingBox.width;
        childX = this.x + child.x;

        child.visible = childX + width > 0 && childX < this._windowSize;
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
        childY = 0,
        child = null;

    for (;i<l;)
    {
        child = this._items[i++];
        height = child.boundingBox.height;
        childY = this.y + child.y;

        child.visible = childY + height > 0 && childY < this._windowSize;
    }
};

/**
 * Update layout
 * @param {boolean} [updatePosition=false]
 */
App.TileList.prototype.updateLayout = function updateLayout(updatePosition)
{
    App.List.prototype.updateLayout.call(this);

    if (updatePosition)
    {
        if (this._direction === App.Direction.X) this.updateX(this.x);
        else if (this._direction === App.Direction.Y) this.updateY(this.y);
    }
};
