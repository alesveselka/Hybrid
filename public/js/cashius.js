/**
 * Function prototype bind polyfill
 * ! @source http://code.famo.us/lib/functionPrototypeBind.js
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

/**
 * Object.create() polyfill
 * ! @source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 */
if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (o === null) {
                throw Error('Cannot set a null [[Prototype]]');
            }
            if (typeof o != 'object') {
                throw TypeError('Argument must be an object');
            }
            F.prototype = o;
            return new F();
        };
    })();
}

/**
 * requestAnimationFrame polyfill
 */
window.requestAnimationFrame || (window.requestAnimationFrame =
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback)
    {
        return window.setTimeout(function() {
            callback();
        }, 1000 / 60);
    });

/**
 * @module App
 */
var App = App || {};

/** @type {{rgbToHex:Function,hexToRgb:Function}} */
App.MathUtils = {
    /**
     * Convert RGB values to HEX value
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {string}
     */
    rgbToHex:function(red,green,blue)
    {
        return ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    },

    /**
     * Convert HEX value to r, g, and b color component values
     * @param {string} hex
     * @returns {{r:Number,g:Number,b:Number}|null}
     */
    hexToRgb:function(hex)
    {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {r:parseInt(result[1],16),g:parseInt(result[2],16),b:parseInt(result[3],16)} : null;
    }
};

/**
 * Device
 * @type {{TOUCH_SUPPORTED:boolean}}
 */
App.Device = {
    TOUCH_SUPPORTED:('ontouchstart' in window) // iOS
        || (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) // IE10
        || (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) // IE11+
};

/**
 * Event type
 * @enum {string}
 * @return {{
 *      CHANGE_SCREEN:string,
 *      COMPLETE:string,
 *      UPDATE:string,
 *      PROGRESS:string,
 *      ERROR:string,
 *      CHANGE:string,
 *      LAYOUT_UPDATE:string,
 *      TICK:string,
 *      ADDED:string,
 *      REMOVED:string,
 *      RESIZE:string,
 *      MOUSE_ENTER:string,
 *      MOUSE_LEAVE:string,
 *      MOUSE_DOWN:string,
 *      MOUSE_UP:string,
 *      MOUSE_MOVE:string,
 *      CLICK:string}}
 */
App.EventType = {
    // Commands
    CHANGE_SCREEN:"CHANGE_SCREEN",

    // App
    COMPLETE:"COMPLETE",
    UPDATE:"UPDATE",
    PROGRESS:"PROGRESS",
    ERROR:"ERROR",
    CHANGE:"CHANGE",
    LAYOUT_UPDATE:"LAYOUT_UPDATE",
    TICK:"TICK",

    // Collection
    ADDED:"ADDED",
    REMOVED:"REMOVED",

    // DOM
    RESIZE:"resize",
    MOUSE_ENTER:"mouseenter",
    MOUSE_LEAVE:"mouseleave",
    MOUSE_DOWN:"mousedown",
    MOUSE_UP:"mouseup",
    MOUSE_MOVE:"mousemove",
    CLICK:"click"
};

/**
 * Model Proxy state
 * @enum {string}
 * @return {{TICKER:string,EVENT_LISTENER_POOL:string,ACCOUNTS:string,TRANSACTIONS:string,SETTINGS:string,FILTERS:string,CURRENCIES:string}}
 */
App.ModelName = {
    TICKER:"TICKER",
    EVENT_LISTENER_POOL:"EVENT_LISTENER_POOL",
    ACCOUNTS:"ACCOUNTS",
    TRANSACTIONS:"TRANSACTIONS",
    SETTINGS:"SETTINGS",
    FILTERS:"FILTERS",
    CURRENCIES:"CURRENCIES"
};

/**
 * View Segment state
 * @enum {string}
 * @return {{APPLICATION_VIEW:string,LOG:string}}
 */
App.ViewName = {
    APPLICATION_VIEW:"APPLICATION_VIEW",
    LOG:"LOG"
};

/**
 * Interactive state
 * @enum {string}
 * @return {{OVER:string,OUT:string,DRAGGING:string,SCROLLING:string,SNAPPING:string,SWIPING:string}}
 */
App.InteractiveState = {
    OVER:"OVER",
    OUT:"OUT",
    DRAGGING:"DRAGGING",
    SCROLLING:"SCROLLING",
    SNAPPING:"SNAPPING",
    SWIPING:"SWIPING"
};

/**
 * Transition state
 * @enum {string}
 * @return {{SHOWING:string,SHOWN:string,HIDING:string,HIDDEN:string}}
 */
App.TransitionState = {
    SHOWING:"SHOWING",
    SHOWN:"SHOWN",
    HIDING:"HIDING",
    HIDDEN:"HIDDEN"
};

/**
 * Scroll Policy
 * @enum {string}
 * @return {{ON:string,OFF:string,AUTO:string}}
 */
App.ScrollPolicy = {
    ON:"ON",
    OFF:"OFF",
    AUTO:"AUTO"
};


/**
 * Direction
 * @enum {string}
 * @return {{X:string,Y:string,LEFT:string,RIGHT:string}}
 */
App.Direction = {
    X:"x",
    Y:"y",
    LEFT:"LEFT",
    RIGHT:"RIGHT"
};

/**
 * Screen Name
 * @enum {number}
 * @return {{ACCOUNT:number,CATEGORY:number}}
 */
App.ScreenName = {
    ACCOUNT:0,
    CATEGORY:1
};

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
App.EventListener.prototype.reset = function reset()
{
    this.allocated = false;
    this.type = null;
    this.scope = null;
    this.handler = null;
};

/**
 * @class EventDispatcher
 * @constructor
 */
App.EventDispatcher = function EventDispatcher(listenerPool)
{
    this._listeners = [];
    this._listenersPool = listenerPool;
};

/**
 * Add event listener
 * @param	{string} eventType
 * @param	{Object} scope
 * @param	{Function} listener
 */
App.EventDispatcher.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    if (!this.hasEventListener(eventType,scope,listener))
    {
        var eventListener = this._listenersPool.allocate();
        eventListener.type = eventType;
        eventListener.scope = scope;
        eventListener.handler = listener;

        this._listeners[this._listeners.length] = eventListener;
    }
};

/**
 * @method hasEventListener
 * @param	{string} eventType
 * @param	{Object} scope
 * @param	{Function} handler
 * @return  {boolean}
 */
App.EventDispatcher.prototype.hasEventListener = function hasEventListener(eventType,scope,handler)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;)
    {
        listener = this._listeners[i++];
        if (listener.type === eventType && listener.scope === scope && listener.handler === handler)
        {
            listener = null;

            return true;
        }
    }
    listener = null;

    return false;
};

/**
 * Remove event listener
 * @param	{String} eventType
 * @param	{Object} scope
 * @param	{Function} handler
 */
App.EventDispatcher.prototype.removeEventListener = function removeEventListener(eventType,scope,handler)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;i++)
    {
        listener = this._listeners[i];
        if (listener.type === eventType && listener.scope === scope && listener.handler === handler)
        {
            this._listenersPool.release(listener);
            listener.reset();

            this._listeners.splice(i,1);

            break;
        }
    }
    listener = null;
};

/**
 * Remove all listeners
 */
App.EventDispatcher.prototype.removeAllListeners = function removeAllListeners()
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;i++)
    {
        listener = this._listeners[i];

        this._listenersPool.release(listener);
        listener.reset();

        this._listeners.splice(i,1);
    }
    listener = null;
    this._listeners.length = 0;
};

/**
 * Dispatch event
 * @param {string} eventType
 * @param {Object|null} data
 */
App.EventDispatcher.prototype.dispatchEvent = function dispatchEvent(eventType,data)
{
    var i = 0, l = this._listeners.length, listener = null;
    for (;i<l;)
    {
        listener = this._listeners[i++];
        if (listener && listener.type === eventType)
        {
            listener.handler.call(listener.scope,data,eventType);
        }
    }
    listener = null;
};

/**
 * @method pipe Link incoming and outcoming events; dispatch incoming events further
 * @param {Object} target
 * @param {string} eventType
 */
App.EventDispatcher.prototype.pipe = function pipe(target,eventType)
{
    target.addEventListener(eventType,this,this._pipeListener);
};

/**
 * @method unpipe Remove event target from pipe
 * @param {Object} target
 * @param {string} eventType
 */
App.EventDispatcher.prototype.unPipe = function unPipe(target,eventType)
{
    target.removeEventListener(eventType,this,this._pipeListener);
};

/**
 * @method pipeListener Listens for events piped in, and dispatch them further
 * @param {string} eventType
 * @param {Object|null} data
 * @private
 */
App.EventDispatcher.prototype._pipeListener = function _pipeListener(data,eventType)
{
    this.dispatchEvent(eventType,data);
};

/**
 * Destroy
 */
App.EventDispatcher.prototype.destroy = function destroy()
{
    this.removeAllListeners();

    this._listeners.length = 0;
    this._listeners = null;
    this._listenersPool = null;
};

/**
 * @class ModelLocator
 * @type {{_proxies:Object,addProxy:Function,hasProxy:Function,getProxy:Function}}
 */
App.ModelLocator = {
    _proxies:{},

    /**
     * @method addPoxy Add proxy to the locator
     * @param {string} proxyName
     * @param {*} proxy
     */
    addProxy:function addProxy(proxyName,proxy)
    {
        if (this._proxies[proxyName]) throw Error("Proxy "+proxyName+" already exist");

        this._proxies[proxyName] = proxy;
    },

    /**
     * @method hasProxy Check if proxy already exist
     * @param {string} proxyName
     * @return {boolean}
     */
    hasProxy:function hasProxy(proxyName)
    {
        return this._proxies[proxyName];
    },

    /**
     * @method getProxy Returns proxy by name passed in
     * @param {string} proxyName
     * @return {*}
     */
    getProxy:function getProxy(proxyName)
    {
        return this._proxies[proxyName];
    }
};
/**
 * @class ObjectPool
 * @param {Function} objectClass
 * @param {number} size
 * @constructor
 */
App.ObjectPool = function ObjectPool(objectClass,size)
{
    this._objectClass = objectClass;
    this._size = size;
    this._items = [];
    this._freeItems = [];
};

/**
 * Pre-allocate objectClass instances
 */
App.ObjectPool.prototype.preAllocate = function preAllocate()
{
    var oldSize = this._items.length,
        newSize = oldSize + this._size;

    this._items.length = newSize;

    for (var i = oldSize;i < newSize;i++)
    {
        this._items[i] = new this._objectClass(i);
        this._freeItems.push(i);
    }
};

/**
 * @method allocate Allocate object instance
 * @returns {{poolIndex:number,allocated:boolean}}
 */
App.ObjectPool.prototype.allocate = function allocate()
{
    if (this._freeItems.length === 0) this.preAllocate();

    var index = this._freeItems.shift();
    var item = this._items[index];

    item.allocated = true;

    return item;
};

/**
 * @method release Release item into pool
 * @param {{poolIndex:number,allocated:boolean}} item
 */
App.ObjectPool.prototype.release = function release(item)
{
    item.allocated = false;

    this._freeItems.push(item.poolIndex);
};

/**
 * @class Collection
 * @param {Array} source
 * @param {Function} itemConstructor
 * @param {Object} parent
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Collection = function Collection(source,itemConstructor,parent,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    if (source)
    {
        var i = 0, l = source.length;

        this._items = new Array(l);

        for (;i<l;i++) this._items[i] = new itemConstructor(source[i],this,parent);
    }

    if (!this._items) this._items = [];
    this._currentItem = null;
    this._currentIndex = -1;
};

App.Collection.prototype = Object.create(App.EventDispatcher.prototype);
App.Collection.prototype.constructor = App.Collection;

/**
 * @method addItem Add item into collection
 * @param {*} item
 */
App.Collection.prototype.addItem = function addItem(item)
{
    this._items[this._items.length] = item;

    this.dispatchEvent(App.EventType.ADDED,item);
};

/**
 * @method setCurrent Set current item of collection
 * @param {*} value	item to set as current
 * @param {?boolean} [force=null]	force to execute the method, even if the value is same as current item
 */
App.Collection.prototype.setCurrent = function setCurrent(value,force)
{
    if (value === this._currentItem && !force) return;

    //var data = {oldItem:this._currentItem};

    this._currentItem = value;
    this._updateCurrentIndex();

    //data.currentItem = this._currentItem;

    this.dispatchEvent(App.EventType.CHANGE,data);
};

/**
 * @method getCurrent Returns current item
 * @returns {null|*}
 */
App.Collection.prototype.getCurrent = function getCurrent()
{
    return this._currentItem;
};

/**
 * @method getItemAt Return item at index passed in
 * @param {number} index
 * @return {*} item
 */
App.Collection.prototype.getItemAt = function getItemAt(index)
{
    return this._items[index];
};

/**
 * @method previous Return previous item
 * @returns {*}
 */
App.Collection.prototype.previous = function previous()
{
    var index = this._currentIndex;
    if (index === -1) index = 0;

    if (index <= 0) index = this._items.length - 1;
    else index -= 1;

    return this._items[index];
};

/**
 * @method next Return next item
 * @returns {*}
 */
App.Collection.prototype.next = function next()
{
    var index = this._currentIndex;

    if (index === -1 || index >= this._items.length-1) index = 0;
    else index += 1;

    return this._items[index];
};

/**
 * @method other Go to either prev or next item, based on delta passed in
 * @param {number} delta
 */
App.Collection.prototype.other = function other(delta)
{
    var l = this._items.length;

    return this._items[this._currentIndex + l + delta] % l;
};

/**
 * @method hasItem Check if the item is already in collection
 * @param {*} item
 * @return {boolean}
 */
App.Collection.prototype.hasItem = function hasItem(item)
{
    return this.indexOf(item) > -1;
};

/**
 * @method removeItemAt Remove item at index passed in
 * @return {*} item
 */
App.Collection.prototype.removeItemAt = function removeItemAt(index)
{
    var item = this._items.splice(index,1)[0];

    this._updateCurrentIndex();

    this.dispatchEvent(App.EventType.REMOVED,item);

    return item;
};

/**
 * @method updateCurrentIndex Return currentItem's index
 * @private
 */
App.Collection.prototype._updateCurrentIndex = function _updateCurrentIndex()
{
    this._currentIndex = this.indexOf(this._currentItem);
};

/**
 * @method indexOf Return currentItem's index
 * @param {Object} item
 * @return {number}
 */
App.Collection.prototype.indexOf = function indexOf(item)
{
    var multiplier = 8, i = 0, l = Math.floor(this._items.length / multiplier) * multiplier;
    for (;i<l;)
    {
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
        if (this._items[i++] === item) return i-1;
    }

    l = this._items.length;
    for (;i<l;)
    {
        if (this._items[i++] === item) return i-1;
    }

    return -1;
};

/**
 * Return current item's index
 * @method index
 * @returns {number}
 */
App.Collection.prototype.index = function index()
{
    return this._currentIndex;
};

/**
 * @method length Return length of the collection
 * @return {number}
 */
App.Collection.prototype.length = function length()
{
    return this._items.length;
};

/**
 * @class Account
 * @param {{name:string,categories:Array.<Category>}} data
 * @constructor
 */
App.Account = function Account(data)
{
    this._data = data;
    this._name = null;
    this._categories = null;
};

/**
 * Create and return name
 *
 * @method getName
 * @returns {string}
 */
App.Account.prototype.getName = function getName()
{
    if (!this._name) this._name = this._data.name;

    return this._name;
};

App.Account.prototype.getBalance = function getBalance()
{

};

App.Account.prototype.getExpenses = function getExpenses()
{

};

App.Account.prototype.getIncome = function getIncome()
{

};

/**
 * Create and return categories collection
 *
 * @method getCategories
 * @returns {Collection}
 */
App.Account.prototype.getCategories = function getCategories()
{
    if (!this._categories) this._categories = new App.Collection();

    return this._categories;
};

App.Transaction = function Transaction(amount,currency,category,date,type,mode,repeating,pending)
{
    this.amount = amount;
    this.currency = currency;
    this.category = category;
    this.date = date;
    this.type = type;
    this.mode = mode;
    this.repeating = repeating;
    this.pending = pending;
};

App.Category = function Category(name,color,icon,subCategories,account,budget)
{
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.subCategories = subCategories;
    this.account = account;
    this.budget = budget;
};

App.Filter = function Filter(startDate,endDate,categories)
{
    this.startDate = startDate;
    this.endDate = endDate;
    this.categories = categories;
};

/**
 * @class ViewLocator
 * @type {{_viewSegments:Object, addViewSegment: Function, hasViewSegment: Function, getViewSegment: Function}}
 */
App.ViewLocator = {
    _viewSegments:{},

    /**
     * Add view segment
     * @param {string} segmentName
     * @param {*} segment
     */
    addViewSegment:function addViewSegment(segmentName,segment)
    {
        if (this._viewSegments[segmentName]) throw Error("View segment "+segmentName+" already exist");

        this._viewSegments[segmentName] = segment;

        return segment;
    },

    /**
     * Check if view segment already exist
     * @param {string} segmentName
     * @return {boolean}
     */
    hasViewSegment:function hasViewSegment(segmentName)
    {
        return this._viewSegments[segmentName];
    },

    /**
     * Return view segment by name passed in
     * @param {string} segmentName
     * @return {*}
     */
    getViewSegment:function getViewSegment(segmentName)
    {
        return this._viewSegments[segmentName];
    }
};

/**
 * @class ScrollIndicator
 * @extends Graphics
 * @param {string} direction
 * @param {number} pixelRatio
 * @constructor
 */
App.ScrollIndicator = function ScrollIndicator(direction,pixelRatio)
{
    PIXI.Graphics.call(this);

    this.visible = false;
    this.boundingBox = new PIXI.Rectangle(0,0,0,0);

    this._direction = direction;
    this._pixelRatio = pixelRatio;
    this._minIndicatorSize = Math.round(50 * pixelRatio);
    this._padding = Math.round(4 * pixelRatio);
    this._size = 0;
    this._indicatorSize = 0;
    this._indicatorThickness = 0;
    this._contentPosition = 0;
    this._positionStep = 0;

    this._showHideTween = new App.TweenProxy(0.2,App.Easing.linear,0,App.ModelLocator.getProxy(App.ModelName.EVENT_LISTENER_POOL));
    this._state = App.TransitionState.HIDDEN;
};

App.ScrollIndicator.prototype = Object.create(PIXI.Graphics.prototype);
App.ScrollIndicator.prototype.constructor = App.ScrollIndicator;

/**
 * Show
 */
App.ScrollIndicator.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.HIDING || this._state === TransitionState.HIDDEN)
    {
        this._state = TransitionState.SHOWING;
        this.visible = true;

        this._showHideTween.start(true);
    }
};

/**
 * Hide
 *
 * @param {boolean} [immediate=false]
 */
App.ScrollIndicator.prototype.hide = function hide(immediate)
{
    var TransitionState = App.TransitionState;

    if (immediate)
    {
        this._state = TransitionState.HIDDEN;

        this.alpha = 0.0;
        this.visible = false;
    }
    else
    {
        if (this._state === TransitionState.SHOWING || this._state === TransitionState.SHOWN)
        {
            this._state = TransitionState.HIDING;

            this._showHideTween.start(true);
        }
    }
};

/**
 * Update indicator according to position passed in
 * @param {number} contentPosition
 */
App.ScrollIndicator.prototype.update = function update(contentPosition)
{
    this._contentPosition = contentPosition;

    var TransitionState = App.TransitionState;
    if (this._state === TransitionState.SHOWING || this._state === TransitionState.HIDING)
    {
        this._updateVisibility(TransitionState);
    }

    this._render();
};

/**
 * Update visibility
 * @param {App.TransitionState} TransitionState
 * @private
 */
App.ScrollIndicator.prototype._updateVisibility = function _updateVisibility(TransitionState)
{
    var progress = this._showHideTween.progress;

    if (this._state === TransitionState.SHOWING)
    {
        this.alpha = progress;

        if (progress === 1.0) this._state = TransitionState.SHOWN;
    }
    else if (this._state === TransitionState.HIDING)
    {
        this.alpha = 1.0 - progress;

        if (progress === 1.0)
        {
            this._state = TransitionState.HIDDEN;
            this.visible = false;
        }
    }
};

/**
 * Resize
 * @param {number} size
 * @param {number} contentSize
 */
App.ScrollIndicator.prototype.resize = function resize(size,contentSize)
{
    this._size = size;

    if (this._direction === App.Direction.X)
    {
        this.boundingBox.width = this._size;
        this.boundingBox.height = Math.round(8 * this._pixelRatio);

        this._indicatorThickness = this.boundingBox.height - this._padding;
        this._indicatorSize = Math.round(this._size * (this._size / contentSize));
        if (this._indicatorSize < this._minIndicatorSize) this._indicatorSize = this._minIndicatorSize;

        this._positionStep = (this._size - this._indicatorSize) / (contentSize - this._size);
    }
    else if (this._direction === App.Direction.Y)
    {
        this.boundingBox.width = Math.round(8 * this._pixelRatio);
        this.boundingBox.height = this._size;

        this._indicatorThickness = this.boundingBox.width - this._padding;
        this._indicatorSize = Math.round(this._size * (this._size / contentSize));
        if (this._indicatorSize < this._minIndicatorSize) this._indicatorSize = this._minIndicatorSize;

        this._positionStep = (this._size - this._indicatorSize) / (contentSize - this._size);
    }

    this._render();
};

/**
 * Render indicator
 * @private
 */
App.ScrollIndicator.prototype._render = function _render()
{
    var indicatorSize = this._indicatorSize,
        position = -Math.round(this._contentPosition * this._positionStep);

    if (position + indicatorSize > this._size)
    {
        indicatorSize = this._size - position;
    }
    else if (position < 0)
    {
        indicatorSize = indicatorSize + position;
        position = 0;
    }

    this.clear();
    this.beginFill(0x000000,0.3);

    if (this._direction === App.Direction.X)
    {
        this.drawRoundedRect(
            position + this._padding,
            Math.round(this._padding * 0.5),
            indicatorSize - this._padding * 2,
            this._indicatorThickness,
            this._indicatorThickness * 0.5
        );
    }
    else if (this._direction === App.Direction.Y)
    {
        this.drawRoundedRect(
            Math.round(this._padding * 0.5),
            position + this._padding,
            this._indicatorThickness,
            indicatorSize - this._padding * 2,
            this._indicatorThickness * 0.5
        );
    }

    this.endFill();
};

/**
 * Destroy
 */
App.ScrollIndicator.prototype.destroy = function destroy()
{
    //TODO also destroy PIXI's Graphics object!

    this._showHideTween.destroy();
    this._showHideTween = null;

    this.boundingBox = null;
    this._direction = null;
    this._state = null;

    this.clear();
};

/**
 * @class Pane
 * @extends {DisplayObjectContainer}
 * @param {string} xScrollPolicy
 * @param {string} yScrollPolicy
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.Pane = function Pane(xScrollPolicy,yScrollPolicy,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._content = null;
    this._width = width;
    this._height = height;
    this._contentHeight = 0;
    this._contentWidth = 0;

    this._enabled = false;
    this._state = null;
    this._xOriginalScrollPolicy = xScrollPolicy;
    this._yOriginalScrollPolicy = yScrollPolicy;
    this._xScrollPolicy = xScrollPolicy;
    this._yScrollPolicy = yScrollPolicy;
    this._xScrollIndicator = new App.ScrollIndicator(App.Direction.X,pixelRatio);
    this._yScrollIndicator = new App.ScrollIndicator(App.Direction.Y,pixelRatio);

    this._mouseData = null;
    this._oldMouseX = 0.0;
    this._oldMouseY = 0.0;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._xOffset = 0.0;
    this._yOffset = 0.0;
    this._friction = 0.9;
    this._dumpForce = 0.5;
    this._snapForce = 0.2;
};

App.Pane.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Pane.prototype.constructor = App.Pane;

/**
 * Set content of the pane
 *
 * @method setContent
 * @param {PIXI.DisplayObjectContainer} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = this._content.height;
    this._contentWidth = this._content.width;

    this.addChildAt(this._content,0);

    this._updateScrollers();
};

/**
 * Remove content
 *
 * @method removeContent
 */
App.Pane.prototype.removeContent = function removeContent()
{
    if (this._content && this.contains(this._content))
    {
        this.removeChild(this._content);

        this._content = null;
    }
};

/**
 * Resize
 *
 * @param {number} width
 * @param {number} height
 */
App.Pane.prototype.resize = function resize(width,height)
{
    this._width = width;
    this._height = height;

    if (this._content)
    {
        this._contentHeight = this._content.height;
        this._contentWidth = this._content.width;

        this._updateScrollers();
    }
};

/**
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        //TODO check scroll policy before registering events; no need to register them if policy is OFF
        this._registerEventListeners();

        this.interactive = true;

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Pane.prototype.disable = function disable()
{
    this._unRegisterEventListeners();

    //TODO also stop scrolling, but if 'snapping' make sure the content is not pulled after cancelling the state
    if (this._state === App.InteractiveState.DRAGGING) this._onPointerUp();

    this.interactive = false;

    this._enabled = false;
};

/**
 * Reset content scroll
 */
App.Pane.prototype.resetScroll = function resetScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    if (this._content)
    {
        this._content.x = 0;
        this._content.y = 0;

        this._xScrollIndicator.hide(true);
        this._yScrollIndicator.hide(true);
    }
};

/**
 * Cancel scroll
 */
App.Pane.prototype.cancelScroll = function cancelScroll()
{
    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._xScrollIndicator.hide(true);
    this._yScrollIndicator.hide(true);
};

/**
 * Register event listeners
 * @private
 */
App.Pane.prototype._registerEventListeners = function _registerEventListeners()
{
    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = this._onPointerDown;
        this.touchend = this._onPointerUp;
        this.touchendoutside = this._onPointerUp;
        this.touchmove = this._onPointerMove;
    }
    else
    {
        this.mousedown = this._onPointerDown;
        this.mouseup = this._onPointerUp;
        this.mouseupoutside = this._onPointerUp;
        this.mousemove = this._onPointerMove;
    }

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * UnRegister event listeners
 * @private
 */
App.Pane.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    if (App.Device.TOUCH_SUPPORTED)
    {
        this.touchstart = null;
        this.touchend = null;
        this.touchendoutside = null;
        this.touchmove = null;
    }
    else
    {
        this.mousedown = null;
        this.mouseup = null;
        this.mouseupoutside = null;
        this.mousemove = null;
    }
};

/**
 * Pointer Down handler
 *
 * @method _onPointerDown
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerDown = function _onMouseDown(data)
{
    //TODO make sure just one input is registered (multiple inputs on touch screens) ...
    //data.originalEvent.preventDefault();

    this._mouseData = data;

    var mp = this._mouseData.getLocalPosition(this.stage);
    this._xOffset = mp.x - this._content.x;
    this._yOffset = mp.y - this._content.y;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;

    this._state = App.InteractiveState.DRAGGING;

    if (this._xScrollPolicy === App.ScrollPolicy.ON) this._xScrollIndicator.show();
    if (this._yScrollPolicy === App.ScrollPolicy.ON) this._yScrollIndicator.show();
};

/**
 * On pointer up
 *
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerUp = function _onMouseUp(data)
{
    if (this._isContentPulled())
    {
        this._state = App.InteractiveState.SNAPPING;
        this._xSpeed = 0.0;
        this._ySpeed = 0.0;
    }
    else
    {
        this._state = App.InteractiveState.SCROLLING;
    }

    this._mouseData = null;
};

/**
 * On pointer move
 * @param {InteractionData} data
 * @private
 */
App.Pane.prototype._onPointerMove = function _onMouseMove(data)
{
    this._mouseData = data;
};

/**
 * Tick handler
 *
 * @private
 */
App.Pane.prototype._onTick = function _onTick()
{
    var InteractiveState = App.InteractiveState;

    if (this._state === InteractiveState.DRAGGING) this._drag(App.ScrollPolicy);
    else if (this._state === InteractiveState.SCROLLING) this._scroll(App.ScrollPolicy,InteractiveState);
    else if (this._state === InteractiveState.SNAPPING) this._snap(App.ScrollPolicy,InteractiveState);

    if (this._xScrollIndicator.visible) this._xScrollIndicator.update(this._content.x);
    if (this._yScrollIndicator.visible) this._yScrollIndicator.update(this._content.y);
};

/**
 * Perform drag operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._drag = function _drag(ScrollPolicy)
{
    var pullDistance = 0;

    if (this.stage)
    {
        if (this._xScrollPolicy === ScrollPolicy.ON)
        {
            var mouseX = this._mouseData.getLocalPosition(this.stage).x,
                contentX = this._content.x,
                contentRight = contentX + this._contentWidth,
                contentLeft = contentX - this._contentWidth;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentX > 0)
            {
                pullDistance = (1 - contentX / this._width) * this._dumpForce;
                this._content.x = Math.round(mouseX * pullDistance - this._xOffset * pullDistance);
            }
            else if (contentRight < this._width)
            {
                pullDistance = (contentRight / this._width) * this._dumpForce;
                this._content.x = Math.round(contentLeft - (this._width - mouseX) * pullDistance + (this._contentWidth - this._xOffset) * pullDistance);
            }
            else
            {
                this._content.x = Math.round(mouseX - this._xOffset);
            }

            this._xSpeed = mouseX - this._oldMouseX;
            this._oldMouseX = mouseX;
        }

        if (this._yScrollPolicy === ScrollPolicy.ON)
        {
            var mouseY = this._mouseData.getLocalPosition(this.stage).y,
                contentY = this._content.y,
                contentBottom = contentY + this._contentHeight,
                contentTop = this._height - this._contentHeight;

            if (mouseY <= -10000) return;

            // If content is pulled from beyond screen edges, dump the drag effect
            if (contentY > 0)
            {
                pullDistance = (1 - contentY / this._height) * this._dumpForce;
                this._content.y = Math.round(mouseY * pullDistance - this._yOffset * pullDistance);
            }
            else if (contentBottom < this._height)
            {
                pullDistance = (contentBottom / this._height) * this._dumpForce;
                this._content.y = Math.round(contentTop - (this._height - mouseY) * pullDistance + (this._contentHeight - this._yOffset) * pullDistance);
            }
            else
            {
                this._content.y = Math.round(mouseY - this._yOffset);
            }

            this._ySpeed = mouseY - this._oldMouseY;
            this._oldMouseY = mouseY;
        }
    }
};

/**
 * Perform scroll operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @param {App.InteractiveState} InteractiveState
 * @private
 */
App.Pane.prototype._scroll = function _scroll(ScrollPolicy,InteractiveState)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        this._content.x = Math.round(this._content.x + this._xSpeed);

        var contentX = this._content.x,
            contentRight = contentX + this._contentWidth;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentX > 0)
        {
            this._xSpeed *= (1 - contentX / this._width) * this._dumpForce;
        }
        else if (contentRight < this._width)
        {
            this._xSpeed *= (contentRight / this._width) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._xSpeed) < .1)
        {
            this._xSpeed = 0.0;
            this._state = null;
            this._xScrollIndicator.hide();

            if (contentX > 0 || contentRight < this._width) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._xSpeed *= this._friction;
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        this._content.y = Math.round(this._content.y + this._ySpeed);

        var contentY = this._content.y,
            contentBottom = contentY + this._contentHeight;

        // If content is scrolled from beyond screen edges, dump the speed
        if (contentY > 0)
        {
            this._ySpeed *= (1 - contentY / this._height) * this._dumpForce;
        }
        else if (contentBottom < this._height)
        {
            this._ySpeed *= (contentBottom / this._height) * this._dumpForce;
        }

        // If the speed is very low, stop it.
        // Also, if the content is scrolled beyond screen edges, switch to 'snap' state
        if (Math.abs(this._ySpeed) < .1)
        {
            this._ySpeed = 0.0;
            this._state = null;
            this._yScrollIndicator.hide();

            if (contentY > 0 || contentBottom < this._height) this._state = InteractiveState.SNAPPING;
        }
        else
        {
            this._ySpeed *= this._friction;
        }
    }
};

/**
 * Perform snap operation
 *
 * @param {App.ScrollPolicy} ScrollPolicy
 * @private
 */
App.Pane.prototype._snap = function _snap(ScrollPolicy)
{
    if (this._xScrollPolicy === ScrollPolicy.ON)
    {
        var contentX = this._content.x,
            contentRight = contentX + this._contentWidth,
            contentLeft = contentX - this._contentWidth,
            result = contentX * this._snapForce;

        if (contentX > 0)
        {
            if (result < 5)
            {
                this._state = null;
                this._content.x = 0;
                this._xScrollIndicator.hide();
            }
            else
            {
                this._content.x = Math.round(result);
            }
        }
        else if (contentRight < this._width)
        {
            result = contentLeft + (contentX - contentLeft) * this._snapForce;
            if (result >= this._width - 5)
            {
                this._state = null;
                this._content.x = contentLeft;
                this._xScrollIndicator.hide();
            }
            else
            {
                this._content.x = Math.round(result);
            }
        }
    }

    if (this._yScrollPolicy === ScrollPolicy.ON)
    {
        var contentY = this._content.y,
            contentBottom = contentY + this._contentHeight,
            contentTop = this._height - this._contentHeight;

        if (contentY > 0)
        {
            result = contentY * this._snapForce;
            if (result < 5)
            {
                this._state = null;
                this._content.y = 0;
                this._yScrollIndicator.hide();
            }
            else
            {
                this._content.y = Math.round(result);
            }
        }
        else if (contentBottom < this._height)
        {
            result = contentTop + (contentY - contentTop) * this._snapForce;
            if (result >= contentTop - 5)
            {
                this._state = null;
                this._content.y = contentTop;
                this._yScrollIndicator.hide();
            }
            else
            {
                this._content.y = Math.round(result);
            }
        }
    }
};

/**
 * Is content pulled
 * @returns {boolean}
 * @private
 */
App.Pane.prototype._isContentPulled = function _isContentPulled()
{
    return this._content.x > 0 ||
        this._content.y > 0 ||
        this._content.y + this._contentHeight < this._height ||
        this._content.x + this._contentWidth < this._width;
};

/**
 * Update scroll indicators
 * @private
 */
App.Pane.prototype._updateScrollers = function _updateScrollBars()
{
    var ScrollPolicy = App.ScrollPolicy;
    //TODO (un)register event listeners based on the policy!
    if (this._xOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentWidth >= this._width)
        {
            this._xScrollPolicy = ScrollPolicy.ON;

            this._xScrollIndicator.resize(this._width,this._contentWidth);
            this._xScrollIndicator.x = this._height - this._xScrollIndicator.boundingBox.height;
            if (!this.contains(this._xScrollIndicator)) this.addChild(this._xScrollIndicator);
        }
        else
        {
            this._xScrollPolicy = ScrollPolicy.OFF;

            this._xScrollIndicator.hide();
            if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
        }
    }

    if (this._yOriginalScrollPolicy === ScrollPolicy.AUTO)
    {
        if (this._contentHeight >= this._height)
        {
            this._yScrollPolicy = ScrollPolicy.ON;

            this._yScrollIndicator.resize(this._height,this._contentHeight);
            this._yScrollIndicator.x = this._width - this._yScrollIndicator.boundingBox.width;
            if (!this.contains(this._yScrollIndicator)) this.addChild(this._yScrollIndicator);
        }
        else
        {
            this._yScrollPolicy = ScrollPolicy.OFF;

            this._yScrollIndicator.hide();
            if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
        }
    }
};

/**
 * Destroy
 */
App.Pane.prototype.destroy = function destroy()
{
    //TODO also destroy PIXI's DisplayObjectContainer object!

    this.disable();

    this._ticker = null;

    this._state = null;
    this._xSpeed = 0.0;
    this._ySpeed = 0.0;
    this._mouseData = null;

    this.removeContent();

    if (this.contains(this._xScrollIndicator)) this.removeChild(this._xScrollIndicator);
    this._xScrollIndicator.destroy();
    this._xScrollIndicator = null;

    if (this.contains(this._yScrollIndicator)) this.removeChild(this._yScrollIndicator);
    this._yScrollIndicator.destroy();
    this._yScrollIndicator = null;

    this._xOriginalScrollPolicy = null;
    this._yOriginalScrollPolicy = null;
    this._xScrollPolicy = null;
    this._yScrollPolicy = null;
};

/**
 * @class ViewStack
 * @extends DisplayObjectContainer
 * @param {Array.<Screen>} children
 * @param {boolean} [addToStage=false]
 * @constructor
 */
App.ViewStack = function ViewStack(children,addToStage)
{
    PIXI.DisplayObjectContainer.call(this);

    this._children = [];
    this._selectedChild = null;
    this._selectedIndex = -1;
    this._childrenToHide = [];

    if (children)
    {
        var i = 0, l = children.length;
        for (;i<l;) this.add(children[i++],addToStage);
    }
};

App.ViewStack.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ViewStack.prototype.constructor = App.ViewStack;

/**
 * Add child to stack
 *
 * @param {Screen} child
 * @param {boolean} [addToStage=false]
 */
App.ViewStack.prototype.add = function add(child,addToStage)
{
    this._children[this._children.length] = child;

    if (addToStage) this.addChild(child);
};

/**
 * Select child
 *
 * @param {Screen} child
 */
App.ViewStack.prototype.selectChild = function selectChild(child)
{
    if (this._selectedChild)
    {
        if (!child || this._selectedChild === child) return;

        this._childrenToHide[this._childrenToHide.length] = this._selectedChild;
    }

    var i = 0, l = this._children.length;
    for (;i<l;)
    {
        if (child === this._children[i++])
        {
            this._selectedChild = child;
            this._selectedIndex = i - 1;
        }
    }
};

/**
 * Select child by index passed in
 *
 * @param {number} index
 */
App.ViewStack.prototype.selectChildByIndex = function selectChildByIndex(index)
{
    if (index < 0 || index >= this._children.length) return;

    if (this._selectedChild)
    {
        if (this._selectedChild === this._children[index]) return;

        this._childrenToHide[this._childrenToHide.length] = this._selectedChild;
    }

    this._selectedChild = this._children[index];
    this._selectedIndex = index;
};

/**
 * Return selected child
 * @returns {Screen}
 */
App.ViewStack.prototype.getSelectedChild = function getSelectedChild()
{
    return this._selectedChild;
};

/**
 * Return index of selected child
 * @returns {number}
 */
App.ViewStack.prototype.getSelectedIndex = function getSelectedIndex()
{
    return this._selectedIndex;
};

/**
 * Return child by index passed in
 * @param {number} index
 * @returns {Screen|null}
 */
App.ViewStack.prototype.getChildByIndex = function getChildByIndex(index)
{
    if (index < 0 || index >= this._children.length) return null;

    return this._children[index];
};

/**
 * Show
 */
App.ViewStack.prototype.show = function show()
{
    if (this._selectedChild)
    {
        // First check if the child to show is not actually hiding
        var i = 0, l = this._childrenToHide.length;
        for (;i<l;i++)
        {
            if (this._selectedChild === this._childrenToHide[i])
            {
                this._selectedChild.removeEventListener(App.EventType.COMPLETE,this,this._onHideComplete);
                this._childrenToHide.splice(i,1);
                break;
            }
        }

        if (!this.contains(this._selectedChild)) this.addChild(this._selectedChild);

        this._selectedChild.show();
    }
};

/**
 * Hide
 */
App.ViewStack.prototype.hide = function hide()
{
    var i = 0, l = this._childrenToHide.length, child = null, EventType = App.EventType;
    for (;i<l;)
    {
        child = this._childrenToHide[i++];

        child.addEventListener(EventType.COMPLETE,this,this._onHideComplete);
        child.hide();
    }
};

/**
 * On hide complete
 * @param {{target:Screen,state:string}} data
 * @private
 */
App.ViewStack.prototype._onHideComplete = function _onHideComplete(data)
{
    if (data.state === App.TransitionState.HIDDEN)
    {
        /**@type Screen */
        var screen = data.target;

        screen.removeEventListener(App.EventType.COMPLETE,this,this._onHideComplete);

        if (this.contains(screen)) this.removeChild(screen);

        var i = 0, l = this._childrenToHide.length;
        for (;i<l;i++)
        {
            if (screen === this._childrenToHide[i])
            {
                this._childrenToHide.splice(i,1);
                break;
            }
        }
    }
};

/**
 * Abstract Screen
 *
 * @class Screen
 * @extends {DisplayObjectContainer}
 * @param {Collection} model
 * @param {Object} layout
 * @param {number} tweenDuration
 * @constructor
 */
App.Screen = function Screen(model,layout,tweenDuration)
{
    PIXI.DisplayObjectContainer.call(this);

    this._model = model;
    this._layout = layout;
    this._enabled = false;
    this._transitionState = App.TransitionState.HIDDEN;
    this._interactiveState = null;
    this._mouseDownPosition = null;
    this._mouseX = 0.0;
    this._leftSwipeThreshold = Math.round(30 * layout.pixelRatio);
    this._rightSwipeThreshold = Math.round(5 * layout.pixelRatio);
    this._swipeEnabled = false;
    this._swipeDirection = null;

    var ModelLocator = App.ModelLocator;
    var ModelName = App.ModelName;

    this._eventDispatcher = new App.EventDispatcher(ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));
    this._ticker = ModelLocator.getProxy(ModelName.TICKER);
    this._showHideTween = new App.TweenProxy(tweenDuration,App.Easing.outExpo,0,ModelLocator.getProxy(ModelName.EVENT_LISTENER_POOL));

    this.alpha = 0.0;
};

App.Screen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.Screen.prototype.constructor = App.Screen;

/**
 * Show
 */
App.Screen.prototype.show = function show()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.HIDDEN || this._transitionState === TransitionState.HIDING)
    {
        this.enable();

        this._transitionState = TransitionState.SHOWING;

        this._showHideTween.restart();

        this.visible = true;
    }
};

/**
 * Hide
 */
App.Screen.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWN || this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.HIDING;

        this._showHideTween.start(true);
    }
};

/**
 * Enable
 */
App.Screen.prototype.enable = function enable()
{
    if (!this._enabled)
    {
        this.interactive = true;

        this._registerEventListeners();

        this._enabled = true;
    }
};

/**
 * Disable
 */
App.Screen.prototype.disable = function disable()
{
    this.interactive = false;

    this._unRegisterEventListeners();

    this._enabled = false;

    this._interactiveState = null;
};

/**
 * Add event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.addEventListener = function addEventListener(eventType,scope,listener)
{
    this._eventDispatcher.addEventListener(eventType,scope,listener);
};

/**
 * Remove event listener
 * @param {string} eventType
 * @param {Object} scope
 * @param {Function} listener
 */
App.Screen.prototype.removeEventListener = function removeEventListener(eventType,scope,listener)
{
    this._eventDispatcher.removeEventListener(eventType,scope,listener);
};

/**
 * Register event listeners
 * @private
 */
App.Screen.prototype._registerEventListeners = function _registerEventListeners()
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

    this._showHideTween.addEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);
};

/**
 * UnRegister event listeners
 * @private
 */
App.Screen.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);

    this._showHideTween.removeEventListener(App.EventType.COMPLETE,this,this._onTweenComplete);

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
 * On tick
 * @private
 */
App.Screen.prototype._onTick = function _onTick()
{
    if (this._showHideTween.isRunning())
    {
        var TransitionState = App.TransitionState;

        if (this._transitionState === TransitionState.SHOWING) this.alpha = this._showHideTween.progress;
        else if (this._transitionState === TransitionState.HIDING) this.alpha = 1 - this._showHideTween.progress;
    }

    if (this._swipeEnabled)
    {
        var InteractiveState = App.InteractiveState;

        if (this._interactiveState === InteractiveState.DRAGGING) this._drag();
        else if (this._interactiveState === InteractiveState.SWIPING) this._swipe(this._swipeDirection);
    }
};

/**
 * On tween complete
 * @private
 */
App.Screen.prototype._onTweenComplete = function _onTweenComplete()
{
    var TransitionState = App.TransitionState;

    if (this._transitionState === TransitionState.SHOWING)
    {
        this._transitionState = TransitionState.SHOWN;

        this.alpha = 1.0;
    }
    else if (this._transitionState === TransitionState.HIDING)
    {
        this._transitionState = TransitionState.HIDDEN;

        this.disable();

        this.alpha = 0.0;

        this.visible = false;

        this._eventDispatcher.dispatchEvent(App.EventType.COMPLETE,{target:this,state:this._transitionState});
    }
};

/**
 * On pointer down
 *
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerDown = function _onPointerDown(data)
{
    if (this.stage)
    {
        this._mouseDownPosition = data.getLocalPosition(this.stage);
        this._mouseX = this._mouseDownPosition.x;
    }

    if (this._swipeEnabled) this._interactiveState = App.InteractiveState.DRAGGING;
};

/**
 * On pointer up
 * @param {Object} data
 * @private
 */
App.Screen.prototype._onPointerUp = function _onPointerUp(data)
{
    if (this._swipeEnabled)
    {
        if (this._interactiveState === App.InteractiveState.SWIPING) this._swipeEnd(this._swipeDirection);
        this._interactiveState = null;
    }

    if (this.stage && this._mouseDownPosition && this._enabled)
    {
        var oldX = this._mouseDownPosition.x,
            oldY = this._mouseDownPosition.y;

        this._mouseDownPosition = data.getLocalPosition(this.stage,this._mouseDownPosition);

        var dx = oldX - this._mouseDownPosition.x,
            dy = oldY - this._mouseDownPosition.y,
            dist = dx * dx - dy * dy,
            TransitionState = App.TransitionState;

        if (Math.abs(dist) < 5 && (this._transitionState === TransitionState.SHOWING || this._transitionState === TransitionState.SHOWN)) this._onClick();

        this._mouseDownPosition = null;
    }
};

/**
 * Return pointer position
 * @returns {Point}
 * @private
 */
App.Screen.prototype._getPointerPosition = function _getPointerPosition()
{
    return App.Device.TOUCH_SUPPORTED ? this.stage.getTouchPosition() : this.stage.getMousePosition();
};

/**
 * Drag
 * @private
 */
App.Screen.prototype._drag = function _drag()
{
    var InteractiveState = App.InteractiveState;

    if (this._interactiveState === InteractiveState.DRAGGING)
    {
        if (this.stage && this._mouseX)
        {
            var newX = this._getPointerPosition().x;

            if (this._mouseX - newX > this._leftSwipeThreshold)
            {
                this._interactiveState = InteractiveState.SWIPING;
                this._swipeDirection = App.Direction.LEFT;
                this._swipeStart();
            }
            else if (newX - this._mouseX > this._rightSwipeThreshold)
            {
                this._interactiveState = InteractiveState.SWIPING;
                this._swipeDirection = App.Direction.RIGHT;
                this._swipeStart();
            }

            this._mouseX = newX;
        }
    }
};

/**
 * Click handler
 * @private
 */
App.Screen.prototype._onClick = function _onClick()
{
    this._eventDispatcher.dispatchEvent(App.EventType.CLICK);
};

/**
 * Called when swipe starts
 * @private
 */
App.Screen.prototype._swipeStart = function _swipeStart()
{
    // Abstract
};

/**
 * Called when swipe ends
 * @param {string} direction
 * @private
 */
App.Screen.prototype._swipeEnd = function _swipeEnd(direction)
{
    // Abstract
};

/**
 * Swipe handler
 * @param {string} direction
 * @private
 */
App.Screen.prototype._swipe = function _swipe(direction)
{
    // Abstract
};

/**
 * Destroy
 */
App.Screen.prototype.destroy = function destroy()
{
    this.disable();

    this._eventDispatcher.destroy();
    this._eventDispatcher = null;

    this._showHideTween.destroy();
    this._showHideTween = null;

    this._ticker = null;
    this._model = null;
    this._layout = null;
    this._transitionState = null;
    this._mouseDownPosition = null;

    //TODO make sure everything is destroyed
};

/**
 * @class AccountButton
 * @extends Graphics
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.AccountButton = function AccountButton(model,layout,index)
{
    PIXI.Graphics.call(this);

    this._model = model;
    this._layout = layout;

    var pixelRatio = this._layout.pixelRatio,
        height = Math.round(70 * pixelRatio);

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    //TODO move texts and their settings objects into pools?
    this._nameLabel = new PIXI.Text(this._model.getName()+" "+index,{font:Math.round(24 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});
    this._nameLabel.x = Math.round(15 * pixelRatio);
    this._nameLabel.y = Math.round(15 * pixelRatio);

    this._detailsLabel = new PIXI.Text("Balance: 2.876, Expenses: -250, Income: 1.500",{font:Math.round(12 * pixelRatio)+"px Arial",fill:"#999999"});
    this._detailsLabel.x = Math.round(15 * pixelRatio);
    this._detailsLabel.y = Math.round(45 * pixelRatio);

    //this._icon =

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);

    this.interactive = true;

    this._render();
};

App.AccountButton.prototype = Object.create(PIXI.Graphics.prototype);
App.AccountButton.prototype.constructor = App.AccountButton;

/**
 * @method _resize
 * @param {number} width
 */
App.AccountButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._render();
};

/**
 * @method render
 * @private
 */
App.AccountButton.prototype._render = function _render()
{
    //TODO cache this as texture?

    var padding = Math.round(10 * this._layout.pixelRatio);

    this.clear();
    this.beginFill(0xefefef);
    this.drawRect(0,0,this.boundingBox.width,this.boundingBox.height);
    this.beginFill(0xffffff);
    this.drawRect(padding,0,this.boundingBox.width-padding*2,1);
    this.beginFill(0xcccccc);
    this.drawRect(padding,this.boundingBox.height-1,this.boundingBox.width-padding*2,1);
    this.endFill();
};

/**
 * Destroy
 */
App.AccountButton.prototype.destroy = function destroy()
{
    this.clear();

    this.interactive = false;

    this._layout = null;
    this._model = null;

    this.boundingBox = null;

    this.removeChild(this._nameLabel);
    this._nameLabel = null;

    this.removeChild(this._detailsLabel);
    this._detailsLabel = null;
};

/**
 * @class AccountScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var i = 0, l = this._model.length(), AccountButton = App.AccountButton, button = null;

    this._buttons = new Array(l);
    this._buttonContainer = new PIXI.DisplayObjectContainer();

    for (;i<30;i++)
    {
        //button = new AccountButton(this._model.getItemAt(i),this._layout);
        button = new AccountButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonContainer.addChild(button);
    }

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._pane.setContent(this._buttonContainer);

    this._updateLayout();

    this.addChild(this._pane);

//    this._addButton =
};

App.AccountScreen.prototype = Object.create(App.Screen.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

/**
 * Enable
 */
App.AccountScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Click handler
 * @private
 */
App.AccountScreen.prototype._onClick = function _onClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.CATEGORY);
};

/**
 * @method _updateLayout
 * @private
 */
App.AccountScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0, l = this._buttons.length, height = this._buttons[0].boundingBox.height;
    for (;i<l;i++)
    {
        this._buttons[i].y = i * height;
    }

    this._pane.resize(this._layout.width,this._layout.height);
};

/**
 * Destroy
 */
App.AccountScreen.prototype.destroy = function destroy()
{
    App.Screen.prototype.destroy.call(this);

    this.disable();

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonContainer.contains(button)) this._buttonContainer.removeChild(button);
        button.destroy();
    }
    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};

/**
 * @class CategoryButton
 * @extends DisplayObjectContainer
 * @param {Account} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryButton = function CategoryButton(model,layout,index)
{
    PIXI.DisplayObjectContainer.call(this);

    var pixelRatio = layout.pixelRatio,
        height = Math.round(50 * pixelRatio);

    this._ticker = App.ModelLocator.getProxy(App.ModelName.TICKER);
    this._model = model;
    this._layout = layout;
    this._state = null;
    this._dragFriction = 0.5;
    this._snapForce = 0.5;
    this._editOffset = Math.round(80 * pixelRatio);
    this._editButtonShown = false;

    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,height);

    this._background = new PIXI.Graphics();
    this._background.beginFill(0xE53013);
    this._background.drawRect(0,0,this.boundingBox.width,this.boundingBox.height);
    this._background.endFill();

    this._surfaceSkin = new PIXI.Graphics();
    this._icon = new PIXI.Sprite.fromFrame("currencies");
    this._nameLabel = new PIXI.Text("Category "+index,{font:Math.round(18 * pixelRatio)+"px HelveticaNeueCond",fill:"#394264"});

    this._renderSurface();

    this.addChild(this._background);
    this.addChild(this._surfaceSkin);
};

App.CategoryButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.CategoryButton.prototype.constructor = App.CategoryButton;

/**
 * @method _resize
 * @param {number} width
 */
App.CategoryButton.prototype.resize = function resize(width)
{
    this.boundingBox.width = width;

    this._renderSurface();
    //TODO also resize background and other elements
};

/**
 * Tick handler
 * @private
 */
App.CategoryButton.prototype._onTick = function _onTick()
{
    if (this._state === App.InteractiveState.SNAPPING) this.snap();
};

/**
 * Enable snapping
 * @private
 */
App.CategoryButton.prototype._enableSnap = function _enableSnap()
{
    this._state = App.InteractiveState.SNAPPING;

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * Disable snapping
 * @private
 */
App.CategoryButton.prototype._disableSnap = function _disableSnap()
{
    this._state = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * @method swipe
 * @param {number} position
 * @private
 */
App.CategoryButton.prototype.swipe = function swipe(position)
{
    if (!this._editButtonShown)
    {
        if (!this._state) this._state = App.InteractiveState.SWIPING;

        var w = this._layout.width;

        this._surfaceSkin.x = -Math.round(w * (1 - (position / w)) * this._dragFriction);
    }
};

/**
 * @method snap
 * @param {string} swipeDirection
 * @private
 */
App.CategoryButton.prototype.snap = function snap(swipeDirection)
{
    // Snap back if button is swiping
    if (this._state === App.InteractiveState.SWIPING)
    {
        this._enableSnap();
    }
    // Or snap to close edit button, if it is open ...
    else if (!this._state && this._editButtonShown)
    {
        // ... and swipe direction is right
        if (swipeDirection === App.Direction.RIGHT)
        {
            this._enableSnap();
        }
        else
        {
            return;
        }
    }

    // Snap to show edit button
    if (this._surfaceSkin.x < -this._editOffset)
    {
        if (this._surfaceSkin.x * this._snapForce >= -this._editOffset)
        {
            this._editButtonShown = true;

            this._surfaceSkin.x = -this._editOffset;

            this._disableSnap();
        }
        else
        {
            this._surfaceSkin.x *= this._snapForce;
        }
    }
    // Snap to close edit button
    else
    {
        if (this._surfaceSkin.x * this._snapForce >= -1)
        {
            this._editButtonShown = false;

            this._surfaceSkin.x = 0;

            this._disableSnap();
        }
        else
        {
            this._surfaceSkin.x *= this._snapForce;
        }
    }
};

/**
 * @method render
 * @private
 */
App.CategoryButton.prototype._renderSurface = function _renderSurface()
{
    var pixelRatio = this._layout.pixelRatio,
        padding = Math.round(10 * pixelRatio),
        w = this.boundingBox.width,
        h = this.boundingBox.height;

    //TODO cache this as texture?
    this._surfaceSkin.clear();
    this._surfaceSkin.beginFill(0xefefef);
    this._surfaceSkin.drawRect(0,0,w,h);
    this._surfaceSkin.beginFill(0xffffff);
    this._surfaceSkin.drawRect(padding,0,w-padding*2,1);
    this._surfaceSkin.beginFill(0xcccccc);
    this._surfaceSkin.drawRect(padding,h-1,w-padding*2,1);
    this._surfaceSkin.beginFill("0x"+App.MathUtils.rgbToHex(
        Math.round(Math.sin(0.3 * 10 + 0) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 2) * 127 + 128),
        Math.round(Math.sin(0.3 * 10 + 4) * 127 + 128)
    ));
    this._surfaceSkin.drawRect(0,0,Math.round(4 * pixelRatio),h);
    this._surfaceSkin.endFill();

    if (pixelRatio === 1)
    {
        this._icon.scale.x *= 0.5;
        this._icon.scale.y *= 0.5;
    }
    this._icon.x = Math.round(15 * pixelRatio);
    this._icon.y = Math.round((h - this._icon.height) / 2);
    this._icon.tint = 0x394264;

    this._nameLabel.x = Math.round(64 * pixelRatio);
    this._nameLabel.y = Math.round(18 * pixelRatio);

    this._surfaceSkin.addChild(this._icon);
    this._surfaceSkin.addChild(this._nameLabel);
};

/**
 * Destroy
 */
App.CategoryButton.prototype.destroy = function destroy()
{
    this.clear();

    this.interactive = false;

    this._layout = null;
    this._model = null;

    this.boundingBox = null;

    this.removeChild(this._colorStripe);
    this._colorStripe = null;

    this.removeChild(this._icon);
    this._icon = null;

    this.removeChild(this._nameLabel);
    this._nameLabel = null;
};

/**
 * @class CategoryScreen
 * @extends Screen
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.CategoryScreen = function CategoryScreen(model,layout)
{
    App.Screen.call(this,model,layout,0.4);

    var i = 0,
        l = this._model.length(),
        CategoryButton = App.CategoryButton,
        button = null;

    this._swipeButton = null;
    this._buttons = new Array(l);
    this._buttonContainer = new PIXI.DisplayObjectContainer();

    for (;i<30;i++)
    {
        button = new CategoryButton(this._model.getItemAt(0),this._layout,i);
        this._buttons[i] = button;
        this._buttonContainer.addChild(button);
    }

    this._pane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._pane.setContent(this._buttonContainer);

//    this._addButton =

    this._updateLayout();

    this.addChild(this._pane);

    this._swipeEnabled = true;
};

App.CategoryScreen.prototype = Object.create(App.Screen.prototype);
App.CategoryScreen.prototype.constructor = App.CategoryScreen;

/**
 * Enable
 */
App.CategoryScreen.prototype.enable = function enable()
{
    App.Screen.prototype.enable.call(this);

    this._pane.resetScroll();
    this._pane.enable();
};

/**
 * Called when swipe starts
 * @private
 */
App.CategoryScreen.prototype._swipeStart = function _swipeStart()
{
    this._pane.cancelScroll();

    this._swipeButton = this._getButtonUnderPoint(this._getPointerPosition());
};

/**
 * Called when swipe ends
 * @param {string} direction
 * @private
 */
App.CategoryScreen.prototype._swipeEnd = function _swipeEnd(direction)
{
    if (this._swipeButton)
    {
        this._swipeButton.snap(direction);
        this._swipeButton = null;
    }
};

/**
 * Swipe handler
 * @param {string} direction
 * @private
 */
App.CategoryScreen.prototype._swipe = function _swipe(direction)
{
    if (this._swipeButton && direction === App.Direction.LEFT) this._swipeButton.swipe(this._getPointerPosition().x);
};

/**
 * Click handler
 * @private
 */
App.CategoryScreen.prototype._onClick = function _onClick()
{
    App.Controller.dispatchEvent(App.EventType.CHANGE_SCREEN,App.ScreenName.ACCOUNT);
};

/**
 * Find button under point passed in
 * @param {Point} point
 * @private
 */
App.CategoryScreen.prototype._getButtonUnderPoint = function _getButtonUnderPoint(point)
{
    var i = 0,
        l = this._buttons.length,
        height = this._buttons[0].boundingBox.height,
        y = point.y,
        buttonY = 0,
        containerY = this._buttonContainer.y;

    for (;i<l;i++)
    {
        buttonY = this._buttons[i].y + containerY;
        if (buttonY < y && buttonY + height > y)
        {
            return this._buttons[i];
        }
    }

    return null;
};

/**
 * @method _updateLayout
 * @private
 */
App.CategoryScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0,
        l = this._buttons.length,
        height = this._buttons[0].boundingBox.height;

    for (;i<l;i++)
    {
        this._buttons[i].y = i * height;
    }

    this._pane.resize(this._layout.width,this._layout.height);
};

/**
 * Destroy
 */
App.CategoryScreen.prototype.destroy = function destroy()
{
    App.Screen.prototype.destroy.call(this);

    this.disable();

    this.removeChild(this._pane);
    this._pane.destroy();
    this._pane = null;

    var i = 0, l = this._buttons.length, button = null;
    for (;i<l;)
    {
        button = this._buttons[i++];
        if (this._buttonContainer.contains(button)) this._buttonContainer.removeChild(button);
        button.destroy();
    }
    this._buttonContainer = null;

    this._buttons.length = 0;
    this._buttons = null;
};

/**
 * @class ApplicationView
 * @extends DisplayObjectContainer
 * @param {Stage} stage
 * @param {CanvasRenderer} renderer
 * @param {number} width
 * @param {number} height
 * @param {number} pixelRatio
 * @constructor
 */
App.ApplicationView = function ApplicationView(stage,renderer,width,height,pixelRatio)
{
    PIXI.DisplayObjectContainer.call(this);

    var ModelLocator = App.ModelLocator,
        ModelName = App.ModelName;

    this._renderer = renderer;
    this._stage = stage;

    this._layout = {
        originalWidth:width,
        originalHeight:height,
        width:Math.round(width * pixelRatio),
        height:Math.round(height * pixelRatio),
        headerHeight:Math.round(50 * pixelRatio),
        bodyHeight:Math.round((height - 50) - pixelRatio),
        pixelRatio:pixelRatio
    };

    this._background = new PIXI.Graphics();
    this._background.beginFill(0xbada55,1);
    this._background.drawRect(0,0,this._layout.width,this._layout.height);
    this._background.endFill();

    //TODO use ScreenFactory for the screens?
    this._screenStack = new App.ViewStack([
        new App.AccountScreen(ModelLocator.getProxy(ModelName.ACCOUNTS),this._layout),
        new App.CategoryScreen(ModelLocator.getProxy(ModelName.ACCOUNTS),this._layout)
    ]);
    this._screenStack.selectChildByIndex(1);
    this._screenStack.show();

    this.addChild(this._background);
    this.addChild(this._screenStack);

    this._registerEventListeners();
};

App.ApplicationView.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.ApplicationView.prototype.constructor = App.ApplicationView;

/**
 * Register event listeners
 *
 * @method _registerEventListeners
 * @private
 */
App.ApplicationView.prototype._registerEventListeners = function _registerEventListeners()
{
    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * Change screen by the name passed in
 * @param {number} screenName
 */
App.ApplicationView.prototype.changeScreen = function changeScreen(screenName)
{
    this._screenStack.selectChildByIndex(screenName);
    this._screenStack.show();
    this._screenStack.hide();
};

/**
 * On Ticker's  Tick event
 *
 * @method _onTick
 * @private
 */
App.ApplicationView.prototype._onTick = function _onTick()
{
    this._renderer.render(this._stage);
};

App.ApplicationView.prototype._onResize = function _onResize()
{

};

/**
 * Easing functions
 * @enum {Function}
 * @type {{
 *      linear: Function,
 *      inQuad: Function,
 *      outQuad: Function,
 *      inOutQuad: Function,
 *      inCubic: Function,
 *      outCubic: Function,
 *      inOutCubic: Function,
 *      inExpo: Function,
 *      outExpo: Function,
 *      inOutExpo: Function,
 *      inElastic: Function,
 *      outElastic: Function,
 *      inOutElastic: Function}}
 */
App.Easing = {
    linear: function(t) {
        return t;
    },
    /**
     * @property inQuad
     * @static
     */
    inQuad: function(t) {
        return t*t;
    },

    /**
     * @property outQuad
     * @static
     */
    outQuad: function(t) {
        return -(t-=1)*t+1;
    },

    /**
     * @property inOutQuad
     * @static
     */
    inOutQuad: function(t) {
        if ((t/=.5) < 1) return .5*t*t;
        return -.5*((--t)*(t-2) - 1);
    },

    /**
     * @property inCubic
     * @static
     */
    inCubic: function(t) {
        return t*t*t;
    },

    /**
     * @property outCubic
     * @static
     */
    outCubic: function(t) {
        return ((--t)*t*t + 1);
    },

    /**
     * @property inOutCubic
     * @static
     */
    inOutCubic: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t;
        return .5*((t-=2)*t*t + 2);
    },

    /**
     * @property inExpo
     * @static
     */
    inExpo: function(t) {
        return (t===0) ? 0.0 : Math.pow(2, 10 * (t - 1));
    },

    /**
     * @property outExpo
     * @static
     */
    outExpo: function(t) {
        return (t===1.0) ? 1.0 : (1-Math.pow(2, -10 * t));
    },

    /**
     * @property inOutExpo
     * @static
     */
    inOutExpo: function(t) {
        if (t===0) return 0.0;
        if (t===1.0) return 1.0;
        if ((t/=.5) < 1) return .5 * Math.pow(2, 10 * (t - 1));
        return .5 * (-Math.pow(2, -10 * --t) + 2);
    },

    /**
     * @property inElastic
     * @static
     */
    inElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/ p));
    },

    /**
     * @property outElastic
     * @static
     */
    outElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return a*Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p) + 1.0;
    },

    /**
     * @property inOutElastic
     * @static
     */
    inOutElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if ((t/=.5)===2) return 1.0;  if (!p) p=(.3*1.5);
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p));
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p)*.5 + 1.0;
    }
};

/**
 * @class TweenProxy
 * @param {number} duration
 * @param {Function} ease
 * @param {number} defaultProgress
 * @param {ObjectPool} eventListenerPool
 * @extends {EventDispatcher}
 * @constructor
 */
App.TweenProxy = function TweenProxy(duration,ease,defaultProgress,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this.progress = defaultProgress || 0.0;

    this._interval = -1;
    this._running = false;
    this._reversed = false;

    this._start = -1.0;
    this._end = -1.0;
    this._reversedEnd = -1.0;
    this._now = -1.0;
    this._duration = duration * 1000 || 1000;
    this._ease = ease || App.Easing.linear;
    this._timeStamp = window.performance && window.performance.now ? window.performance : Date;
    this._intervalReference = this._tweenInterval.bind(this);
};

App.TweenProxy.prototype = Object.create(App.EventDispatcher.prototype);
App.TweenProxy.prototype.constructor = App.TweenProxy;

/**
 * Set easing function
 * @method setEase
 * @param {Function} value
 */
App.TweenProxy.prototype.setEase = function setEase(value)
{
    this._ease = value;
};

/**
 * Start
 * @method start
 * @param {boolean} [reverseIfRunning=false] - reverse the tween if the tween is currently running
 * @param {Function} [ease=null] - set new ease
 */
App.TweenProxy.prototype.start = function start(reverseIfRunning,ease)
{
    if (ease) this.setEase(ease);

    if (!this._running)
    {
        this._running = true;
        this._reversed = false;

        this._tween();
    }
    else
    {
        if (reverseIfRunning)
        {
            if (this._reversed)
            {
                this._reversed = false;
            }
            else
            {
                this._reversed = true;
                this._reversedEnd = this._start + (this._now - this._start) * 2;
            }
        }
    }
};

/**
 * Stop
 * @method stop
 */
App.TweenProxy.prototype.stop = function stop()
{
    this._running = false;

    clearInterval(this._interval);
    this._interval = -1;
};

/**
 * Restart
 * @method restart
 */
App.TweenProxy.prototype.restart = function restart()
{
    if (this._running) this.stop();

    this.start();
};

/**
 * Is tween running?
 * @method isRunning
 * @returns {boolean}
 */
App.TweenProxy.prototype.isRunning = function isRunning()
{
    return this._running;
};

/**
 * Tween
 * @method _tween
 * @private
 */
App.TweenProxy.prototype._tween = function _tween()
{
    if (this._interval > 0)
    {
        clearInterval(this._interval);
        this._interval = -1.0;
    }

    this.progress = 0.0;

    this._start = this._timeStamp.now();
    this._end = this._start + this._duration;
    this._interval = setInterval(this._intervalReference,1000/120);
};

/**
 * Tween interval function
 * @method _tweenInterval
 * @private
 */
App.TweenProxy.prototype._tweenInterval = function _tweenInterval()
{
    this._now = this._timeStamp.now();

    var end = this._reversed ? this._reversedEnd : this._end;
    var progress = (this._duration - (end - this._now)) / this._duration;
    if (progress < 0) progress = 0.0;
    else if (progress > 1) progress = 1.0;

    this.progress = this._ease(progress);
    if(this._now >= end)
    {
        this.progress = 1.0;
        this.stop();

        this.dispatchEvent(App.EventType.COMPLETE);
    }
};

/**
 * Destroy
 */
App.TweenProxy.prototype.destroy = function destroy()
{
    App.EventDispatcher.prototype.destroy.call(this);

    this.stop();

    this._intervalReference = null;
    this._timeStamp = null;
    this._ease = null;
};
/**
 * @class Ticker
 * @param {ObjectPool} eventListenerPool
 * @constructor
 */
App.Ticker = function Ticker(eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

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

        window.requestAnimationFrame(this._rafListener);
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

    if (this._listeners.length === 0) this._isRunning = false;
};

/**
 * Remove all listeners
 */
App.Ticker.prototype.removeAllListeners = function()
{
    App.EventDispatcher.prototype.removeAllListeners.call(this);

    this._isRunning = false;
};

/**
 * Animation function
 * @private
 */
App.Ticker.prototype._raf = function _raf()
{
    if (this._isRunning)
    {
        window.requestAnimationFrame(this._rafListener);

        this.dispatchEvent(App.EventType.TICK);
    }
};

/**
 * @class Controller
 * @type {{_eventListenerPool:ObjectPool,_eventCommandMap: {}, _commands: Array, _init: Function, _onCommandComplete: Function, _destroyCommand: Function, dispatchEvent: Function}}
 */
App.Controller = {
    _eventListenerPool:null,
    _eventCommandMap:{},
    /** @type {Array.<Command>} */
    _commands:[],

    /**
     * Init
     * @param {ObjectPool} eventListenerPool
     * @param {Array.<{eventType:string,command:Function}>} eventMap
     */
    init:function init(eventListenerPool,eventMap)
    {
        this._eventListenerPool = eventListenerPool;

        var i = 0, l = eventMap.length, obj = null;
        for (;i<l;)
        {
            obj = eventMap[i++];
            this._eventCommandMap[obj.eventType] = {constructor:obj.command};
        }
        obj = null;
        eventMap = null;

    },

    /**
     * On command complete
     * @param {*} data
     * @private
     */
    _onCommandComplete:function _onCommandComplete(data)
    {
        this._destroyCommand(data);
    },

    /**
     * Destroy command
     * @param {Command} command
     * @private
     */
    _destroyCommand:function _destroyCommand(command)
    {
        var i = 0, l = this._commands.length, cmd = null;
        for (;i<l;)
        {
            cmd = this._commands[i++];
            if (cmd === command)
            {
                cmd.removeEventListener(App.EventType.COMPLETE,this,this._onCommandComplete);
                cmd.destroy();
                this._commands.splice(i,1);
                break;
            }
        }
    },

    /**
     * Dispatch event passed in
     * @param {string} eventType
     * @param {*} [data=null] Defaults to null
     * @param {boolean} [checkRunningInstances=false] Defaults to false
     */
    dispatchEvent:function dispatchEvent(eventType,data,checkRunningInstances)
    {
        /** @type {Function} */var commandConstructor = this._eventCommandMap[eventType].constructor;
        if (commandConstructor)
        {
            /** @type {Command} */var cmd = null;

            // First check, if multiple instances of this Command are allowed
            // If not, destroy running instances, before executing new one
            if (checkRunningInstances)
            {
                var i = 0, l = this._commands.length;
                for (;i<l;)
                {
                    cmd = this._commands[i++];
                    if (cmd instanceof commandConstructor && !cmd.allowMultipleInstances)
                    {
                        this._destroyCommand(cmd);
                    }
                }
            }

            // Execute command
            cmd = /** @type {Command} */new commandConstructor(this._eventListenerPool);

            this._commands.push(cmd);

            cmd.addEventListener(App.EventType.COMPLETE,this,this._onCommandComplete);
            cmd.execute(data);
        }
    }
};

/**
 * The Command
 * @class Command
 * @extends {EventDispatcher}
 * @param allowMultipleInstances {boolean}
 * @param eventListenerPool {ObjectPool}
 */
App.Command = function Command(allowMultipleInstances,eventListenerPool)
{
    App.EventDispatcher.call(this,eventListenerPool);

    this.allowMultipleInstances = allowMultipleInstances;
};

App.Command.prototype = Object.create(App.EventDispatcher.prototype);
App.Command.prototype.constructor = App.Command;

/**
 * Execute a command
 * @param {*=} data Defaults to null
 */
App.Command.prototype.execute = function execute(data) {};

/**
 * Destroy current instance
 *
 * @method destroy
 */
App.Command.prototype.destroy = function destroy()
{
    App.EventDispatcher.prototype.destroy.call(this);
};
/**
 * @class LoadData
 * @extends {Command}
 * @param {ObjectPool} pool
 * @constructor
 */
App.LoadData = function LoadData(pool)
{
    App.Command.call(this,false,pool);

    this._assetLoader = null;
    this._fontLoadingInterval = -1;
    this._fontInfoElement = null;
};

App.LoadData.prototype = Object.create(App.Command.prototype);
App.LoadData.prototype.constructor = App.LoadData;

/**
 * Execute the command
 *
 * @method execute
 */
App.LoadData.prototype.execute = function execute()
{
    this._loadAssets();
};

/**
 * Load image assets
 *
 * @method _loadAssets
 * @private
 */
App.LoadData.prototype._loadAssets = function _loadAssets()
{
    this._assetLoader = new PIXI.AssetLoader(["./data/icons-big.json"]);

    this._assetLoader.onComplete = function()
    {
        this._assetLoader.onComplete = null; //TODO destroy?

        this._loadFont();
    }.bind(this);

    this._assetLoader.load();
};

/**
 * Set app font and check if it is loaded
 *
 * @method _loadFont
 * @private
 */
App.LoadData.prototype._loadFont = function _loadFont()
{
    this._fontInfoElement = document.getElementById("fontInfo");

    var fontInfoWidth = this._fontInfoElement.offsetWidth;

    this._fontLoadingInterval = setInterval(function()
    {
        if (this._fontInfoElement.offsetWidth !== fontInfoWidth)
        {
            clearInterval(this._fontLoadingInterval);

            //TODO remove font info element from DOM?

            this._loadData();
        }
    }.bind(this),100);

    this._fontInfoElement.style.fontFamily = "HelveticaNeueCond";
};

/**
 * Load locally stored app data
 *
 * @method _loadData
 * @private
 */
App.LoadData.prototype._loadData = function _loadData()
{
    //TODO Access local storage

    var request = new XMLHttpRequest();
    request.open('GET','./data/accounts.json',true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400)
        {
            this.dispatchEvent(App.EventType.COMPLETE,request.responseText);
        } else {
            console.log("error");
        }
    }.bind(this);

    request.onerror = function() {
        console.log("on error");
        this.dispatchEvent(App.EventType.COMPLETE);
    };

    request.send();
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.LoadData.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    this._assetLoader = null;

    clearInterval(this._fontLoadingInterval);

    this._fontInfoElement = null;
};

/**
 * @class Initialize
 * @extends {Command}
 * @constructor
 */
App.Initialize = function Initialize()
{
    this._eventListenerPool = new App.ObjectPool(App.EventListener,10);

    App.Command.call(this,false,this._eventListenerPool);

    this._loadDataCommand = new App.LoadData(this._eventListenerPool);
};

App.Initialize.prototype = Object.create(App.Command.prototype);
App.Initialize.prototype.constructor = App.Initialize;

/**
 * Execute the command
 *
 * @method execute
 */
App.Initialize.prototype.execute = function execute()
{
    this._loadDataCommand.addEventListener(App.EventType.COMPLETE,this,this._onLoadDataComplete);
    this._loadDataCommand.execute();
};

/**
 * Load data complete handler
 *
 * @method _onLoadDataComplete
 * @param {string} data
 * @private
 */
App.Initialize.prototype._onLoadDataComplete = function _onLoadDataComplete(data)
{
    this._loadDataCommand.destroy();
    this._loadDataCommand = null;
    
    this._initModel(data);
    this._initCommands();
    this._initView();

    this.dispatchEvent(App.EventType.COMPLETE);
};

/**
 * Initialize application model
 *
 * @method _initModel
 * @param {string} data
 * @private
 */
App.Initialize.prototype._initModel = function _initModel(data)
{
    var ModelLocator = App.ModelLocator;
    var ModelName = App.ModelName;
    var Collection = App.Collection;

    ModelLocator.addProxy(ModelName.EVENT_LISTENER_POOL,this._eventListenerPool);
    ModelLocator.addProxy(ModelName.TICKER,new App.Ticker(this._eventListenerPool));
    ModelLocator.addProxy(ModelName.ACCOUNTS,new Collection(
        JSON.parse(data).accounts,//TODO parse JSON on data from localStorage
        App.Account,
        null,
        this._eventListenerPool
    ));
    /*ModelLocator.addProxy(ModelName.TRANSACTIONS,new Collection(
        localStorage.getItem(ModelName.TRANSACTIONS),
        App.Transaction,
        null,
        this._eventListenerPool
    ));
    ModelLocator.addProxy(ModelName.FILTERS,new Collection(
        localStorage.getItem(ModelName.FILTERS),
        App.Filter,
        null,
        this._eventListenerPool
    ));*/

    //TODO TextField object pool?
};

/**
 * Initialize commands
 *
 * @method _initCommands
 * @private
 */
App.Initialize.prototype._initCommands = function _initCommands()
{
    App.Controller.init(this._eventListenerPool,[
        {eventType:App.EventType.CHANGE_SCREEN,command:App.ChangeScreen}
    ]);
};

/**
 * Initialize view
 *
 * @method _initView
 * @private
 */
App.Initialize.prototype._initView = function _initView()
{
    //TODO initialize textures, icons, patterns?

    var canvas = document.getElementsByTagName("canvas")[0],
        context = canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1,
        pixelRatio = dpr / bsr,
        w = window.innerWidth,
        h = window.innerHeight,
        stage = new PIXI.Stage(0xffffff),
        renderer = new PIXI.CanvasRenderer(w,h,{
            view:canvas,
            resolution:1,
            transparent:false,
            autoResize:false,
            clearBeforeRender:false
        });

    if (pixelRatio > 1)
    {
        if (pixelRatio > 2) pixelRatio = 2;

        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        context.scale(pixelRatio,pixelRatio);

        stage.interactionManager.setPixelRatio(pixelRatio);
    }

    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.tintWithOverlay;

    //context.webkitImageSmoothingEnabled = context.mozImageSmoothingEnabled = true;

    App.ViewLocator.addViewSegment(
        App.ViewName.APPLICATION_VIEW,
        stage.addChild(new App.ApplicationView(stage,renderer,w,h,pixelRatio))
    );

    renderer.render(stage);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.Initialize.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);

    if (this._loadDataCommand)
    {
        this._loadDataCommand.destroy();
        this._loadDataCommand = null;
    }

    this._eventListenerPool = null;
};

/**
 * @class ChangeScreen
 * @extends {Command}
 * @param {ObjectPool} pool
 * @constructor
 */
App.ChangeScreen = function ChangeScreen(pool)
{
    App.Command.call(this,false,pool);
};

App.ChangeScreen.prototype = Object.create(App.Command.prototype);
App.ChangeScreen.prototype.constructor = App.ChangeScreen;

/**
 * Execute the command
 *
 * @method execute
 */
App.ChangeScreen.prototype.execute = function execute(screenName)
{
    App.ViewLocator.getViewSegment(App.ViewName.APPLICATION_VIEW).changeScreen(screenName);

    this.dispatchEvent(App.EventType.COMPLETE,this);
};

/**
 * Destroy the command
 *
 * @method destroy
 */
App.ChangeScreen.prototype.destroy = function destroy()
{
    App.Command.prototype.destroy.call(this);
};

(function()
{
    function onInitComplete()
    {
        initCommand.destroy();
        initCommand = null;
    }

    var initCommand = new App.Initialize();
    initCommand.addEventListener(App.EventType.COMPLETE,this,onInitComplete);
    initCommand.execute();
})();
