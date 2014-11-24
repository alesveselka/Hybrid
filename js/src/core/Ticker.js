/**
 * @class Ticker
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Ticker = function Ticker(eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this._rafId = -1;
    this._rafListener = this._raf.bind(this);
    this._isRunning = false;
};

App.Ticker.prototype = Object.create(App.EventDispatcher.prototype);
App.Ticker.prototype.constructor = App.Ticker;

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Ticker.prototype.addEventListener = function(eventType,scope,listener)
{
    App.EventDispatcher.prototype.addEventListener.call(this,eventType,scope,listener);

    if (!this._isRunning)
    {
        this._isRunning = true;

        this._rafId = window.requestAnimationFrame(this._rafListener);
    }
};

/**
 * Remove event listeners
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Ticker.prototype.removeEventListener = function(eventType,scope,listener)
{
    App.EventDispatcher.prototype.removeEventListener.call(this,eventType,scope,listener);

    if (this._listeners.length === 0)
    {
        window.cancelAnimationFrame(this._rafId);

        this._isRunning = false;
    }
};

/**
 * Remove all listeners
 */
App.Ticker.prototype.removeAllListeners = function()
{
    App.EventDispatcher.prototype.removeAllListeners.call(this);

    window.cancelAnimationFrame(this._rafId);

    this._isRunning = false;
};

/**
 * Animation function
 * @private
 */
App.Ticker.prototype._raf = function _raf()
{
    this._rafId = window.requestAnimationFrame(this._rafListener);

    this.dispatchEvent(App.EventType.TICK);
};