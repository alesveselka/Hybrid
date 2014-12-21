/**
 * @class Rectangle
 * @param {number} poolIndex
 * @constructor
 */
App.Rectangle = function Rectangle(poolIndex)
{
    this.allocated = false;
    this.poolIndex = poolIndex;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
};

/**
 * @method reset Reset item returning to pool
 */
App.EventListener.prototype.reset = function reset()
{
    this.allocated = false;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
};