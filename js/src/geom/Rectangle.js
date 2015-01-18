/**
 * @class Rectangle
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @constructor
 */
App.Rectangle = function Rectangle(x,y,width,height)
{
    //this.allocated = false;
    //this.poolIndex = poolIndex;
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
};

/**
 * @method reset Reset item returning to pool
 */
/*App.EventListener.prototype.reset = function reset()
{
    this.allocated = false;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
};*/