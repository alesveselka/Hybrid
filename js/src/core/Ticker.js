com.pond5.lib.core.Ticker = (function()
{
    var EventDispatcher = com.pond5.lib.event.EventDispatcher;
    var EventType = com.pond5.lib.enm.EventType;

    function Ticker()
    {
        EventDispatcher.call(this);

        this._rafId = -1;
        this._rafListener = _raf.bind(this);
        this._isRunning = false;

        _init.call(this);
    }

    Ticker.prototype = Object.create(EventDispatcher.prototype);
    Ticker.prototype.constructor = Ticker;
    var p = Ticker.prototype;

    /**
     * Add event listener
     * @param {string} eventType
     * @param {Object} scope
     * @param {Function} listener
     */
    p.addEventListener = function(eventType,scope,listener)
    {
        EventDispatcher.prototype.addEventListener.call(this,eventType,scope,listener);

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
    p.removeEventListener = function(eventType,scope,listener)
    {
        EventDispatcher.prototype.removeEventListener.call(this,eventType,scope,listener);

        if (!this._listeners.length)
        {
            window.cancelAnimationFrame(this._rafId);

            this._isRunning = false;
        }
    };

    /**
     * Remove all listeners
     */
    p.removeAllListeners = function()
    {
        EventDispatcher.prototype.removeAllListeners.call(this);

        window.cancelAnimationFrame(this._rafId);

        this._isRunning = false;
    };

    /**
     * Animation function
     * @private
     */
    function _raf()
    {
        this._rafId = window.requestAnimationFrame(this._rafListener);

        this.dispatchEvent(EventType.TICK);
    }

    /**
     * Init
     * @private
     */
    function _init()
    {
        window.requestAnimationFrame || (window.requestAnimationFrame =
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback,element)
        {
            return window.setTimeout(function() {
                callback(+new Date());
            }, 1000 / 60);
        });

        //TODO polyFill for 'cancelAnimationFrame'?
        /*window.cancelAnimationFrame = window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame;*/
    }

    return Ticker;
})();
