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
    function(callback,element)
    {
        return window.setTimeout(function() {
            callback(+new Date());
        }, 1000 / 60);
    });

window.cancelAnimationFrame = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame;

/**
 * @module App
 */
var App = App || {};

/**
 * Event type
 * @enum {string}
 * @return {{
 *      INITIALIZE:string,
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
    INITIALIZE:"INITIALIZE",

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
 * @return {{APPLICATION_VIEW:string}}
 */
App.ViewName = {
    APPLICATION_VIEW:"APPLICATION_VIEW"
};

/**
 * Interactive state
 * @enum {string}
 * @return {{OVER:string,OUT:string,DRAGGING:string,SCROLLING:string,SNAPPING:string}}
 */
App.InteractiveState = {
    OVER:"OVER",
    OUT:"OUT",
    DRAGGING:"DRAGGING",
    SCROLLING:"SCROLLING",
    SNAPPING:"SNAPPING"
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
 * @return {{X:string,Y:string}}
 */
App.Direction = {
    X:"x",
    Y:"y"
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
 */
App.ScrollIndicator.prototype.hide = function hide()
{
    var TransitionState = App.TransitionState;

    if (this._state === TransitionState.SHOWING || this._state === TransitionState.SHOWN)
    {
        this._state = TransitionState.HIDING;

        this._showHideTween.start(true);
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
 * @param {PIXI.DisplayObject} content
 */
App.Pane.prototype.setContent = function setContent(content)
{
    this.removeContent();

    this._content = content;
    this._contentHeight = this._content.boundingBox.height;
    this._contentWidth = this._content.boundingBox.width;

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
 * Enable
 */
App.Pane.prototype.enable = function enable()
{
    if (!this._enabled)
    {
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

    this.interactive = false;

    this._enabled = false;
};

/**
 * Register event listeners
 * @private
 */
App.Pane.prototype._registerEventListeners = function _registerEventListeners()
{
    //TODO can register only either mouse or touch, based on device
    this.mousedown = this._onPointerDown;
    this.mouseup = this._onPointerUp;
    this.mouseupoutside = this._onPointerUp;
    this.touchstart = this._onPointerDown;
    this.touchend = this._onPointerUp;
    this.touchendoutside = this._onPointerUp;
    this.mousemove = this._onPointerMove;
    this.touchmove = this._onPointerMove;

    this._ticker.addEventListener(App.EventType.TICK,this,this._onTick);
};

/**
 * UnRegister event listeners
 * @private
 */
App.Pane.prototype._unRegisterEventListeners = function _unRegisterEventListeners()
{
    //TODO can register only either mouse or touch, based on device
    this.mousedown = null;
    this.mouseup = null;
    this.mouseupoutside = null;
    this.touchstart = null;
    this.touchend = null;
    this.touchendoutside = null;
    this.mousemove = null;
    this.touchmove = null;

    this._ticker.removeEventListener(App.EventType.TICK,this,this._onTick);
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
    //TODO handle multiple pointers at once (at touch screens)

    data.originalEvent.preventDefault();

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
    data.originalEvent.preventDefault();

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
    data.originalEvent.preventDefault();

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

    this.addChild(this._nameLabel);
    this.addChild(this._detailsLabel);

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
 * @class AccountScreen
 * @extends DisplayObjectContainer
 * @param {Collection} model
 * @param {Object} layout
 * @constructor
 */
App.AccountScreen = function AccountScreen(model,layout)
{
    PIXI.DisplayObjectContainer.call(this);

    this._model = model;
    this._layout = layout;
    this.boundingBox = new PIXI.Rectangle(0,0,this._layout.width,0);

    var i = 0, l = this._model.length(), AccountButton = App.AccountButton, button = null;

    this._accountButtons = new Array(l);

    //TODO add the list into 'ScrollPane'
    for (;i<30;i++)
    {
        //button = new AccountButton(this._model.getItemAt(i),this._layout);
        button = new AccountButton(this._model.getItemAt(0),this._layout,i);
        this._accountButtons[i] = button;
        this.addChild(button);
    }

    this._updateLayout();

//    this._addButton =
};

App.AccountScreen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
App.AccountScreen.prototype.constructor = App.AccountScreen;

/**
 * @method _resize
 * @param {number} width
 */
App.AccountScreen.prototype.resize = function resize(width)
{
    //

    this._render();
};

/**
 * @method _updateLayout
 * @private
 */
App.AccountScreen.prototype._updateLayout = function _updateLayout()
{
    var i = 0, l = this._accountButtons.length, height = this._accountButtons[0].boundingBox.height;
    for (;i<l;i++)
    {
        this._accountButtons[i].y = i * height;
    }

    this.boundingBox.height = l * height;
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

    this._screenPane = new App.Pane(App.ScrollPolicy.OFF,App.ScrollPolicy.AUTO,this._layout.width,this._layout.height,this._layout.pixelRatio);
    this._screenPane.setContent(new App.AccountScreen(App.ModelLocator.getProxy(App.ModelName.ACCOUNTS),this._layout));

    this.addChild(this._background);
    this.addChild(this._screenPane);

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
    this._screenPane.enable();

    App.ModelLocator.getProxy(App.ModelName.TICKER).addEventListener(App.EventType.TICK,this,this._onTick);
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
        return (t===1.0) ? 1.0 : (-Math.pow(2, -10 * t) + 1);
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
/**
 * @class Controller
 * @type {{_eventCommandMap: {}, _commands: Array, _init: Function, _onCommandComplete: Function, _destroyCommand: Function, dispatchEvent: Function}}
 */
App.Controller = {
    _eventCommandMap:{},
    /** @type {Array.<Command>} */
    _commands:[],

    /**
     * Init
     * @param {Array.<{eventType:string,command:Function}>} eventMap
     */
    init:function init(eventMap)
    {
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
            cmd = /** @type {Command} */new commandConstructor();

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
    /*App.Controller.init([
        {eventType:App.EventType.INITIALIZE,command:App.Initialize}
    ]);*/
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
