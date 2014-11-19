/**
 * @class EventListener
 * @param {number} index
 * @constructor
 */
App.EventListener = function EventListener(index)
{
    this.allocated = false;
    this.poolIndex = index;
    this.type = null;
    this.scope = null;
    this.handler = null;
};

/**
 * @method reset Reset item returning to pool
 */
App.EventListener.reset = function reset()
{
    this.allocated = false;
    this.poolIndex = -1;
    this.type = null;
    this.scope = null;
    this.handler = null;
};
